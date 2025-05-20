"use client";

import { createColumnHelper, FilterFn } from "@tanstack/react-table";
import { DateRange } from "react-day-picker";

import { TransactionWithAllJoins } from "@/lib/db/types";
import { categoryTypeConfig, cn, formatCurrency, formatDateToPtBr } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import CategoryBadge from "../category-badge";
import { Checkbox } from "../ui/checkbox";
import { DataTableColumnHeader } from "./column-header";

const multiColumnFilterFn: FilterFn<TransactionWithAllJoins> = (row, columnId, filterValue) => {
  const amount = formatCurrency(row.original.amount);
  const amountWithoutGrouping = formatCurrency(row.original.amount, { useGrouping: false });

  const searchableRowContent =
    `${row.original.title} ${row.original.description} ${amount} ${amountWithoutGrouping}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

// TODO: VER QUANDO VIA ADD STATUS E BUDGET NA TABELA
// const statusFilterFn: FilterFn<TransactionWithAllJoins> = (row, columnId, filterValue: string[]) => {
//   if (!filterValue?.length) return true;
//   const status = row.getValue(columnId) as string;
//   return filterValue.includes(status);
// };

// const budgetFilterFn: FilterFn<TransactionWithAllJoins> = (row, columnId, filterValue: string[]) => {
//   if (!filterValue?.length) return true;
//   const budget = row.getValue(columnId) as string;
//   return filterValue.includes(budget);
// };

const categoryFilterFn: FilterFn<TransactionWithAllJoins> = (row, columnId, filterValue: string) => {
  if (!filterValue) return true;
  const rowCategoryId = row.original.category?.id;
  return rowCategoryId === filterValue;
};

const accountFilterFn: FilterFn<TransactionWithAllJoins> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const account = row.getValue(columnId) as string;
  return filterValue.includes(account);
};

const dateFilterFn: FilterFn<TransactionWithAllJoins> = (row, _columnId, range: DateRange) => {
  // no "from" → keep the row
  if (!range?.from) return true;

  // 1. the row date already comes from the DB as "YYYY-MM-DD"
  const rowDate = row.original.date;

  // 2. normalise picker dates to "YYYY-MM-DD" in *UTC*
  const from = range.from.toISOString().slice(0, 10);
  const to = range.to ? range.to.toISOString().slice(0, 10) : from;

  // 3. simple inclusive comparison
  return rowDate >= from && rowDate <= to;
};

const columnHelper = createColumnHelper<TransactionWithAllJoins>();

export const columns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 28,
  }),
  columnHelper.accessor("date", {
    id: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data" />,
    cell: (props) => {
      return <div>{formatDateToPtBr(props.getValue())}</div>;
    },
    filterFn: dateFilterFn,
    size: 100,
  }),
  columnHelper.accessor("account.name", {
    id: "account",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Conta" />,
    size: 140,
    filterFn: accountFilterFn,
  }),
  columnHelper.accessor("title", {
    id: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Título" />,
    size: 320,
    filterFn: multiColumnFilterFn,
  }),
  columnHelper.accessor("category.id", {
    id: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categoria" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          {row.original.category && <CategoryBadge category={row.original.category} />}
        </div>
      );
    },
    size: 140,
    filterFn: categoryFilterFn,
  }),
  columnHelper.accessor("amount", {
    id: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor" className="justify-end" />,
    cell: (props) => {
      const isExpense = Number(props.row.original.amount) < 0;
      return (
        <div
          className={cn(
            "font-bold tabular-nums text-right",
            isExpense ? categoryTypeConfig.expense.colors.textDark : categoryTypeConfig.income.colors.textDark,
          )}
        >
          {formatCurrency(props.getValue())}
        </div>
      );
    },
    size: 80,
    sortingFn: (rowA, rowB) => {
      const amountA = Number(rowA.original.amount);
      const amountB = Number(rowB.original.amount);
      return amountA - amountB;
    },
    filterFn: multiColumnFilterFn,
  }),
  columnHelper.display({
    id: "actions",
    cell: () => {
      return (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem>Copy payment ID</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    size: 32,
  }),
];
