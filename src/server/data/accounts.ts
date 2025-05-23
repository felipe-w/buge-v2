import "server-only";

import { count, eq, getTableColumns } from "drizzle-orm";

import { db } from "@/lib/db/drizzle";
import { accounts } from "@/lib/db/schemas/accounts-schema";
import { transactions } from "@/lib/db/schemas/transactions-schema";
import { AccountType } from "@/lib/db/types";

import { checkGroupOwnership } from "./groups";

export async function getGroupAccounts({ groupId }: { groupId: string }) {
  return await db
    .select({
      ...getTableColumns(accounts),
      transactions: count(transactions.id),
    })
    .from(accounts)
    .leftJoin(transactions, eq(accounts.id, transactions.accountId))
    .where(eq(accounts.groupId, groupId))
    .groupBy(accounts.id);
}

export async function getAccountById({ id }: { id: string }) {
  return await db.query.accounts.findFirst({ where: eq(accounts.id, id) });
}

export async function getAccountAndTransactions({ accountId }: { accountId: string }) {
  const result = await db.query.accounts.findFirst({
    where: eq(accounts.id, accountId),
    with: {
      transactions: {
        with: {
          category: true,
          account: true,
          budget: true,
          transfer: {
            with: {
              account: true,
            },
          },
        },
      },
    },
  });

  if (!result) throw new Error("Conta não encontrada");
  return result;
}

export async function createAccount({ name, type, groupId }: { name: string; type: AccountType; groupId: string }) {
  return await db.insert(accounts).values({ name, type, groupId });
}

export async function editAccount({ id, name, type }: { id: string; name: string; type: AccountType }) {
  return await db.update(accounts).set({ name, type }).where(eq(accounts.id, id));
}

export async function deleteAccount({ id, groupId }: { id: string; groupId: string }) {
  await checkGroupOwnership({ groupId });

  // need to manually delete transactions in order to deal with linked transactions

  return await db.delete(accounts).where(eq(accounts.id, id));
}

export async function transferAccountTransactions({
  id,
  groupId,
  destinationId,
}: {
  id: string;
  groupId: string;
  destinationId: string;
}) {
  await checkGroupOwnership({ groupId });

  return await db.update(transactions).set({ accountId: destinationId }).where(eq(transactions.accountId, id));
}

// TODO: delete transactions properly
// export async function deleteAccountTransactions(id: string) {
//   return await db.delete(transactions).where(eq(transactions.accountId, id));
// }
