"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { TicketCategory } from "@/src/lib/domain-types";

const categories: Array<{ value: TicketCategory; label: string }> = [
  { value: "BUG", label: "Bug Report" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate Content" },
  { value: "ACCOUNT_ISSUE", label: "Account Issue" },
  { value: "OTHER", label: "Other" },
];

export function TicketForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketCategory>("BUG");
  const [description, setDescription] = useState("");
  const [reportedUser, setReportedUser] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          category,
          description,
          reportedUser,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Ticket submission failed");
      }

      setSubject("");
      setCategory("BUG");
      setDescription("");
      setReportedUser("");
      setMessage("Ticket submitted.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Ticket submission failed",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="theme-text mb-2 block text-sm font-semibold">
            Subject
          </span>
          <input
            required
            maxLength={160}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="Short summary"
          />
        </label>
        <label className="block">
          <span className="theme-text mb-2 block text-sm font-semibold">
            Category
          </span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as TicketCategory)}
            className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="theme-text mb-2 block text-sm font-semibold">
            Reported username
          </span>
          <input
            maxLength={80}
            value={reportedUser}
            onChange={(event) => setReportedUser(event.target.value)}
            className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="Optional"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="theme-text mb-2 block text-sm font-semibold">
            Description
          </span>
          <textarea
            required
            maxLength={4000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="theme-input min-h-36 w-full rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="Tell the admin team what happened"
          />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="theme-button-neutral rounded-full px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Submitting..." : "Submit ticket"}
        </button>
        {message ? (
          <p className="text-sm font-semibold text-slate-600">{message}</p>
        ) : null}
      </div>
    </form>
  );
}
