"use client";

import Link from "next/link";
import { useState } from "react";

import { UserAvatar } from "@/src/components/user-avatar";
import type { DirectMessageRecord, SocialUser } from "@/src/lib/data";

type SerializedMessage = Omit<DirectMessageRecord, "createdAt"> & {
  createdAt: string;
};

type MessagesThreadClientProps = {
  currentUserId: string;
  otherUser: SocialUser;
  initialMessages: SerializedMessage[];
};

function displayName(user: SocialUser) {
  return user.name || user.username || user.publicId;
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MessagesThreadClient({
  currentUserId,
  otherUser,
  initialMessages,
}: MessagesThreadClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profileHref = `/profile/${otherUser.username || otherUser.publicId}`;

  async function sendMessage() {
    const content = draft.trim();
    if (!content) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/messages/${otherUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not send message.");
      }

      setMessages((current) => [
        ...current,
        {
          ...data.message,
          createdAt: new Date(data.message.createdAt).toISOString(),
        },
      ]);
      setDraft("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Direct messages
          </p>
          <Link href={profileHref} className="group mt-3 inline-flex items-center gap-4">
            <UserAvatar
              name={otherUser.name}
              username={otherUser.username}
              publicId={otherUser.publicId}
              image={otherUser.image}
              avatarUrl={otherUser.avatarUrl}
              size="lg"
            />
            <div>
              <h1 className="text-4xl font-bold text-slate-950 group-hover:underline">
                {displayName(otherUser)}
              </h1>
              <p className="mt-2 text-sm text-slate-500 group-hover:underline">
                @{otherUser.username || otherUser.publicId}
              </p>
            </div>
          </Link>
        </div>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-5 shadow-sm">
          <div className="max-h-[540px] space-y-3 overflow-y-auto pr-1">
            {messages.length ? (
              messages.map((message) => {
                const mine = message.senderId === currentUserId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-[1.5rem] px-4 py-3 ${
                        mine
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {message.content}
                      </p>
                      <p
                        className={`mt-2 text-xs ${
                          mine ? "text-white/60" : "text-slate-500"
                        }`}
                      >
                        {formatTimestamp(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
                No messages yet. Start the conversation.
              </div>
            )}
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 flex gap-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={1000}
              rows={2}
              className="theme-input min-h-14 flex-1 rounded-2xl px-4 py-3 text-sm outline-none"
              placeholder="Write a message..."
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || !draft.trim()}
              className="theme-button-primary self-end rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
