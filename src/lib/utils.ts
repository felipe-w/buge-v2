import { clsx, type ClassValue } from "clsx";
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
