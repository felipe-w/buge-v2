"use client";

import { createParentCategoryAction } from "@/server/actions/category-actions";
import Form from "next/form";
import { useActionState, useEffect, useState } from "react";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { categoryTypeConfig, cn } from "@/lib/utils";
import { PlusCircleIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

interface CreateParentCategoryDialogProps {
  categoryType: "income" | "expense";
  groupId: string;
}

export function CreateParentCategoryDialog({ categoryType, groupId }: CreateParentCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"income" | "expense">(categoryType);
  const [childCategories, setChildCategories] = useState<string[]>([]);

  const [state, formAction, isPending] = useActionState(createParentCategoryAction, {
    success: false,
    message: "",
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setOpen(false);
      // Reset form
      setChildCategories([]);
    }
  }, [state]);

  const addChildCategory = () => {
    setChildCategories([...childCategories, ""]);
  };

  const removeChildCategory = (index: number) => {
    const newChildCategories = [...childCategories];
    newChildCategories.splice(index, 1);
    setChildCategories(newChildCategories);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "income" | "expense");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircleIcon />
          Criar Categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Categoria Principal</DialogTitle>
          <DialogDescription>Crie uma categoria principal com ou sem subcategorias.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={categoryType} value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent">
            <TabsTrigger
              value="expense"
              className={cn(
                "transition-colors",
                "data-[state=active]:border-b-2",
                "data-[state=inactive]:cursor-pointer",
                `${categoryTypeConfig.expense.colors.tabBg}`,
                `${categoryTypeConfig.expense.colors.tabText}`,
                `${categoryTypeConfig.expense.colors.tabBorder}`,
              )}
            >
              <categoryTypeConfig.expense.icon className="mr-1" />
              {categoryTypeConfig.expense.label}
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className={cn(
                "transition-colors",
                "data-[state=active]:border-b-2",
                "data-[state=inactive]:cursor-pointer",
                `${categoryTypeConfig.income.colors.tabBg}`,
                `${categoryTypeConfig.income.colors.tabText}`,
                `${categoryTypeConfig.income.colors.tabBorder}`,
              )}
            >
              <categoryTypeConfig.income.icon className="mr-1" />
              {categoryTypeConfig.income.label}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Form id="create-parent-category-form" action={formAction}>
          <input type="hidden" name="type" value={activeTab} />
          <input type="hidden" name="groupId" value={groupId} />

          <div
            className={cn(
              "mt-2 space-y-6 rounded-md border p-4",
              activeTab === "income" &&
                categoryTypeConfig.income.colors.bg + " " + categoryTypeConfig.income.colors.border,
              activeTab === "expense" &&
                categoryTypeConfig.expense.colors.bg + " " + categoryTypeConfig.expense.colors.border,
            )}
          >
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome da Categoria Principal</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Ex: Alimentação"
                disabled={isPending}
                className="bg-background"
              />
              {state.errors?.name && <p className="text-destructive text-xs">{state.errors.name[0]}</p>}
            </div>

            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <Label htmlFor="child_categories">Subcategorias (opcional)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        className={cn(
                          "-mb-1 size-6",
                          activeTab === "income" && categoryTypeConfig.income.colors.buttonHoverBg,
                          activeTab === "expense" && categoryTypeConfig.expense.colors.buttonHoverBg,
                        )}
                        variant="ghost"
                        size="icon"
                        onClick={addChildCategory}
                      >
                        <PlusCircleIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Adicionar Subcategoria</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {childCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-md py-8">
                  <p className="text-muted-foreground max-w-[80%] text-center text-xs">
                    Caso não adicione subcategorias, esta categoria será criada como independente e poderá ser usada
                    para agrupar transações.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {childCategories.map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          name="child_categories"
                          placeholder={`Subcategoria ${index + 1}`}
                          disabled={isPending}
                          key={index}
                          className="bg-background"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "size-6",
                          activeTab === "income" && categoryTypeConfig.income.colors.buttonHoverBg,
                          activeTab === "expense" && categoryTypeConfig.expense.colors.buttonHoverBg,
                        )}
                        onClick={() => removeChildCategory(index)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="reset" variant="ghost" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <SubmitButton status={isPending ? "pending" : "idle"} form="create-parent-category-form">
            Criar
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
