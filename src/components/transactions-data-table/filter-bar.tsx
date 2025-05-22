"use client";

import { Table } from "@tanstack/react-table";
import { DateRange } from "react-day-picker";

import { Account, CategoryWithChildren } from "@/lib/db/types";

import CategorySelector from "../category-selector";
import AccountFilter from "./account-filter";
import { DateFilter } from "./date-filter";
import DataTableSearchInput from "./search-input";
import TransactionTypeFilter, { TransactionType } from "./transaction-type-filter";

interface FilterBarProps<TData> {
  table: Table<TData>;
  categories: CategoryWithChildren[];
  accounts?: Account[];
}

export default function FilterBar<TData>({ table, categories, accounts }: FilterBarProps<TData>) {
  const categoryColumn = table.getColumn("category");
  const currentCategoryId = (categoryColumn?.getFilterValue() as string) ?? "";

  const dateColumn = table.getColumn("date");
  const currentDateRange = (dateColumn?.getFilterValue() as DateRange | undefined) ?? undefined;

  const accountColumn = table.getColumn("account");
  const currentAccountId = (accountColumn?.getFilterValue() as string) ?? "";

  const transactionTypeColumn = table.getColumn("transactionType");
  const currentTransactionType = (transactionTypeColumn?.getFilterValue() as TransactionType | undefined) ?? undefined;

  const handleCategoryChange = (newCategoryId: string) => {
    categoryColumn?.setFilterValue(newCategoryId || undefined);
  };

  const handleDateChange = (newDateRange?: DateRange) => {
    dateColumn?.setFilterValue(newDateRange || undefined);
  };

  const handleAccountChange = (newAccountId?: string) => {
    accountColumn?.setFilterValue(newAccountId || undefined);
  };

  const handleTransactionTypeChange = (newTransactionType?: TransactionType) => {
    transactionTypeColumn?.setFilterValue(newTransactionType || undefined);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <DataTableSearchInput table={table} />
        </div>
        <DateFilter value={currentDateRange} onChange={handleDateChange} />
        <CategorySelector
          categories={categories}
          triggerType="button"
          value={currentCategoryId}
          onChange={handleCategoryChange}
        />
        {accounts && <AccountFilter accounts={accounts} value={currentAccountId} onChange={handleAccountChange} />}
        <TransactionTypeFilter value={currentTransactionType} onChange={handleTransactionTypeChange} />
      </div>
    </div>
  );
}
