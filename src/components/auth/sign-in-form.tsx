"use client";

import { useActionState } from "react";
import Form from "next/form";
import Link from "next/link";

import { signInAction } from "@/server/actions/users-actions";

import { AlertError } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInAction, {
    success: false,
    message: "",
  });

  return (
    <Form className="p-6 md:p-8" action={formAction}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">Faça login</h1>
          <p className="text-muted-foreground text-balance">Insira seu e-mail para continuar</p>
        </div>
        {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="exemplo@email.com" required />
          {state.errors?.email && <p className="text-destructive text-xs font-medium">{state.errors.email[0]}</p>}
        </div>

        <SubmitButton status={isPending ? "pending" : "idle"}>Entrar</SubmitButton>

        <div className="text-center text-sm">
          Não tem uma conta?{" "}
          <Link href="/sign-up" className="underline underline-offset-4">
            Cadastre-se
          </Link>
        </div>
      </div>
    </Form>
  );
}
