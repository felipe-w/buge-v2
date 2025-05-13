"use client";

import { useState } from "react";

import { Account, Budget, Category, TransactionWithAllJoins } from "@/lib/db/types";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangleIcon, Edit3Icon } from "lucide-react";
import { TransactionForm } from "./transaction-form";

interface EditTransactionDialogProps {
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  transaction: TransactionWithAllJoins;
}

export function EditTransactionDialog({ accounts, categories, budgets, transaction }: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false);

  // in a transfer, we should only be able to edit one transaction, the original one (source)
  // to check if it is the source, the amount should be negative
  const isTransfer = transaction.transferId !== null;
  const isSourceTransaction = Number(transaction.amount) < 0;

  // If it's a transfer but not the source transaction, use the source transaction's data
  const transactionToEdit =
    isTransfer && !isSourceTransaction && transaction.transfer ? transaction.transfer : transaction;

  const destinationAccountId = isTransfer && !isSourceTransaction ? transaction.accountId : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Edit3Icon />
          Editar Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        {isTransfer && !isSourceTransaction && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangleIcon />
            <AlertDescription>
              Esta é uma transação de transferência. Você está editando a transação de origem (saída), que afetará
              automaticamente a transação de destino (entrada).
            </AlertDescription>
          </Alert>
        )}
        <TransactionForm
          mode="edit"
          accounts={accounts}
          categories={categories}
          budgets={budgets}
          initialData={transactionToEdit}
          destinationAccountId={destinationAccountId || undefined}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
