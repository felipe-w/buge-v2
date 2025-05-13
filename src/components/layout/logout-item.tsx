"use client";

import { redirect } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function LogoutItem() {
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          redirect("/sign-in");
        },
      },
    });
  };

  return (
    <DropdownMenuItem onClick={handleLogout}>
      <LogOut className="mr-2" />
      <span>Sair</span>
    </DropdownMenuItem>
  );
}
