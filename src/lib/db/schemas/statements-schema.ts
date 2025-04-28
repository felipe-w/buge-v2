import { relations, sql } from "drizzle-orm";
import { date, index, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { accounts } from "./accounts-schema";
import { budgets } from "./budgets-schema";
import { transactions } from "./transactions-schema";

// --- Statements Table ---
export const statements = pgTable(
  "statements",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    budgetId: uuid("budget_id").references(() => budgets.id, {
      onDelete: "set null",
    }),
    statementType: varchar("statement_type", {
      length: 20,
      enum: ["credit_card", "bank"],
    })
      .notNull()
      .default("credit_card"),
    description: text("description"),
    expectedTotal: numeric("expected_total", { precision: 12, scale: 2 }),
    actualTotal: numeric("actual_total", { precision: 12, scale: 2 }),
    status: varchar("status", {
      length: 20,
      enum: ["pending", "imported", "error"],
    })
      .notNull()
      .default("pending"),
    errorMessage: text("error_message"),
    rawResponse: text("raw_response"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("idx_statements_account_id").on(t.accountId)],
);

export const statementsRelations = relations(statements, ({ one, many }) => ({
  account: one(accounts, {
    fields: [statements.accountId],
    references: [accounts.id],
  }),
  budget: one(budgets, {
    fields: [statements.budgetId],
    references: [budgets.id],
  }),
  statementTransactions: many(statementTransactions),
}));

export const statementTransactions = pgTable(
  "statement_transactions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    statementId: uuid("statement_id")
      .notNull()
      .references(() => statements.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    categoryName: varchar("category_name", { length: 255 }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    transactionId: uuid("transaction_id").references(() => transactions.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("idx_statement_transactions_statement_id").on(t.statementId),
    uniqueIndex("uq_statement_transactions_transaction_id").on(t.transactionId),
  ],
);

export const statementTransactionsRelations = relations(statementTransactions, ({ one }) => ({
  statement: one(statements, {
    fields: [statementTransactions.statementId],
    references: [statements.id],
  }),
  importedTransaction: one(transactions, {
    fields: [statementTransactions.transactionId],
    references: [transactions.id],
  }),
}));
