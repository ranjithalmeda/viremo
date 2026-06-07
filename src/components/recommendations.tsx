"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AddEntryModal,
  type EntryDraft,
} from "@/src/components/add-entry-modal";

type Recommendation = {
  id: string;
  title: string;
  reason: string;
  type: "MOVIE" | "SERIES" | "ANIME" | "BOOK";
};

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadRecommendations = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "initial") {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);
    setFeedback(null);

    try {
      const res = await fetch("/api/recommendations");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not load recommendations");
      }

      setRecommendations(data.recommendations || []);
    } catch {
      setError("Could not load recommendations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations("initial");
  }, [loadRecommendations]);

  const recommendationDraft = useMemo<EntryDraft | null>(() => {
    if (!selectedRecommendation) return null;

    return {
      title: selectedRecommendation.title,
      type: selectedRecommendation.type,
      status: "WATCHING",
      rating: null,
      notes: selectedRecommendation.reason,
      poster: null,
      tmdbId: null,
    };
  }, [selectedRecommendation]);

  async function saveRecommendation(draft: EntryDraft) {
    const response = await fetch("/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...draft,
        notes: draft.notes || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not add this recommendation.");
    }

    setFeedback(`Added "${data.title}" to your diary.`);
    setSelectedRecommendation(null);
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-6 text-lg font-semibold text-[var(--foreground-strong)]">
          Recommended for You
        </h2>
        <div className="theme-muted text-sm">Loading recommendations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-6 text-lg font-semibold text-[var(--foreground-strong)]">
          Recommended for You
        </h2>
        <div className="text-sm text-red-600">{error}</div>
        <button
          onClick={() => loadRecommendations("refresh")}
          disabled={refreshing}
          className="theme-button-secondary mt-4 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Try again"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h2 className="mb-6 text-lg font-semibold text-[var(--foreground-strong)]">
        Recommended for You
      </h2>

      {feedback && (
        <div className="mb-4 rounded-2xl bg-[rgba(200,168,233,0.22)] px-4 py-3 text-sm text-[var(--accent)]">
          {feedback}
        </div>
      )}

      <div className="grid gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition hover:border-[var(--accent)] hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="flex-1 font-semibold text-[var(--foreground-strong)]">
                {rec.title}
              </h3>
              <span className="whitespace-nowrap rounded-full bg-[var(--badge-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--badge-text)]">
                {rec.type}
              </span>
            </div>
            <p className="text-sm leading-5 text-[var(--muted)]">{rec.reason}</p>
            <button
              onClick={() => setSelectedRecommendation(rec)}
              className="mt-3 text-sm font-medium text-[var(--accent)] transition-colors hover:underline"
            >
              + Add to diary
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => loadRecommendations("refresh")}
        disabled={refreshing}
        className="theme-button-secondary mt-6 w-full rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
      >
        {refreshing ? "Refreshing..." : "Refresh Recommendations"}
      </button>

      <AddEntryModal
        open={Boolean(selectedRecommendation)}
        initialDraft={recommendationDraft}
        onClose={() => {
          setSelectedRecommendation(null);
          setFeedback(null);
        }}
        onSubmit={saveRecommendation}
      />
    </div>
  );
}
