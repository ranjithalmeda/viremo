"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import type { EntryTypeValue } from "@/src/lib/watchlist";
import { formatStatus, formatType } from "@/src/lib/watchlist";

type SearchSource = "tmdb" | "books";

type SearchResult = {
  id: string;
  source: SearchSource;
  tmdbId: number | null;
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

const GOOGLE_BOOKS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SearchSource>("tmdb");
  const deferredQuery = useDeferredValue(query.trim());
  const [results, setResults] = useState<SearchResult[]>([]);
  const [states, setStates] = useState<Record<string, PerResultState>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<string, boolean>>({});

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
        let payload: { error?: string; results?: SearchResult[] };

        if (source === "books") {
          if (!GOOGLE_BOOKS_API_KEY) {
            throw new Error("Google Books API key is missing.");
          }

          const booksUrl = new URL("https://www.googleapis.com/books/v1/volumes");
          booksUrl.searchParams.set("q", deferredQuery);
          booksUrl.searchParams.set("maxResults", "12");
          booksUrl.searchParams.set("key", GOOGLE_BOOKS_API_KEY);

          const response = await fetch(booksUrl.toString(), {
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Google Books request failed with status ${response.status}.`);
          }

          const booksPayload = (await response.json()) as {
            items?: Array<{
              id?: string;
              volumeInfo?: {
                title?: string | null;
                authors?: string[] | null;
                publishedDate?: string | null;
                description?: string | null;
                imageLinks?: {
                  thumbnail?: string | null;
                  smallThumbnail?: string | null;
                } | null;
              } | null;
            }>;
          };

          payload = {
            results: (booksPayload.items ?? [])
              .filter(
                (item): item is { id: string; volumeInfo: NonNullable<typeof item.volumeInfo> } =>
                  Boolean(item.id && item.volumeInfo?.title),
              )
              .slice(0, 12)
              .map((item) => {
                const volume = item.volumeInfo;
                const thumbnail =
                  volume.imageLinks?.thumbnail || volume.imageLinks?.smallThumbnail || null;

                return {
                  id: `books-${item.id}`,
                  source: "books",
                  tmdbId: null,
                  title: volume.title || "Untitled",
                  type: "BOOK" as EntryTypeValue,
                  mediaType: "book",
                  poster: thumbnail ? thumbnail.replace(/^http:/, "https:") : null,
                  year: volume.publishedDate?.slice(0, 4) || null,
                  overview: volume.description || volume.authors?.join(", ") || null,
                };
              }),
          };
        } else {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(deferredQuery)}&source=${source}`,
            { signal: controller.signal },
          );
          payload = (await response.json()) as {
            error?: string;
            results?: SearchResult[];
          };

          if (!response.ok) {
            setResults([]);
            setMessage(payload.error || "Search failed.");
            return;
          }
        }

        setResults(payload.results || []);
        setStates((current) => {
          const next = { ...current };

          for (const result of payload.results || []) {
            if (!next[result.id]) {
              next[result.id] = {
                type: result.type,
                status: "WATCHING",
              };
            }
          }

          return next;
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setMessage(
            error instanceof Error
              ? error.message
              : "We could not reach the search route.",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void runSearch();

    return () => controller.abort();
  }, [deferredQuery, source]);

  const emptyState = useMemo(() => {
    if (loading) return "Searching titles...";
    if (deferredQuery.length < 2) return "Type at least two characters to begin.";
    if (message) return message;
    if (!results.length) return "No titles matched your search yet.";
    return null;
  }, [deferredQuery.length, loading, message, results.length]);

  async function addToDiary(result: SearchResult) {
    const selection = states[result.id] ?? {
      type: result.type,
      status: "WATCHING" as const,
    };

    try {
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

      let payload: { error?: string } | null = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        setMessage(
          payload?.error ||
            `Could not add this title. Server responded ${response.status}.`,
        );
        return;
      }

      setAdded((current) => ({ ...current, [result.id]: true }));
      setMessage(`Added "${result.title}" to your diary.`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not add this title due to a network error.",
      );
    }
  }

  return (
    <section className="space-y-8">
      <div className="space-y-4 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(139,92,246,0.14)] px-4 py-2 text-sm font-semibold text-[var(--accent)]">
          {source === "tmdb" ? "TMDB powered" : "Google Books powered"}
        </div>
        <div className="space-y-4">
          <h1 className="theme-heading text-4xl font-semibold sm:text-5xl">
            Search titles and add them to your diary.
          </h1>
          <p className="theme-muted max-w-2xl text-base leading-7">
            Search TMDB or Google Books, then save movies, shows, anime, and books into your diary.
          </p>
        </div>

        <div className="glass rounded-[1.8rem] p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="block sm:max-w-xs">
              <span className="theme-text mb-3 block text-sm font-semibold">
                Search source
              </span>
              <select
                value={source}
                onChange={(event) => setSource(event.target.value as SearchSource)}
                className="theme-input w-full rounded-2xl px-5 py-4 text-base outline-none"
              >
                <option value="tmdb">TMDB</option>
                <option value="books">Google Books</option>
              </select>
            </label>
            <label className="block w-full sm:w-auto">
              <span className="theme-text mb-3 block text-sm font-semibold">
                {source === "tmdb" ? "Search TMDB" : "Search Google Books"}
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  source === "tmdb"
                    ? "Try Interstellar, Naruto, Arcane..."
                    : "Try Dune, One Piece, The Name of the Wind..."
                }
                className="theme-input w-full rounded-2xl px-5 py-4 text-base outline-none"
              />
            </label>
          </div>
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
            const selection = states[result.id] ?? {
              type: result.type,
              status: "WATCHING" as const,
            };

            return (
              <article
                key={result.id}
                className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:border-[rgba(139,92,246,0.65)]"
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
                              [result.id]: {
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
                          <option value="BOOK">Book</option>
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
                              [result.id]: {
                                ...selection,
                                status: event.target.value as PerResultState["status"],
                              },
                            }))
                          }
                          className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                        >
                          <option value="WATCHING">
                            {formatStatus("WATCHING", selection.type)}
                          </option>
                          <option value="COMPLETED">{formatStatus("COMPLETED")}</option>
                          <option value="DROPPED">{formatStatus("DROPPED")}</option>
                        </select>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToDiary(result)}
                      disabled={added[result.id]}
                      className="theme-button-primary w-full rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {added[result.id] ? "Added" : "Add to diary"}
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
