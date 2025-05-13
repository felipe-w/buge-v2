"use client";

import { useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { toast } from "sonner";

import { deleteTransactionAction } from "@/server/actions/transactions-actions";
import { TransactionWithAllJoins } from "@/lib/db/types";

import { TransactionCard } from "@/components/transaction-card";
import { Alert, AlertDescription, AlertError, AlertTitle } from "@/components/ui/alert";
import { Button, SubmitButton } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";

export default function DeleteTransactionDialog({ transaction }: { transaction: TransactionWithAllJoins }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(deleteTransactionAction, {
    success: false,
    message: "",
    errors: undefined,
  });

  const isTransfer = transaction.transferId !== null;

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Trash2Icon />
          Excluir Transação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Transação</DialogTitle>
          <DialogDescription>Ação irreversível, todos os dados serão perdidos.</DialogDescription>
        </DialogHeader>
        <Form id="delete-transaction-form" action={formAction}>
          <input type="hidden" name="id" value={transaction.id} />
          <div className="space-y-6 py-2">
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
            {isTransfer && (
              <Alert variant="warning" className="mb-4">
                <AlertTriangleIcon />
                <AlertTitle>Atenção!</AlertTitle>
                <AlertDescription>As duas transações desta transferência serão excluídas.</AlertDescription>
              </Alert>
            )}
            <TransactionCard transaction={transaction} />
          </div>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <SubmitButton
            type="submit"
            form="delete-transaction-form"
            variant="destructive"
            status={isPending ? "pending" : "idle"}
            disabled={isPending}
          >
            Excluir
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
