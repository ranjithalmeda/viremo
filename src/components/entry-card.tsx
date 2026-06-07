"use client";

import type { EntryRecord } from "@/src/lib/watchlist";
import {
  formatRating,
  formatStatus,
  formatType,
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
    <article className="group grid min-h-[260px] overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_55px_rgba(45,27,78,0.12)] transition hover:-translate-y-0.5 hover:border-[var(--accent-highlight)] sm:grid-cols-[148px_minmax(0,1fr)]">
      <div className="relative min-h-[260px] bg-[var(--bg-tertiary)]">
        {entry.poster ? (
          <img
            src={entry.poster}
            alt={`${entry.title} poster`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full min-h-[260px] items-center justify-center bg-[var(--bg-tertiary)] text-6xl font-black text-white/80">
            {getPosterFallback(entry.title)}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-5 p-5">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--badge-bg)] px-3 py-1 text-xs font-black text-[var(--badge-text)]">
              {formatType(entry.type)}
            </span>
            <span className="rounded-full bg-[var(--accent-secondary)] px-3 py-1 text-xs font-black text-[var(--badge-text)]">
              {formatStatus(entry.status, entry.type)}
            </span>
            <span className="rounded-full border border-[var(--accent-highlight)] px-3 py-1 text-xs font-semibold text-[var(--accent-highlight)]">
              {formatRating(entry.rating)}
            </span>
          </div>

          <div>
            <h3 className="line-clamp-2 text-2xl font-black leading-tight text-[var(--foreground-strong)]">
              {entry.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Updated {updatedLabel}
            </p>
          </div>

          <p className="line-clamp-3 text-sm leading-6 text-[var(--muted)]">
            {entry.notes?.trim() ||
              "No notes yet. Add a quick thought, review, or memory for this title."}
          </p>
        </div>

        {(onEdit || onDelete || onAddToFolder) && (
          <div className="flex flex-wrap gap-2">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(entry)}
                className="theme-button-secondary rounded-full px-4 py-2 text-sm font-bold"
              >
                Edit
              </button>
            ) : null}
            {onAddToFolder ? (
              <button
                type="button"
                onClick={() => onAddToFolder(entry)}
                className="theme-button-secondary rounded-full px-4 py-2 text-sm font-bold"
              >
                Add to folder
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(entry)}
                className="theme-button-danger rounded-full px-4 py-2 text-sm font-bold"
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
