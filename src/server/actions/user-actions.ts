"use server";

import { auth } from "@/lib/auth";
import { AuthFormSchema, FormState, VerifyOTPFormSchema } from "@/lib/types";
import { validateFormData, ValidationError } from "@/lib/validate-form-data";
import { redirect } from "next/navigation";
import { createGroup } from "../data/groups";
import { getUserByEmail, setSelectedGroupId } from "../data/users";

// Sign-up with email OTP
export async function signUpAction(prevState: FormState, formData: FormData): Promise<FormState> {
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
export async function signInAction(prevState: FormState, formData: FormData): Promise<FormState> {
  let email: string;

  try {
    const validated = validateFormData(formData, AuthFormSchema);
    email = validated.email;

    // check if user exists
    const user = await getUserByEmail({ email });
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
export async function verifyOTPAction(prevState: FormState, formData: FormData): Promise<FormState> {
  let email: string;
  let otp: string;

  try {
    const validated = validateFormData(formData, VerifyOTPFormSchema);
    email = validated.email;
    otp = validated.otp;

    await auth.api.signInEmailOTP({ body: { email, otp } });
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

// this is run after the user is created, directly on auth.ts
export async function setupNewUserAction({ id, name }: { id: string; name: string }) {
  try {
    const group = await createGroup({ name, ownerId: id, newUser: true });
    await setSelectedGroupId({ groupId: group.id, userId: id });
  } catch (error) {
    console.error("Error setting up new user:", error);
    throw new Error("Erro ao configurar novo usuário");
  }
}

export async function setSelectedGroupIdAction({ groupId, userId }: { groupId: string; userId: string }) {
  await setSelectedGroupId({ groupId, userId });
}
