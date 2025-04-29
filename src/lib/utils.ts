import { clsx, type ClassValue } from "clsx";
import { ArrowLeftRight, CircleDollarSign, ShoppingCart } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
      border: "border-income",
      bg: "bg-income/10",
      bgHover: "hover:bg-income/30",
      text: "text-income-foreground",
      badgeBg: "bg-income-foreground/80",
      // buttonHover: "hover:bg-income-200",
      itemHover: "hover:bg-income/20",
      // emptyBg: "bg-income-50/50",
      // emptyTitle: "text-income-800",
      buttonBg: "bg-income/20",
      buttonHoverBg: "hover:bg-income/50",
      buttonText: "text-income-foreground",
      // buttonHoverText: "hover:text-income-200",
      // badgeBorder: "border-income-200",
      borderLeft: "border-income/40",
      tabBg: "data-[state=active]:bg-income/30",
      tabText: "data-[state=active]:text-income-foreground",
      tabBorder: "data-[state=active]:border-income",
    },
  },
  expense: {
    icon: ShoppingCart,
    label: "Despesas",
    colors: {
      border: "border-expense",
      bg: "bg-expense/10",
      bgHover: "hover:bg-expense/30",
      text: "text-expense-foreground",
      badgeBg: "bg-expense-foreground/80",
      // buttonHover: "hover:bg-expense-300",
      itemHover: "hover:bg-expense/20",
      // emptyBg: "bg-expense-100/50",
      // emptyTitle: "text-expense-900",
      buttonBg: "bg-expense/20",
      buttonHoverBg: "hover:bg-expense/50",
      buttonText: "text-expense-foreground",
      // buttonHoverText: "hover:text-expense-200",
      // badgeBorder: "border-expense-300",
      borderLeft: "border-expense/40",
      tabBg: "data-[state=active]:bg-expense/30",
      tabText: "data-[state=active]:text-expense-foreground",
      tabBorder: "data-[state=active]:border-expense",
    },
  },
  transfer: {
    icon: ArrowLeftRight,
    label: "Transferência",
    colors: {
      border: "border-muted-300",
      bg: "bg-muted-200",
      text: "text-muted-700",
      tabBg: "data-[state=active]:bg-muted-200",
      tabText: "data-[state=active]:text-muted-700",
      tabBorder: "data-[state=active]:border-muted-300",
    },
  },
};
