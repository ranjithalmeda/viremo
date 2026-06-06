"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminAiLimitForm({ initialLimit }: { initialLimit: number }) {
  const router = useRouter();
  const [limit, setLimit] = useState(initialLimit);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveLimit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/settings/ai-limit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save AI limit.");
      }

      setLimit(data.limit);
      setMessage("AI limit saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save AI limit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={saveLimit}
      className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-slate-950">Pro AI daily limit</h2>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Requests per day
          </span>
          <input
            min={1}
            max={100}
            type="number"
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="theme-input w-40 rounded-2xl px-4 py-3 text-sm outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="theme-button-neutral rounded-full px-5 py-3 text-sm font-bold disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save limit"}
        </button>
        {message ? <p className="text-sm font-semibold text-slate-600">{message}</p> : null}
      </div>
    </form>
  );
}
