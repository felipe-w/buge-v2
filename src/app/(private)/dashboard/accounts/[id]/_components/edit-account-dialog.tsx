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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { accountTypes } from "@/lib/db/schemas/accounts-schema";
import { Account } from "@/lib/types";
import { getAccountTypeName } from "@/lib/utils";
import { editAccountAction } from "@/server/actions/account-actions";

export default function EditAccountDialog({ account }: { account: Account }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(editAccountAction, { success: false, message: "" });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setOpen(false);
    }
  }, [state]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="secondary" size="icon">
                <PencilIcon />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Editar conta</TooltipContent>
        </Tooltip>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar conta</DialogTitle>
            <DialogDescription>Faça alterações na sua conta ou exclua-a.</DialogDescription>
          </DialogHeader>
          <Form id="edit-account-form" action={formAction}>
            <input type="hidden" name="id" value={account.id} />
            <div className="space-y-6 py-2">
              {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" required defaultValue={account.name} />
                {state.errors?.name && <p className="text-destructive text-xs">{state.errors.name[0]}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" required defaultValue={account.type} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue id="type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getAccountTypeName(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.errors?.type && <p className="text-destructive text-xs">{state.errors.type[0]}</p>}
              </div>
            </div>
          </Form>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <SubmitButton status={isPending ? "pending" : "idle"} form="edit-account-form">
              Editar
            </SubmitButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
