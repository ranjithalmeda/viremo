"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CommunityReplyPanel({
  postId,
  canReply,
}: {
  postId: string;
  canReply: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitReply() {
    if (!content.trim()) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/community/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not reply.");
      }

      setContent("");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not reply.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!canReply) {
    return (
      <div className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 text-slate-600">
        Sign in to reply.
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="theme-input min-h-28 w-full rounded-2xl px-4 py-3 text-sm outline-none"
        placeholder="Share a recommendation..."
      />
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={submitting || !content.trim()}
          onClick={submitReply}
          className="theme-button-neutral rounded-full px-5 py-3 text-sm font-bold disabled:opacity-60"
        >
          {submitting ? "Replying..." : "Reply"}
        </button>
        {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
      </div>
    </div>
  );
}

export function CommunityReplyActions({
  replyId,
  canMarkBest,
}: {
  replyId: string;
  canMarkBest: boolean;
}) {
  const router = useRouter();

  async function update(endpoint: string) {
    await fetch(endpoint, { method: "PUT" });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => update(`/api/community/replies/${replyId}/upvote`)}
        className="theme-button-secondary rounded-full px-3 py-1 text-xs font-bold"
      >
        Helpful
      </button>
      {canMarkBest ? (
        <button
          type="button"
          onClick={() => update(`/api/community/replies/${replyId}/best`)}
          className="theme-button-primary rounded-full px-3 py-1 text-xs font-bold"
        >
          Best answer
        </button>
      ) : null}
    </div>
  );
}
