import "server-only";

import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schemas/auth-schema";
import { eq } from "drizzle-orm";

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}
