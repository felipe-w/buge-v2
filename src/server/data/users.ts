import "server-only";

import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { authUsers } from "@/lib/db/schemas/auth-schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function getUserByEmail({ email }: { email: string }) {
  const [user] = await db.select().from(authUsers).where(eq(authUsers.email, email));
  return user;
}

export async function getCurrentUser() {
  const { id } = await isAuthenticated();

  const [user] = await db.select().from(authUsers).where(eq(authUsers.id, id));

  if (!user) redirect("/sign-in");
  return user;
}

export async function setSelectedGroupId({ groupId, userId }: { groupId: string; userId: string }) {
  await db.update(authUsers).set({ selectedGroupId: groupId }).where(eq(authUsers.id, userId));
}
