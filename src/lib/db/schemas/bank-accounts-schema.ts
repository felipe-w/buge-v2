import { relations, sql } from "drizzle-orm";
import { date, index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { groups } from "./groups-schema";
import { statements } from "./statements-schema";
import { transactions } from "./transactions-schema";

// --- Bank Accounts Table ---
export const bankAccounts = pgTable(
  "bank_accounts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", {
      enum: ["checking", "savings", "credit_card", "investment", "cash", "other"],
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("idx_bank_accounts_group_id").on(t.groupId)],
);

export const bankAccountsRelations = relations(bankAccounts, ({ one, many }) => ({
  group: one(groups, {
    fields: [bankAccounts.groupId],
    references: [groups.id],
  }),
  transactions: many(transactions),
  reconciliations: many(bankAccountReconciliations),
  statements: many(statements),
}));

// --- Bank Account Reconciliations Table ---
export const bankAccountReconciliations = pgTable(
  "bank_account_reconciliations",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    bankAccountId: uuid("bank_account_id")
      .notNull()
      .references(() => bankAccounts.id, { onDelete: "cascade" }),
    balance: numeric("balance", { precision: 12, scale: 2 }).notNull(),
    reconciliationDate: date("reconciliation_date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("idx_bank_account_reconciliations_bank_account_id").on(t.bankAccountId)],
);

export const bankAccountReconciliationsRelations = relations(bankAccountReconciliations, ({ one }) => ({
  bankAccount: one(bankAccounts, {
    fields: [bankAccountReconciliations.bankAccountId],
    references: [bankAccounts.id],
  }),
}));
