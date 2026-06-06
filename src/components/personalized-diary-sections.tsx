"use client";

import { EntryCard } from "@/src/components/entry-card";
import {
  getPreferenceStyle,
  type ProfileBlock,
  type UserPreferences,
} from "@/src/lib/preferences";
import {
  formatRating,
  formatStatus,
  formatType,
  getPosterFallback,
  type EntryRecord,
} from "@/src/lib/watchlist";

const blockLabels: Record<ProfileBlock, string> = {
  recentlyWatched: "Recently Watched",
  favorites: "Favorites",
  watchlist: "Watchlist",
};

type PersonalizedDiarySectionsProps = {
  entries: EntryRecord[];
  preferences: UserPreferences;
  onEdit?: (entry: EntryRecord) => void;
  onDelete?: (entry: EntryRecord) => void;
  onAddToFolder?: (entry: EntryRecord) => void;
  publicView?: boolean;
};

function getEntriesForBlock(entries: EntryRecord[], block: ProfileBlock) {
  if (block === "favorites") {
    return entries
      .filter((entry) => typeof entry.rating === "number" && entry.rating >= 4)
      .slice(0, 6);
  }

  if (block === "watchlist") {
    const watchlistEntries = entries.filter((entry) => entry.status === "WATCHING");
    return (watchlistEntries.length ? watchlistEntries : entries).slice(0, 6);
  }

  return entries.slice(0, 6);
}

function getEmptyCopy(block: ProfileBlock) {
  if (block === "favorites") {
    return "Rate a few entries 4 or 5 stars to fill this section.";
  }

  if (block === "watchlist") {
    return "Mark titles as watching to build this section.";
  }

  return "New diary entries will appear here.";
}

export function PersonalizedDiarySections({
  entries,
  preferences,
  onEdit,
  onDelete,
  onAddToFolder,
  publicView = false,
}: PersonalizedDiarySectionsProps) {
  const style = getPreferenceStyle(preferences);
  const layoutClass =
    preferences.layout === "list"
      ? "grid gap-3"
      : preferences.layout === "card"
        ? "grid gap-5 lg:grid-cols-2"
        : "grid gap-5 sm:grid-cols-2 xl:grid-cols-3";

  return (
    <section
      style={style}
      className="overflow-hidden rounded-[2rem] border border-[var(--profile-border)] bg-[var(--profile-surface)] shadow-sm"
    >
      <div className="space-y-6 bg-[var(--profile-bg)] p-6 text-[var(--profile-text)] sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--profile-muted)]">
              {publicView ? "Personal profile" : "Your appearance"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              {publicView ? "Custom diary spaces" : "Personalized diary view"}
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--profile-border)] bg-[var(--profile-surface)] px-4 py-2 text-sm font-semibold text-[var(--profile-muted)]">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--profile-accent)" }}
            />
            {preferences.layout}
          </div>
        </div>

        {preferences.blocks.map((block) => {
          const blockEntries = getEntriesForBlock(entries, block);

          return (
            <section
              key={block}
              className="rounded-[1.75rem] border border-[var(--profile-border)] bg-[var(--profile-surface)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-semibold">{blockLabels[block]}</h3>
                  <p className="mt-1 text-sm text-[var(--profile-muted)]">
                    {blockEntries.length} highlighted titles
                  </p>
                </div>
                <div
                  className="h-1.5 w-24 rounded-full"
                  style={{ background: "var(--profile-accent)" }}
                />
              </div>

              {blockEntries.length ? (
                <div className={`mt-5 ${layoutClass}`}>
                  {blockEntries.map((entry) =>
                    preferences.layout === "list" ? (
                      <article
                        key={entry.id}
                        className="grid gap-4 rounded-[1.4rem] border border-[var(--profile-border)] bg-[var(--profile-surface-soft)] p-4 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:items-center"
                      >
                        <div className="h-24 overflow-hidden rounded-[1rem] bg-slate-900/20">
                          {entry.poster ? (
                            <img
                              src={entry.poster}
                              alt={`${entry.title} poster`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-3xl font-bold">
                              {getPosterFallback(entry.title)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-xl font-semibold">
                            {entry.title}
                          </h4>
                          <p className="mt-1 text-sm text-[var(--profile-muted)]">
                            {formatType(entry.type)} | {formatStatus(entry.status, entry.type)}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--profile-muted)]">
                            {entry.notes?.trim() || "No notes yet."}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <span className="rounded-full border border-[var(--profile-border)] px-3 py-1 text-xs font-semibold">
                            {formatRating(entry.rating)}
                          </span>
                          {onEdit ? (
                            <button
                              type="button"
                              onClick={() => onEdit(entry)}
                              className="theme-button-secondary rounded-full px-3 py-1 text-xs font-semibold"
                            >
                              Edit
                            </button>
                          ) : null}
                          {onAddToFolder ? (
                            <button
                              type="button"
                              onClick={() => onAddToFolder(entry)}
                              className="theme-button-secondary rounded-full px-3 py-1 text-xs font-semibold"
                            >
                              Folder
                            </button>
                          ) : null}
                        </div>
                      </article>
                    ) : (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddToFolder={onAddToFolder}
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.4rem] border border-dashed border-[var(--profile-border)] bg-[var(--profile-surface-soft)] p-6 text-sm text-[var(--profile-muted)]">
                  {getEmptyCopy(block)}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
