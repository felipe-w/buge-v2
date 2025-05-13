import { randomUUID } from "node:crypto";
import { eq, inArray, or } from "drizzle-orm";

import { db } from "@/lib/db/drizzle";
import { transactions } from "@/lib/db/schemas";
import { EditTransaction, NewTransaction } from "@/lib/validations";

import { calculateCompensatedAmounts } from "../services/transactions-services";
import { getGroupAccounts } from "./accounts";

export async function getGroupTransactions({ groupId }: { groupId: string }) {
  const accounts = await getGroupAccounts({ groupId });

  const result = await db.query.transactions.findMany({
    where: inArray(
      transactions.accountId,
      accounts.map((account) => account.id),
    ),
    with: {
      account: true,
      category: true,
      budget: true,
      transfer: { with: { account: true } },
    },
  });

  return result;
}

export async function getTransaction({ id }: { id: string }) {
  const result = await db.query.transactions.findFirst({
    where: eq(transactions.id, id),
    with: {
      account: true,
      category: true,
      budget: true,
      transfer: { with: { account: true } },
    },
  });

  if (!result) throw new Error("Transação não encontrada");
  return result;
}

export async function getCompensationTransactions({ compensationId }: { compensationId: string }) {
  const compensatedTransactions = await db.query.transactions.findMany({
    where: eq(transactions.compensationId, compensationId),
  });

  if (compensatedTransactions.length < 2) {
    await db.update(transactions).set({ compensationId: null }).where(eq(transactions.compensationId, compensationId));
    throw new Error("Transações não podem ser compensadas.");
  }

  const incomes = compensatedTransactions.filter((t) => Number(t.amount) > 0);
  const expenses = compensatedTransactions.filter((t) => Number(t.amount) < 0);

  let oneSide = null;
  if (compensatedTransactions.length > 2) {
    oneSide = incomes.length > 1 ? "expense" : "income";
  }

  return { compensatedTransactions, incomes, expenses, oneSide };
}

export async function createTransaction({ transaction }: { transaction: NewTransaction }) {
  const { type, destinationAccountId, categoryId, amount, ...rest } = transaction;
  const adjustedAmount = type === "expense" || type === "transfer" ? (Number(amount) * -1).toString() : amount;

  return await db.transaction(async (tx) => {
    const sourceLegId = randomUUID();
    const destinationLegId = randomUUID();

    if (transaction.type === "transfer") {
      await tx.insert(transactions).values({
        ...rest,
        id: destinationLegId,
        accountId: destinationAccountId!,
        amount: (Number(adjustedAmount) * -1).toString(),
        categoryId: null,
        transferId: sourceLegId,
      });
    }

    await tx.insert(transactions).values({
      ...rest,
      id: sourceLegId,
      accountId: transaction.accountId,
      amount: adjustedAmount,
      categoryId: type === "transfer" ? null : categoryId,
      transferId: type === "transfer" ? destinationLegId : null,
    });
  });
}

export async function editTransaction({ transaction }: { transaction: EditTransaction }) {
  const { id, type, amount, accountId, destinationAccountId, ...rest } = transaction;
  const existingTransaction = await getTransaction({ id });
  const adjustedAmount = type === "expense" || type === "transfer" ? (Number(amount) * -1).toString() : amount;

  await db.transaction(async (tx) => {
    await tx
      .update(transactions)
      .set({ amount: adjustedAmount, accountId, ...rest })
      .where(eq(transactions.id, transaction.id));

    if (existingTransaction.transferId) {
      await tx
        .update(transactions)
        .set({ accountId: destinationAccountId, amount: (Number(adjustedAmount) * -1).toString(), ...rest })
        .where(eq(transactions.transferId, existingTransaction.id));
    }
  });

  if (existingTransaction.compensationId && amount !== undefined) {
    await updateEffectiveAmounts({ compensationId: existingTransaction.compensationId });
  }
}

export async function deleteTransaction({ id }: { id: string }) {
  const transaction = await getTransaction({ id });

  if (transaction.compensationId) {
    await uncompensateTransaction({ transactionId: id });
  }

  if (transaction.transferId) {
    // Delete both transactions in a single query using OR
    await db.delete(transactions).where(or(eq(transactions.id, id), eq(transactions.id, transaction.transferId)));
  } else {
    await db.delete(transactions).where(eq(transactions.id, id));
  }
}

export async function compensateTransactions({ firstId, secondId }: { firstId: string; secondId: string }) {
  const firstTransaction = await getTransaction({ id: firstId });
  const secondTransaction = await getTransaction({ id: secondId });

  if (Number(firstTransaction.amount) * Number(secondTransaction.amount) >= 0) {
    throw new Error("Transações não podem ser compensadas.");
  }

  // check if any of the transactions is already in a compensation group
  const existingCompensationId = firstTransaction.compensationId || secondTransaction.compensationId;
  if (existingCompensationId) {
    const { oneSide } = await getCompensationTransactions({
      compensationId: existingCompensationId,
    });

    // if there is a one side, we need to check if the transaction we are adding is of the same type
    if (oneSide) {
      const transactionToBeAddedToCompensation = firstTransaction.compensationId ? secondTransaction : firstTransaction;
      const transactionType = Number(transactionToBeAddedToCompensation.amount) > 0 ? "income" : "expense";

      // throw an error if the type is equal to the one side
      if (transactionType === oneSide) throw new Error("Transações não podem ser compensadas.");
    }
  }

  const compensationId = existingCompensationId || randomUUID();

  await db.transaction(async (tx) => {
    await tx.update(transactions).set({ compensationId }).where(eq(transactions.id, firstId));
    await tx.update(transactions).set({ compensationId }).where(eq(transactions.id, secondId));
  });

  // now we need to update the effective amounts of all transactions in the compensation group
  await updateEffectiveAmounts({ compensationId });
}

export async function uncompensateTransaction({ transactionId }: { transactionId: string }) {
  const { compensationId, amount } = await getTransaction({ id: transactionId });
  if (!compensationId) throw new Error("Transação não está compensada.");

  // fetch all transactions that are compensated by the transaction
  const { oneSide } = await getCompensationTransactions({ compensationId });

  // if the transaction is in the one side, we can just remove the compensation
  const transactionType = Number(amount) > 0 ? "income" : "expense";
  if (transactionType === oneSide) {
    await db
      .update(transactions)
      .set({ compensationId: null, compensatedAmount: null })
      .where(eq(transactions.compensationId, compensationId));
  } else {
    // if the transaction is in the many side, we need to remove it from the compensation group and update the effective amounts
    await db
      .update(transactions)
      .set({ compensationId: null, compensatedAmount: null })
      .where(eq(transactions.id, transactionId));

    await updateEffectiveAmounts({ compensationId });
  }
}

export async function updateEffectiveAmounts({ compensationId }: { compensationId: string }) {
  const transactionsInGroup = await db.query.transactions.findMany({
    where: eq(transactions.compensationId, compensationId),
  });

  if (transactionsInGroup.length < 2) throw new Error("Transações não podem ser compensadas.");

  const remainingAmountsMap = calculateCompensatedAmounts(transactionsInGroup);

  await db.transaction(async (tx) => {
    for (const transaction of transactionsInGroup) {
      const effectiveAmount = remainingAmountsMap[transaction.id];

      await tx
        .update(transactions)
        .set({ compensatedAmount: effectiveAmount.toString() })
        .where(eq(transactions.id, transaction.id));
    }
  });
}
