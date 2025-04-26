import "server-only";

import { getCurrentUserId } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { groupMembers, groups } from "@/lib/db/schemas/groups-schema";
import { asc, eq } from "drizzle-orm";

export async function getUserGroups() {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  console.log("userId", userId);

  const userGroups = await db
    .select()
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, userId))
    .orderBy(asc(groups.createdAt));

  return userGroups.map((groupMember) => groupMember.groups);
}
