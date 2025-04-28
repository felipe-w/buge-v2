"use server";

import {
  EditGroupSchema,
  FormState,
  NewGroupMemberSchema,
  NewGroupSchema,
  RemoveGroupMemberSchema,
  TransferOwnershipSchema,
} from "@/lib/types";
import { validateFormData, ValidationError } from "@/lib/validate-form-data";
import { revalidatePath } from "next/cache";
import { addMember, createGroup, deleteGroup, editGroup, removeMember, transferOwnership } from "../data/groups";

export async function createGroupAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const validated = validateFormData(formData, NewGroupSchema);
    const group = await createGroup(validated.name, validated.ownerId);

    revalidatePath("/dashboard/groups");

    return {
      success: true,
      message: "Grupo criado com sucesso",
      data: group,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao criar grupo",
      errors:
        error instanceof ValidationError
          ? error.errors
          : { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
}

export async function editGroupAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const validated = validateFormData(formData, EditGroupSchema);
    const group = await editGroup(validated.id, validated.name);

    revalidatePath("/dashboard/groups");

    return {
      success: true,
      message: "Grupo editado com sucesso",
      data: group,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao editar grupo",
      errors:
        error instanceof ValidationError
          ? error.errors
          : { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
}

export async function deleteGroupAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    // same as edit group schema
    const validated = validateFormData(formData, EditGroupSchema);
    await deleteGroup(validated.id, validated.name);

    revalidatePath("/dashboard/groups");

    return {
      success: true,
      message: "Grupo deletado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao deletar grupo",
      errors:
        error instanceof ValidationError
          ? error.errors
          : { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
}

export async function addMemberAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const validated = validateFormData(formData, NewGroupMemberSchema);
    await addMember(validated.groupId, validated.email);

    revalidatePath("/dashboard/groups");

    return {
      success: true,
      message: "Membro adicionado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao adicionar membro",
      errors:
        error instanceof ValidationError
          ? error.errors
          : { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
}

export async function removeMemberAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const validated = validateFormData(formData, RemoveGroupMemberSchema);
    await removeMember(validated.groupId, validated.userId);

    revalidatePath("/dashboard/groups");

    return {
      success: true,
      message: "Membro removido com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao remover membro",
      errors:
        error instanceof ValidationError
          ? error.errors
          : { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
}

export async function transferOwnershipAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const validated = validateFormData(formData, TransferOwnershipSchema);
    await transferOwnership(validated.id, validated.ownerId);

    revalidatePath("/dashboard/groups");

    return {
      success: true,
      message: "Proprietário do grupo transferido com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao transferir proprietário do grupo",
      errors:
        error instanceof ValidationError
          ? error.errors
          : { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
}
