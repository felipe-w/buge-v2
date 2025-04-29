"use client";

import { Badge } from "@/components/ui/badge";
import { CategoryWithChildren } from "@/lib/types";
import { categoryTypeConfig, cn } from "@/lib/utils";
import { ChevronDown, Minus } from "lucide-react";
import AddSubCategoryDialog from "./add-subcategory-dialog";
import EditCategoryDialog from "./edit-category-dialog";

type CategoryTreeProps = {
  categories: CategoryWithChildren[];
  type: "income" | "expense";
};

export default function CategoryTree({ categories, type }: CategoryTreeProps) {
  const typeCategories = categories.filter((category) => category.type === type);

  // Check if there are any categories of this type
  const hasCategories = (): boolean => {
    return typeCategories.length > 0;
  };

  // Get the configuration for the current type
  const config = categoryTypeConfig[type];
  const TypeIcon = config.icon;
  const colors = config.colors;

  return (
    <>
      <div className={cn("overflow-hidden rounded-md border", colors.border)}>
        <div className={cn("flex items-center justify-between border-b p-3", colors.bg, colors.bgHover)}>
          <div className="flex items-center">
            <Badge variant="default" className={cn("text-background font-bold", colors.badgeBg)}>
              <TypeIcon className="mr-1" />
              {config.label.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="space-y-0.5 p-2">
          {/* Empty state */}
          {!hasCategories() && (
            <div
              className={cn("flex flex-col items-center justify-center rounded-md px-4 py-8 text-center", colors.bg)}
            >
              <TypeIcon className="mb-3 h-12 w-12" />
              <h3 className="font-medium">
                {type === "income" ? "Nenhuma categoria de receita ainda" : "Nenhuma categoria de despesa ainda"}
              </h3>
              <p className="mb-4 max-w-md text-sm">
                {type === "income"
                  ? "Categorias de receita ajudam a rastrear de onde vem seu dinheiro. Exemplos incluem salário, investimentos ou trabalho freelance."
                  : "Categorias de despesa ajudam a rastrear para onde vai seu dinheiro. Exemplos incluem aluguel, serviços públicos, mantimentos ou refeições fora."}
              </p>
            </div>
          )}

          {/* All parent categories - consolidated view */}
          {typeCategories.map((category) => (
            <div key={category.id} className="rounded-md">
              <div className={cn("group flex items-center justify-between p-1", colors.itemHover)}>
                <div className="flex items-center">
                  {/* Show chevron only if has children */}
                  {category.children && category.children.length > 0 ? (
                    <ChevronDown size={16} className={cn("mr-2", colors.text)} />
                  ) : (
                    <Minus size={16} className={cn("mr-2", colors.text)} />
                  )}
                  <span className="text-sm">{category.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AddSubCategoryDialog category={category} />
                  <EditCategoryDialog category={category} categories={categories} />
                  {/* <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 opacity-0 group-hover:opacity-100 hover:text-red-500", colors.itemHover)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(category);
                      setOpenDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button> */}
                </div>
              </div>

              {/* Children - only show if has children */}
              {category.children && category.children.length > 0 && (
                <div className={cn("mb-4 ml-3 border-l-2 pl-2", colors.borderLeft)}>
                  {category.children.map((child) => (
                    <div
                      key={child.id}
                      className={cn("group flex items-center justify-between rounded-md p-1", colors.itemHover)}
                    >
                      <div className="flex items-center">
                        <Minus size={12} className={cn("mr-2", colors.text)} />
                        <span className="text-sm">{child.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <EditCategoryDialog category={child} categories={categories} />
                        {/* <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8 opacity-0 group-hover:opacity-100 hover:text-red-500",
                            colors.itemHover,
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(child);
                            setOpenDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
