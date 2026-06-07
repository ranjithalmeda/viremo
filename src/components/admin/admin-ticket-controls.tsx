"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { TicketStatus } from "@/src/lib/domain-types";

type AdminTicketControlsProps = {
  ticketId: string;
  status: TicketStatus;
  adminReply: string | null;
};

const statusOptions: Array<{ value: TicketStatus; label: string }> = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

export function AdminTicketControls({
  ticketId,
  status,
  adminReply,
}: AdminTicketControlsProps) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState<TicketStatus>(status);
  const [reply, setReply] = useState(adminReply || "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          adminReply: reply,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Ticket update failed");
      }

      setMessage("Saved");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ticket update failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
      <select
        value={nextStatus}
        onChange={(event) => setNextStatus(event.target.value as TicketStatus)}
        className="theme-input w-full rounded-2xl px-4 py-3 text-sm font-semibold outline-none"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <textarea
        value={reply}
        onChange={(event) => setReply(event.target.value)}
        className="theme-input min-h-28 w-full rounded-2xl px-4 py-3 text-sm outline-none"
        placeholder="Admin reply"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="theme-button-neutral rounded-full px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save ticket"}
        </button>
        {message ? (
          <p className="text-xs font-semibold text-slate-500">{message}</p>
        ) : null}
      </div>
    </form>
  );
}
