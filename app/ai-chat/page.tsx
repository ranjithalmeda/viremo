import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/src/lib/auth";
import { AIChatClient } from "@/src/components/ai-chat-client";
import {
  getChatMessagesForUser,
  getEntriesForUser,
  type ChatMessageRecord,
  type EntryRecord,
} from "@/src/lib/data";
import { getAiUsageForUser } from "@/src/lib/ai-limits";

export default async function AIChatPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role === "USER") {
    return (
      <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200/70 bg-white/95 p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-500">
            Pro feature
          </p>
          <h1 className="mt-4 text-4xl font-bold text-slate-950">
            AI Chat is a Pro feature.
          </h1>
          <p className="mt-3 text-slate-600">
            Contact admin to upgrade.
          </p>
        </div>
      </div>
    );
  }

  const [entries, chatMessages, usage] = await Promise.all([
    getEntriesSafely(session.user.id),
    getChatMessagesSafely(session.user.id),
    session.user.role === "PRO"
      ? getAiUsageForUser(session.user.id)
      : Promise.resolve(null),
  ]);
  
  const entriesFormatted = entries.map((entry: EntryRecord) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));

  const chatMessagesFormatted = chatMessages.map((message: ChatMessageRecord) => ({
    id: message.id,
    role: message.role === "USER" ? ("user" as const) : ("assistant" as const),
    content: message.content,
    timestamp: message.createdAt.toISOString(),
  }));

  return (
    <div className="w-full h-screen flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 mb-1">
          AI Recommendation Chat
        </h1>
        <p className="text-sm text-slate-600">
          {usage
            ? `${usage.count}/${usage.limit} requests used today`
            : "Chat with AI about your watchlist. It knows your ratings, genres, and what you've watched."}
        </p>
      </div>

      <AIChatClient
        initialEntries={entriesFormatted}
        initialMessages={chatMessagesFormatted}
        userName={session.user.name || "Watcher"}
        initialUsage={
          usage
            ? {
                ...usage,
                resetAt: usage.resetAt.toISOString(),
              }
            : null
        }
      />
    </div>
  );
}

async function getEntriesSafely(userId: string): Promise<EntryRecord[]> {
  try {
    return await getEntriesForUser(userId);
  } catch (error) {
    console.error("Failed to load AI chat diary entries:", error);
    return [];
  }
}

async function getChatMessagesSafely(userId: string): Promise<ChatMessageRecord[]> {
  try {
    return await getChatMessagesForUser(userId);
  } catch (error) {
    console.error("Failed to load AI chat history:", error);
    return [];
  }
}
