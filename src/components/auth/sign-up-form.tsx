"use client";

import Form from "next/form";
import { useActionState } from "react";

import { AlertError } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/server/actions/user-actions";
import Link from "next/link";

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, {
    success: false,
    message: "",
    errors: undefined,
  });

  return (
    <Form className="p-6 md:p-8" action={formAction}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">Cadastre-se</h1>
          <p className="text-muted-foreground text-balance">Crie sua conta para continuar</p>
        </div>
        {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="exemplo@email.com" required />
          {state.errors?.email && <p className="text-destructive text-xs font-medium">{state.errors.email[0]}</p>}
        </div>
        <SubmitButton status={isPending ? "pending" : "idle"}>Cadastrar</SubmitButton>

        <div className="text-center text-sm">
          Já tem uma conta?{" "}
          <Link href="/sign-in" className="underline underline-offset-4">
            Faça login
          </Link>
        </div>
      </div>
    </Form>
  );
}
