"use client";

import Link from "next/link";

import { Account } from "@/lib/db/types";
import { getAccountTypeName } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight } from "lucide-react";

export function AccountCards({ account }: { account: Account & { transactions: number } }) {
  return (
    <Link href={`/dashboard/accounts/${account.id}`} key={account.id}>
      <Card className="hover:bg-secondary">
        <CardHeader>
          <CardTitle>{account.name}</CardTitle>
        </CardHeader>
        <CardFooter className="flex justify-between">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <ArrowLeftRight size={12} />
            <span>{account.transactions} transações</span>
          </div>
          <Badge variant="default">{getAccountTypeName(account.type)}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
