import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { UserAvatar } from "@/src/components/user-avatar";
import { authOptions } from "@/src/lib/auth";
import {
  getConversationsForUser,
  type ConversationRecord,
} from "@/src/lib/data";

function displayName(user: {
  name: string | null;
  username: string | null;
  publicId: string;
}) {
  return user.name || user.username || user.publicId;
}

function formatTimestamp(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const conversations: ConversationRecord[] = await getConversationsForUser(session.user.id);

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Inbox
          </p>
          <h1 className="mt-3 text-4xl font-bold text-[var(--foreground-strong)] sm:text-5xl">
            Messages
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-[var(--muted)]">
            Basic direct messages. Threads update when you open or send.
          </p>
        </div>

        {conversations.length ? (
          <div className="space-y-3">
            {conversations.map((conversation: ConversationRecord) => {
              const mine =
                conversation.latestMessage.senderId === session.user.id;

              return (
                <Link
                  key={conversation.user.id}
                  href={`/messages/${conversation.user.id}`}
                  className="block rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.65)] hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      name={conversation.user.name}
                      username={conversation.user.username}
                      publicId={conversation.user.publicId}
                      image={conversation.user.image}
                      avatarUrl={conversation.user.avatarUrl}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="truncate text-xl font-semibold text-[var(--foreground-strong)]">
                          {displayName(conversation.user)}
                        </h2>
                        <div className="flex shrink-0 items-center gap-2">
                          {conversation.unreadCount > 0 ? (
                            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                              {conversation.unreadCount > 99
                                ? "99+"
                                : conversation.unreadCount}
                            </span>
                          ) : null}
                          <p className="text-xs text-[var(--muted)]">
                            {formatTimestamp(conversation.latestMessage.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`mt-1 truncate text-sm ${
                          conversation.unreadCount > 0 && !mine
                            ? "font-semibold text-[var(--foreground-strong)]"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        {mine ? "You: " : ""}
                        {conversation.latestMessage.content}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[rgba(139,92,246,0.45)] bg-[var(--surface)] p-10 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[rgba(139,92,246,0.14)] text-2xl font-black text-[var(--accent)]">
              M
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[var(--foreground-strong)]">
              No messages yet
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Find a user and start a conversation
            </p>
            <Link
              href="/search"
              className="theme-button-primary mt-6 inline-flex rounded-full px-5 py-3 text-sm font-bold"
            >
              Find users
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
