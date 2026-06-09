"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [entrySearch, setEntrySearch] = useState("");
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  async function loadEntries() {
    if (entries.length > 0) return entries;

    setEntriesLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/entries");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load entries.");
      }

      setEntries(data);
      return data as EntryOption[];
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not load entries.");
      return [];
    } finally {
      setEntriesLoading(false);
    }
  }

  const existingEntryIds = useMemo(
    () => new Set(folder.entries.map((item) => item.entryId)),
    [folder.entries],
  );

  const availableEntries = useMemo(
    () => entries.filter((entry) => !existingEntryIds.has(entry.id)),
    [entries, existingEntryIds],
  );

  const visibleEntries = useMemo(() => {
    const query = entrySearch.trim().toLowerCase();

    if (!query) return availableEntries;

    return availableEntries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.type.toLowerCase().includes(query),
    );
  }, [availableEntries, entrySearch]);

  function toggleEntry(entryId: string) {
    setSelectedEntryIds((current) =>
      current.includes(entryId)
        ? current.filter((id) => id !== entryId)
        : [...current, entryId],
    );
  }

  function selectEntries(entryOptions: EntryOption[]) {
    setSelectedEntryIds((current) =>
      Array.from(new Set([...current, ...entryOptions.map((entry) => entry.id)])),
    );
  }

  async function addSelectedEntries() {
    const loadedEntries = await loadEntries();
    const selectedIds = selectedEntryIds.filter(
      (entryId) => !existingEntryIds.has(entryId),
    );

    if (!loadedEntries.length || !selectedIds.length) {
      setFeedback("Choose at least one entry first.");
      return;
    }

    setAdding(true);
    setFeedback(null);

    try {
      const addedEntries: FolderEntryItem[] = [];
      let skippedCount = 0;

      for (const entryId of selectedIds) {
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
          skippedCount += 1;
          continue;
        }

        const added = data.folderEntry;
        addedEntries.push({
          id: added.id,
          entryId: added.entryId,
          addedAt: added.addedAt,
          entry: added.entry,
        });
      }

      if (addedEntries.length) {
        setFolder((current) => ({
          ...current,
          entryCount: current.entryCount + addedEntries.length,
          entries: [...addedEntries, ...current.entries],
        }));
      }

      setSelectedEntryIds([]);
      setFeedback(
        skippedCount
          ? `Added ${addedEntries.length} entries. ${skippedCount} were already in ${folder.name}.`
          : `Added ${addedEntries.length} entries to ${folder.name}.`,
      );
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
          <div className="grid gap-4">
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Add diary entries
              </span>
              <input
                value={entrySearch}
                onFocus={loadEntries}
                onChange={(event) => setEntrySearch(event.target.value)}
                disabled={entriesLoading || adding}
                className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                placeholder="Search entries, then select multiple"
              />
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-600">
                {selectedEntryIds.length} selected
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const loadedEntries = await loadEntries();
                    const sourceEntries = loadedEntries.length
                      ? loadedEntries.filter((entry) => !existingEntryIds.has(entry.id))
                      : visibleEntries;
                    const query = entrySearch.trim().toLowerCase();
                    selectEntries(
                      query
                        ? sourceEntries.filter(
                            (entry) =>
                              entry.title.toLowerCase().includes(query) ||
                              entry.type.toLowerCase().includes(query),
                          )
                        : sourceEntries,
                    );
                  }}
                  disabled={entriesLoading || adding}
                  className="theme-button-secondary flex-1 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60 sm:flex-none"
                >
                  Select visible
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEntryIds([])}
                  disabled={entriesLoading || adding || !selectedEntryIds.length}
                  className="theme-button-secondary flex-1 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60 sm:flex-none"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {entriesLoading ? (
                <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                  Loading entries...
                </div>
              ) : entries.length ? (
                visibleEntries.length ? (
                  visibleEntries.map((entry) => {
                    const checked = selectedEntryIds.includes(entry.id);

                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => toggleEntry(entry.id)}
                        disabled={adding}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                          checked
                            ? "border-[var(--accent)] bg-[var(--surface-soft)]"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-lg border text-xs font-black ${
                            checked
                              ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]"
                              : "border-slate-300 text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black text-slate-950">
                            {entry.title}
                          </span>
                          <span className="mt-1 block text-xs font-semibold text-slate-500">
                            {entry.type}
                          </span>
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center text-sm text-slate-600">
                    No available entries match this search.
                  </div>
                )
              ) : (
                <button
                  type="button"
                  onClick={loadEntries}
                  className="theme-button-secondary w-full rounded-2xl px-4 py-3 text-sm font-semibold"
                >
                  Load diary entries
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={addSelectedEntries}
              disabled={adding || entriesLoading || !selectedEntryIds.length}
              className="theme-button-primary rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {adding
                ? "Adding..."
                : selectedEntryIds.length
                  ? `Add ${selectedEntryIds.length} entries`
                  : "Add selected entries"}
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
