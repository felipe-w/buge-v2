"use client";

import { useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { toast } from "sonner";

import { compensateTransactionsAction } from "@/server/actions/transactions-actions";
import { TransactionWithAllJoins } from "@/lib/db/types";

import { TransactionCard } from "@/components/transaction-card";
import { AlertError } from "@/components/ui/alert";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkIcon, SearchIcon } from "lucide-react";

interface CompensateTransactionDialogProps {
  transaction: TransactionWithAllJoins;
  transactions: TransactionWithAllJoins[];
}

export function CompensateTransactionDialog({ transaction, transactions }: CompensateTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithAllJoins | null>(null);

  const [state, formAction, isPending] = useActionState(compensateTransactionsAction, {
    success: false,
    message: "",
    errors: undefined,
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setOpen(false);
    }
  }, [state]);

  const filteredTransactions = transactions
    .filter((t) => t.id !== transaction.id && !t.transferId && t.category?.type === transaction.category?.type)
    .filter(
      (t) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .slice(0, 5)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <LinkIcon />
          Compensar Transação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compensar Transação</DialogTitle>
          <DialogDescription>
            Escolha outra transação para ter seu valor compensado com esta, alterando o valor final de ambas de acordo
            com o resultado da compensação.
          </DialogDescription>
        </DialogHeader>
        <Form id="compensate-transaction-form" action={formAction}>
          <input type="hidden" name="id" value={transaction.id} />
          {/* {selectedTransaction && (
            <input type="hidden" name="compensatedTransactionId" value={selectedTransaction.id} />
          )} */}

          <div className="space-y-6 py-2">
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
            {/* Current Transaction */}
            <TransactionCard transaction={transaction} />

            {/* Search for transactions */}
            <div>
              <Label className="text-sm font-medium">Buscar transação para compensar</Label>
              <div className="relative mt-1">
                <Input
                  placeholder="Buscar por título, descrição, conta ou categoria"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="peer ps-9"
                />
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <SearchIcon size={16} aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Search results - transactions list */}
            {/* TODO: ESTOU TRABALHANDO NISSO AGORA */}
            {searchTerm && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Transações encontradas</Label>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2 bg-background">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t) => <TransactionCard key={t.id} transaction={t} />)
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma transação encontrada</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <SubmitButton status={isPending ? "pending" : "idle"} form="compensate-transaction-form">
            Compensar
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
