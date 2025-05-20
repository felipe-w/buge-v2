"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryState, useQueryStates } from "nuqs";
import { parseAsInteger } from "nuqs/server";

import { Account, CategoryWithChildren, TransactionWithAllJoins } from "@/lib/db/types";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FilterBar from "./filter-bar";
import { DataTablePagination } from "./pagination";
import { getSortingStateParser } from "./parsers";

interface DataTableProps {
  columns: ColumnDef<TransactionWithAllJoins>[];
  data: TransactionWithAllJoins[];
  categories: CategoryWithChildren[];
  accounts: Account[];
}

export function TransactionsDataTable({ columns, data, categories, accounts }: DataTableProps) {
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
    },
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
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
