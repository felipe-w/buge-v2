"use client";

import { useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { toast } from "sonner";

import { deleteGroupAction } from "@/server/actions/groups-actions";
import { GroupWithMembers } from "@/lib/db/types";

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
import { TrashIcon } from "lucide-react";

export function DeleteGroupDialog({ group }: { group: GroupWithMembers }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(deleteGroupAction, {
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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
          <TrashIcon className="mr-2" />
          Excluir
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Grupo</DialogTitle>
          <DialogDescription>Ação irreversível, todos os dados serão perdidos.</DialogDescription>
        </DialogHeader>
        <Form id="delete-group-form" action={formAction}>
          <input type="hidden" name="id" value={group.id} />
          <div className="space-y-6 py-2">
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Confirme o nome</Label>
              <Input id="name" name="name" required placeholder="Nome do Grupo" disabled={isPending} />
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
          <SubmitButton
            type="submit"
            form="delete-group-form"
            variant="destructive"
            status={isPending ? "pending" : "idle"}
            disabled={isPending}
          >
            Excluir
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
