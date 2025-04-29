import { Heading } from "@/components/layout/heading";
import { Card, CardContent } from "@/components/ui/card";

import { getAccountAndTransactions } from "@/server/data/accounts";

import { AccountActions } from "./_components/account-actions";

export default async function AccountDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: accountId } = await params;
  const accountAndTransactions = await getAccountAndTransactions({ accountId });

  if (!accountAndTransactions) {
    return <div>Conta não encontrada</div>;
  }

  // Fetch reconciliations
  // const { data: reconciliations, error: reconciliationsError } = await supabase
  //   .from("account_reconciliations")
  //   .select("*")
  //   .eq("account_id", accountId)
  //   .order("reconciliation_date", { ascending: false });

  // if (reconciliationsError) {
  //   console.error("Error fetching reconciliations:", reconciliationsError);
  // }

  // Get latest and previous reconciliations if they exist
  // const latestReconciliation = reconciliations && reconciliations.length > 0 ? reconciliations[0] : null;
  // const previousReconciliation = reconciliations && reconciliations.length > 1 ? reconciliations[1] : null;

  // Calculate if there's a reconciliation discrepancy
  // let hasDiscrepancy = false;
  // let discrepancyAmount = 0;

  // if (latestReconciliation && previousReconciliation) {
  //   // Find transactions between the two reconciliations
  //   const transactionsBetweenReconciliations =
  //     accountTransactions?.filter((t) => {
  //       const transactionDate = new UTCDate(t.date);
  //       const latestDate = new UTCDate(latestReconciliation.reconciliation_date);
  //       const previousDate = new UTCDate(previousReconciliation.reconciliation_date);

  //       return transactionDate >= previousDate && transactionDate <= latestDate;
  //     }) || [];

  //   // Calculate the expected balance based on previous reconciliation + transactions
  //   const transactionsSum = transactionsBetweenReconciliations.reduce((sum, t) => {
  //     // For balance calculations, always use the original amount
  //     // Effective amount is only for reporting and categorization
  //     const amountToUse = t.amount;

  //     if (t.transaction_type === "expense") {
  //       return sum - Math.abs(amountToUse);
  //     } else if (t.transaction_type === "income") {
  //       return sum + Math.abs(amountToUse);
  //     } else if (t.transaction_type === "transfer") {
  //       // Since each transfer creates two transactions (one in each account),
  //       // we only need to look at the amount of this transaction
  //       // Negative amount means money leaving this account
  //       // Positive amount means money coming into this account
  //       return sum + amountToUse; // We use the signed amount directly
  //     }
  //     return sum;
  //   }, previousReconciliation.balance);

  //   // Check if there's a discrepancy
  //   if (Math.abs(transactionsSum - latestReconciliation.balance) > 0.01) {
  //     hasDiscrepancy = true;
  //     discrepancyAmount = latestReconciliation.balance - transactionsSum;
  //   }
  // }

  return (
    <div className="space-y-6">
      <Heading title={accountAndTransactions.name} actions={<AccountActions account={accountAndTransactions} />} />

      <Card>
        <CardContent>
          <pre>{JSON.stringify(accountAndTransactions, null, 2)}</pre>
          {/* {latestReconciliation && (
            <div
              className={`mb-6 flex items-start rounded-lg p-4 ${
                !previousReconciliation || !hasDiscrepancy
                  ? "border border-green-200 bg-green-50"
                  : "border border-amber-200 bg-amber-50"
              }`}
            >
              <div
                className={`mr-3 rounded-full p-1.5 ${
                  !previousReconciliation || !hasDiscrepancy
                    ? "bg-green-100 text-green-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {!previousReconciliation || !hasDiscrepancy ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium">
                  Última reconciliação:{" "}
                  {new UTCDate(latestReconciliation.reconciliation_date).toLocaleDateString("pt-BR")}
                </h4>

                {!previousReconciliation ? (
                  <p className="mt-1 text-sm text-green-600">Reconciliação inicial.</p>
                ) : !hasDiscrepancy ? (
                  <p className="mt-1 text-sm text-green-600">Saldo reconciliado corretamente.</p>
                ) : (
                  <div className="mt-1">
                    <p className="text-sm text-amber-700">
                      {discrepancyAmount > 0 ? (
                        <>
                          O saldo reconciliado está{" "}
                          <span className="font-medium">{formatCurrency(Math.abs(discrepancyAmount))}</span> acima do
                          esperado.
                        </>
                      ) : (
                        <>
                          O saldo reconciliado está{" "}
                          <span className="font-medium">{formatCurrency(Math.abs(discrepancyAmount))}</span> abaixo do
                          esperado.
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* <AccountTransactions
            accountId={accountId}
            transactions={accountTransactions || []}
            reconciliations={reconciliations || []}
            categories={categories || []}
            accounts={accounts || []}
            budgets={budgets || []}
            account={account}
          /> */}
        </CardContent>
      </Card>
    </div>
  );
}
