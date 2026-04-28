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
    <div className="flex flex-col gap-2">
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
              "w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold",
              filter === item
                ? "theme-button-neutral"
                : "theme-button-secondary",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
