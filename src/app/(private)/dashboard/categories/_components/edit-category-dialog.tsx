"use client";

import { useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { toast } from "sonner";

import { editCategoryAction } from "@/server/actions/categories-actions";
import { CategoryWithChildren } from "@/lib/db/types";

import { Alert, AlertDescription, AlertError, AlertTitle } from "@/components/ui/alert";
import { Button, SubmitButton } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit3Icon, Terminal } from "lucide-react";

interface EditCategoryDialogProps {
  category: CategoryWithChildren;
  categories: CategoryWithChildren[];
}

export default function EditCategoryDialog({ category, categories }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(editCategoryAction, { success: false, message: "" });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setOpen(false);
    }
  }, [state]);

  const isSubcategory = category.parentId !== null;
  const hasChildren = category.children?.length && category.children.length > 0;

  const potentialParents = categories.filter((cat) => {
    if (cat.type !== category.type) return false; // Can't select a different type
    if (cat.id === category.id) return false; // Can't select itself
    if (cat.parentId === category.id) return false; // Can't select its own children
    if (cat.parentId !== null) return false; // Can't select a subcategory as a parent
    if (cat.children?.length == 0) return false; // Can't select a standalone category as a parent
    return true;
  });

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
                <Edit3Icon />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Editar categoria</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
        </DialogHeader>
        <Form id="edit-category-form" action={formAction}>
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="type" value={category.type} />
          {!isSubcategory && <input type="hidden" name="parentId" value="null" />}
          <div className="space-y-6 py-2">
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required defaultValue={category.name} disabled={isPending} />
              {state.errors?.name && <p className="text-destructive text-xs">{state.errors.name[0]}</p>}
            </div>

            {hasChildren ? (
              <Alert variant="default" className="mx-auto max-w-md">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Categoria com subcategorias</AlertTitle>
                <AlertDescription>
                  Esta categoria já possui subcategorias, portanto não pode se tornar uma subcategoria.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="parentId">Categoria Principal</Label>
                <Select name="parentId" defaultValue={category.parentId || ""} disabled={isPending} required>
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="Selecionar uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma categoria</SelectItem>
                    {potentialParents.map((parentCategory) => (
                      <SelectItem key={parentCategory.id} value={parentCategory.id}>
                        {parentCategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.errors?.parentId && <p className="text-destructive text-xs">{state.errors.parentId[0]}</p>}
                <p className="text-muted-foreground text-sm">
                  Deixe em branco para tornar esta categoria uma categoria principal.
                </p>
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
          <SubmitButton status={isPending ? "pending" : "idle"} form="edit-category-form">
            Editar
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
