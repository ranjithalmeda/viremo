"use client";

import type { EntryType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const categories: EntryType[] = ["MOVIE", "SERIES", "ANIME", "BOOK"];

export function CommunityCreateForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/community", {
        method: "POST",
        body: form,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create post.");
      }

      event.currentTarget.reset();
      setMessage("Posted.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create post.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submitPost}
      className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-gold)]">
          New request
        </p>
        <h2 className="text-2xl font-bold text-[var(--foreground-strong)]">
          Ask the community
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Describe the mood, title examples, or exact kind of recommendation you want.
        </p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <input
          required
          name="title"
          className="theme-input rounded-2xl px-4 py-3 text-sm outline-none md:col-span-2"
          placeholder="Looking for dark psychological anime like Death Note"
        />
        <select
          name="category"
          className="theme-input rounded-2xl px-4 py-3 text-sm outline-none"
          defaultValue="ANIME"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          name="youtubeUrl"
          className="theme-input rounded-2xl px-4 py-3 text-sm outline-none"
          placeholder="Optional YouTube/trailer link"
        />
        <textarea
          required
          name="description"
          className="theme-input min-h-28 rounded-2xl px-4 py-3 text-sm outline-none md:col-span-2"
          placeholder="Describe the vibe, examples, or what you want to avoid."
        />
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
            Images
          </span>
          <input
            name="images"
            type="file"
            accept="image/jpeg,image/png"
            multiple
            className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
          />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="theme-button-primary rounded-full px-5 py-3 text-sm font-bold disabled:opacity-60"
        >
          {submitting ? "Posting..." : "Post request"}
        </button>
        {message ? <p className="text-sm font-semibold text-[var(--muted)]">{message}</p> : null}
      </div>
    </form>
  );
}
