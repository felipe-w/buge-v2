"use client";

import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { cn, formatDateToPtBr } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, XCircle } from "lucide-react";

interface DateFilterProps {
  value?: DateRange;
  onChange: (dateRange?: DateRange) => void;
  className?: string;
}

export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(value);

  useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (selectedRange?: DateRange) => {
    setDate(selectedRange);
    onChange(selectedRange);
    // Optional: Close popover on selecting a range, or keep it open for adjustments
    // if (selectedRange?.from && selectedRange?.to) {
    //   setIsOpen(false);
    // }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            size="sm"
            className={cn("w-full justify-start text-left font-normal border-dashed", !date && "text-muted-foreground")}
          >
            <CalendarIcon />
            {date?.from &&
              (date.to ? (
                <>
                  {formatDateToPtBr(date.from)} - {formatDateToPtBr(date.to)}
                </>
              ) : (
                <>{formatDateToPtBr(date.from)}</>
              ))}
            {date && (
              <div
                role="button"
                aria-label="Limpar filtro de data"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setDate(undefined);
                  onChange(undefined);
                }}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <XCircle size={16} />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="range" defaultMonth={date?.from} selected={date} onSelect={handleSelect} numberOfMonths={2} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
