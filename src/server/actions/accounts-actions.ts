"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validatedActionWithUser } from "@/lib/validate-form-data";
import { DeleteAccountSchema, EditAccountSchema, FormState, NewAccountSchema } from "@/lib/validations";

import { createAccount, deleteAccount, editAccount, transferAccountTransactions } from "../data/accounts";

export const createAccountAction = validatedActionWithUser(NewAccountSchema, async (data): Promise<FormState> => {
  try {
    await createAccount({ name: data.name, type: data.type, groupId: data.groupId });
    revalidatePath("/dashboard/accounts");

    return {
      success: true,
      message: "Conta criada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao criar conta",
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
});

export const editAccountAction = validatedActionWithUser(EditAccountSchema, async (data): Promise<FormState> => {
  try {
    await editAccount({ id: data.id, name: data.name, type: data.type });
    revalidatePath("/dashboard/accounts");

    return {
      success: true,
      message: "Conta editada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao editar conta",
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
});

export const deleteAccountAction = validatedActionWithUser(DeleteAccountSchema, async (data): Promise<FormState> => {
  try {
    if (data.deleteOption === "transfer" && data.transferTo) {
      await transferAccountTransactions({
        id: data.id,
        groupId: data.groupId,
        destinationId: data.transferTo,
      });
    } else if (data.deleteOption === "cascade") {
      // TODO: finalize cascade and invoke deleteAccountTransactions
      // await deleteAccountTransactions(validated.id, validated.groupId);
    }

    await deleteAccount({ id: data.id, groupId: data.groupId });
  } catch (error) {
    return {
      success: false,
      message: "Erro ao deletar conta",
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }

  redirect(`/dashboard/accounts?success=true`);
});
