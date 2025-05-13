import "server-only";

import { put } from "@vercel/blob";
import { eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db/drizzle";
import { statements, statementTransactions as statementTransactionsSchema } from "@/lib/db/schemas/statements-schema";
import { transactions } from "@/lib/db/schemas/transactions-schema";
import { Statement, StatementWithAllJoins } from "@/lib/db/types";
import { ExtractedTransaction, NewStatement } from "@/lib/validations";

import { getGroupAccounts } from "./accounts";

export async function getGroupStatements({ groupId }: { groupId: string }) {
  const accounts = await getGroupAccounts({ groupId });

  const result = await db.query.statements.findMany({
    where: inArray(
      statements.accountId,
      accounts.map((account) => account.id),
    ),
    with: { statementTransactions: { with: { category: true } }, account: true },
  });
  return result;
}

export async function getStatement({ id }: { id: string }): Promise<StatementWithAllJoins> {
  const result = await db.query.statements.findFirst({
    where: eq(statements.id, id),
    with: { statementTransactions: { with: { category: true } }, account: true },
  });

  if (!result) throw new Error("Extrato não encontrado");

  return result;
}

export async function createStatement(statement: NewStatement) {
  const result = await db.insert(statements).values(statement).returning();
  return result[0];
}

export async function uploadToStorage({ content, statementId }: { content: File; statementId: string }) {
  return await put(`statements/${statementId}.pdf`, content, { access: "public" });
}

export async function updateStatement(statementId: string, data: Partial<Statement>) {
  const result = await db.update(statements).set(data).where(eq(statements.id, statementId)).returning();
  return result[0];
}

export async function addStatementTransactions(statementId: string, transactions: ExtractedTransaction[]) {
  const result = await db
    .insert(statementTransactionsSchema)
    .values(
      transactions.map(({ category, ...t }) => ({
        ...t,
        statementId,
        categoryId: !category || category === "null" || category === "undefined" ? null : category,
      })),
    )
    .returning();
  return result;
}

export async function importTransactions(statementId: string) {
  const statement = await getStatement({ id: statementId });

  const transactionsToImport = statement.statementTransactions.map((st) => ({
    id: st.id,
    date: st.date,
    accountId: statement.accountId,
    budgetId: statement.budgetId,
    description: st.description,
    title: st.title,
    amount: st.amount,
    categoryId: st.categoryId,
  }));

  const insertedCoreTransactions = await db.insert(transactions).values(transactionsToImport).returning();
  return insertedCoreTransactions;
}
