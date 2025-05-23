import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db/drizzle";
import { categories } from "@/lib/db/schemas";
import { EditCategory, NewCategory } from "@/lib/validations";

import { getCurrentUser } from "./users";

export async function getGroupCategories({ groupId }: { groupId: string }) {
  const groupIdToUse = groupId ?? (await getCurrentUser()).selectedGroupId;
  if (!groupIdToUse) throw new Error("Grupo não selecionado");

  const result = await db.query.categories.findMany({
    where: and(eq(categories.groupId, groupIdToUse), isNull(categories.parentId)),
    with: {
      children: true,
    },
  });

  if (!result) throw new Error("Categorias não encontradas");
  return result;
}

export async function getCategory({ id }: { id: string }) {
  const result = await db.query.categories.findFirst({ where: eq(categories.id, id), with: { children: true } });

  if (!result) throw new Error("Categoria não encontrada");
  return result;
}

export async function createCategory({ name, groupId, type, parentId }: NewCategory) {
  const [category] = await db.insert(categories).values({ name, groupId, type, parentId }).returning();
  return category;
}

export async function editCategory({ id, name, parentId }: EditCategory) {
  const category = await getCategory({ id });
  if (!category) throw new Error("Categoria não encontrada.");

  if (parentId) {
    const parentCategory = await getCategory({ id: parentId });
    if (!parentCategory) throw new Error("Categoria principal não encontrada.");

    // if the parent category is standalone (has no children) or has a parent_id, it can't be a parent
    if (parentCategory.children.length === 0 || parentCategory.parentId !== null) {
      throw new Error("Esta categoria não pode ter subcategorias.");
    }

    if (category.children.length > 0) {
      throw new Error("Esta categoria já possui subcategorias.");
    }
  }

  return await db.update(categories).set({ name, parentId }).where(eq(categories.id, id));
}
