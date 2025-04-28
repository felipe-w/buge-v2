// 'use client';

// import { Tables } from '@/types/supabase';
// import TransactionsTable from '../../transactions/TransactionsTable';

// type Transaction = Tables<'transactions'> & {
//   category: Tables<'categories'> | null;
//   account: Tables<'accounts'>;
// };

// interface AccountTransactionsProps {
//   accountId: string;
//   transactions: Transaction[];
//   reconciliations: Tables<'account_reconciliations'>[];
//   categories: Tables<'categories'>[];
//   accounts: Tables<'accounts'>[];
//   budgets: Tables<'budgets'>[];
//   account: Tables<'accounts'>;
// }

// export function AccountTransactions({
//   accountId,
//   transactions,
//   reconciliations,
//   categories,
//   accounts,
//   budgets,
// }: AccountTransactionsProps) {
//   return (
//     <div className="space-y-4">
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-semibold">Transações</h2>
//       </div>

//       <TransactionsTable
//         transactions={transactions}
//         accounts={accounts}
//         categories={categories}
//         budgets={budgets}
//         showAccountColumn={false}
//         showBalanceColumn={true}
//         showActions={true}
//         reconciliations={reconciliations}
//         singleAccountId={accountId}
//       />
//     </div>
//   );
// }
