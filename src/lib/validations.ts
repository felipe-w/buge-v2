import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import {
  accountReconciliations,
  accounts,
  budgetItems,
  budgets,
  categories,
  groups,
  statements,
  statementTransactions,
  transactions,
} from "@/lib/db/schemas";

// helpers
const numericStringSchema = z
  .string({
    required_error: "Este campo é obrigatório",
    invalid_type_error: "Deve ser um texto",
  })
  .trim()
  .refine((s) => s.length > 0, { message: "Valor não pode ser vazio" })
  .pipe(
    z.coerce.number().finite({ message: "Número deve ser finito" }).positive({ message: "Número deve ser positivo" }),
  )
  .transform(String);

export type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
  data?: Record<string, unknown>;
};

export const uuidSchema = z.object({ id: z.string().uuid({ message: "ID inválido" }) });
export type UUID = z.infer<typeof uuidSchema>;

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
export const NewAccountSchema = createInsertSchema(accounts);
export const EditAccountSchema = NewAccountSchema.omit({ groupId: true }).required({ id: true });
export const DeleteAccountSchema = NewAccountSchema.partial()
  .required({ id: true, groupId: true })
  .extend({
    deleteOption: z.enum(["cascade", "transfer"]),
    transferTo: z.string().uuid().optional(),
  });

export type NewAccount = z.infer<typeof NewAccountSchema>;
export type EditAccount = z.infer<typeof EditAccountSchema>;
export type DeleteAccount = z.infer<typeof DeleteAccountSchema>;

export const NewAccountReconciliationSchema = createInsertSchema(accountReconciliations);
export type NewAccountReconciliation = z.infer<typeof NewAccountReconciliationSchema>;

// Budgets Schema Zod Schemas
export const NewBudgetSchema = createInsertSchema(budgets);
export type NewBudget = z.infer<typeof NewBudgetSchema>;

export const NewBudgetItemSchema = createInsertSchema(budgetItems);
export type NewBudgetItem = z.infer<typeof NewBudgetItemSchema>;

// Categories Schema Zod Schemas
export const NewCategorySchema = createInsertSchema(categories);
export const EditCategorySchema = NewCategorySchema.omit({ groupId: true, type: true }).required({ id: true });
export type NewCategory = z.infer<typeof NewCategorySchema>;
export type EditCategory = z.infer<typeof EditCategorySchema>;

// Groups Schema Zod Schemas
export const NewGroupSchema = createInsertSchema(groups);
export const EditGroupSchema = NewGroupSchema.omit({ ownerId: true }).required({ id: true });
export const TransferOwnershipSchema = NewGroupSchema.omit({ name: true }).required({ id: true, ownerId: true });
export type NewGroup = z.infer<typeof NewGroupSchema>;
export type EditGroup = z.infer<typeof EditGroupSchema>;
export type TransferOwnership = z.infer<typeof TransferOwnershipSchema>;

export const NewGroupMemberSchema = z.object({
  groupId: z.string().uuid(),
  email: z.string().email({ message: "E-mail inválido" }),
});

export const RemoveGroupMemberSchema = z.object({
  userId: z.string().uuid(),
  groupId: z.string().uuid(),
});

export type NewGroupMember = z.infer<typeof NewGroupMemberSchema>;
export type RemoveGroupMember = z.infer<typeof RemoveGroupMemberSchema>;

// Statements Schema Zod Schemas

export const NewStatementSchema = createInsertSchema(statements)
  .extend({
    statementType: z.enum(["credit_card", "bank"], { message: "Tipo de extrato inválido" }),
    pdfFile: z
      .any()
      .refine((file) => file instanceof File && file.type === "application/pdf" && file.size <= 4 * 1024 * 1024, {
        message: "Arquivo PDF é obrigatório e deve ter no máximo 4MB",
      }),
    expectedTotal: numericStringSchema.optional(), // Only required for credit_card via superRefine
    budgetId: z.string().uuid().optional(),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.statementType === "credit_card") {
      if (!data.expectedTotal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valor é obrigatório para cartão de crédito",
          path: ["expectedTotal"],
        });
      }
    }
  });
export type NewStatement = z.infer<typeof NewStatementSchema>;

export const NewStatementTransactionSchema = createInsertSchema(statementTransactions);
export type NewStatementTransaction = z.infer<typeof NewStatementTransactionSchema>;

// Transactions Schema Zod Schemas
const BaseTransactionSchemaFields = createInsertSchema(transactions, {
  amount: numericStringSchema,
}).extend({
  type: z.enum(["transfer", "expense", "income"]),
  destinationAccountId: z.string().uuid().optional(),
});

export const NewTransactionSchema = BaseTransactionSchemaFields.superRefine((data, ctx) => {
  if (data.type === "transfer") {
    if (!data.destinationAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Conta de destino é obrigatória",
      });
    } else if (data.destinationAccountId === data.accountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Conta de destino não pode ser a mesma conta de origem",
      });
    }
  }
});

export const EditTransactionSchema = BaseTransactionSchemaFields.partial().required({ id: true });

export type NewTransaction = z.infer<typeof NewTransactionSchema>;
export type EditTransaction = z.infer<typeof EditTransactionSchema>;

export const NewCompensateSchema = z.object({
  firstId: z.string().uuid(),
  secondId: z.string().uuid(),
});

export type NewCompensate = z.infer<typeof NewCompensateSchema>;

// Extracted Transactions
export const ExtractedTransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data deve estar no formato YYYY-MM-DD" }),
  title: z.string().min(1, { message: "Título é obrigatório" }),
  description: z.string().optional(),
  category: z.string().optional(),
  amount: z.string(),
});

export type ExtractedTransaction = z.infer<typeof ExtractedTransactionSchema>;
