import { relations, sql } from "drizzle-orm";
import { AnyPgColumn, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { budgetItems } from "./budgets-schema";
import { groups } from "./groups-schema";
import { transactions } from "./transactions-schema";

// --- Categories Table ---
export const categories = pgTable(
  "categories",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", { enum: ["income", "expense"] }).notNull(),
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("idx_categories_group_id").on(t.groupId)],
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  group: one(groups, {
    fields: [categories.groupId],
    references: [groups.id],
  }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parentCategory",
  }),
  children: many(categories, {
    relationName: "parentCategory",
  }),
  budgetItems: many(budgetItems),
  transactions: many(transactions),
}));
