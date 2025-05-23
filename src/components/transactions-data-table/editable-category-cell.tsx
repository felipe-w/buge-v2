"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Form from "next/form";

import { editTransactionCategoryAction } from "@/server/actions/transactions-actions";
import { CategoryWithChildren, TransactionWithAllJoins } from "@/lib/db/types";
import { getTransactionType } from "@/lib/utils";

import CategoryBadge from "@/components/category-badge";
import CategorySelector from "@/components/category-selector";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, CheckCircle, Loader2 } from "lucide-react";

interface EditCategoryFormProps {
  transaction: TransactionWithAllJoins;
  categories: CategoryWithChildren[];
  onEditEnd: () => void;
}

function EditCategoryForm({ transaction, categories, onEditEnd }: EditCategoryFormProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(transaction.categoryId || "");
  const [state, formAction, isPending] = useActionState(editTransactionCategoryAction, { success: false, message: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const editContainerRef = useRef<HTMLDivElement>(null);

  // Handle successful submission
  useEffect(() => {
    if (state.success) {
      setShowSuccess(true);
      // Show success indicator for 1.5 seconds then close
      const timer = setTimeout(() => {
        setShowSuccess(false);
        onEditEnd();
      }, 1500);

      return () => clearTimeout(timer);
    } else if (state.message && !state.success) {
      setShowSuccess(false);
    }
  }, [state, onEditEnd]);

  // Handle click outside to close editing mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editContainerRef.current && !editContainerRef.current.contains(event.target as Node)) {
        if (!isPending) {
          onEditEnd();
        }
      }
    };

    if (!showSuccess) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [onEditEnd, showSuccess, isPending]);

  if (showSuccess) {
    return (
      <div className="flex items-center gap-2 text-success-foreground">
        <CheckCircle size={16} />
        <span className="text-sm font-medium">Atualizado!</span>
      </div>
    );
  }

  if (state.message && !state.success) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle size={16} />
        <span className="text-sm font-medium">Erro!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 w-full" ref={editContainerRef}>
      <Form action={formAction} className="flex items-center gap-1 w-full">
        <input type="hidden" name="id" value={transaction.id} />
        <input type="hidden" name="categoryId" value={selectedCategoryId} />
        <div className="flex-1 min-w-0">
          <CategorySelector
            categories={categories}
            value={selectedCategoryId}
            onChange={(newCategoryId: string) => setSelectedCategoryId(newCategoryId || "")}
            triggerType="input"
            className="w-full"
          />
        </div>
        <Button type="submit" size="icon" variant="success" disabled={isPending} className="shrink-0">
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        </Button>
      </Form>
    </div>
  );
}

interface EditableCategoryCellProps {
  transaction: TransactionWithAllJoins;
  categories: CategoryWithChildren[];
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export function EditableCategoryCell({
  transaction,
  categories,
  isEditing,
  onEditStart,
  onEditEnd,
}: EditableCategoryCellProps) {
  const transactionType = getTransactionType(transaction);
  const filteredCategories = categories.filter((cat) =>
    transactionType === "expense"
      ? cat.type === "expense"
      : transactionType === "income"
        ? cat.type === "income"
        : true,
  );

  if (isEditing) {
    return <EditCategoryForm transaction={transaction} categories={filteredCategories} onEditEnd={onEditEnd} />;
  }

  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={onEditStart}>
      {transaction.category && <CategoryBadge category={transaction.category} />}
    </div>
  );
}
