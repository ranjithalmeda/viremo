"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";

import {
  AddEntryModal,
  type EntryDraft,
} from "@/src/components/add-entry-modal";
import { EntryCard } from "@/src/components/entry-card";
import { FilterPills } from "@/src/components/filter-pills";
import { ProfileSearchForm } from "@/src/components/profile-search-form";
import { StatsBar } from "@/src/components/stats-bar";
import type { EntryFilter, EntryRecord } from "@/src/lib/watchlist";

type DashboardClientProps = {
  initialEntries: EntryRecord[];
};

export function DashboardClient({ initialEntries }: DashboardClientProps) {
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
      <section className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="pill mb-4 text-sky-900">Protected dashboard</div>
            <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">
              Your diary at a glance.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Track what you are watching, what you finished, and what lost you
              halfway through. Add entries manually or pull them in from TMDB.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/search"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-800"
            >
              Search TMDB
            </Link>
            <button
              type="button"
              onClick={() => {
                setEditingEntry(null);
                setModalOpen(true);
              }}
              className="rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800"
            >
              + Add title
            </button>
          </div>
        </div>

        <StatsBar entries={entries} />

        <ProfileSearchForm />

        <div className="glass rounded-[1.6rem] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <FilterPills filter={filter} onChange={setFilter} />
            <p className="text-sm text-slate-500">
              {filteredEntries.length} visible{" "}
              {filteredEntries.length === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>

        {feedback ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {feedback}
          </div>
        ) : null}

        {filteredEntries.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEntries.map((entry) => (
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
        ) : (
          <div className="glass-strong rounded-[2rem] p-10 text-center">
            <h2 className="text-3xl font-semibold text-slate-950">
              Nothing matches this filter yet.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
              Start with a manual entry or search TMDB to bring in posters and
              metadata from real titles.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setEditingEntry(null);
                  setModalOpen(true);
                }}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Add manually
              </button>
              <Link
                href="/search"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-800"
              >
                Search titles
              </Link>
            </div>
          </div>
        )}
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
        <div className="fixed bottom-5 right-5 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          Updating diary...
        </div>
      ) : null}
    </>
  );
}
