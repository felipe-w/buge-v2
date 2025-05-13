"use client";

import { useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { toast } from "sonner";

import { deleteAccountAction } from "@/server/actions/accounts-actions";
import { Account, AccountWithTransactions } from "@/lib/db/types";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, Loader2, Trash2Icon } from "lucide-react";

interface DeleteAccountDialogProps {
  account: AccountWithTransactions;
  accounts: Account[];
}

export default function DeleteAccountDialog({ account, accounts }: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(deleteAccountAction, { success: false, message: "" });
  const [deleteOption, setDeleteOption] = useState<"transfer" | "cascade">("transfer");

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setOpen(false);
    }
  }, [state]);

  const availableAccounts = accounts.filter((acc) => acc.id !== account.id);
  const hasTransactions = account.transactions.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
              >
                <Trash2Icon />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Excluir conta</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Conta</DialogTitle>
          <DialogDescription>
            {!hasTransactions
              ? `Tem certeza que deseja excluir a conta "${account.name}"?`
              : `O que deseja fazer com as transações associadas à conta "${account.name}"?`}
          </DialogDescription>
        </DialogHeader>

        <Form id="delete-account-form" action={formAction}>
          <input type="hidden" name="id" value={account.id} />
          <input type="hidden" name="groupId" value={account.groupId} />
          <input type="hidden" name="deleteOption" value={hasTransactions ? deleteOption : "cascade"} />
          {hasTransactions && deleteOption === "transfer" && (
            <input
              type="hidden"
              name="transferTo"
              value={availableAccounts.length > 0 ? availableAccounts[0]?.id : ""}
            />
          )}
          <div className="space-y-6">
            {state.errors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  {state.errors.server ? state.errors.server[0] : "Ocorreu um erro ao excluir a conta."}
                </AlertDescription>
              </Alert>
            )}

            {hasTransactions && (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    Esta ação afetará todas as transações associadas a esta conta. As reconciliações são sempre
                    excluídas.
                  </AlertDescription>
                </Alert>

                <RadioGroup
                  defaultValue={availableAccounts.length > 0 ? "transfer" : "cascade"}
                  name="deleteOption"
                  onValueChange={(value) => setDeleteOption(value as "transfer" | "cascade")}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="transfer" id="transfer" disabled={availableAccounts.length === 0} />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="transfer" className="font-medium">
                        Transferir transações
                      </Label>
                      <p className="text-muted-foreground text-sm">Mover todas as transações para outra conta</p>
                    </div>
                  </div>

                  {deleteOption === "transfer" && availableAccounts.length > 0 && (
                    <div className="ml-6">
                      <Select name="transferTo" defaultValue={availableAccounts[0]?.id} disabled={isPending}>
                        <SelectTrigger id="transferTo">
                          <SelectValue placeholder="Selecione uma conta" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAccounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {deleteOption === "transfer" && availableAccounts.length === 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erro</AlertTitle>
                      <AlertDescription>
                        Não há contas disponíveis para transferência. <br />
                        Crie outra conta primeiro.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="cascade" id="cascade" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="cascade" className="font-medium">
                        Excluir tudo
                      </Label>
                      <p className="text-muted-foreground text-sm">Excluir esta conta e todos os dados associados</p>
                    </div>
                  </div>
                </RadioGroup>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isPending || (deleteOption === "transfer" && availableAccounts.length === 0)}
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
