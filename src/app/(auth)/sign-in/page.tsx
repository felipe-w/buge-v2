"use client";

import Form from "next/form";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

import { AlertError } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmailOTP } from "@/server/actions/user-actions";
import Link from "next/link";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmailOTP, {
    success: false,
    message: "",
  });
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  return (
    <>
      <Form className="p-6 md:p-8" action={formAction}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Faça login</h1>
            <p className="text-muted-foreground text-balance">Insira seu e-mail para continuar</p>
          </div>
          {state.errors && <AlertError description={state.errors.server && state.errors.server[0]} />}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="exemplo@email.com"
              required
              defaultValue={emailParam}
            />
            {state.errors?.email && <p className="text-destructive text-xs font-medium">{state.errors.email[0]}</p>}
          </div>

          <SubmitButton status={isPending ? "pending" : "idle"}>Entrar</SubmitButton>

          <div className="text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/sign-up" className="underline underline-offset-4">
              Faça cadastro
            </Link>
          </div>
        </div>
      </Form>
    </>
  );
}
