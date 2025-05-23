"use client";

import { ColumnDef, createColumnHelper, FilterFn } from "@tanstack/react-table";
import { DateRange } from "react-day-picker";

import { CategoryWithChildren, TransactionWithAllJoins } from "@/lib/db/types";
import { categoryTypeConfig, cn, formatCurrency, formatDateToPtBr, getTransactionType, toYYYYMMDD } from "@/lib/utils";

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
import { EditableCategoryCell } from "./editable-category-cell";

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
  const rowCategoryId = row.original.categoryId;
  return rowCategoryId === filterValue;
};

const accountFilterFn: FilterFn<TransactionWithAllJoins> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const account = row.original.accountId;
  return filterValue.includes(account);
};

const transactionTypeFilterFn: FilterFn<TransactionWithAllJoins> = (row, _columnId, filterValue: string) => {
  if (!filterValue) return true;
  const transactionType = getTransactionType(row.original);
  // Treat unknown types as NOT matching the active filter so they remain visible.
  if (!transactionType) return true;
  return transactionType === filterValue;
};

const dateFilterFn: FilterFn<TransactionWithAllJoins> = (row, _columnId, range: DateRange) => {
  if (!range?.from) return true;

  const rowDate = row.original.date;

  const from = toYYYYMMDD(range.from);
  const to = range.to ? toYYYYMMDD(range.to) : from;

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
  // columnHelper.display({
  //   id: "status",
  //   header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
  //   cell: ({ row }) => {
  //     const status = row.original.

  //   },
  //   size: 100,
  // }),
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
  columnHelper.accessor((row) => getTransactionType(row), {
    id: "transactionType",
    filterFn: transactionTypeFilterFn,
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
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        categories: CategoryWithChildren[];
        editingTransactionId: string | null;
        onEditStart: (id: string) => void;
        onEditEnd: () => void;
      };

      if (!meta) {
        // Fallback to original display if meta is not available
        return (
          <div className="flex items-center gap-2">
            {row.original.category && <CategoryBadge category={row.original.category} />}
          </div>
        );
      }

      return (
        <EditableCategoryCell
          transaction={row.original}
          categories={meta.categories}
          isEditing={meta.editingTransactionId === row.original.id}
          onEditStart={() => meta.onEditStart(row.original.id)}
          onEditEnd={meta.onEditEnd}
        />
      );
    },
    size: 180,
    filterFn: categoryFilterFn,
    sortingFn: (rowA, rowB) => {
      const categoryA = rowA.original.category?.name ?? "";
      const categoryB = rowB.original.category?.name ?? "";
      return categoryA.localeCompare(categoryB);
    },
  }),
  columnHelper.accessor("amount", {
    id: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor" className="justify-end" />,
    cell: (props) => {
      const transactionType = getTransactionType(props.row.original);

      return (
        <div
          className={cn(
            "font-bold tabular-nums text-right",
            transactionType === "expense"
              ? categoryTypeConfig.expense.colors.textDark
              : transactionType === "income"
                ? categoryTypeConfig.income.colors.textDark
                : categoryTypeConfig.transfer.colors.textDark,
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
] as ColumnDef<TransactionWithAllJoins>[];
