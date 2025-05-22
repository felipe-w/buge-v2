import { createParser } from "nuqs/server";
import { DateRange } from "react-day-picker";
import { z } from "zod";

import { toYYYYMMDD } from "../../lib/utils";

const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

export const getSortingStateParser = (columnIds?: string[] | Set<string>) => {
  const validKeys = columnIds ? (columnIds instanceof Set ? columnIds : new Set(columnIds)) : null;

  return createParser({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value);
        const result = z.array(sortingItemSchema).safeParse(parsed);

        if (!result.success) return null;

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null;
        }

        return result.data;
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length && a.every((item, index) => item.id === b[index]?.id && item.desc === b[index]?.desc),
  });
};

// Custom parser for DateRange for nuqs
export const parseAsDateRange = {
  parse: (value: string): DateRange | undefined => {
    if (!value) return undefined;
    try {
      const parsed = JSON.parse(value);
      const fromStr = parsed.from;
      const toStr = parsed.to;

      let fromDate: Date | undefined = undefined;
      if (fromStr && typeof fromStr === "string") {
        const [year, month, day] = fromStr.split("-").map(Number);
        fromDate = new Date(year, month - 1, day);
      }

      let toDate: Date | undefined = undefined;
      if (toStr && typeof toStr === "string") {
        const [year, month, day] = toStr.split("-").map(Number);
        toDate = new Date(year, month - 1, day);
      }

      if (!fromDate && !toDate) return undefined;
      return { from: fromDate, to: toDate };
    } catch {
      return undefined;
    }
  },
  serialize: (value: DateRange | undefined): string => {
    if (!value || (!value.from && !value.to)) return "";

    return JSON.stringify({
      from: value.from ? toYYYYMMDD(value.from) : undefined,
      to: value.to ? toYYYYMMDD(value.to) : undefined,
    });
  },
};
