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
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { accountTypes } from "@/lib/db/schemas/accounts-schema";
import { getAccountTypeName } from "@/lib/utils";
import { createAccountAction } from "@/server/actions/account-actions";

export function CreateAccountDialog({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createAccountAction, {
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
          Criar Conta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Conta</DialogTitle>
          <DialogDescription>Preencha as informações para criar uma nova conta.</DialogDescription>
        </DialogHeader>
        <Form id="create-account-form" action={formAction}>
          <input type="hidden" name="groupId" value={groupId} />
          <div className="space-y-6 py-2">
            {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required placeholder="Nome da conta" disabled={isPending} />
              {state.errors?.name && <p className="text-destructive text-xs">{state.errors.name[0]}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Tipo</Label>
              <Select name="type" required disabled={isPending}>
                <SelectTrigger>
                  <SelectValue id="type" placeholder="Selecione o tipo de conta" />
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
          <SubmitButton status={isPending ? "pending" : "idle"} form="create-account-form">
            Criar
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
