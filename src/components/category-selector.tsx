"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { Category, CategoryWithChildren } from "@/lib/db/types";
import { categoryTypeConfig, cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckIcon, ChevronDownIcon, TagIcon, XCircle } from "lucide-react";
import CategoryBadge from "./category-badge";
import { Separator } from "./ui/separator";

// Define a type for category type configuration
type CategoryTypeConfig = (typeof categoryTypeConfig)[keyof typeof categoryTypeConfig];

interface CategorySelectorProps {
  categories: CategoryWithChildren[];
  value?: string;
  onChange?: (value: string) => void;
  triggerType?: "input" | "button";
  className?: string;
}

export default function CategorySelector({
  categories,
  value: controlledValue,
  onChange,
  triggerType = "input",
  className,
}: CategorySelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [internalValue, setInternalValue] = useState<string>("");

  // Use controlled or internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Effect to sync internalValue with controlledValue
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Flattened list of all categories for lookup
  const flattenedCategories = useMemo(() => categories.flatMap((cat) => [cat, ...(cat.children || [])]), [categories]);

  // Find selected category data
  const selectedCategory = value ? flattenedCategories.find((cat) => cat.id === value) : undefined;

  // Organize categories by type (expense/income) and structure (parents/standalone)
  const organizedCategories = useMemo(() => {
    const result = {
      expense: { parents: [] as CategoryWithChildren[], standalone: [] as Category[] },
      income: { parents: [] as CategoryWithChildren[], standalone: [] as Category[] },
    };

    categories.forEach((category) => {
      const type = category.type as keyof typeof result;
      if (!result[type]) return;

      const hasChildren = category.children && category.children.length > 0;

      if (hasChildren) {
        result[type].parents.push(category);
      } else if (!category.parentId) {
        result[type].standalone.push(category);
      }
    });

    return result;
  }, [categories]);

  const handleCategorySelect = (selectedId: string) => {
    // Toggle selection if clicking the same category
    const newValue = selectedId === value ? "" : selectedId;

    // Update state and call onChange
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);

    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (controlledValue === undefined) {
      setInternalValue("");
    }
    onChange?.("");
  };

  // Render a category group with title
  const renderCategoryGroup = (
    title: React.ReactNode,
    items: Category[],
    typeConfig: CategoryTypeConfig,
    key?: string,
  ) => {
    if (!items || items.length === 0) return null;

    return (
      <CommandGroup key={key} heading={title} className={cn("border-b", typeConfig.colors.bgLight)}>
        {items.map((item) => (
          <CommandItem
            key={item.id}
            value={item.name}
            onSelect={() => handleCategorySelect(item.id)}
            className="data-[selected=true]:bg-muted"
          >
            <div className="flex items-center">
              <CheckIcon className={cn("mr-1", value === item.id ? "opacity-100" : "opacity-0")} />
              {item.name}
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    );
  };

  // Create heading with icon for category groups
  const createGroupHeading = (title: string, config: CategoryTypeConfig) => (
    <div className="flex items-center">
      <config.icon size={14} className={cn("mr-2", config.colors.textDark)} />
      <span className={cn(config.colors.textDark)}>{title}</span>
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerType === "button" ? (
          <Button
            id={id}
            variant="outline"
            size="sm"
            className={cn("border-dashed", !value && "text-muted-foreground", className)}
          >
            <TagIcon />
            Categoria
            {value && selectedCategory && (
              <>
                <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
                <CategoryBadge category={selectedCategory} />
                <div
                  role="button"
                  aria-label="Limpar filtro de categoria"
                  tabIndex={0}
                  onClick={handleClear}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <XCircle size={16} />
                </div>
              </>
            )}
          </Button>
        ) : (
          <Button
            id={id}
            variant="input"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between", className)}
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {selectedCategory?.name || "Selecione uma categoria"}
            </span>
            <ChevronDownIcon size={16} className="text-muted-foreground/80 shrink-0" aria-hidden="true" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" usePortal={false}>
        <Command>
          <CommandInput placeholder="Buscar categoria..." />
          <CommandList>
            <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>

            {/* Expense Parent Categories */}
            {organizedCategories.expense.parents.map((parentCategory) =>
              renderCategoryGroup(
                createGroupHeading(parentCategory.name, categoryTypeConfig.expense),
                parentCategory.children || [],
                categoryTypeConfig.expense,
                parentCategory.id,
              ),
            )}

            {/* Standalone Expense Categories */}
            {organizedCategories.expense.standalone.length > 0 &&
              renderCategoryGroup(
                createGroupHeading("Categorias Avulsas", categoryTypeConfig.expense),
                organizedCategories.expense.standalone,
                categoryTypeConfig.expense,
              )}

            {/* Income Parent Categories */}
            {organizedCategories.income.parents.map((parentCategory) =>
              renderCategoryGroup(
                createGroupHeading(parentCategory.name, categoryTypeConfig.income),
                parentCategory.children || [],
                categoryTypeConfig.income,
                parentCategory.id,
              ),
            )}

            {/* Standalone Income Categories */}
            {organizedCategories.income.standalone.length > 0 &&
              renderCategoryGroup(
                createGroupHeading("Categorias Avulsas", categoryTypeConfig.income),
                organizedCategories.income.standalone,
                categoryTypeConfig.income,
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
