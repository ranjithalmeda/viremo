"use client";

import type { EntryRecord } from "@/src/lib/watchlist";
import {
  formatStatus,
  formatType,
  getPosterFallback,
} from "@/src/lib/watchlist";

type EntryCardProps = {
  entry: EntryRecord;
  onEdit?: (entry: EntryRecord) => void;
  onDelete?: (entry: EntryRecord) => void;
};

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const updatedLabel = formatUpdatedAt(entry.updatedAt);

  return (
    <article className="glass overflow-hidden rounded-[1.75rem]">
      <div className="relative aspect-[3/4] overflow-hidden bg-[linear-gradient(160deg,#11365f_0%,#1e6bb8_50%,#0f766e_100%)]">
        {entry.poster ? (
          <img
            src={entry.poster}
            alt={`${entry.title} poster`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl font-bold text-white/85">
            {getPosterFallback(entry.title)}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent p-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
              {formatType(entry.type)}
            </span>
            <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white">
              {formatStatus(entry.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-2 text-xl font-semibold text-slate-950">
            {entry.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Updated {updatedLabel}
            {entry.rating ? ` | ${entry.rating}/5` : ""}
          </p>
        </div>

        <p className="min-h-[3rem] text-sm leading-6 text-slate-600">
          {entry.notes?.trim() ||
            "No notes yet. Add your quick thoughts, favorite arc, or recommendation angle."}
        </p>

        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(entry)}
                className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-800"
              >
                Edit
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(entry)}
                className="flex-1 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Delete
              </button>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
