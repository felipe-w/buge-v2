"use client";

import { useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { toast } from "sonner";

import { addSubCategoryAction } from "@/server/actions/categories-actions";
import { CategoryWithChildren } from "@/lib/db/types";

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PlusCircleIcon } from "lucide-react";

export default function AddSubCategoryDialog({ category }: { category: CategoryWithChildren }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(addSubCategoryAction, { success: false, message: "" });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-background size-6 opacity-0 group-hover:opacity-100"
              >
                <PlusCircleIcon />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Adicionar Subcategoria</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Subcategoria</DialogTitle>
          <DialogDescription>Adicione uma nova subcategoria a esta categoria.</DialogDescription>
        </DialogHeader>

        <Form id="add-subcategory-form" action={formAction}>
          <input type="hidden" name="type" value={category.type} />
          <input type="hidden" name="parentId" value={category.id} />
          <input type="hidden" name="groupId" value={category.groupId} />
          <div className="space-y-6 py-2">
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome da Subcategoria</Label>
              <Input id="name" name="name" placeholder="Ex: Restaurantes" required disabled={isPending} />
              {state.errors?.name && <p className="text-destructive text-xs">{state.errors.name[0]}</p>}
            </div>
          </div>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <SubmitButton status={isPending ? "pending" : "idle"} form="edit-category-form">
            Editar
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
