"use client";

import { useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { toast } from "sonner";

import { createStatementAction } from "@/server/actions/statements-actions";
import { Account, Budget } from "@/lib/db/types";
import { formatDateToPtBr } from "@/lib/utils";

import CurrencyMaskedInput from "@/components/currency-input";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, BuildingIcon, CreditCard, InfoIcon, PlusCircle } from "lucide-react";

interface CreateStatementDialogProps {
  accounts: Account[];
  groupId: string;
  budgets?: Budget[];
}

export default function CreateStatementDialog({ accounts, groupId, budgets }: CreateStatementDialogProps) {
  const [open, setOpen] = useState(false);
  const [statementType, setStatementType] = useState<"credit_card" | "bank">("credit_card");

  const [state, formAction, isPending] = useActionState(createStatementAction, {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Importar Extrato
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Extrato</DialogTitle>
          <DialogDescription>Faça envio de um PDF para importação de transações.</DialogDescription>
        </DialogHeader>
        <Form id="create-statement-form" action={formAction}>
          <input type="hidden" name="groupId" value={groupId} />
          <input type="hidden" name="statementType" value={statementType} />
          <div className="space-y-6 py-2">
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
            <Alert variant="warning">
              <AlertCircle />
              <AlertTitle>ATENÇÃO</AlertTitle>
              <AlertDescription>
                Não é possível extrair transações de um arquivo com senha.
                <br />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="underline underline-offset-4">Veja como remover a senha.</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">Passo a passo:</p>
                      <br />
                      <ul className="grid gap-1 list-decimal list-inside">
                        <li>Abra o PDF e digite a senha.</li>
                        <li>Vá em &quot;Imprimir&quot; (Ctrl+P / Cmd+P).</li>
                        <li>Escolha &quot;Salvar como PDF&quot;.</li>
                        <li>Salve o novo arquivo.</li>
                      </ul>
                      <br />O novo arquivo não terá mais senha.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </AlertDescription>
            </Alert>

            <Tabs
              defaultValue="credit_card"
              value={statementType}
              onValueChange={(value) => setStatementType(value as "credit_card" | "bank")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="credit_card">
                  <CreditCard size={16} />
                  <span>Cartão de Crédito</span>
                </TabsTrigger>
                <TabsTrigger value="bank">
                  <BuildingIcon size={16} />
                  <span>Conta Bancária</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <div className="space-y-6">
                  {/* Account and File Upload */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="accountId">Conta</Label>
                      <Select name="accountId" required disabled={isPending}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {state.errors?.accountId && (
                        <p className="text-destructive text-xs">{state.errors.accountId[0]}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pdfFile">Arquivo PDF</Label>
                      <Input
                        id="pdfFile"
                        name="pdfFile"
                        type="file"
                        accept="application/pdf"
                        disabled={isPending}
                        required
                      />
                      {state.errors?.pdfFile && <p className="text-xs text-destructive">{state.errors.pdfFile[0]}</p>}
                    </div>
                  </div>

                  {/* Amount and Budget */}
                  {statementType === "credit_card" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="expectedTotal">Valor</Label>
                        <CurrencyMaskedInput
                          name="expectedTotal"
                          required={statementType === "credit_card"}
                          disabled={isPending}
                        />
                        {state.errors?.expectedTotal && (
                          <p className="text-destructive text-xs">{state.errors.expectedTotal[0]}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <TooltipProvider>
                          <Tooltip>
                            <Label htmlFor="budgetId">
                              Orçamento
                              <TooltipTrigger asChild>
                                <InfoIcon size={12} className="-ml-1 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                            </Label>
                            <TooltipContent>
                              <p>Sobrescreve data da transação</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Select name="budgetId" disabled={isPending || !budgets || budgets.length === 0}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Campo opcional" />
                          </SelectTrigger>
                          <SelectContent>
                            {budgets?.map((budget) => (
                              <SelectItem key={budget.id} value={budget.id}>
                                {/* TODO: NEED TO CHECK WHEN WE HAVE BUDGETS */}
                                {formatDateToPtBr(budget.date || "", {
                                  month: "long",
                                  year: "numeric",
                                })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {state.errors?.budget_id && (
                          <p className="text-destructive text-xs">{state.errors.budget_id[0]}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Ex: Fatura de Maio/2023"
                      disabled={isPending}
                    />
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <SubmitButton status={isPending ? "pending" : "idle"} form="create-statement-form">
            Importar
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
