"use client";

import { useEffect, useState } from "react";

import type { EntryRecord, EntryTypeValue, WatchStatusValue } from "@/src/lib/watchlist";
import { entryTypes, watchStatuses } from "@/src/lib/watchlist";

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
      <div className="glass-strong w-full max-w-2xl rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="pill text-sky-900">
              {isEditing ? "Update entry" : "Add a title"}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">
              {isEditing ? "Refine your diary entry" : "Capture what you watched"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
          >
            Close
          </button>
        </div>

        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
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
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Title
            </span>
            <input
              required
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              placeholder="Naruto, Interstellar, Arcane..."
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {entryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {watchStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              placeholder="1-5"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              placeholder="Optional poster image URL"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Notes
            </span>
            <textarea
              rows={5}
              value={draft.notes}
              onChange={(event) =>
                setDraft((current) => ({ ...current, notes: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              placeholder="Favorite character, episode count, why you dropped it, what surprised you..."
            />
          </label>

          <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
