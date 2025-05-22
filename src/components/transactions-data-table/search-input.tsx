"use client";

import { useEffect, useState } from "react";
import { Table } from "@tanstack/react-table";

import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { CircleXIcon, SearchIcon } from "lucide-react";

interface SearchInputProps<TData> {
  table: Table<TData>;
  debounceDelay?: number;
}

export default function DataTableSearchInput<TData>({ table, debounceDelay = 300 }: SearchInputProps<TData>) {
  const [filterValue, setFilterValue] = useState((table.getColumn("title")?.getFilterValue() ?? "") as string);

  useEffect(() => {
    const handler = setTimeout(() => {
      table.getColumn("title")?.setFilterValue(filterValue);
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [filterValue, table, debounceDelay]);

  return (
    <>
      <Input
        className={cn("peer min-w-60 ps-9 h-8", Boolean(filterValue) && "pe-9")}
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        placeholder="Título, descrição ou valor..."
        type="text"
        aria-label="Buscar por título, descrição ou valor"
      />
      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
        <SearchIcon size={16} aria-hidden="true" />
      </div>
      {Boolean(filterValue) && (
        <button
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Clear filter"
          onClick={() => {
            setFilterValue("");
            table.getColumn("title")?.setFilterValue("");
          }}
        >
          <CircleXIcon size={16} aria-hidden="true" />
        </button>
      )}
    </>
  );
}
