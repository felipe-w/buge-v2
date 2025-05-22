import "server-only";

import { del, put } from "@vercel/blob";
import { eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db/drizzle";
import { statements } from "@/lib/db/schemas/statements-schema";
import { transactions } from "@/lib/db/schemas/transactions-schema";
import { Statement, StatementWithAllJoins } from "@/lib/db/types";
import { NewStatement } from "@/lib/validations";

import { getGroupAccounts } from "./accounts";

export async function getGroupStatements({ groupId }: { groupId: string }) {
  const accounts = await getGroupAccounts({ groupId });

  const result = await db.query.statements.findMany({
    where: inArray(
      statements.accountId,
      accounts.map((account) => account.id),
    ),
    with: { account: true },
  });
  return result;
}

export async function getStatement({ id }: { id: string }): Promise<StatementWithAllJoins> {
  const result = await db.query.statements.findFirst({
    where: eq(statements.id, id),
    with: {
      account: true,
      transactions: {
        with: { account: true, category: true, budget: true, transfer: { with: { account: true } } },
      },
    },
  });

  if (!result) throw new Error("Extrato não encontrado");

  return result;
}

export async function createStatement(statement: NewStatement) {
  const result = await db.insert(statements).values(statement).returning();
  return result[0];
}

export async function updateStatement(statementId: string, data: Partial<Statement>) {
  const result = await db.update(statements).set(data).where(eq(statements.id, statementId)).returning();
  return result[0];
}

export async function importTransactions(statementId: string) {
  const statement = await getStatement({ id: statementId });
  const extractedTransactions = statement.aiResponse;
  if (!extractedTransactions) throw new Error("Não há transações para importar");

  const transactionsToImport = extractedTransactions.map((t) => ({
    date: t.date,
    accountId: statement.accountId,
    budgetId: statement.budgetId,
    description: t.description,
    title: t.title,
    amount: t.amount,
    categoryId: t.categoryId,
    statementId,
  }));

  const insertedTransactions = await db.insert(transactions).values(transactionsToImport).returning();
  return insertedTransactions;
}

export async function deleteStatement({ id }: { id: string }) {
  const result = await db.delete(statements).where(eq(statements.id, id)).returning();
  return result[0];
}

export async function uploadToStorage({ content, statementId }: { content: File; statementId: string }) {
  return await put(`statements/${statementId}.pdf`, content, { access: "public" });
}

export async function removeFromStorage({ fileUrl }: { fileUrl: string }) {
  await del(fileUrl);
}
