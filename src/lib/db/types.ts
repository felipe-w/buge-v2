import { User as UserFromBetterAuth } from "better-auth";

import { accounts, accountTypes } from "./schemas/accounts-schema";
import { budgets } from "./schemas/budgets-schema";
import { categories } from "./schemas/categories-schema";
import { groupMembers, groups } from "./schemas/groups-schema";
import { statements, statementStatuses } from "./schemas/statements-schema";
import { transactions } from "./schemas/transactions-schema";

// accounts
export type Account = typeof accounts.$inferSelect;
export type AccountWithTransactions = Account & { transactions: TransactionWithAllJoins[] };
export type AccountType = (typeof accountTypes)[number];

// budgets
export type Budget = typeof budgets.$inferSelect;

// categories
export type Category = typeof categories.$inferSelect;
export type CategoryWithChildren = Category & { children?: Category[] };

// groups
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type GroupWithMembers = Group & { groupMembers: (GroupMember & { user: User })[] };

// statements
export type Statement = typeof statements.$inferSelect;
export type StatementStatus = (typeof statementStatuses)[number];
export type StatementWithAllJoins = Statement & {
  account: Account;
  transactions?: TransactionWithAllJoins[];
};

// transactions
export type Transaction = typeof transactions.$inferSelect;
export type TransactionWithAccount = Transaction & { account: Account };
export type TransactionWithAllJoins = Transaction & {
  account: Account;
  category?: Category | null;
  budget?: Budget | null;
  transfer?: TransactionWithAccount | null;
};

export type TransactionType = "transfer" | "expense" | "income";

// users
export type User = UserFromBetterAuth & {
  selectedGroupId?: string | null | undefined;
};
