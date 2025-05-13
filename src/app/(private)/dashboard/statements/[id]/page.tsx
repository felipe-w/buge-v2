import { getStatement } from "@/server/data/statements";
import { formatCurrency } from "@/lib/utils";

export default async function StatementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const statement = await getStatement({ id });

  return (
    <>
      <div>
        <h1>{statement.account.name}</h1>
        <p>{statement.createdAt?.toLocaleDateString()}</p>
        <p>{statement.status}</p>
        <p>{statement.expectedTotal}</p>
      </div>
      <div>
        <h2>Transações</h2>
        {statement.statementTransactions.map((transaction) => (
          <div key={transaction.id}>
            <p>
              {transaction.title} - {transaction.category?.name} - {formatCurrency(transaction.amount)}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
