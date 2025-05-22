"use client";

import * as React from "react";

import { Account } from "@/lib/db/types";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Landmark, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface AccountFilterProps {
  accounts: Account[];
  value?: string;
  onChange: (accountId?: string) => void;
  className?: string;
}

export default function AccountFilter({ accounts, value: currentAccountId, onChange, className }: AccountFilterProps) {
  const handleAccountChange = (newAccountId: string) => {
    // If the selected account is clicked again, clear the filter
    const finalValue = newAccountId === currentAccountId ? undefined : newAccountId;
    onChange(finalValue);
  };

  const selectedAccount = accounts.find((account) => account.id === currentAccountId);

  const handleClear = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("border-dashed", !currentAccountId && "text-muted-foreground", className)}
        >
          <Landmark />
          Conta
          {selectedAccount && (
            <>
              <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
              <span className="text-foreground">{selectedAccount.name}</span>
              <div
                role="button"
                aria-label="Limpar filtro de conta"
                tabIndex={0}
                onPointerDown={handleClear}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <XCircle size={16} />
              </div>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {accounts.map((account) => (
          <DropdownMenuCheckboxItem
            key={account.id}
            checked={currentAccountId === account.id}
            onSelect={() => handleAccountChange(account.id)}
          >
            {account.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
