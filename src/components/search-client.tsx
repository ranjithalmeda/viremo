"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import type { EntryTypeValue } from "@/src/lib/watchlist";
import { formatType } from "@/src/lib/watchlist";

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
      <div className="flex flex-col gap-4">
        <div className="pill w-fit text-emerald-800">TMDB powered</div>
        <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">
          Search titles and drop them straight into your diary.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          This route keeps your TMDB key on the server. Search movies and TV
          titles, tweak the type if it should count as anime, then save it in
          one click.
        </p>
      </div>

      <div className="glass rounded-[1.8rem] p-5 sm:p-6">
        <label className="block">
          <span className="mb-3 block text-sm font-semibold text-slate-700">
            Search TMDB
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try Interstellar, Naruto, Arcane..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </label>
      </div>

      {emptyState ? (
        <div className="glass-strong rounded-[2rem] p-10 text-center text-base text-slate-600">
          {emptyState}
        </div>
      ) : null}

      {results.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {results.map((result) => {
            const selection = states[result.tmdbId] ?? {
              type: result.type,
              status: "WATCHING" as const,
            };

            return (
              <article
                key={result.tmdbId}
                className="glass overflow-hidden rounded-[1.75rem]"
              >
                <div className="grid gap-5 p-5 sm:grid-cols-[150px_1fr]">
                  <div className="overflow-hidden rounded-[1.4rem] bg-[linear-gradient(160deg,#11365f_0%,#1e6bb8_50%,#0f766e_100%)]">
                    {result.poster ? (
                      <img
                        src={result.poster}
                        alt={`${result.title} poster`}
                        className="aspect-[3/4] h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[3/4] items-center justify-center text-4xl font-bold text-white/85">
                        {result.title.trim().charAt(0).toUpperCase() || "W"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-950">
                        {result.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatType(selection.type)}
                        {result.year ? ` | ${result.year}` : ""}
                        {result.mediaType ? ` | ${result.mediaType}` : ""}
                      </p>
                    </div>

                    <p className="text-sm leading-6 text-slate-600">
                      {result.overview || "No overview was returned for this title."}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
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
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        >
                          <option value="MOVIE">Movie</option>
                          <option value="SERIES">Series</option>
                          <option value="ANIME">Anime</option>
                        </select>
                      </label>

                      <label>
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Initial status
                        </span>
                        <select
                          value={selection.status}
                          onChange={(event) =>
                            setStates((current) => ({
                              ...current,
                              [result.tmdbId]: {
                                ...selection,
                                status: event.target
                                  .value as PerResultState["status"],
                              },
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        >
                          <option value="WATCHING">Watching</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="DROPPED">Dropped</option>
                        </select>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToDiary(result)}
                      disabled={added[result.tmdbId]}
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-emerald-700"
                    >
                      {added[result.tmdbId] ? "Added to diary" : "Add to diary"}
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
