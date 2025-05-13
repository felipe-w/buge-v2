"use client";

import { useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { toast } from "sonner";

import { transferOwnershipAction } from "@/server/actions/groups-actions";
import { GroupMember, GroupWithMembers, User } from "@/lib/db/types";

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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck } from "lucide-react";

export function TransferOwnershipDialog({ group }: { group: GroupWithMembers }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(transferOwnershipAction, {
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

  type MemberWithUser = GroupMember & { user: User };
  const memberProfiles = group.groupMembers.filter((member: MemberWithUser) => {
    return member.userId !== group.ownerId;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <UserCheck className="mr-2" />
          Transferir Propriedade
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferir Propriedade</DialogTitle>
          <DialogDescription>
            Selecione para quem deseja transferir a propriedade do grupo <strong>{group.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Form id="transfer-ownership-form" action={formAction}>
          <input type="hidden" name="id" value={group.id} />
          <div className="space-y-6 py-2">
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ownerId">Novo Proprietário</Label>
              <Select name="ownerId" required disabled={isPending || memberProfiles.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um membro" />
                </SelectTrigger>
                <SelectContent>
                  {memberProfiles.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Não há membros disponíveis
                    </SelectItem>
                  ) : (
                    memberProfiles.map((profile: MemberWithUser) => (
                      <SelectItem key={profile.userId} value={profile.userId}>
                        {profile.user.name || profile.user.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {state.errors?.new_owner_id && <p className="text-destructive text-xs">{state.errors.new_owner_id[0]}</p>}
              {memberProfiles.length === 0 && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Adicione membros ao grupo para poder transferir a propriedade.
                </p>
              )}
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
            form="transfer-ownership-form"
            status={isPending ? "pending" : "idle"}
            disabled={isPending || memberProfiles.length === 0}
          >
            Transferir
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
