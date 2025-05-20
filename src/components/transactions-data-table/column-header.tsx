import { Column } from "@tanstack/react-table";

import { cn } from "@/lib/utils";

import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div
      className={cn("flex h-full cursor-pointer items-center gap-2 select-none", className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <div className="ml-2 text-muted-foreground">
        {column.getIsSorted() === "desc" ? (
          <ChevronDown size={16} />
        ) : column.getIsSorted() === "asc" ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronsUpDown size={16} />
        )}
      </div>
    </div>
  );
}
