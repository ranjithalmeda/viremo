"use client";

import { cn } from "@/src/lib/utils";
import {
  entryTypes,
  formatStatus,
  formatType,
  type EntryFilter,
  watchStatuses,
} from "@/src/lib/watchlist";

type FilterPillsProps = {
  filter: EntryFilter;
  onChange: (filter: EntryFilter) => void;
};

export function FilterPills({ filter, onChange }: FilterPillsProps) {
  const items: EntryFilter[] = ["ALL", ...entryTypes, ...watchStatuses];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const label =
          item === "ALL"
            ? "All"
            : item === "WATCHING" || item === "COMPLETED" || item === "DROPPED"
              ? formatStatus(item)
              : formatType(item);

        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              filter === item
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-800",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
