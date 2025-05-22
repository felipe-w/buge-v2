"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  Updater,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useQueryState, useQueryStates, type UseQueryStateOptions } from "nuqs";
import { parseAsInteger, parseAsString } from "nuqs/server";
import { DateRange } from "react-day-picker";

import { Account, CategoryWithChildren, TransactionWithAllJoins } from "@/lib/db/types";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FilterBar from "./filter-bar";
import { DataTablePagination } from "./pagination";
import { getSortingStateParser, parseAsDateRange } from "./parsers";

interface DataTableProps {
  columns: ColumnDef<TransactionWithAllJoins>[];
  data: TransactionWithAllJoins[];
  categories: CategoryWithChildren[];
  accounts: Account[];
  initialColumnVisibility?: VisibilityState;
}

export function TransactionsDataTable({
  columns,
  data,
  categories,
  accounts,
  initialColumnVisibility,
}: DataTableProps) {
  const columnIds = useMemo(() => columns.map((c) => c.id).filter(Boolean) as string[], [columns]);
  const sortingParser = useMemo(
    () => getSortingStateParser(new Set(columnIds)).withDefault([{ id: "title", desc: false }]),
    [columnIds],
  );
  const [sorting, setSorting] = useQueryState("sort", sortingParser);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useQueryStates(
    {
      pageIndex: parseAsInteger.withDefault(0),
      pageSize: parseAsInteger.withDefault(50),
    },
    {
      urlKeys: { pageIndex: "page", pageSize: "pageSize" },
      history: "replace",
    },
  );

  // State for column visibility
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    transactionType: false, // Hide transactionType column by default
    ...initialColumnVisibility,
  });

  // Filters state with nuqs
  const [titleColumnFilter, setTitleColumnFilter] = useQueryState("titleSearch", parseAsString.withDefault(""));
  const [dateRange, setDateRange] = useQueryState<DateRange | undefined>("date", {
    ...parseAsDateRange,
    defaultValue: undefined as DateRange | undefined,
  } as UseQueryStateOptions<DateRange | undefined> & { serialize: (value: DateRange | undefined) => string });
  const [categoryId, setCategoryId] = useQueryState("category", parseAsString.withDefault(""));
  const [accountId, setAccountId] = useQueryState("account", parseAsString.withDefault(""));
  const [transactionType, setTransactionType] = useQueryState("type", parseAsString.withDefault(""));

  const columnFilters = useMemo(() => {
    const filters: ColumnFiltersState = [];
    if (dateRange) filters.push({ id: "date", value: dateRange });
    if (categoryId) filters.push({ id: "category", value: categoryId });
    if (accountId) filters.push({ id: "account", value: accountId });
    if (transactionType) filters.push({ id: "transactionType", value: transactionType });
    if (titleColumnFilter) filters.push({ id: "title", value: titleColumnFilter });
    return filters;
  }, [dateRange, categoryId, accountId, transactionType, titleColumnFilter]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
      sorting: sorting,
      rowSelection,
      columnVisibility,
      columnFilters,
    },
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => {
      const oldFilters = table.getState().columnFilters;
      const newFilters = typeof updater === "function" ? updater(oldFilters) : updater;

      const getFilterValue = <T extends string | DateRange | undefined>(id: string, defaultValue: T): T => {
        const filter = newFilters.find((f) => f.id === id);
        return filter ? (filter.value as T) : defaultValue;
      };

      setDateRange(getFilterValue<DateRange | undefined>("date", undefined) ?? null);
      setCategoryId(getFilterValue<string>("category", "") ?? null);
      setAccountId(getFilterValue<string>("account", "") ?? undefined);
      setTransactionType(getFilterValue<string>("transactionType", "") ?? null);
      setTitleColumnFilter(getFilterValue<string>("title", "") ?? null);
    },
  });

  return (
    <div className="space-y-4">
      <FilterBar table={table} categories={categories} accounts={accounts} />
      <div className="overflow-auto h-[calc(100vh-30em)]">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-9 py-2 " style={{ width: `${header.getSize()}px` }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-1">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
