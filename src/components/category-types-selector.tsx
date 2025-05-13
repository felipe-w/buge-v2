"use client";

import { useId } from "react";

import { categoryTypeConfig, cn } from "@/lib/utils";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CategoryTypesSelectorProps {
  value: string;
  onChange: (value: string) => void;
  hasTransfer?: boolean;
  disabled?: boolean;
}

export default function CategoryTypesSelector({
  value,
  onChange,
  hasTransfer = false,
  disabled,
}: CategoryTypesSelectorProps) {
  const id = useId();

  return (
    <div className="border-input bg-card inline-flex h-9 w-full rounded-md border p-0.5">
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as "income" | "expense" | "transfer")}
        className={cn(
          "group has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid w-full items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px]",
          hasTransfer
            ? "grid-cols-3 after:w-1/3 data-[state=expense]:after:translate-x-0 data-[state=income]:after:translate-x-full data-[state=transfer]:after:translate-x-[200%]"
            : "grid-cols-2 after:w-1/2 data-[state=expense]:after:translate-x-0 data-[state=income]:after:translate-x-full",
          "after:rounded-sm",
          value === "income" ? "after:bg-income/80" : value === "expense" ? "after:bg-expense/80" : "after:bg-muted",
        )}
        disabled={disabled}
        data-state={value}
      >
        <label
          className={`group-data-[state=income]:text-muted-foreground group-data-[state=transfer]:text-muted-foreground relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none ${disabled ? "cursor-not-allowed pointer-events-none opacity-50" : ""} ${value === "expense" ? "text-expense-foreground" : ""}`}
        >
          <categoryTypeConfig.expense.icon size={16} className="mr-2" />
          {categoryTypeConfig.expense.label}
          <RadioGroupItem id={`${id}-1`} value="expense" className="sr-only" />
        </label>
        <label
          className={`group-data-[state=expense]:text-muted-foreground group-data-[state=transfer]:text-muted-foreground relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none ${disabled ? "cursor-not-allowed pointer-events-none opacity-50" : ""} ${value === "income" ? "text-income-foreground" : ""}`}
        >
          <categoryTypeConfig.income.icon size={16} className="mr-2" />
          {categoryTypeConfig.income.label}
          <RadioGroupItem id={`${id}-2`} value="income" className="sr-only" />
        </label>
        {hasTransfer && (
          <label
            className={`group-data-[state=income]:text-muted-foreground group-data-[state=expense]:text-muted-foreground relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none ${disabled ? "cursor-not-allowed pointer-events-none opacity-50" : ""} ${value === "transfer" ? "text-muted-foreground" : ""}`}
          >
            <categoryTypeConfig.transfer.icon size={16} className="mr-2" />
            {categoryTypeConfig.transfer.label}
            <RadioGroupItem id={`${id}-3`} value="transfer" className="sr-only" />
          </label>
        )}
      </RadioGroup>
    </div>
  );
}
