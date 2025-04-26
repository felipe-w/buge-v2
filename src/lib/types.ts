import { users } from "@/lib/db/schemas/auth-schema";
import { bankAccountReconciliations, bankAccounts } from "@/lib/db/schemas/bank-accounts-schema";
import { budgetItems, budgets } from "@/lib/db/schemas/budgets-schema";
import { categories } from "@/lib/db/schemas/categories-schema";
import { groupMembers, groups } from "@/lib/db/schemas/groups-schema";
import { statements, statementTransactions } from "@/lib/db/schemas/statements-schema";
import { transactions } from "@/lib/db/schemas/transactions-schema";
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

// Bank Accounts Schema Zod Schemas
export const BankAccountSchema = createSelectSchema(bankAccounts);
export const NewBankAccountSchema = createInsertSchema(bankAccounts);
export type BankAccount = z.infer<typeof BankAccountSchema>;
export type NewBankAccount = z.infer<typeof NewBankAccountSchema>;

export const BankAccountReconciliationSchema = createSelectSchema(bankAccountReconciliations);
export const NewBankAccountReconciliationSchema = createInsertSchema(bankAccountReconciliations);
export type BankAccountReconciliation = z.infer<typeof BankAccountReconciliationSchema>;
export type NewBankAccountReconciliation = z.infer<typeof NewBankAccountReconciliationSchema>;

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
export type Category = z.infer<typeof CategorySchema>;
export type NewCategory = z.infer<typeof NewCategorySchema>;

// Groups Schema Zod Schemas
export const GroupSchema = createSelectSchema(groups);
export const NewGroupSchema = createInsertSchema(groups);
export type Group = z.infer<typeof GroupSchema>;
export type NewGroup = z.infer<typeof NewGroupSchema>;

export const GroupMemberSchema = createSelectSchema(groupMembers);
export const NewGroupMemberSchema = createInsertSchema(groupMembers);
export type GroupMember = z.infer<typeof GroupMemberSchema>;
export type NewGroupMember = z.infer<typeof NewGroupMemberSchema>;

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
export const UserSchema = createSelectSchema(users);
export const NewUserSchema = createInsertSchema(users);
export type User = Omit<z.infer<typeof UserSchema>, "image"> & {
  image?: string | null | undefined;
};
export type NewUser = z.infer<typeof NewUserSchema>;
