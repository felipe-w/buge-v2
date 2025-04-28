"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GroupWithMembers } from "@/lib/types";
import { MoreHorizontal, UsersIcon } from "lucide-react";
import { AddMemberDialog } from "./add-member-dialog";
import { DeleteGroupDialog } from "./delete-group-dialog";
import { EditGroupDialog } from "./edit-group-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";
import { TransferOwnershipDialog } from "./transfer-ownership-dialog";

export default function GroupsCard({ group, userId }: { group: GroupWithMembers; userId: string }) {
  const isOwner = group.ownerId === userId;

  return (
    <Card key={group.id}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full border">
            <UsersIcon size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium">{group.name}</h3>
            <p className="text-muted-foreground text-sm">
              {group.groupMembers.length} membro{group.groupMembers.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && <AddMemberDialog group={group} />}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EditGroupDialog group={group} />
                <TransferOwnershipDialog group={group} />
                <DropdownMenuSeparator />
                <DeleteGroupDialog group={group} />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {/* Member List */}
      <CardContent>
        <h4 className="mb-3 text-sm font-medium">Membros</h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {group.groupMembers.map((membership) => (
            <div key={membership.id} className="bg-secondary flex items-center justify-between rounded-md p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={membership.user.image || ""} />
                  <AvatarFallback>
                    {membership.user.name?.substring(0, 2).toUpperCase() ||
                      membership.user.email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{membership.user.name || membership.user.email}</div>
                  <div className="text-muted-foreground text-xs">{membership.user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {membership.userId === group.ownerId ? (
                  <Badge>Proprietário</Badge>
                ) : (
                  (isOwner || membership.userId === userId) && (
                    <RemoveMemberDialog group={group} member={membership.user} userId={userId} />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
