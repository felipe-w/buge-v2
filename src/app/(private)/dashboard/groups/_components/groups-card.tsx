"use client";

import { GroupWithMembers } from "@/lib/db/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full border">
              <UsersIcon size={20} />
            </div>
            <h3 className="text-lg font-medium">{group.name}</h3>
          </div>
        </CardTitle>

        <CardAction>
          <div className="divide-muted-foreground/20 inline-flex divide-x rounded-md shadow-xs rtl:space-x-reverse">
            {isOwner && <AddMemberDialog group={group} />}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
                  >
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
        </CardAction>
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
