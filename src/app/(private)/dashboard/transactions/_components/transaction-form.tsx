"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Form from "next/form";
import { toast } from "sonner";

import { createTransactionAction, editTransactionAction } from "@/server/actions/transactions-actions";
import { Account, Budget, CategoryWithChildren, TransactionWithAllJoins } from "@/lib/db/types";
import { categoryTypeConfig, cn } from "@/lib/utils";

import CategoryTypesSelector from "@/components/category-types-selector";
import CurrencyMaskedInput from "@/components/currency-input";
import { AlertError } from "@/components/ui/alert";
import { Button, SubmitButton } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarIcon, Check, ChevronsUpDown, InfoIcon } from "lucide-react";

interface TransactionFormProps {
  mode: "add" | "edit";
  accounts: Account[];
  categories: CategoryWithChildren[];
  budgets?: Budget[];
  initialData?: TransactionWithAllJoins;
  onSuccess?: () => void;
  destinationAccountId?: string;
}

export function TransactionForm({
  mode,
  accounts,
  categories,
  budgets,
  initialData,
  onSuccess,
  destinationAccountId,
}: TransactionFormProps) {
  const action = mode === "add" ? createTransactionAction : editTransactionAction;
  const [state, formAction, isPending] = useActionState(action, { success: false, message: "" });
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const initialTransactionType = initialData?.transferId
    ? "transfer"
    : Number(initialData?.amount) > 0
      ? "income"
      : "expense";
  const [transactionType, setTransactionType] = useState<"expense" | "income" | "transfer">(initialTransactionType);

  const initialDate = initialData?.date ? new Date(initialData.date) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  const initialCategory = initialData?.categoryId || "";
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  const hasToastedRef = useRef(false);
  useEffect(() => {
    if (state.success && !hasToastedRef.current) {
      toast.success(state.message);
      hasToastedRef.current = true;
      onSuccess?.();
    }
  }, [state, onSuccess]);

  const filteredCategories = categories.filter((cat) =>
    transactionType === "expense"
      ? cat.type === "expense"
      : transactionType === "income"
        ? cat.type === "income"
        : true,
  );

  const flattenedCategories = categories.flatMap((cat) => [cat, ...(cat.children || [])]);

  return (
    <>
      <Form id="transaction-form" action={formAction} className="space-y-6">
        {mode === "edit" && initialData && <input type="hidden" name="id" value={initialData.id} />}
        <input type="hidden" name="type" value={transactionType} />
        {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}

        {/* Transaction Type */}
        <CategoryTypesSelector
          value={transactionType}
          hasTransfer={true}
          disabled={mode === "edit"}
          onChange={(value) => mode === "add" && setTransactionType(value as "expense" | "income" | "transfer")}
        />

        <div
          className={cn(
            "space-y-6 rounded-md border p-4",
            transactionType === "income" &&
              categoryTypeConfig.income.colors.bgMedium + " " + categoryTypeConfig.income.colors.border,
            transactionType === "expense" &&
              categoryTypeConfig.expense.colors.bgMedium + " " + categoryTypeConfig.expense.colors.border,
            transactionType === "transfer" &&
              categoryTypeConfig.transfer.colors.bgMedium + " " + categoryTypeConfig.transfer.colors.border,
          )}
        >
          {/* Title and Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="ex: Inforno Burger"
                disabled={isPending}
                defaultValue={initialData?.title || ""}
              />
              {state.errors?.title && <p className="text-destructive text-xs">{state.errors.title[0]}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <input type="hidden" name="date" value={selectedDate?.toISOString() || ""} />
              <Label htmlFor="date">Data</Label>
              <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="input" disabled={isPending}>
                    <CalendarIcon className="mr-1" />
                    {selectedDate ? selectedDate.toLocaleDateString("pt-BR") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date || new Date());
                      setIsDatePopoverOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              {state.errors?.date && <p className="text-destructive text-xs">{state.errors.date[0]}</p>}
            </div>
          </div>

          {/* Amount and Budget */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Valor</Label>
              <CurrencyMaskedInput
                name="amount"
                required
                disabled={isPending}
                defaultValue={initialData?.amount ? Math.abs(Number(initialData.amount)).toString() : ""}
              />

              {state.errors?.amount && <p className="text-destructive text-xs">{state.errors.amount[0]}</p>}
            </div>

            {transactionType !== "transfer" && (
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
                <Select
                  name="budgetId"
                  defaultValue={initialData?.budgetId || ""}
                  disabled={isPending || !budgets || budgets.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o orçamento (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgets?.map((budget) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        {/* TODO: NEED TO CHECK WHEN WE HAVE BUDGETS */}
                        {new Date(budget.date || "").toLocaleString("pt-BR", { month: "long", year: "numeric" })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.errors?.budget_id && <p className="text-destructive text-xs">{state.errors.budget_id[0]}</p>}
              </div>
            )}
          </div>

          {/* Account and Category/Destination */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="accountId">{transactionType === "transfer" ? "Conta origem" : "Conta"}</Label>
              <Select
                name="accountId"
                required
                disabled={isPending || !!initialData?.transferId}
                defaultValue={initialData?.accountId || ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={transactionType === "transfer" ? "De qual conta" : "Selecione a conta"} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.accountId && <p className="text-destructive text-xs">{state.errors.accountId[0]}</p>}
            </div>

            {transactionType === "transfer" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="destinationAccountId">Conta destino</Label>
                <Select
                  name="destinationAccountId"
                  required
                  disabled={isPending || !!initialData?.transferId}
                  defaultValue={initialData?.transfer?.accountId || destinationAccountId || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Para qual conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.errors?.destinationAccountId && (
                  <p className="text-destructive text-xs">{state.errors.destinationAccountId[0]}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="categoryId">Categoria</Label>
                <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="input" role="combobox" className="justify-between" disabled={isPending}>
                      {flattenedCategories.find((cat) => cat.id === selectedCategory)?.name ?? (
                        <span className="text-muted-foreground">Selecione a categoria</span>
                      )}
                      <ChevronsUpDown className="ml-2 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 sm:min-w-[240px]" align="start" usePortal={false}>
                    <Command>
                      <CommandInput placeholder="Buscar categoria..." />
                      <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                      <CommandList className="max-h-[200px]">
                        {filteredCategories.map((category) => {
                          if (category.children && category.children.length > 0) {
                            return (
                              <CommandGroup key={category.id} heading={category.name}>
                                {category.children.map((child) => (
                                  <CommandItem
                                    key={child.id}
                                    value={child.name}
                                    onSelect={() => {
                                      setSelectedCategory(selectedCategory === child.id ? "" : child.id);
                                      setIsCategoryPopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2",
                                        selectedCategory === child.id ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    {child.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            );
                          }
                          // If it's a top-level category without children, render group + item
                          else if (!category.parentId) {
                            return (
                              <CommandGroup key={category.id} heading={category.name}>
                                <CommandItem
                                  key={`${category.id}-item`} // Ensure unique key for the item within the group
                                  value={category.name}
                                  onSelect={() => {
                                    setSelectedCategory(selectedCategory === category.id ? "" : category.id);
                                    setIsCategoryPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2",
                                      selectedCategory === category.id ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {category.name}
                                </CommandItem>
                              </CommandGroup>
                            );
                          }
                          return null;
                        })}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <input type="hidden" name="categoryId" value={selectedCategory} />
                {state.errors?.categoryId && <p className="text-destructive text-xs">{state.errors.categoryId[0]}</p>}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descrição adicional (opcional)"
              disabled={isPending}
              rows={3}
              defaultValue={initialData?.description || ""}
            />
            {state.errors?.description && <p className="text-destructive text-xs">{state.errors.description[0]}</p>}
          </div>
        </div>
      </Form>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost" disabled={isPending}>
            Cancelar
          </Button>
        </DialogClose>
        <SubmitButton status={isPending ? "pending" : "idle"} form="transaction-form">
          {mode === "add" ? "Criar" : "Salvar"}
        </SubmitButton>
      </DialogFooter>
    </>
  );
}
