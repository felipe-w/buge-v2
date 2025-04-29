import "server-only";

import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { groupMembers, groups } from "@/lib/db/schemas/groups-schema";
import { EditGroup, NewGroup, NewGroupMember, RemoveGroupMember, TransferOwnership } from "@/lib/types";
import { and, eq, exists } from "drizzle-orm";
import { getUserByEmail } from "./users";

export async function getUserGroups() {
  const { id: userId } = await isAuthenticated();

  return await db.query.groups.findMany({
    where: (groups) =>
      exists(
        db
          .select()
          .from(groupMembers)
          .where(and(eq(groupMembers.groupId, groups.id), eq(groupMembers.userId, userId))),
      ),
    with: {
      groupMembers: {
        with: { user: true },
      },
    },
  });
}

export async function createGroup({ name, ownerId, newUser }: NewGroup & { newUser?: boolean }) {
  if (!newUser) {
    await isAuthenticated();
  }

  return await db.transaction(async (tx) => {
    const newGroup = await tx.insert(groups).values({ name, ownerId }).returning();
    await tx.insert(groupMembers).values({ groupId: newGroup[0].id, userId: ownerId });

    return newGroup[0];
  });
}

export async function editGroup({ id, name }: EditGroup) {
  await isAuthenticated();
  await checkGroupOwnership({ groupId: id });

  const result = await db.update(groups).set({ name }).where(eq(groups.id, id)).returning();
  return result[0];
}

export async function deleteGroup({ id, name }: EditGroup) {
  await isAuthenticated();
  await checkGroupOwnership({ groupId: id });

  const result = await db
    .delete(groups)
    .where(and(eq(groups.id, id), eq(groups.name, name)))
    .returning();

  if (!result.length) throw new Error("Grupo não encontrado");
}

export async function addMember({ groupId, email }: NewGroupMember) {
  await isAuthenticated();
  await checkGroupOwnership({ groupId });

  const userToAdd = await getUserByEmail({ email });
  if (!userToAdd) throw new Error("Usuário não encontrado");

  const existingMember = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userToAdd.id)))
    .limit(1);

  if (existingMember.length) throw new Error("Usuário já é membro deste grupo");

  return await db.insert(groupMembers).values({ groupId, userId: userToAdd.id });
}

export async function removeMember({ groupId, userId }: RemoveGroupMember) {
  await isAuthenticated();
  await checkGroupOwnership({ groupId });

  await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
}

export async function transferOwnership({ id, ownerId }: TransferOwnership) {
  await isAuthenticated();
  await checkGroupOwnership({ groupId: id });

  await db.update(groups).set({ ownerId }).where(eq(groups.id, id));
}

export async function checkGroupOwnership({ groupId }: { groupId: string }) {
  const { id: userId } = await isAuthenticated();

  const group = await db
    .select()
    .from(groups)
    .where(and(eq(groups.id, groupId), eq(groups.ownerId, userId)))
    .limit(1);

  if (!group.length) throw new Error("Grupo não encontrado ou você não tem permissão para verificar a propriedade");

  return group[0];
}
