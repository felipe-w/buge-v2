"use server";

import { revalidatePath } from "next/cache";

import { validatedActionWithUser } from "@/lib/validate-form-data";
import {
  EditTransactionSchema,
  FormState,
  NewCompensateSchema,
  NewTransactionSchema,
  uuidSchema,
} from "@/lib/validations";

import {
  compensateTransactions,
  createTransaction,
  deleteTransaction,
  editTransaction,
  uncompensateTransaction,
} from "../data/transactions";

export const createTransactionAction = validatedActionWithUser(
  NewTransactionSchema,
  async (data): Promise<FormState> => {
    try {
      await createTransaction({ transaction: data });
      revalidatePath("/dashboard/transactions");

      return {
        success: true,
        message: "Transação criada com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        message: "Erro ao criar conta",
        errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
      };
    }
  },
);

export const editTransactionAction = validatedActionWithUser(
  EditTransactionSchema,
  async (data): Promise<FormState> => {
    try {
      await editTransaction({ transaction: data });
      revalidatePath("/dashboard/transactions");

      return {
        success: true,
        message: "Transação editada com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        message: "Erro ao criar conta",
        errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
      };
    }
  },
);

export const deleteTransactionAction = validatedActionWithUser(uuidSchema, async (data): Promise<FormState> => {
  try {
    await deleteTransaction({ id: data.id });
    revalidatePath("/dashboard/transactions");

    return {
      success: true,
      message: "Transação excluída com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao excluir transação",
      errors: {
        server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"],
      },
    };
  }
});

export const compensateTransactionsAction = validatedActionWithUser(
  NewCompensateSchema,
  async (data): Promise<FormState> => {
    try {
      if (data.firstId === data.secondId) {
        throw new Error("Não é possível vincular uma transação com ela mesma.");
      }

      await compensateTransactions({ firstId: data.firstId, secondId: data.secondId });
      revalidatePath("/dashboard/transactions");

      return {
        success: true,
        message: "Transações vinculadas com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        message: "Erro ao criar conta",
        errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
      };
    }
  },
);

export const uncompensateTransactionAction = validatedActionWithUser(uuidSchema, async (data): Promise<FormState> => {
  try {
    await uncompensateTransaction({ transactionId: data.id });
    revalidatePath("/dashboard/transactions");

    return {
      success: true,
      message: "Transação desvinculada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao desvincular transação",
      errors: {
        server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"],
      },
    };
  }
});
