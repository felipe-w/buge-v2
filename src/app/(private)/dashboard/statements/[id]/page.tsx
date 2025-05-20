import { ColumnDef } from "@tanstack/react-table";

import { getGroupAccounts } from "@/server/data/accounts";
import { getGroupCategories } from "@/server/data/categories";
import { getStatementTransactions } from "@/server/data/statements";
import { getCurrentUser } from "@/server/data/users";
import { TransactionWithAllJoins } from "@/lib/db/types";
import { formatDateToPtBr } from "@/lib/utils";

import { columns } from "@/components/transactions-data-table/columns";
import { TransactionsDataTable } from "@/components/transactions-data-table/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StatementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const statementTransactions = await getStatementTransactions({ id });
  const statement = statementTransactions[0].statement;

  const tableTransactions = statementTransactions.map((st) => ({
    ...st,
    accountId: statement.accountId,
    budgetId: statement.budgetId,
    budget: statement.budget,
    account: statement.account,
    compensatedAmount: st.importedTransaction?.compensatedAmount,
    transferId: st.importedTransaction?.transferId,
    compensationId: st.importedTransaction?.compensationId,
  }));

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
          <TransactionsDataTable
            columns={columns as ColumnDef<TransactionWithAllJoins>[]}
            data={tableTransactions}
            categories={categories}
            accounts={accounts}
          />
        </CardContent>
      </Card>
    </>
  );
}
