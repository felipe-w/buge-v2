import { Transaction } from "@/lib/db/types";

export function calculateCompensatedAmounts(transactionsToCompensate: Transaction[]) {
  // Split transactions into two working queues
  const incomes = transactionsToCompensate
    .filter((t) => Number(t.amount) > 0)
    .map((t) => ({ ...t, left: Number(t.amount) }));
  const expenses = transactionsToCompensate
    .filter((t) => Number(t.amount) < 0)
    .map((t) => ({ ...t, left: Number(t.amount) * -1 }));

  let i = 0;
  let e = 0;

  while (i < incomes.length && e < expenses.length) {
    const inc = incomes[i];
    const exp = expenses[e];

    const x = Math.min(Number(inc.left), Number(exp.left));
    inc.left -= x;
    exp.left -= x;

    if (inc.left === 0) i++;
    if (exp.left === 0) e++;
  }

  const remaining: Record<string, number> = {};

  for (const inc of incomes) remaining[inc.id] = inc.left;
  for (const exp of expenses) remaining[exp.id] = -exp.left;

  return remaining;
}
