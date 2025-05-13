import { getGroupAccounts } from "@/server/data/accounts";
import { getGroupCategories } from "@/server/data/categories";
import { getGroupTransactions } from "@/server/data/transactions";
import { getCurrentUser } from "@/server/data/users";

import { Heading } from "@/components/layout/heading";
import { CompensateTransactionDialog } from "./_components/compensate-transaction-dialog";
import { CreateTransactionDialog } from "./_components/create-transaction-dialog";
import DeleteTransactionDialog from "./_components/delete-transaction-dialog";
import { EditTransactionDialog } from "./_components/edit-transaction.dialog";

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  const transactions = await getGroupTransactions({ groupId: user.selectedGroupId! });
  const accounts = await getGroupAccounts({ groupId: user.selectedGroupId! });
  const categories = await getGroupCategories({ groupId: user.selectedGroupId! });
  // const budgets = await getGroupBudgets({ groupId: user.selectedGroupId! });

  return (
    <div className="space-y-6">
      <Heading
        title="Transações"
        actions={<CreateTransactionDialog accounts={accounts} categories={categories} budgets={[]} />}
      />
      {transactions.map((t) => (
        <p key={t.id}>
          {t.title} - <EditTransactionDialog accounts={accounts} categories={categories} budgets={[]} transaction={t} />{" "}
          <DeleteTransactionDialog transaction={t} />
          <br />
          <CompensateTransactionDialog transaction={t} transactions={transactions} />
          <br />
          {t.amount}
          <br />
          {t.date} - {t.category?.name}
          <br />
          {t.transfer ? t.transfer.accountId : ""}
        </p>
      ))}
    </div>
  );
}
