"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import type { EntryTypeValue } from "@/src/lib/watchlist";
import { formatStatus, formatType } from "@/src/lib/watchlist";

type SearchResult = {
  tmdbId: number;
  title: string;
  type: EntryTypeValue;
  mediaType: string;
  poster: string | null;
  year: string | null;
  overview: string | null;
};

type PerResultState = {
  type: EntryTypeValue;
  status: "WATCHING" | "COMPLETED" | "DROPPED";
};

export function SearchClient() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [results, setResults] = useState<SearchResult[]>([]);
  const [states, setStates] = useState<Record<number, PerResultState>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (deferredQuery.length < 2) {
      setResults([]);
      setMessage(null);
      return;
    }

    const controller = new AbortController();

    async function runSearch() {
      setLoading(true);
      setMessage(null);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(deferredQuery)}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as {
          error?: string;
          results?: SearchResult[];
        };

        if (!response.ok) {
          setResults([]);
          setMessage(payload.error || "Search failed.");
          return;
        }

        setResults(payload.results || []);
        setStates((current) => {
          const next = { ...current };

          for (const result of payload.results || []) {
            if (!next[result.tmdbId]) {
              next[result.tmdbId] = {
                type: result.type,
                status: "WATCHING",
              };
            }
          }

          return next;
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setMessage("We could not reach the search route.");
        }
      } finally {
        setLoading(false);
      }
    }

    void runSearch();

    return () => controller.abort();
  }, [deferredQuery]);

  const emptyState = useMemo(() => {
    if (loading) return "Searching titles...";
    if (deferredQuery.length < 2) return "Type at least two characters to begin.";
    if (message) return message;
    if (!results.length) return "No titles matched your search yet.";
    return null;
  }, [deferredQuery.length, loading, message, results.length]);

  async function addToDiary(result: SearchResult) {
    const selection = states[result.tmdbId] ?? {
      type: result.type,
      status: "WATCHING" as const,
    };

    const response = await fetch("/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: result.title,
        type: selection.type,
        status: selection.status,
        poster: result.poster,
        tmdbId: result.tmdbId,
        notes: null,
        rating: null,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error || "Could not add this title.");
      return;
    }

    setAdded((current) => ({ ...current, [result.tmdbId]: true }));
    setMessage(`Added "${result.title}" to your diary.`);
  }

  return (
    <section className="space-y-8">
      <div className="space-y-4 rounded-[2rem] border border-slate-200/70 bg-white/95 p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
          TMDB powered
        </div>
        <div className="space-y-4">
          <h1 className="theme-heading text-4xl font-semibold sm:text-5xl">
            Search titles and add them to your diary.
          </h1>
          <p className="theme-muted max-w-2xl text-base leading-7">
            Keep your TMDB key on the server, search all media types, and quickly save movies, shows, or anime into your watch history.
          </p>
        </div>

        <div className="glass rounded-[1.8rem] p-5 sm:p-6">
          <label className="block">
            <span className="theme-text mb-3 block text-sm font-semibold">
              Search TMDB
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Interstellar, Naruto, Arcane..."
              className="theme-input w-full rounded-2xl px-5 py-4 text-base outline-none"
            />
          </label>
        </div>
      </div>

      {emptyState ? (
        <div className="glass-strong theme-muted rounded-[2rem] p-10 text-center text-base">
          {emptyState}
        </div>
      ) : null}

      {results.length ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {results.map((result) => {
            const selection = states[result.tmdbId] ?? {
              type: result.type,
              status: "WATCHING" as const,
            };

            return (
              <article
                key={result.tmdbId}
                className="rounded-[1.8rem] border border-slate-200/70 bg-white/95 shadow-sm"
              >
                <div className="grid gap-5 p-5 sm:grid-cols-[150px_1fr]">
                  <div className="overflow-hidden rounded-[1.5rem] bg-slate-950">
                    {result.poster ? (
                      <img
                        src={result.poster}
                        alt={`${result.title} poster`}
                        className="aspect-[3/4] h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[3/4] items-center justify-center bg-slate-800 text-4xl font-bold text-white/80">
                        {result.title.trim().charAt(0).toUpperCase() || "W"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h2 className="theme-heading text-2xl font-semibold">
                        {result.title}
                      </h2>
                      <p className="theme-muted mt-1 text-sm">
                        {formatType(selection.type)}
                        {result.year ? ` | ${result.year}` : ""}
                        {result.mediaType ? ` | ${result.mediaType}` : ""}
                      </p>
                    </div>

                    <p className="theme-muted text-sm leading-6">
                      {result.overview || "No overview was returned for this title."}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="theme-muted mb-2 block text-xs font-semibold uppercase tracking-[0.18em]">
                          Save as
                        </span>
                        <select
                          value={selection.type}
                          onChange={(event) =>
                            setStates((current) => ({
                              ...current,
                              [result.tmdbId]: {
                                ...selection,
                                type: event.target.value as EntryTypeValue,
                              },
                            }))
                          }
                          className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                        >
                          <option value="MOVIE">Movie</option>
                          <option value="SERIES">Series</option>
                          <option value="ANIME">Anime</option>
                        </select>
                      </label>

                      <label>
                        <span className="theme-muted mb-2 block text-xs font-semibold uppercase tracking-[0.18em]">
                          Diary status
                        </span>
                        <select
                          value={selection.status}
                          onChange={(event) =>
                            setStates((current) => ({
                              ...current,
                              [result.tmdbId]: {
                                ...selection,
                                status: event.target.value as PerResultState["status"],
                              },
                            }))
                          }
                          className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                        >
                          <option value="WATCHING">{formatStatus("WATCHING")}</option>
                          <option value="COMPLETED">{formatStatus("COMPLETED")}</option>
                          <option value="DROPPED">{formatStatus("DROPPED")}</option>
                        </select>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToDiary(result)}
                      disabled={added[result.tmdbId]}
                      className="theme-button-primary w-full rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {added[result.tmdbId] ? "Added" : "Add to diary"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

                      disabled={added[result.tmdbId]}
                      className="theme-button-neutral rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-emerald-700"
                    >
                      {added[result.tmdbId] ? "Logged to diary" : "Log to diary"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
