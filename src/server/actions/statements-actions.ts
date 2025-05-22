"use server";

import { revalidatePath } from "next/cache";

import { validatedActionWithUser } from "@/lib/validate-form-data";
import { FormState, NewStatementSchema, uuidSchema } from "@/lib/validations";

import {
  createStatement,
  deleteStatement,
  getStatement,
  importTransactions,
  removeFromStorage,
  updateStatement,
  uploadToStorage,
} from "../data/statements";
import { checkAuthSession } from "../data/users";
import { processStatement } from "../services/statements-services";

export const createStatementAction = validatedActionWithUser(NewStatementSchema, async (data): Promise<FormState> => {
  try {
    // Create statement
    const newStatement = await createStatement(data);

    // Upload pdf to vercel blob storage and save the url to the db
    const { url } = await uploadToStorage({ content: data.pdfFile as File, statementId: newStatement.id });
    const updatedStatement = await updateStatement(newStatement.id, { fileUrl: url });

    // send the statement to the background job/service
    processStatement({ id: updatedStatement.id });
    revalidatePath(`/dashboard/statements`);

    return {
      success: true,
      message: "Extrato enviado com sucesso",
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao importar extrato",
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
});

export const validateStatementAction = validatedActionWithUser(uuidSchema, async (data): Promise<FormState> => {
  try {
    const transactions = await importTransactions(data.id);
    if (transactions.length === 0) {
      return {
        success: false,
        message: "Nenhuma transação importada",
        errors: { server: ["Nenhuma transação importada"] },
      };
    }

    // update the statement status to reviewing
    await updateStatement(data.id, { status: "imported" });

    return {
      success: true,
      message: "Extrato enviado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao importar extrato",
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
});

export async function deleteStatementAction({ id }: { id: string }) {
  await checkAuthSession();

  try {
    const statement = await getStatement({ id });
    if (statement.status === "imported") {
      throw new Error("Não é possível excluir um extrato que já foi importado");
    }

    await deleteStatement({ id: statement.id });
    if (statement.fileUrl) {
      await removeFromStorage({ fileUrl: statement.fileUrl });
    }

    return {
      success: true,
      message: "Extrato excluído com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao excluir extrato",
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
}
