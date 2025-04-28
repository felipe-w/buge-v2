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

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GroupWithMembers } from "@/lib/types";
import { addMemberAction } from "@/server/actions/group-actions";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export function AddMemberDialog({ group }: { group: GroupWithMembers }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(addMemberAction, {
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
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="secondary" size="icon">
              <UserPlus />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Adicionar membro</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Membro</DialogTitle>
          <DialogDescription>Digite o email do usuário que deseja adicionar ao grupo {group.name}.</DialogDescription>
        </DialogHeader>
        <Form id="add-member-form" action={formAction}>
          <input type="hidden" name="groupId" value={group.id} />
          <div className="space-y-6 py-2">
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email do usuário</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="email@exemplo.com"
                disabled={isPending}
              />
              {state.errors?.email && <p className="text-destructive text-xs">{state.errors.email[0]}</p>}
            </div>
          </div>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <SubmitButton status={isPending ? "pending" : "idle"} form="add-member-form">
            Adicionar
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
