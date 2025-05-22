"use client";

import { useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { toast } from "sonner";

import { validateStatementAction } from "@/server/actions/statements-actions";
import { StatementWithAllJoins } from "@/lib/db/types";
import { cn, formatCurrency, formatDateToPtBr } from "@/lib/utils";

import { Button, SubmitButton } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  FileText,
  FileType2,
  Info,
  Landmark,
  LayoutList,
  ListChecks,
  ShieldCheck,
  Tag,
} from "lucide-react";

interface ValidateStatementDialogProps {
  statement: StatementWithAllJoins; // Pass the full statement data
}

export default function ValidateStatementDialog({ statement }: ValidateStatementDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(validateStatementAction, {
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

  // Calculate summaries
  const transactions = statement.aiResponse || [];
  const dates = transactions.map((t) => new Date(t.date)).filter((d) => !isNaN(d.getTime()));
  const startDate = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
  const endDate = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
  const incomeTransactions = transactions.filter((t) => Number(t.amount) > 0);
  const expenseTransactions = transactions.filter((t) => Number(t.amount) < 0);
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0); // Absolute for display
  const netResult = totalIncome - totalExpense;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Validar Extrato</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Validação do Extrato</DialogTitle>
          <DialogDescription>Revise as transações extraídas antes de confirmar.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Form id="validate-statement-form" action={formAction}>
            <input type="hidden" name="id" value={statement.id} />
          </Form>
          {/* Statement Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info size={20} /> Informações do Extrato
              </CardTitle>
              <CardAction>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {statement.fileUrl && (
                        <a href={statement.fileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                        </a>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ver Arquivo PDF</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {/* Row 1: Account (Left) | Created At (Right) */}
                <div className="flex items-start gap-2">
                  <Landmark size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-0.5">Conta</p>
                    <p className="text-muted-foreground">{statement.account?.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-0.5">Criado em</p>
                    <p className="text-muted-foreground">
                      {statement.createdAt ? formatDateToPtBr(statement.createdAt) : "-"}
                    </p>
                  </div>
                </div>

                {/* Row 2: Type (Left) | Status (Right) */}
                <div className="flex items-start gap-2">
                  <FileType2 size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-0.5">Tipo</p>
                    <p className="text-muted-foreground">
                      {statement.statementType.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Tag size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-0.5">Situação</p>
                    <p className="text-muted-foreground">{statement.status}</p>
                  </div>
                </div>

                {/* Re-adding Expected Total here */}
                {statement.expectedTotal != null && (
                  <div className="flex items-start gap-2">
                    <CircleDollarSign size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-0.5">Total Esperado</p>
                      <p className="text-muted-foreground tabular-nums">{formatCurrency(statement.expectedTotal)}</p>
                    </div>
                  </div>
                )}

                {/* Optional Description - conditionally spans */}
                {statement.description && (
                  <div
                    className={cn(
                      "flex items-start gap-2",
                      !statement.expectedTotal && "sm:col-span-2", // Span only if Total Esperado is NOT present
                    )}
                  >
                    <FileText size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-0.5">Descrição</p>
                      <p className="text-muted-foreground">{statement.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutList size={20} /> Resumo das Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Period Item - now spans full width */}
              <div className="flex items-start gap-2 mb-4 sm:col-span-2 text-sm">
                <CalendarDays size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-0.5">Período</p>
                  <p className="text-muted-foreground">
                    {startDate ? formatDateToPtBr(startDate) : "-"} a {endDate ? formatDateToPtBr(endDate) : "-"}
                  </p>
                </div>
              </div>

              {/* Transaction Breakdown Item - below Period, spans full width, with internal grid */}
              <div className="sm:col-span-2 text-sm">
                <div className="flex items-start gap-2">
                  <ListChecks size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="font-medium mb-0.5">Detalhamento</p>
                </div>
                <div className="pl-6 grid grid-cols-2 gap-x-4 text-sm">
                  {/* Left Column */}
                  <div>
                    <p>
                      <span className="text-muted-foreground">Quantidade: </span>
                      {transactions.length}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Saldo: </span>
                      <span
                        className={cn(
                          "font-medium tabular-nums",
                          netResult > 0 ? "text-income-foreground" : "text-expense-foreground",
                        )}
                      >
                        {formatCurrency(netResult)}
                      </span>
                    </p>
                  </div>

                  {/* Right Column */}
                  <div>
                    <p>
                      <span className="text-muted-foreground">Receitas ({incomeTransactions.length}): </span>
                      <span className="text-income-foreground font-medium tabular-nums">
                        {formatCurrency(totalIncome)}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Despesas ({expenseTransactions.length}): </span>
                      <span className="text-expense-foreground font-medium tabular-nums">
                        {formatCurrency(totalExpense)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Check Section (Conditional) */}
          {statement.expectedTotal != null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck size={20} /> Verificação de Saldo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">Total Esperado do Extrato:</p>
                    <p className="font-medium tabular-nums">{formatCurrency(statement.expectedTotal)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">Resultado das Transações:</p>
                    <p
                      className={cn(
                        "font-medium tabular-nums",
                        netResult >= 0 ? "text-income-foreground" : "text-expense-foreground",
                      )}
                    >
                      {formatCurrency(netResult)}
                    </p>
                  </div>
                  <hr className="my-2 border-border/50" />
                  <div className="flex justify-end items-center pt-1">
                    {(Number(statement.expectedTotal) - Math.abs(netResult)).toFixed(2) === "0.00" ||
                    (Number(statement.expectedTotal) - Math.abs(netResult)).toFixed(2) === "-0.00" ? (
                      <span className="font-bold text-success-foreground flex items-center gap-1.5 text-base">
                        <CheckCircle2 className="h-5 w-5" /> Correto!
                      </span>
                    ) : (
                      <span className="font-bold text-destructive flex items-center gap-1.5 text-base">
                        <AlertTriangle size={20} />
                        Diferença: {formatCurrency(Number(statement.expectedTotal) - Math.abs(netResult))}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <SubmitButton status={isPending ? "pending" : "idle"} form="validate-statement-form">
            Importar
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
