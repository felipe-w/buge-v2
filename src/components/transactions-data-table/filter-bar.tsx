"use client";

import { Table } from "@tanstack/react-table";
import { DateRange } from "react-day-picker";

import { Account, CategoryWithChildren } from "@/lib/db/types";

import CategorySelector from "../category-selector";
import { DateFilter } from "./date-filter";
import DataTableSearchInput from "./search-input";

interface FilterBarProps<TData> {
  table: Table<TData>;
  categories: CategoryWithChildren[];
  accounts?: Account[];
}

export default function FilterBar<TData>({ table, categories }: FilterBarProps<TData>) {
  const categoryColumn = table.getColumn("category");
  const currentCategoryId = (categoryColumn?.getFilterValue() as string) ?? "";
  const dateColumn = table.getColumn("date");
  const currentDateRange = (dateColumn?.getFilterValue() as DateRange | undefined) ?? undefined;

  const handleCategoryChange = (newCategoryId: string) => {
    categoryColumn?.setFilterValue(newCategoryId || undefined);
  };

  const handleDateChange = (newDateRange?: DateRange) => {
    dateColumn?.setFilterValue(newDateRange || undefined);
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
      </div>
    </div>
  );
}
