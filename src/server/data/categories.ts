import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { categories } from "@/lib/db/schemas";
import { EditCategory, NewCategory } from "@/lib/types";
import { and, eq, isNull } from "drizzle-orm";

export async function getGroupCategories({ groupId }: { groupId: string }) {
  await isAuthenticated();

  return await db.query.categories.findMany({
    where: and(eq(categories.groupId, groupId), isNull(categories.parentId)),
    with: {
      children: true,
    },
  });
}

export async function getCategoryById({ id }: { id: string }) {
  await isAuthenticated();

  return await db.query.categories.findFirst({ where: eq(categories.id, id), with: { children: true } });
}

export async function createCategory({ name, groupId, type, parentId }: NewCategory) {
  await isAuthenticated();

  const [category] = await db.insert(categories).values({ name, groupId, type, parentId }).returning();
  return category;
}

export async function editCategory({ id, name, parentId }: EditCategory) {
  await isAuthenticated();

  const category = await getCategoryById({ id });
  if (!category) throw new Error("Categoria não encontrada.");

  if (parentId) {
    const parentCategory = await getCategoryById({ id: parentId });
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
