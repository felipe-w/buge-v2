"use server";

import { auth } from "@/lib/auth";
import { AuthFormSchema, FormState, VerifyOTPFormSchema } from "@/lib/types";
import { validateFormData, ValidationError } from "@/lib/validate-form-data";
import { redirect } from "next/navigation";
import { getUserByEmail } from "../data/users";

// Sign-up with email OTP
export async function signUpWithEmailOTP(prevState: FormState, formData: FormData): Promise<FormState> {
  let email: string;

  try {
    const validated = validateFormData(formData, AuthFormSchema);
    email = validated.email;

    await auth.api.sendVerificationOTP({
      body: {
        email,
        type: "sign-in",
      },
    });
  } catch (error) {
    console.error("OTP sending error:", error);
    return {
      success: false,
      message: "Erro ao enviar OTP",
      errors:
        error instanceof ValidationError
          ? error.errors
          : { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }

  redirect(`/verify-otp?email=${email}&type=sign-up`);
}

// Sign-in with email OTP
export async function signInWithEmailOTP(prevState: FormState, formData: FormData): Promise<FormState> {
  let email: string;

  try {
    const validated = validateFormData(formData, AuthFormSchema);
    email = validated.email;

    // check if user exists
    const user = await getUserByEmail(email);
    if (!user) throw new Error("Usuário não encontrado");

    await auth.api.sendVerificationOTP({
      body: {
        email,
        type: "sign-in",
      },
    });
  } catch (error) {
    console.error("OTP sending error:", error);
    return {
      success: false,
      message: "Erro ao enviar OTP",
      errors:
        error instanceof ValidationError
          ? error.errors
          : { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }

  redirect(`/verify-otp?email=${email}&type=sign-in`);
}

// Verify OTP and complete login
export async function verifyOTPAndLogin(prevState: FormState, formData: FormData): Promise<FormState> {
  let email: string;
  let otp: string;

  try {
    const validated = validateFormData(formData, VerifyOTPFormSchema);
    email = validated.email;
    otp = validated.otp;

    await auth.api.signInEmailOTP({
      body: {
        email,
        otp,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return {
      success: false,
      message: "Erro ao verificar OTP",
      errors:
        error instanceof ValidationError
          ? error.errors
          : { server: [error instanceof Error ? error.message : "Erro desconhecido no servidor"] },
    };
  }

  redirect("/dashboard");
}
