import { getGroupAccounts } from "@/server/data/accounts";
import { getGroupCategories } from "@/server/data/categories";
import { getStatement } from "@/server/data/statements";
import { getCurrentUser } from "@/server/data/users";
import { formatDateToPtBr } from "@/lib/utils";

import { columns } from "@/components/transactions-data-table/columns";
import { TransactionsDataTable } from "@/components/transactions-data-table/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StatementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const statement = await getStatement({ id });

  const { selectedGroupId: groupId } = await getCurrentUser();
  const categories = await getGroupCategories({ groupId: groupId! });
  const accounts = await getGroupAccounts({ groupId: groupId! });

  return (
    <>
      <div className="flex flex-col gap-2 mb-10">
        <h1>{statement.account.name}</h1>
        <p>{formatDateToPtBr(statement.createdAt!)}</p>
        <p>{statement.status}</p>
        <p>{statement.expectedTotal}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {statement.transactions && (
            <TransactionsDataTable
              columns={columns}
              data={statement.transactions}
              categories={categories}
              accounts={accounts}
              initialColumnVisibility={{ account: false }}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
