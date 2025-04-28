import { relations, sql } from "drizzle-orm";
import { date, index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { groups } from "./groups-schema";
import { statements } from "./statements-schema";
import { transactions } from "./transactions-schema";

export const accountTypes = ["checking", "savings", "credit_card", "investment", "cash", "other"] as const;

// --- Bank Accounts Table ---
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", {
      enum: accountTypes,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("idx_accounts_group_id").on(t.groupId)],
);

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  group: one(groups, {
    fields: [accounts.groupId],
    references: [groups.id],
  }),
  transactions: many(transactions),
  reconciliations: many(accountReconciliations),
  statements: many(statements),
}));

// --- Bank Account Reconciliations Table ---
export const accountReconciliations = pgTable(
  "account_reconciliations",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    balance: numeric("balance", { precision: 12, scale: 2 }).notNull(),
    reconciliationDate: date("reconciliation_date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("idx_account_reconciliations_account_id").on(t.accountId)],
);

export const accountReconciliationsRelations = relations(accountReconciliations, ({ one }) => ({
  account: one(accounts, {
    fields: [accountReconciliations.accountId],
    references: [accounts.id],
  }),
}));
