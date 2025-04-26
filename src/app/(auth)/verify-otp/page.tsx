"use client";

import { verifyOTPAndLogin } from "@/server/actions/user-actions";
import Form from "next/form";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { AlertError } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function VerifyOTPPage() {
  const [state, formAction, isPending] = useActionState(verifyOTPAndLogin, {
    success: false,
    message: "",
  });
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const typeParam = searchParams.get("type") || "";
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  return (
    <>
      <Form className="p-6 md:p-8" action={formAction}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Verifique seu e-mail</h1>
            <p className="text-muted-foreground text-balance">Confirme o código enviado no e-mail para continuar</p>
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="OTP">Código de verificação</Label>
            <div className="mx-auto w-fit">
              <InputOTP maxLength={6} name="otp">
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <SubmitButton status={isPending ? "pending" : "idle"}>Confirmar</SubmitButton>

          <div className="text-center text-sm">
            Não recebeu o código? <br />
            {cooldown > 0 ? (
              <span className="text-muted-foreground">Poderá solicitar novamente em {cooldown}s</span>
            ) : typeParam === "sign-in" ? (
              <Link href="/sign-in" className="underline underline-offset-4">
                Solicite novamente
              </Link>
            ) : (
              <Link href="/sign-up" className="underline underline-offset-4">
                Solicite novamente
              </Link>
            )}
          </div>
        </div>
      </Form>
    </>
  );
}
