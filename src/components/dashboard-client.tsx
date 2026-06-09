"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";

import {
  AddEntryModal,
  type EntryDraft,
} from "@/src/components/add-entry-modal";
import { ConfirmToast } from "@/src/components/confirm-toast";
import { EntryCard } from "@/src/components/entry-card";
import { Recommendations } from "@/src/components/recommendations";
import { WatchHistoryCalendar } from "@/src/components/watch-history-calendar";
import {
  getPreferenceStyle,
  type UserPreferences,
} from "@/src/lib/preferences";
import {
  entryTypes,
  formatRating,
  formatStatus,
  formatType,
  getPosterFallback,
  type EntryTypeValue,
  type EntryRecord,
  type WatchStatusValue,
  watchStatuses,
} from "@/src/lib/watchlist";

type DashboardClientProps = {
  initialEntries: EntryRecord[];
  preferences: UserPreferences;
  profile: {
    publicId: string | null;
    username: string | null;
    name: string | null;
  };
};

type FolderOption = {
  id: string;
  name: string;
  isPublic: boolean;
  entryCount: number;
};

type TypeFilter = "ALL" | EntryTypeValue;
type StatusFilter = "ALL" | WatchStatusValue;

export function DashboardClient({
  initialEntries,
  preferences,
  profile,
}: DashboardClientProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EntryRecord | null>(null);
  const [folderEntry, setFolderEntry] = useState<EntryRecord | null>(null);
  const [folderOptions, setFolderOptions] = useState<FolderOption[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [folderSubmitting, setFolderSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [entryPendingDelete, setEntryPendingDelete] =
    useState<EntryRecord | null>(null);
  const [deletingEntry, setDeletingEntry] = useState(false);
  const [isPending, startTransition] = useTransition();
  const preferenceStyle = useMemo(
    () => getPreferenceStyle(preferences),
    [preferences],
  );

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter((entry: EntryRecord) => {
      const matchesSearch =
        !normalizedQuery ||
        entry.title.toLowerCase().includes(normalizedQuery) ||
        entry.notes?.toLowerCase().includes(normalizedQuery);
      const matchesType = typeFilter === "ALL" || entry.type === typeFilter;
      const matchesStatus =
        statusFilter === "ALL" || entry.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [entries, query, statusFilter, typeFilter]);

  const featuredEntry = filteredEntries[0] ?? entries[0] ?? null;
  const completedCount = entries.filter(
    (entry: EntryRecord) => entry.status === "COMPLETED",
  ).length;
  const watchingCount = entries.filter(
    (entry: EntryRecord) => entry.status === "WATCHING",
  ).length;
  const droppedCount = entries.filter(
    (entry: EntryRecord) => entry.status === "DROPPED",
  ).length;
  const profileIdentifier = profile.publicId || profile.username;

  const averageRating = useMemo(() => {
    const ratedEntries = entries.filter(
      (entry: EntryRecord) => typeof entry.rating === "number",
    );

    if (!ratedEntries.length) return "0.0";

    return (
      ratedEntries.reduce(
        (sum: number, entry: EntryRecord) => sum + (entry.rating || 0),
        0,
      ) / ratedEntries.length
    ).toFixed(1);
  }, [entries]);

  async function saveEntry(draft: EntryDraft) {
    const response = await fetch(
      editingEntry ? `/api/entries/${editingEntry.id}` : "/api/entries",
      {
        method: editingEntry ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          notes: draft.notes || null,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setFeedback(data.error || "We could not save your entry.");
      return;
    }

    startTransition(() => {
      setEntries((current: EntryRecord[]) => {
        if (editingEntry) {
          return current.map((entry: EntryRecord) =>
            entry.id === data.id ? data : entry,
          );
        }

        return [data, ...current];
      });
    });

    setFeedback(null);
    setModalOpen(false);
    setEditingEntry(null);
  }

  async function confirmDeleteEntry() {
    if (!entryPendingDelete) return;

    setDeletingEntry(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/entries/${entryPendingDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setFeedback(data.error || "Delete failed.");
        return;
      }

      startTransition(() => {
        setEntries((current: EntryRecord[]) =>
          current.filter((item: EntryRecord) => item.id !== entryPendingDelete.id),
        );
      });
      setFeedback(`Deleted "${entryPendingDelete.title}".`);
      setEntryPendingDelete(null);
    } finally {
      setDeletingEntry(false);
    }
  }

  async function openAddToFolder(entry: EntryRecord) {
    setFolderEntry(entry);
    setFeedback(null);

    if (folderOptions.length > 0) {
      setSelectedFolderId(folderOptions[0].id);
      return;
    }

    setFoldersLoading(true);
    try {
      const response = await fetch("/api/folders");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load folders.");
      }

      const folders = (data.folders || []).map(
        (folder: {
          id: string;
          name: string;
          isPublic: boolean;
          _count?: { entries: number };
        }) => ({
          id: folder.id,
          name: folder.name,
          isPublic: folder.isPublic,
          entryCount: folder._count?.entries ?? 0,
        }),
      );
      setFolderOptions(folders);
      setSelectedFolderId(folders[0]?.id || "");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not load folders.");
    } finally {
      setFoldersLoading(false);
    }
  }

  async function addEntryToFolder() {
    if (!folderEntry || !selectedFolderId) {
      setFeedback("Choose a folder first.");
      return;
    }

    setFolderSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/folders/${selectedFolderId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: folderEntry.id }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not add entry to folder.");
      }

      const folderName =
        folderOptions.find((folder: FolderOption) => folder.id === selectedFolderId)
          ?.name || "folder";
      setFolderOptions((current: FolderOption[]) =>
        current.map((folder: FolderOption) =>
          folder.id === selectedFolderId
            ? {
                ...folder,
                entryCount: data.created
                  ? folder.entryCount + 1
                  : folder.entryCount,
              }
            : folder,
        ),
      );
      setFeedback(
        data.created
          ? `Added "${folderEntry.title}" to ${folderName}.`
          : `"${folderEntry.title}" is already in ${folderName}.`,
      );
      setFolderEntry(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not add entry to folder.");
    } finally {
      setFolderSubmitting(false);
    }
  }

  const typeFilters: TypeFilter[] = ["ALL", ...entryTypes];
  const statusFilters: StatusFilter[] = ["ALL", ...watchStatuses];

  return (
    <>
      <section style={preferenceStyle} className="mobile-font-scale space-y-6">
        {feedback ? (
          <div className="rounded-3xl border border-[var(--accent-highlight)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--foreground-strong)]">
            {feedback}
          </div>
        ) : null}

        {featuredEntry ? (
          <section className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-[var(--accent-highlight)] bg-[var(--surface)] shadow-[0_40px_90px_rgba(45,27,78,0.16)]">
            {featuredEntry.poster ? (
              <img
                src={featuredEntry.poster}
                alt={`${featuredEntry.title} poster`}
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/86 to-[var(--surface)]/72" />
            <div className="relative grid min-h-[320px] gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-end">
              <div className="max-w-3xl self-end">
                <span className="inline-flex rounded-full bg-[var(--badge-bg)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--badge-text)]">
                  Featured entry
                </span>
                <h1 className="mt-5 text-4xl font-black leading-tight text-[var(--foreground-strong)] sm:text-6xl">
                  {featuredEntry.title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                  {featuredEntry.notes?.trim() ||
                    "Your latest diary highlight appears here with fast actions and a cinematic backdrop."}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--badge-bg)] px-3 py-1 text-xs font-black text-[var(--badge-text)]">
                    {formatType(featuredEntry.type)}
                  </span>
                  <span className="rounded-full bg-[var(--accent-secondary)] px-3 py-1 text-xs font-black text-[var(--badge-text)]">
                    {formatStatus(featuredEntry.status, featuredEntry.type)}
                  </span>
                  <span className="rounded-full border border-[var(--accent-highlight)] px-3 py-1 text-xs font-bold text-[var(--accent-highlight)]">
                    {formatRating(featuredEntry.rating)}
                  </span>
                </div>
              </div>

              <div className="hidden overflow-hidden rounded-[1.5rem] border border-[var(--accent-highlight)] bg-[var(--surface-soft)] shadow-2xl lg:block">
                {featuredEntry.poster ? (
                  <img
                    src={featuredEntry.poster}
                    alt={`${featuredEntry.title} poster`}
                    className="aspect-[2/3] h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid aspect-[2/3] place-items-center text-6xl font-black text-[var(--foreground-strong)]">
                    {getPosterFallback(featuredEntry.title)}
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="space-y-5">
            <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_55px_rgba(19,3,15,0.18)]">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <label className="block">
                    <span className="mb-2 block text-sm font-bold text-[var(--foreground-strong)]">
                    Search diary
                  </span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by title or notes"
                    className="theme-input w-full rounded-2xl px-5 py-4 text-sm font-semibold outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntry(null);
                    setModalOpen(true);
                  }}
                  className="theme-button-primary rounded-2xl px-5 py-4 text-sm font-black lg:self-end"
                >
                  Add entry
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {typeFilters.map((item: TypeFilter) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTypeFilter(item)}
                      className={
                        typeFilter === item
                          ? "theme-button-primary rounded-full px-4 py-2 text-sm font-bold"
                          : "theme-button-secondary rounded-full px-4 py-2 text-sm font-bold"
                      }
                    >
                      {item === "ALL" ? "All" : formatType(item)}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((item: StatusFilter) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setStatusFilter(item)}
                      className={
                        statusFilter === item
                          ? "theme-button-primary rounded-full px-4 py-2 text-sm font-bold"
                          : "theme-button-secondary rounded-full px-4 py-2 text-sm font-bold"
                      }
                    >
                      {item === "ALL" ? "All" : formatStatus(item)}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {filteredEntries.length ? (
              <section className="grid gap-5 lg:grid-cols-2">
                {filteredEntries.map((entry: EntryRecord) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={(currentEntry: EntryRecord) => {
                      setEditingEntry(currentEntry);
                      setModalOpen(true);
                    }}
                    onAddToFolder={openAddToFolder}
                    onDelete={setEntryPendingDelete}
                  />
                ))}
              </section>
            ) : (
              <section className="rounded-[1.5rem] border border-dashed border-[var(--accent-highlight)] bg-[var(--surface)] p-10 text-center">
                <h2 className="text-3xl font-black text-[var(--foreground-strong)]">No entries found</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Try another filter or add a new title to your diary.
                </p>
              </section>
            )}

            <WatchHistoryCalendar />
          </main>

          <aside className="hidden space-y-5 xl:block">
            <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_55px_rgba(19,3,15,0.18)]">
              <div className="flex items-center gap-3">
                <div className="grid size-14 place-items-center rounded-2xl bg-[var(--badge-bg)] text-xl font-black text-[var(--badge-text)]">
                  {(profile.name || profile.username || "V").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-black text-[var(--foreground-strong)]">
                    {profile.name || "Viewer"}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    @{profile.username || profile.publicId || "private"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  ["Entries", entries.length],
                  ["Completed", completedCount],
                  ["Watching", watchingCount],
                  ["Dropped", droppedCount],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                  >
                    <p className="text-3xl font-black text-[var(--accent-highlight)]">{value}</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <p className="text-sm font-semibold text-[var(--muted)]">Average rating</p>
                <p className="mt-1 text-4xl font-black text-[var(--accent-highlight)]">
                  {averageRating}
                </p>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent-highlight)]">
                Quick actions
              </p>
              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntry(null);
                    setModalOpen(true);
                  }}
                  className="theme-button-primary rounded-2xl px-4 py-3 text-sm font-black"
                >
                  Add entry
                </button>
                <Link
                  href="/search"
                  className="theme-button-secondary rounded-2xl px-4 py-3 text-center text-sm font-black"
                >
                  Search titles
                </Link>
                <Link
                  href="/folders"
                  className="theme-button-secondary rounded-2xl px-4 py-3 text-center text-sm font-black"
                >
                  Manage folders
                </Link>
                {profileIdentifier ? (
                  <Link
                    href={`/profile/${profileIdentifier}`}
                    className="theme-button-secondary rounded-2xl px-4 py-3 text-center text-sm font-black"
                  >
                    View profile
                  </Link>
                ) : null}
              </div>
            </section>

            <Recommendations />
          </aside>
        </div>

        <div className="xl:hidden">
          <Recommendations />
        </div>
      </section>

      <AddEntryModal
        open={modalOpen}
        initialEntry={editingEntry}
        onClose={() => {
          setModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={saveEntry}
      />

      {folderEntry ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,16,37,0.7)] px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-[var(--accent-highlight)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent-highlight)]">
                  Add to folder
                </p>
                <h2 className="mt-3 text-2xl font-black text-[var(--foreground-strong)]">
                  {folderEntry.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setFolderEntry(null)}
                className="theme-button-secondary rounded-full px-4 py-2 text-sm font-bold"
              >
                Close
              </button>
            </div>

            <div className="mt-6">
              {foldersLoading ? (
                <div className="rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground-strong)]">
                  Loading folders...
                </div>
              ) : folderOptions.length ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--foreground-strong)]">
                    Folder
                  </span>
                  <select
                    value={selectedFolderId}
                    onChange={(event) => setSelectedFolderId(event.target.value)}
                    className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  >
                    {folderOptions.map((folder: FolderOption) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name} ({folder.isPublic ? "Public" : "Private"})
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--accent-highlight)] bg-[var(--surface-soft)] p-5 text-center">
                  <p className="text-sm text-[var(--foreground-strong)]">
                    Create a folder first, then come back to add this entry.
                  </p>
                  <Link
                    href="/folders"
                    className="theme-button-primary mt-4 inline-flex rounded-full px-4 py-2 text-sm font-bold"
                  >
                    Create folder
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setFolderEntry(null)}
                className="theme-button-secondary flex-1 rounded-full px-4 py-3 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addEntryToFolder}
                disabled={folderSubmitting || foldersLoading || !folderOptions.length}
                className="theme-button-primary flex-1 rounded-full px-4 py-3 text-sm font-bold disabled:opacity-60"
              >
                {folderSubmitting ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isPending ? (
        <div className="theme-button-neutral fixed bottom-5 right-5 rounded-full px-4 py-2 text-sm font-bold shadow-lg">
          Updating diary...
        </div>
      ) : null}

      <ConfirmToast
        open={Boolean(entryPendingDelete)}
        title="Delete diary entry?"
        message={
          entryPendingDelete
            ? `"${entryPendingDelete.title}" will be removed from your diary.`
            : ""
        }
        loading={deletingEntry}
        onCancel={() => setEntryPendingDelete(null)}
        onConfirm={confirmDeleteEntry}
      />
    </>
  );
}
