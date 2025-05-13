import { relations, sql } from "drizzle-orm";
import { date, index, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { accounts } from "./accounts-schema";
import { budgets } from "./budgets-schema";
import { categories } from "./categories-schema";
import { statementTransactions } from "./statements-schema";

// --- Transactions Table ---
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    budgetId: uuid("budget_id").references(() => budgets.id, {
      onDelete: "set null",
    }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    compensatedAmount: numeric("compensated_amount", { precision: 12, scale: 2 }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    date: date("date").notNull(),
    transferId: uuid("transfer_id"),
    compensationId: uuid("compensation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("idx_transactions_account_id").on(t.accountId),
    index("idx_transactions_category_id").on(t.categoryId),
    index("idx_transactions_budget_id").on(t.budgetId),
    index("idx_transactions_date").on(t.date),
  ],
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  budget: one(budgets, {
    fields: [transactions.budgetId],
    references: [budgets.id],
  }),
  transfer: one(transactions, {
    fields: [transactions.transferId],
    references: [transactions.id],
  }),
  statementTransactions: one(statementTransactions),
}));
