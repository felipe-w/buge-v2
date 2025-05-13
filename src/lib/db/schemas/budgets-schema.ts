import { relations, sql } from "drizzle-orm";
import { date, index, numeric, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { categories } from "./categories-schema";
import { groups } from "./groups-schema";
import { statements } from "./statements-schema";
import { transactions } from "./transactions-schema";

// --- Budgets Table ---
export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    date: date("date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("idx_budgets_group_id").on(t.groupId)],
);

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  group: one(groups, {
    fields: [budgets.groupId],
    references: [groups.id],
  }),
  items: many(budgetItems),
  transactions: many(transactions),
  statements: many(statements),
}));

// --- Budget Items Table ---
export const budgetItems = pgTable(
  "budget_items",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("idx_budget_items_budget_id").on(t.budgetId)],
);

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetItems.budgetId],
    references: [budgets.id],
  }),
  category: one(categories, {
    fields: [budgetItems.categoryId],
    references: [categories.id],
  }),
}));
