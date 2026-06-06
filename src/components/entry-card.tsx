"use client";

import type { EntryRecord } from "@/src/lib/watchlist";
import {
  formatStatus,
  formatType,
  formatRating,
  getPosterFallback,
} from "@/src/lib/watchlist";

type EntryCardProps = {
  entry: EntryRecord;
  onEdit?: (entry: EntryRecord) => void;
  onDelete?: (entry: EntryRecord) => void;
  onAddToFolder?: (entry: EntryRecord) => void;
};

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function EntryCard({
  entry,
  onEdit,
  onDelete,
  onAddToFolder,
}: EntryCardProps) {
  const updatedLabel = formatUpdatedAt(entry.updatedAt);

  return (
    <article className="rounded-[1.8rem] border border-slate-200/70 bg-white/95 shadow-sm transition hover:-translate-y-0.5">
      <div className="relative overflow-hidden rounded-t-[1.8rem] bg-slate-950">
        {entry.poster ? (
          <img
            src={entry.poster}
            alt={`${entry.title} poster`}
            className="h-72 w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-72 items-center justify-center text-6xl font-bold text-white/85">
            {getPosterFallback(entry.title)}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 to-transparent p-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
              {formatType(entry.type)}
            </span>
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">
              {formatStatus(entry.status, entry.type)}
            </span>
            {entry.rating ? (
              <span className="rounded-full bg-violet-100/90 px-3 py-1 text-xs font-semibold text-violet-700">
                {formatRating(entry.rating)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="theme-heading line-clamp-2 text-xl font-semibold">
            {entry.title}
          </h3>
          <p className="theme-muted mt-1 text-sm">Updated {updatedLabel}</p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Notes
          </p>
          <p className="theme-muted mt-2 min-h-[4.5rem] text-sm leading-6">
            {entry.notes?.trim() || "No notes yet. Capture your thoughts here."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
          <div>
            {entry.tmdbId
              ? `TMDB #${entry.tmdbId}`
              : entry.type === "BOOK"
              ? "Book entry"
              : "Manual entry"}
          </div>
          <div className="rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
            Diary card
          </div>
        </div>

        {(onEdit || onDelete || onAddToFolder) && (
          <div className="flex flex-wrap gap-2">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(entry)}
                className="theme-button-secondary flex-1 rounded-full px-4 py-2 text-sm font-semibold"
              >
                Edit
              </button>
            ) : null}
            {onAddToFolder ? (
              <button
                type="button"
                onClick={() => onAddToFolder(entry)}
                className="theme-button-secondary flex-1 rounded-full px-4 py-2 text-sm font-semibold"
              >
                Add to folder
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(entry)}
                className="theme-button-danger flex-1 rounded-full px-4 py-2 text-sm font-semibold"
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
