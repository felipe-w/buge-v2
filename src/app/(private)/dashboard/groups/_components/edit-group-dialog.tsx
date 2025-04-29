"use client";

import { editGroupAction } from "@/server/actions/group-actions";
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { GroupWithMembers } from "@/lib/types";
import { Edit3Icon } from "lucide-react";
import { toast } from "sonner";

export function EditGroupDialog({ group }: { group: GroupWithMembers }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(editGroupAction, {
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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Edit3Icon className="mr-2" />
          Editar
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Grupo</DialogTitle>
          <DialogDescription>Altere o nome do grupo.</DialogDescription>
        </DialogHeader>
        <Form id="edit-group-form" action={formAction}>
          <input type="hidden" name="id" value={group.id} />
          <div className="space-y-6 py-2">
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" defaultValue={group.name} required disabled={isPending} />
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
          <SubmitButton status={isPending ? "pending" : "idle"} form="edit-group-form">
            Salvar
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
