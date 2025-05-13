"use server";

import { revalidatePath } from "next/cache";

import { validatedActionWithUser } from "@/lib/validate-form-data";
import { EditCategorySchema, FormState, NewCategorySchema } from "@/lib/validations";

import { createCategory, editCategory } from "../data/categories";

export const createParentCategoryAction = validatedActionWithUser(
  NewCategorySchema,
  async (data, formData): Promise<FormState> => {
    try {
      const childCategories = formData.getAll("child_categories");

      // create parent category
      const parentCategory = await createCategory({
        name: data.name,
        groupId: data.groupId,
        type: data.type,
      });

      if (childCategories.length > 0) {
        for (const childCategory of childCategories) {
          await createCategory({
            name: childCategory as string,
            groupId: data.groupId,
            type: data.type,
            parentId: parentCategory.id,
          });
        }
      }

      revalidatePath("/dashboard/categories");

      return {
        success: true,
        message: "Categoria criada com sucesso",
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

export const addSubCategoryAction = validatedActionWithUser(NewCategorySchema, async (data): Promise<FormState> => {
  try {
    await createCategory({
      name: data.name,
      groupId: data.groupId,
      type: data.type,
      parentId: data.parentId,
    });

    revalidatePath("/dashboard/categories");

    return {
      success: true,
      message: "Subcategoria criada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao criar conta",
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
});

export const editCategoryAction = validatedActionWithUser(EditCategorySchema, async (data): Promise<FormState> => {
  try {
    // Special handling for parentId if needed
    const parentId = data.parentId === "none" ? null : data.parentId;

    await editCategory({
      id: data.id,
      name: data.name,
      parentId,
    });

    revalidatePath("/dashboard/categories");

    return {
      success: true,
      message: "Categoria editada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao criar conta",
      errors: { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }
});
