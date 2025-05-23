import { relations, sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { accounts } from "./accounts-schema";
import { authUsers } from "./auth-schema";
import { budgets } from "./budgets-schema";
import { categories } from "./categories-schema";

// --- Groups Table ---
export const groups = pgTable(
  "groups",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => authUsers.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("idx_groups_owner_id").on(t.ownerId)],
);

export const groupsRelations = relations(groups, ({ one, many }) => ({
  owner: one(authUsers, {
    fields: [groups.ownerId],
    references: [authUsers.id],
  }),
  groupMembers: many(groupMembers),
  accounts: many(accounts),
  categories: many(categories),
  budgets: many(budgets),
}));

// --- Group Members Table ---
export const groupMembers = pgTable(
  "group_members",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("group_members_group_id_user_id_key").on(t.groupId, t.userId),
    index("idx_group_members_group_id").on(t.groupId),
    index("idx_group_members_user_id").on(t.userId),
  ],
);

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(authUsers, {
    fields: [groupMembers.userId],
    references: [authUsers.id],
  }),
}));
