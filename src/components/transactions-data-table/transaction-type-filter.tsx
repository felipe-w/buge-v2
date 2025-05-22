"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListFilter, XCircle } from "lucide-react"; // Using ListFilter as a generic icon
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

// Define the possible transaction types
// These should match the values returned by getTransactionType
const transactionTypes = [
  { id: "income", name: "Receita" },
  { id: "expense", name: "Despesa" },
  { id: "transfer", name: "Transferência" },
] as const;

export type TransactionType = (typeof transactionTypes)[number]["id"];

interface TransactionTypeFilterProps {
  value: TransactionType | undefined;
  onChange: (transactionType?: TransactionType) => void;
  className?: string;
}

export default function TransactionTypeFilter({
  value: currentTransactionType,
  onChange,
  className,
}: TransactionTypeFilterProps) {
  const handleTransactionTypeChange = (newTransactionType: TransactionType) => {
    // If the selected type is clicked again, clear the filter
    const finalValue = newTransactionType === currentTransactionType ? undefined : newTransactionType;
    onChange(finalValue);
  };

  const selectedType = transactionTypes.find((type) => type.id === currentTransactionType);

  const handleClear = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("border-dashed", !currentTransactionType && "text-muted-foreground", className)}
        >
          <ListFilter className="mr-2 h-4 w-4" /> {/* Using ListFilter icon */}
          Tipo
          {selectedType && (
            <>
              <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
              <span className="text-foreground">{selectedType.name}</span>
              <div
                role="button"
                aria-label="Limpar filtro de tipo"
                tabIndex={0}
                onPointerDown={handleClear}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <XCircle size={16} />
              </div>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {transactionTypes.map((type) => (
          <DropdownMenuCheckboxItem
            key={type.id}
            checked={currentTransactionType === type.id}
            onSelect={() => handleTransactionTypeChange(type.id)}
          >
            {type.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
