import { relations, sql } from "drizzle-orm";
import { index, jsonb, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { ExtractedTransaction } from "@/lib/validations";

import { accounts } from "./accounts-schema";
import { budgets } from "./budgets-schema";
import { transactions } from "./transactions-schema";

export const statementStatuses = ["extracting", "validating", "imported", "failed"] as const;

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
    status: varchar("status", {
      length: 20,
      enum: statementStatuses,
    })
      .notNull()
      .default("extracting"),
    fileUrl: text("file_url"),
    aiResponse: jsonb("ai_response").$type<ExtractedTransaction[]>(),
    error: text("error"),
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
  transactions: many(transactions),
}));
