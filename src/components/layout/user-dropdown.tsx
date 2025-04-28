"use client";

import { AlertCircle, ChevronDown, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Group, User } from "@/lib/types";
import { setSelectedGroupIdAction } from "@/server/actions/user-actions";
import Link from "next/link";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import LogoutItem from "./logout-item";

export function UserDropdown({ groups, user }: { groups: Group[]; user: User }) {
  const [localSelectedGroupId, setLocalSelectedGroupId] = useState<string>(user.selectedGroupId!);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : user.email.split("@")[0].substring(0, 2).toUpperCase();

  const selectedGroup = groups.find((group) => group.id === localSelectedGroupId);
  const hasMultipleGroups = groups.length > 1;

  // Handler for changing the group selection
  const handleGroupChange = async (newGroupId: string) => {
    if (newGroupId && newGroupId !== localSelectedGroupId) {
      const previousGroupId = localSelectedGroupId;
      setLocalSelectedGroupId(newGroupId);
      try {
        await setSelectedGroupIdAction(user.id, newGroupId);
        router.refresh();
      } catch (error) {
        console.error("Error setting selected group ID:", error);
        toast.error("Erro ao definir o grupo selecionado");
        setLocalSelectedGroupId(previousGroupId);
      }
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {hasMultipleGroups ? (
          <Button
            variant="default"
            className="bg-foreground/40 hover:bg-foreground/60 flex items-center justify-between border border-transparent pr-3 pl-2"
          >
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback className="bg-foreground/60 text-primary-foreground">
                  {userInitials || <AlertCircle size={16} />}
                </AvatarFallback>
              </Avatar>
              <span className="text-primary-foreground/90 ml-1 text-sm font-medium">{selectedGroup!.name}</span>
            </div>
            <ChevronDown className="text-primary-foreground ml-2" />
          </Button>
        ) : (
          <Avatar className="size-8">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback className="bg-foreground/60 text-primary-foreground">{userInitials}</AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {hasMultipleGroups && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground pb-0">Grupo Atual</DropdownMenuLabel>
              {groups.length === 0 ? (
                <div className="text-muted-foreground px-2 py-1.5 text-xs">Nenhum grupo encontrado</div>
              ) : (
                <DropdownMenuRadioGroup value={localSelectedGroupId} onValueChange={handleGroupChange}>
                  {groups.map((group: Group) => (
                    <DropdownMenuRadioItem key={group.id} value={group.id}>
                      {group.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/groups">
              <Users className="mr-2" />
              <span>Grupos</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <LogoutItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
