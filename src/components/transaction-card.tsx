import { TransactionWithAllJoins } from "@/lib/db/types";
import { categoryTypeConfig, cn, formatCurrency, formatDateToPtBr } from "@/lib/utils";

import { Landmark } from "lucide-react";
import CategoryBadge from "./category-badge";
import { Badge } from "./ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function TransactionCard({ transaction }: { transaction: TransactionWithAllJoins }) {
  const isTransfer = transaction.transferId !== null;
  const transactionType = isTransfer ? "transfer" : Number(transaction.amount) > 0 ? "income" : "expense";

  const typeConfig = categoryTypeConfig[transactionType];

  return (
    <Card className="py-4 gap-2">
      <CardHeader className="px-4 ">
        <CardTitle>{transaction.title}</CardTitle>
        <CardDescription className="text-xs flex items-center">{transaction.description}</CardDescription>
        <CardAction className="flex items-center">
          <span className="text-xs">{formatDateToPtBr(transaction.date)}</span>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex flex-wrap gap-2 justify-between items-end">
          <Badge variant="secondary" className="text-xs">
            <Landmark size={14} className="mr-1" /> {transaction.account.name}
          </Badge>
          {transaction.category && <CategoryBadge category={transaction.category} />}
          <div className="ml-auto">
            <Badge
              className={cn("text-sm font-bold tabular-nums", typeConfig.colors.textDark, typeConfig.colors.bgMedium)}
            >
              {formatCurrency(transaction.amount)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
