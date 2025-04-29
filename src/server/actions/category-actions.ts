"use server";

import { EditCategorySchema, FormState, NewCategorySchema } from "@/lib/types";
import { validateFormData } from "@/lib/validate-form-data";
import { revalidatePath } from "next/cache";
import { createCategory, editCategory } from "../data/categories";

export async function createParentCategoryAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const validated = validateFormData(formData, NewCategorySchema);
    const childCategories = formData.getAll("child_categories");

    // create parent category
    const parentCategory = await createCategory({
      name: validated.name,
      groupId: validated.groupId,
      type: validated.type,
    });

    if (childCategories.length > 0) {
      for (const childCategory of childCategories) {
        await createCategory({
          name: childCategory as string,
          groupId: validated.groupId,
          type: validated.type,
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
      message: "Erro ao criar categoria",
      errors: {
        server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"],
      },
    };
  }
}

export async function addSubCategoryAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const validated = validateFormData(formData, NewCategorySchema);

    await createCategory({
      name: validated.name,
      groupId: validated.groupId,
      type: validated.type,
      parentId: validated.parentId,
    });

    revalidatePath("/dashboard/categories");

    return {
      success: true,
      message: "Subcategoria criada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao adicionar subcategoria",
      errors: {
        server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"],
      },
    };
  }
}

export async function editCategoryAction(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    // Convert FormData to a plain object
    const rawFormData = Object.fromEntries(formData.entries());
    const dataToValidate = {
      ...rawFormData,
      parentId: rawFormData.parentId === "none" ? null : rawFormData.parentId,
    };

    const validated = EditCategorySchema.parse(dataToValidate);

    await editCategory({
      id: validated.id,
      name: validated.name,
      parentId: validated.parentId,
    });

    revalidatePath("/dashboard/categories");

    return {
      success: true,
      message: "Categoria editada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao editar categoria",
      errors: {
        server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"],
      },
    };
  }
}
