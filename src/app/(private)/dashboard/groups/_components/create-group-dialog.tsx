"use client";

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
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createGroupAction } from "@/server/actions/group-actions";

export function CreateGroupDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createGroupAction, {
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
          <PlusIcon />
          Criar Grupo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Grupo</DialogTitle>
          <DialogDescription>Preencha as informações para criar um novo grupo.</DialogDescription>
        </DialogHeader>
        <Form id="create-group-form" action={formAction}>
          <input type="hidden" name="ownerId" value={userId} />
          <div className="space-y-6 py-2">
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required placeholder="Nome do grupo" disabled={isPending} />
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
          <SubmitButton status={isPending ? "pending" : "idle"} form="create-group-form">
            Criar
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
