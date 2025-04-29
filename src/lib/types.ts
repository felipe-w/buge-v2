import {
  accountReconciliations,
  accounts,
  accountTypes,
  authUsers,
  budgetItems,
  budgets,
  categories,
  groupMembers,
  groups,
  statements,
  statementTransactions,
  transactions,
} from "@/lib/db/schemas";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
  data?: Record<string, unknown>;
};

// Auth Form Schema
export const AuthFormSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
});
export const VerifyOTPFormSchema = AuthFormSchema.extend({
  otp: z.string().length(6, { message: "Código inválido" }),
});
export type AuthFormSchema = z.infer<typeof AuthFormSchema>;
export type VerifyOTPFormSchema = z.infer<typeof VerifyOTPFormSchema>;

// Accounts Schema Zod Schemas
export const AccountSchema = createSelectSchema(accounts);
export const NewAccountSchema = createInsertSchema(accounts);
export const EditAccountSchema = NewAccountSchema.omit({ groupId: true }).required({ id: true });
export const DeleteAccountSchema = NewAccountSchema.partial()
  .required({ id: true, groupId: true })
  .extend({
    deleteOption: z.enum(["cascade", "transfer"]),
    transferTo: z.string().uuid().optional(),
  });
export type Account = z.infer<typeof AccountSchema>;
export type NewAccount = z.infer<typeof NewAccountSchema>;
export type EditAccount = z.infer<typeof EditAccountSchema>;
export type DeleteAccount = z.infer<typeof DeleteAccountSchema>;

export type AccountType = (typeof accountTypes)[number];
export type AccountWithTransactions = Account & {
  transactions: (Transaction & { category: Category | null; account: Account })[];
};

export const AccountReconciliationSchema = createSelectSchema(accountReconciliations);
export const NewAccountReconciliationSchema = createInsertSchema(accountReconciliations);
export type AccountReconciliation = z.infer<typeof AccountReconciliationSchema>;
export type NewAccountReconciliation = z.infer<typeof NewAccountReconciliationSchema>;

// Budgets Schema Zod Schemas
export const BudgetSchema = createSelectSchema(budgets);
export const NewBudgetSchema = createInsertSchema(budgets);
export type Budget = z.infer<typeof BudgetSchema>;
export type NewBudget = z.infer<typeof NewBudgetSchema>;

export const BudgetItemSchema = createSelectSchema(budgetItems);
export const NewBudgetItemSchema = createInsertSchema(budgetItems);
export type BudgetItem = z.infer<typeof BudgetItemSchema>;
export type NewBudgetItem = z.infer<typeof NewBudgetItemSchema>;

// Categories Schema Zod Schemas
export const CategorySchema = createSelectSchema(categories);
export const NewCategorySchema = createInsertSchema(categories);
export const EditCategorySchema = NewCategorySchema.omit({ groupId: true, type: true }).required({ id: true });
export type Category = z.infer<typeof CategorySchema>;
export type NewCategory = z.infer<typeof NewCategorySchema>;
export type EditCategory = z.infer<typeof EditCategorySchema>;

export type CategoryWithChildren = Category & {
  children?: Category[];
};

// Groups Schema Zod Schemas
export const GroupSchema = createSelectSchema(groups);
export const NewGroupSchema = createInsertSchema(groups);
export const EditGroupSchema = NewGroupSchema.omit({ ownerId: true }).required({ id: true });
export const TransferOwnershipSchema = NewGroupSchema.omit({ name: true }).required({ id: true, ownerId: true });
export type Group = z.infer<typeof GroupSchema>;
export type NewGroup = z.infer<typeof NewGroupSchema>;
export type EditGroup = z.infer<typeof EditGroupSchema>;
export type TransferOwnership = z.infer<typeof TransferOwnershipSchema>;

export const GroupMemberSchema = createSelectSchema(groupMembers);
export const NewGroupMemberSchema = z.object({
  groupId: z.string().uuid(),
  email: z.string().email({ message: "E-mail inválido" }),
});
export const RemoveGroupMemberSchema = GroupMemberSchema.partial().required({ userId: true, groupId: true });

export type GroupMember = z.infer<typeof GroupMemberSchema>;
export type NewGroupMember = z.infer<typeof NewGroupMemberSchema>;
export type RemoveGroupMember = z.infer<typeof RemoveGroupMemberSchema>;

export type GroupWithMembers = Group & {
  groupMembers: (GroupMember & {
    user: User;
  })[];
};

// Statements Schema Zod Schemas
export const StatementSchema = createSelectSchema(statements);
export const NewStatementSchema = createInsertSchema(statements);
export type Statement = z.infer<typeof StatementSchema>;
export type NewStatement = z.infer<typeof NewStatementSchema>;

export const StatementTransactionSchema = createSelectSchema(statementTransactions);
export const NewStatementTransactionSchema = createInsertSchema(statementTransactions);
export type StatementTransaction = z.infer<typeof StatementTransactionSchema>;
export type NewStatementTransaction = z.infer<typeof NewStatementTransactionSchema>;

// Transactions Schema Zod Schemas
export const TransactionSchema = createSelectSchema(transactions);
export const NewTransactionSchema = createInsertSchema(transactions);
export type Transaction = z.infer<typeof TransactionSchema>;
export type NewTransaction = z.infer<typeof NewTransactionSchema>;

// Users Schema Zod Schemas
export const AuthUserSchema = createSelectSchema(authUsers);
export const NewAuthUserSchema = createInsertSchema(authUsers);
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type NewAuthUser = z.infer<typeof NewAuthUserSchema>;

export const UserSchema = AuthUserSchema;
export type User = Omit<z.infer<typeof UserSchema>, "image" | "selectedGroupId"> & {
  image?: string | null | undefined;
  selectedGroupId?: string | null | undefined;
};
