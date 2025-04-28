"use server";

import { DeleteAccountSchema, EditAccountSchema, FormState, NewAccountSchema } from "@/lib/types";
import { validateFormData, ValidationError } from "@/lib/validate-form-data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAccount, deleteAccount, editAccount, transferAccountTransactions } from "../data/accounts";

export async function createAccountAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const validated = validateFormData(formData, NewAccountSchema);
    await createAccount(validated.name, validated.type, validated.groupId);

    revalidatePath("/dashboard/accounts");

    return {
      success: true,
      message: "Conta criada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao criar conta",
      errors:
        error instanceof ValidationError
          ? error.errors
          : { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
}

export async function editAccountAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const validated = validateFormData(formData, EditAccountSchema);
    await editAccount(validated.id, validated.name, validated.type);

    revalidatePath("/dashboard/accounts");

    return {
      success: true,
      message: "Conta editada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao editar conta",
      errors:
        error instanceof ValidationError
          ? error.errors
          : { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
}

export async function deleteAccountAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const validated = validateFormData(formData, DeleteAccountSchema);

    if (validated.deleteOption === "transfer" && validated.transferTo) {
      await transferAccountTransactions(validated.id, validated.groupId, validated.transferTo);
    } else if (validated.deleteOption === "cascade") {
      // TODO: finalize cascade and invoke deleteAccountTransactions
      // await deleteAccountTransactions(validated.id, validated.groupId);
    }

    await deleteAccount(validated.id, validated.groupId);
  } catch (error) {
    return {
      success: false,
      message: "Erro ao deletar conta",
      errors:
        error instanceof ValidationError
          ? error.errors
          : { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }

  redirect(`/dashboard/accounts?success=true`);
}
