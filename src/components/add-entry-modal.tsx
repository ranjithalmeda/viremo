"use client";

import { useEffect, useState } from "react";

import type { EntryRecord, EntryTypeValue, WatchStatusValue } from "@/src/lib/watchlist";
import { entryTypes, formatStatus, watchStatuses } from "@/src/lib/watchlist";

export type EntryDraft = {
  title: string;
  type: EntryTypeValue;
  status: WatchStatusValue;
  rating: number | null;
  notes: string;
  poster: string | null;
  tmdbId: number | null;
};

type AddEntryModalProps = {
  open: boolean;
  initialEntry?: EntryRecord | null;
  onClose: () => void;
  onSubmit: (draft: EntryDraft) => Promise<void>;
};

const emptyDraft: EntryDraft = {
  title: "",
  type: "MOVIE",
  status: "WATCHING",
  rating: null,
  notes: "",
  poster: null,
  tmdbId: null,
};

export function AddEntryModal({
  open,
  initialEntry,
  onClose,
  onSubmit,
}: AddEntryModalProps) {
  const [draft, setDraft] = useState<EntryDraft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(initialEntry);

  useEffect(() => {
    if (!open) return;

    if (initialEntry) {
      setDraft({
        title: initialEntry.title,
        type: initialEntry.type,
        status: initialEntry.status,
        rating: initialEntry.rating,
        notes: initialEntry.notes || "",
        poster: initialEntry.poster,
        tmdbId: initialEntry.tmdbId,
      });
      return;
    }

    setDraft(emptyDraft);
  }, [initialEntry, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
      <div className="glass-strong w-full max-w-2xl rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="pill theme-faint">
              {isEditing ? "Update entry" : "Add a title"}
            </p>
            <h2 className="theme-heading mt-4 text-3xl font-semibold">
              {isEditing ? "Refine your diary entry" : "Capture what you watched"}
            </h2>
            <p className="theme-muted mt-3 text-sm leading-6">
              Keep your watch history accurate with a title, rating, status, and notes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="theme-button-secondary rounded-full px-4 py-2 text-sm font-semibold"
          >
            Close
          </button>
        </div>

        <form
          className="mt-8 grid gap-4 sm:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);

            try {
              await onSubmit(draft);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <label className="sm:col-span-2">
            <span className="theme-text mb-2 block text-sm font-semibold">
              Title
            </span>
            <input
              required
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
              placeholder="Naruto, Interstellar, Arcane..."
            />
          </label>

          <label>
            <span className="theme-text mb-2 block text-sm font-semibold">
              Type
            </span>
            <select
              value={draft.type}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  type: event.target.value as EntryTypeValue,
                }))
              }
              className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
            >
              {entryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="theme-text mb-2 block text-sm font-semibold">
              Status
            </span>
            <select
              value={draft.status}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  status: event.target.value as WatchStatusValue,
                }))
              }
              className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
            >
              {watchStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="theme-text mb-2 block text-sm font-semibold">
              Rating
            </span>
            <input
              min={1}
              max={5}
              type="number"
              value={draft.rating ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  rating: event.target.value ? Number(event.target.value) : null,
                }))
              }
              className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
              placeholder="1-5"
            />
          </label>

          <label>
            <span className="theme-text mb-2 block text-sm font-semibold">
              Poster URL
            </span>
            <input
              value={draft.poster ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  poster: event.target.value || null,
                }))
              }
              className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
              placeholder="Optional poster image URL"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="theme-text mb-2 block text-sm font-semibold">
              Notes
            </span>
            <textarea
              rows={5}
              value={draft.notes}
              onChange={(event) =>
                setDraft((current) => ({ ...current, notes: event.target.value }))
              }
              className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
              placeholder="Favorite character, episode count, why you dropped it, what surprised you..."
            />
          </label>

          <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="theme-button-secondary rounded-full px-5 py-3 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="theme-button-neutral rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Saving..."
                : isEditing
                  ? "Update entry"
                  : "Add entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
