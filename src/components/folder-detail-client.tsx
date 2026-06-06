"use client";

import Link from "next/link";
import { useState } from "react";

import { EntryCard } from "@/src/components/entry-card";
import type { EntryRecord } from "@/src/lib/watchlist";

type FolderEntryItem = {
  id: string;
  entryId: string;
  addedAt: string;
  entry: EntryRecord;
};

type EntryOption = {
  id: string;
  title: string;
  type: string;
};

type FolderDetail = {
  id: string;
  name: string;
  isPublic: boolean;
  entryCount: number;
  entries: FolderEntryItem[];
};

export function FolderDetailClient({
  initialFolder,
}: {
  initialFolder: FolderDetail;
}) {
  const [folder, setFolder] = useState(initialFolder);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [removingEntryId, setRemovingEntryId] = useState<string | null>(null);
  const [entries, setEntries] = useState<EntryOption[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  async function loadEntries() {
    if (entries.length > 0) return selectedEntryId || entries[0]?.id || "";

    setEntriesLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/entries");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load entries.");
      }

      setEntries(data);
      setSelectedEntryId(data[0]?.id || "");
      return data[0]?.id || "";
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not load entries.");
      return "";
    } finally {
      setEntriesLoading(false);
    }
  }

  async function addEntry(entryId = selectedEntryId) {
    if (!entryId) {
      setFeedback("Choose an entry first.");
      return;
    }

    setAdding(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/folders/${folder.id}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not add entry.");
      }

      if (!data.created) {
        setFeedback("That entry is already in this folder.");
        return;
      }

      const added = data.folderEntry;
      setFolder((current) => ({
        ...current,
        entryCount: current.entryCount + 1,
        entries: [
          {
            id: added.id,
            entryId: added.entryId,
            addedAt: added.addedAt,
            entry: added.entry,
          },
          ...current.entries,
        ],
      }));
      setFeedback(`Added "${added.entry.title}" to ${folder.name}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not add entry.");
    } finally {
      setAdding(false);
    }
  }

  async function removeEntry(item: FolderEntryItem) {
    setRemovingEntryId(item.entryId);
    setFeedback(null);

    try {
      const response = await fetch(
        `/api/folders/${folder.id}/entries/${item.entryId}`,
        { method: "DELETE" },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not remove entry.");
      }

      setFolder((current) => ({
        ...current,
        entryCount: Math.max(0, current.entryCount - 1),
        entries: current.entries.filter((entry) => entry.id !== item.id),
      }));
      setFeedback(`Removed "${item.entry.title}" from ${folder.name}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not remove entry.");
    } finally {
      setRemovingEntryId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-8 shadow-sm">
        <Link
          href="/folders"
          className="theme-button-secondary inline-flex rounded-full px-4 py-2 text-sm font-semibold"
        >
          Back to folders
        </Link>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Folder
            </p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">
              {folder.name}
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              {folder.entryCount} saved entries
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              folder.isPublic
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {folder.isPublic ? "Public" : "Private"}
          </span>
        </div>

        {feedback ? (
          <div className="mt-5 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-700">
            {feedback}
          </div>
        ) : null}

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <label className="flex-1">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Add diary entry
              </span>
              <select
                value={selectedEntryId}
                onFocus={loadEntries}
                onChange={(event) => setSelectedEntryId(event.target.value)}
                disabled={entriesLoading || adding}
                className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
              >
                {entriesLoading ? (
                  <option>Loading entries...</option>
                ) : entries.length ? (
                  entries.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.title} ({entry.type})
                    </option>
                  ))
                ) : (
                  <option value="">Open to load entries</option>
                )}
              </select>
            </label>
            <button
              type="button"
              onClick={async () => {
                const entryId = await loadEntries();
                await addEntry(entryId);
              }}
              disabled={adding || entriesLoading}
              className="theme-button-primary rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {adding ? "Adding..." : "Add entry"}
            </button>
          </div>
        </div>
      </div>

      {folder.entries.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {folder.entries.map((item) => (
            <div key={item.id} className="space-y-3">
              <EntryCard entry={item.entry} />
              <button
                type="button"
                onClick={() => removeEntry(item)}
                disabled={removingEntryId === item.entryId}
                className="theme-button-danger w-full rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {removingEntryId === item.entryId
                  ? "Removing..."
                  : "Remove from folder"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/95 p-10 text-center text-slate-600">
          This folder is empty. Add entries from your dashboard cards.
        </div>
      )}
    </div>
  );
}
