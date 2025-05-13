"use client";

import { useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { toast } from "sonner";

import { removeMemberAction } from "@/server/actions/groups-actions";
import { GroupWithMembers, User } from "@/lib/db/types";

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, LogOut, UserMinus } from "lucide-react";

interface RemoveMemberProps {
  group: GroupWithMembers;
  member: User;
  userId: string;
}

export function RemoveMemberDialog({ group, member, userId }: RemoveMemberProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(removeMemberAction, {
    success: false,
    message: "",
    errors: undefined,
  });

  const isSelfRemoval = userId === member.id;

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
              <Button variant="outline" size="icon">
                {isSelfRemoval ? <LogOut /> : <UserMinus />}
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{isSelfRemoval ? "Sair do Grupo" : "Remover Membro"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSelfRemoval ? "Sair do Grupo" : "Remover Membro"}</DialogTitle>
          <DialogDescription>
            {isSelfRemoval ? (
              <>
                Tem certeza que deseja sair do grupo <strong>{group.name}</strong>?
              </>
            ) : (
              <>
                Tem certeza que deseja remover <strong>{member.name || member.email}</strong> do grupo{" "}
                <strong>{group.name}</strong>?
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <Form id="remove-member-form" action={formAction}>
          <input type="hidden" name="groupId" value={group.id} />
          <input type="hidden" name="userId" value={member.id} />
          <div className="space-y-6 py-2">
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
            <Alert variant="warning">
              <AlertCircle />
              <AlertTitle>ATENÇÃO</AlertTitle>
              <AlertDescription>Essa ação não pode ser revertida.</AlertDescription>
            </Alert>
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
            form="remove-member-form"
            variant="destructive"
            status={isPending ? "pending" : "idle"}
            disabled={isPending}
          >
            {isSelfRemoval ? "Sair" : "Remover"}
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
