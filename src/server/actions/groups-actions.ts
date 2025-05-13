"use server";

import { revalidatePath } from "next/cache";

import { validatedActionWithUser } from "@/lib/validate-form-data";
import {
  EditGroupSchema,
  FormState,
  NewGroupMemberSchema,
  NewGroupSchema,
  RemoveGroupMemberSchema,
  TransferOwnershipSchema,
} from "@/lib/validations";

import { addMember, createGroup, deleteGroup, editGroup, removeMember, transferOwnership } from "../data/groups";

export const createGroupAction = validatedActionWithUser(NewGroupSchema, async (data): Promise<FormState> => {
  try {
    const group = await createGroup({ name: data.name, ownerId: data.ownerId });

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
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
});

export const editGroupAction = validatedActionWithUser(EditGroupSchema, async (data): Promise<FormState> => {
  try {
    const group = await editGroup({ id: data.id, name: data.name });

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
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
});

export const deleteGroupAction = validatedActionWithUser(EditGroupSchema, async (data): Promise<FormState> => {
  try {
    await deleteGroup({ id: data.id, name: data.name });

    revalidatePath("/dashboard/groups");

    return {
      success: true,
      message: "Grupo deletado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao deletar grupo",
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
});

export const addMemberAction = validatedActionWithUser(NewGroupMemberSchema, async (data): Promise<FormState> => {
  try {
    await addMember({ groupId: data.groupId, email: data.email });

    revalidatePath("/dashboard/groups");

    return {
      success: true,
      message: "Membro adicionado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao adicionar membro",
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
});

export const removeMemberAction = validatedActionWithUser(RemoveGroupMemberSchema, async (data): Promise<FormState> => {
  try {
    await removeMember({ groupId: data.groupId, userId: data.userId });

    revalidatePath("/dashboard/groups");

    return {
      success: true,
      message: "Membro removido com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao remover membro",
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
});

export const transferOwnershipAction = validatedActionWithUser(
  TransferOwnershipSchema,
  async (data): Promise<FormState> => {
    try {
      await transferOwnership({ id: data.id, ownerId: data.ownerId });

      revalidatePath("/dashboard/groups");

      return {
        success: true,
        message: "Proprietário do grupo transferido com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        message: "Erro ao transferir proprietário do grupo",
        errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
      };
    }
  },
);
