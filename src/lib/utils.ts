import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { ArrowLeftRight, CircleDollarSign, ShoppingCart } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export function compensatedAmount(transaction: TransactionWithAllJoins) {
//   const amount =
//     transaction.compensationId && transaction.compensatedAmount !== null
//       ? transaction.compensatedAmount
//       : transaction.amount;

//   return amount;
// }

export function formatCurrency(amount: string | number, options?: Intl.NumberFormatOptions): string {
  if (typeof amount === "string") {
    amount = Number(amount);
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    ...options,
  }).format(amount);
}

export function formatDateToPtBr(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  if (typeof date === "string") {
    date = new Date(date);
  }

  return date.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    ...options,
  });
}

export function getAccountTypeName(type: string) {
  const typeMap: Record<string, string> = {
    checking: "Conta Corrente",
    savings: "Poupança",
    credit_card: "Cartão de Crédito",
    investment: "Investimento",
    cash: "Dinheiro",
    other: "Outro",
  };

  return typeMap[type] || type;
}

export const categoryTypeConfig = {
  income: {
    icon: CircleDollarSign,
    label: "Receitas",
    colors: {
      bgLight: "bg-income/10",
      bgMedium: "bg-income/30",
      bgDark: "bg-income-foreground/80",
      textDark: "text-income-foreground",
      textLight: "text-income-foreground/50",
      border: "border-income",
      bgHover: "hover:bg-income/30",
      itemHover: "hover:bg-income/20",
      // emptyBg: "bg-income-50/50",
      // emptyTitle: "text-income-800",
      buttonHoverBg: "hover:bg-income/50",
      buttonText: "text-income-foreground",
      // buttonHoverText: "hover:text-income-200",
      // badgeBorder: "border-income-200",
      borderLeft: "border-income/40",
    },
  },
  expense: {
    icon: ShoppingCart,
    label: "Despesas",
    colors: {
      bgLight: "bg-expense/10",
      bgMedium: "bg-expense/30",
      bgDark: "bg-expense-foreground/80",
      textDark: "text-expense-foreground",
      textLight: "text-expense-foreground/50",
      border: "border-expense",
      bgHover: "hover:bg-expense/30",
      // buttonHover: "hover:bg-expense-300",
      itemHover: "hover:bg-expense/20",
      // emptyBg: "bg-expense-100/50",
      // emptyTitle: "text-expense-900",
      buttonHoverBg: "hover:bg-expense/50",
      buttonText: "text-expense-foreground",
      // buttonHoverText: "hover:text-expense-200",
      // badgeBorder: "border-expense-300",
      borderLeft: "border-expense/40",
    },
  },
  transfer: {
    icon: ArrowLeftRight,
    label: "Transferências",
    colors: {
      bgLight: "bg-muted/10",
      bgMedium: "bg-muted/80",
      bgDark: "bg-muted-foreground/80",
      textDark: "text-muted-foreground",
      textLight: "text-muted-foreground/50",
      border: "border-muted",
      bgHover: "hover:bg-muted/30",
      // buttonHover: "hover:bg-muted-300",
      itemHover: "hover:bg-muted/20",
      // emptyBg: "bg-muted-100/50",
      // emptyTitle: "text-muted-900",
      buttonHoverBg: "hover:bg-muted/50",
      buttonText: "text-muted-foreground",
      // buttonHoverText: "hover:text-muted-200",
      // badgeBorder: "border-muted-300",
      borderLeft: "border-muted/40",
    },
  },
};
