"use client";

import { useId, useState } from "react";

import { Category, CategoryWithChildren } from "@/lib/db/types";
import { categoryTypeConfig, cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckIcon, ChevronDownIcon, FilterIcon, XCircle } from "lucide-react";
import CategoryBadge from "./category-badge";
import { Separator } from "./ui/separator";

// Define a type for category type configuration
type CategoryTypeConfig = (typeof categoryTypeConfig)[keyof typeof categoryTypeConfig];

interface CategoryItemProps {
  category: Category;
  currentValue: string;
  onSelect: (value: string) => void;
  className?: string;
  icon?: React.ElementType; // Optional icon for specific items if needed
  iconConfig?: CategoryTypeConfig; // For items that need type-based icon/color
}

const CategorySelectItem: React.FC<CategoryItemProps> = ({
  category,
  currentValue,
  onSelect,
  className,
  icon: ItemIcon,
  iconConfig,
}) => (
  <CommandItem
    key={category.id}
    value={category.name}
    onSelect={() => {
      onSelect(category.id);
    }}
    className={cn("data-[selected=true]:bg-muted", className)}
  >
    <div className="flex items-center">
      {ItemIcon && iconConfig && <ItemIcon size={14} className={cn(iconConfig.colors.textDark)} />}
      <CheckIcon className={cn("mr-1", currentValue === category.id ? "opacity-100" : "opacity-0")} />
      {category.name}
    </div>
  </CommandItem>
);

interface ParentCategoryGroupProps {
  parentCategory: CategoryWithChildren;
  typeConfig: CategoryTypeConfig;
  currentValue: string;
  onItemSelect: (value: string) => void;
}

const ParentCategoryItems: React.FC<ParentCategoryGroupProps> = ({
  parentCategory,
  typeConfig,
  currentValue,
  onItemSelect,
}) => {
  const ParentIcon = typeConfig.icon;
  return (
    <CommandGroup
      key={parentCategory.id}
      heading={
        <div className="flex items-center">
          <ParentIcon size={14} className={cn("mr-2", typeConfig.colors.textDark)} />
          <span className={cn(typeConfig.colors.textDark)}>{parentCategory.name}</span>
        </div>
      }
      className={cn("border-b", typeConfig.colors.bgLight)}
    >
      {parentCategory.children!.map((child) => (
        <CategorySelectItem key={child.id} category={child} currentValue={currentValue} onSelect={onItemSelect} />
      ))}
    </CommandGroup>
  );
};

interface StandaloneGroupProps {
  title: string;
  categories: CategoryWithChildren[];
  typeConfig: CategoryTypeConfig;
  currentValue: string;
  onItemSelect: (value: string) => void;
}

const StandaloneCategoryItemsGroup: React.FC<StandaloneGroupProps> = ({
  title,
  categories,
  typeConfig,
  currentValue,
  onItemSelect,
}) => {
  if (categories.length === 0) return null;
  const GroupIcon = typeConfig.icon;
  return (
    <CommandGroup
      heading={
        <div className="flex items-center">
          <GroupIcon size={14} className={cn("mr-2", typeConfig.colors.textDark)} />
          <span className={cn(typeConfig.colors.textDark)}>{title}</span>
        </div>
      }
      className={cn("border-b", typeConfig.colors.bgLight)}
    >
      {categories.map((category) => (
        <CategorySelectItem key={category.id} category={category} currentValue={currentValue} onSelect={onItemSelect} />
      ))}
    </CommandGroup>
  );
};

interface CategorySelectorProps {
  categories: CategoryWithChildren[];
  value?: string; // To control the component from outside
  onChange?: (value: string) => void; // To report changes
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
  // Use internal state if not controlled, otherwise use controlledValue
  const [internalValue, setInternalValue] = useState<string>("");

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValueState = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  const flattenedCategories = categories.flatMap((cat) => [cat, ...(cat.children || [])]);

  const handleItemSelect = (selectedId: string) => {
    const newValue = selectedId === value ? "" : selectedId;
    setValueState(newValue);
    setOpen(false);
  };

  console.log(value);

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  const expenseConfig = categoryTypeConfig.expense;
  const incomeConfig = categoryTypeConfig.income;

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
            <FilterIcon />
            Categoria
            {value && (
              <>
                <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
                <CategoryBadge category={flattenedCategories.find((category) => category.id === value)!} />
                <div
                  role="button"
                  aria-label="Limpar filtro de categoria"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setValueState("");
                  }}
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
              {value ? flattenedCategories.find((category) => category.id === value)?.name : "Selecione uma categoria"}
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

            {/* --- Expense Categories --- */}
            {expenseCategories
              .filter((category) => category.children && category.children.length > 0)
              .map((category) => (
                <ParentCategoryItems
                  key={category.id}
                  parentCategory={category}
                  typeConfig={expenseConfig}
                  currentValue={value}
                  onItemSelect={handleItemSelect}
                />
              ))}
            <StandaloneCategoryItemsGroup
              title="Outras Despesas"
              categories={expenseCategories.filter(
                (category) => !category.parentId && (!category.children || category.children.length === 0),
              )}
              typeConfig={expenseConfig}
              currentValue={value}
              onItemSelect={handleItemSelect}
            />

            {/* --- Income Categories --- */}
            {incomeCategories
              .filter((category) => category.children && category.children.length > 0)
              .map((category) => (
                <ParentCategoryItems
                  key={category.id}
                  parentCategory={category}
                  typeConfig={incomeConfig}
                  currentValue={value}
                  onItemSelect={handleItemSelect}
                />
              ))}
            <StandaloneCategoryItemsGroup
              title="Outras Receitas"
              categories={incomeCategories.filter(
                (category) => !category.parentId && (!category.children || category.children.length === 0),
              )}
              typeConfig={incomeConfig}
              currentValue={value}
              onItemSelect={handleItemSelect}
            />
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
