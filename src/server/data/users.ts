import "server-only";

import { headers } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { authUsers } from "@/lib/db/schemas/auth-schema";

export async function getUserByEmail({ email }: { email: string }) {
  const [user] = await db.select().from(authUsers).where(eq(authUsers.email, email));

  if (!user) throw new Error("Usuário não encontrado");
  return user;
}

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    unauthorized();
  }

  const [user] = await db.select().from(authUsers).where(eq(authUsers.id, session.user.id));

  if (!user) redirect("/sign-in");
  return user;
}

export async function setSelectedGroupId({ groupId, userId }: { groupId: string; userId: string }) {
  const result = await db.update(authUsers).set({ selectedGroupId: groupId }).where(eq(authUsers.id, userId));

  if (!result) throw new Error("Grupo não selecionado");
  return result;
}

export async function checkAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  if (!user) {
    unauthorized();
  }

  return user;
}
