"use client";

import { useState } from "react";

import { Account, Budget, Category } from "@/lib/db/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircleIcon } from "lucide-react";
import { TransactionForm } from "./transaction-form";

interface CreateTransactionDialogProps {
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
}

export function CreateTransactionDialog({ accounts, categories, budgets }: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircleIcon />
          Criar Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Transação</DialogTitle>
          <DialogDescription>Preencha as informações para registrar uma nova transação.</DialogDescription>
        </DialogHeader>
        <TransactionForm
          mode="add"
          accounts={accounts}
          categories={categories}
          budgets={budgets}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
