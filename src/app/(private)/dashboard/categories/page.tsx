import EmptySection from "@/components/layout/empty-section";
import { Heading } from "@/components/layout/heading";

import { getGroupCategories } from "@/server/data/categories";
import { getCurrentUser } from "@/server/data/users";
import CategoryTree from "./_components/category-tree";
import { CreateParentCategoryDialog } from "./_components/create-parent-category-dialog";

export default async function CategoriesPage() {
  const { selectedGroupId: groupId } = await getCurrentUser();
  const categories = await getGroupCategories({ groupId: groupId! });

  return (
    <div className="space-y-6">
      <Heading title="Categorias" actions={<CreateParentCategoryDialog categoryType="income" groupId={groupId!} />} />

      {categories.length === 0 ? (
        <EmptySection
          title="Nenhuma categoria encontrada"
          description="Crie sua primeira categoria para começar a gerenciar suas finanças."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CategoryTree categories={categories} type="income" />
          <CategoryTree categories={categories} type="expense" />
        </div>
      )}
    </div>
  );
}
