"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";

import {
  AddEntryModal,
  type EntryDraft,
} from "@/src/components/add-entry-modal";
import { EntryCard } from "@/src/components/entry-card";
import { FilterPills } from "@/src/components/filter-pills";
import {
  formatStatus,
  formatType,
  getPosterFallback,
  type EntryFilter,
  type EntryRecord,
} from "@/src/lib/watchlist";

type DashboardClientProps = {
  initialEntries: EntryRecord[];
  profile: {
    publicId: string | null;
    username: string | null;
    name: string | null;
  };
};

export function DashboardClient({
  initialEntries,
  profile,
}: DashboardClientProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [filter, setFilter] = useState<EntryFilter>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EntryRecord | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (filter === "ALL") return true;
      return entry.type === filter || entry.status === filter;
    });
  }, [entries, filter]);

  const featuredEntry = filteredEntries[0] ?? entries[0] ?? null;
  const recentEntries = filteredEntries.slice(0, 5);
  const posterEntries = filteredEntries.slice(0, 6);
  const libraryEntries = filteredEntries.slice(0, 6);
  const WatchingCount = entries.filter((entry) => entry.status === "WATCHING").length;
  const finishedCount = entries.filter((entry) => entry.status === "COMPLETED").length;
  const droppedCount = entries.filter((entry) => entry.status === "DROPPED").length;
  const profileIdentifier = profile.publicId || profile.username;

  const averageRating = useMemo(() => {
    const ratedEntries = entries.filter((entry) => typeof entry.rating === "number");

    if (!ratedEntries.length) {
      return "0.0";
    }

    return (
      ratedEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) /
      ratedEntries.length
    ).toFixed(1);
  }, [entries]);

  async function saveEntry(draft: EntryDraft) {
    const response = await fetch(
      editingEntry ? `/api/entries/${editingEntry.id}` : "/api/entries",
      {
        method: editingEntry ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      setEntries((current) => {
        if (editingEntry) {
          return current.map((entry) =>
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

  async function deleteEntry(entry: EntryRecord) {
    const confirmed = window.confirm(`Delete "${entry.title}" from your diary?`);
    if (!confirmed) return;

    const response = await fetch(`/api/entries/${entry.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      setFeedback(data.error || "Delete failed.");
      return;
    }

    startTransition(() => {
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    });
  }

  return (
    <>
      <section className="space-y-6">
        {feedback ? (
          <div className="rounded-3xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300">
            {feedback}
          </div>
        ) : null}

        <section className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-[0_40px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <aside className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-5 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-500/10 text-lg font-semibold text-violet-700">
                  WL
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-950">Watchlist</p>
                  <p className="text-sm text-slate-500">Your daily tracker</p>
                </div>
              </div>

              <div className="mt-6">
                <FilterPills filter={filter} onChange={setFilter} />
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Quick actions
                </p>
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEntry(null);
                      setModalOpen(true);
                    }}
                    className="theme-button-primary w-full rounded-2xl px-4 py-3 text-sm font-semibold"
                  >
                    Add Watching title
                  </button>
                  <Link
                    href="/search"
                    className="theme-button-secondary inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold"
                  >
                    Search titles
                  </Link>
                </div>
              </div>
            </aside>

            <div className="space-y-6">
              {featuredEntry ? (
                <section className="rounded-[2rem] border border-slate-200/80 bg-violet-50 p-6 shadow-sm">
                  <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-violet-700">
                        <span className="rounded-full bg-violet-100 px-3 py-1.5">
                          Featured log
                        </span>
                        <span>{formatType(featuredEntry.type)}</span>
                        <span>{formatStatus(featuredEntry.status)}</span>
                      </div>

                      <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">
                        {featuredEntry.title}
                      </h1>
                      <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                        {featuredEntry.notes?.trim() ||
                          "A quick spotlight on your latest entry, updated with rating and status details."}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntry(featuredEntry);
                            setModalOpen(true);
                          }}
                          className="theme-button-primary rounded-full px-5 py-3 text-sm font-semibold"
                        >
                          Edit entry
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEntry(featuredEntry)}
                          className="theme-button-secondary rounded-full px-5 py-3 text-sm font-semibold"
                        >
                          Remove entry
                        </button>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-inner">
                      {featuredEntry.poster ? (
                        <img
                          src={featuredEntry.poster}
                          alt={`${featuredEntry.title} poster`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full min-h-[260px] items-center justify-center bg-slate-200 text-[5rem] font-black text-slate-400">
                          {getPosterFallback(featuredEntry.title)}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Recent logs
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                      Your most recent titles
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500">
                    {filteredEntries.length} visible
                  </p>
                </div>

                {recentEntries.length ? (
                  <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-3">
                      {recentEntries.map((entry) => (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => {
                            setEditingEntry(entry);
                            setModalOpen(true);
                          }}
                          className="grid w-full grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-4 rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-4 text-left transition hover:shadow-lg"
                        >
                          <div className="relative h-20 overflow-hidden rounded-[1.2rem] bg-slate-200">
                            {entry.poster ? (
                              <img
                                src={entry.poster}
                                alt={`${entry.title} poster`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-3xl font-bold text-slate-500">
                                {getPosterFallback(entry.title)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xl font-semibold text-slate-950">
                              {entry.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {formatType(entry.type)} | {formatStatus(entry.status)}
                            </p>
                            <p className="mt-2 truncate text-sm text-slate-600">
                              {entry.notes?.trim() || "Open to add your notes and reactions."}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                              {entry.rating ? `${entry.rating}/5` : "No rating"}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {posterEntries.map((entry) => (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => {
                            setEditingEntry(entry);
                            setModalOpen(true);
                          }}
                          className="group overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-slate-50 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <div className="relative aspect-[0.74] overflow-hidden bg-slate-200">
                            {entry.poster ? (
                              <img
                                src={entry.poster}
                                alt={`${entry.title} poster`}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-5xl font-black text-slate-400">
                                {getPosterFallback(entry.title)}
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-3">
                              <p className="truncate text-base font-semibold text-white">
                                {entry.title}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/70">
                                {formatType(entry.type)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-8 text-center">
                    <h3 className="text-2xl font-semibold text-slate-950">No entries yet</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Start by logging the movies, series, or anime you already Watching.
                    </p>
                  </div>
                )}
              </section>

              {libraryEntries.length ? (
                <section className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-slate-950">Library picks</h2>
                    <p className="text-sm text-slate-500">
                      {filter === "ALL"
                        ? "All saved titles"
                        : `Filtered by ${filter === "WATCHING" || filter === "COMPLETED" || filter === "DROPPED" ? formatStatus(filter) : formatType(filter)}`}
                    </p>
                  </div>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                    {libraryEntries.map((entry) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        onEdit={(currentEntry) => {
                          setEditingEntry(currentEntry);
                          setModalOpen(true);
                        }}
                        onDelete={deleteEntry}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-5">
              <section className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-500/10 text-lg font-semibold text-violet-700">
                    {(profile.name || profile.username || "V").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-slate-950">{profile.name || "Viewer"}</p>
                    <p className="text-sm text-slate-500">
                      @{profile.username || profile.publicId || "private"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-4 text-center">
                    <p className="text-3xl font-semibold text-slate-950">{entries.length}</p>
                    <p className="mt-1 text-sm text-slate-500">In library</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-4 text-center">
                    <p className="text-3xl font-semibold text-slate-950">{finishedCount}</p>
                    <p className="mt-1 text-sm text-slate-500">Finished</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-4 text-center">
                    <p className="text-3xl font-semibold text-slate-950">{WatchingCount}</p>
                    <p className="mt-1 text-sm text-slate-500">Watching</p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-600">
                  Avg. rating: <span className="font-semibold text-slate-950">{averageRating}</span>
                </p>
              </section>

              <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Public profile
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                  Share your shelf
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Share your Watching archive with friends using your public profile link.
                </p>
                <div className="mt-5 rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Share ID
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">
                    {profile.publicId || "Pending"}
                  </p>
                  {profileIdentifier ? (
                    <Link
                      href={`/profile/${profileIdentifier}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Open public profile
                    </Link>
                  ) : null}
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Archive notes
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-950">Dropped titles</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">{droppedCount}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      entries you decided not to finish
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-950">Dashboard direction</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      This dashboard now uses a bright, spacious layout with a left action rail, central log feed, and right profile summary.
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </section>
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

      {isPending ? (
        <div className="theme-button-neutral fixed bottom-5 right-5 rounded-full px-4 py-2 text-sm font-semibold shadow-lg">
          Updating diary...
        </div>
      ) : null}
    </>
  );
}
