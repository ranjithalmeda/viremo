import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import {
  addChatMessage,
  getChatMessagesForUser,
  getEntriesForUser,
} from "@/src/lib/data";
import { consumeAiUsage } from "@/src/lib/ai-limits";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "USER") {
    return NextResponse.json(
      { error: "AI Chat is a Pro feature. Contact admin to upgrade." },
      { status: 403 },
    );
  }

  try {
    const usage =
      session.user.role === "PRO"
        ? await consumeAiUsage(session.user.id)
        : null;

    if (usage && !usage.allowed) {
      return NextResponse.json(
        {
          error: "Daily limit reached. Resets tomorrow.",
          usage: {
            ...usage,
            resetAt: usage.resetAt.toISOString(),
          },
        },
        { status: 429 },
      );
    }

    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not configured");
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from the server environment" },
        { status: 500 }
      );
    }

    const entries = await getEntriesSafely(session.user.id);
    const chatHistory = await getChatHistorySafely(session.user.id);

    saveChatMessageSafely(session.user.id, "USER", message);

    // Build a summary of their watchlist
    const diaryContext = buildDiaryContext(entries);
    const conversationContext = buildConversationContext(chatHistory);

    // Create the model - use gemini-2.0-flash (faster, cheaper)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build the full prompt with user context
    const fullPrompt = `You are a friendly recommendation assistant for a movie/show/anime/book watchlist app called Viremo. 
You are chatting with ${session.user.name || "a user"} about their viewing preferences and recommendations.

Here's their watch diary:
${diaryContext}

Recent chat history:
${conversationContext}

Instructions:
- Be conversational and friendly
- Make recommendations based on their actual ratings, notes, and watch history
- Use recent chat history to keep context across follow-up questions
- If the user asks something outside movies, shows, anime, or books, answer briefly if it is safe and harmless, then gently connect back to Viremo when useful
- If they ask about specific genres or types they watch, refer to their diary
- Suggest titles that fit their demonstrated taste
- Keep responses concise (2-3 sentences max)
- If they haven't watched much yet, encourage them to add more titles first

User message: ${message}`;

    // Simple API call with just text
    const result = await model.generateContent(fullPrompt);

    const text = result.response.text();

    saveChatMessageSafely(session.user.id, "ASSISTANT", text);

    return NextResponse.json({
      reply: text,
      usage: usage
        ? {
            ...usage,
            resetAt: usage.resetAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    console.error("AI chat API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);

    return NextResponse.json(
      { error: `Failed to generate response: ${errorMessage}` },
      { status: 500 }
    );
  }
}

async function getEntriesSafely(userId: string) {
  try {
    return await getEntriesForUser(userId);
  } catch (error) {
    console.error("Failed to load diary entries:", error);
    return [];
  }
}

async function getChatHistorySafely(userId: string) {
  try {
    return await getChatMessagesForUser(userId, 20);
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
}

function saveChatMessageSafely(
  userId: string,
  role: "USER" | "ASSISTANT",
  content: string,
) {
  addChatMessage(userId, role, content).catch((error) => {
    console.error(`Failed to save ${role.toLowerCase()} chat message:`, error);
  });
}

function buildConversationContext(
  messages: Array<{
    role: string;
    content: string;
  }>
): string {
  if (messages.length === 0) {
    return "No previous chat messages.";
  }

  return messages
    .map((message) => {
      const role = message.role === "USER" ? "User" : "Assistant";
      return `${role}: ${message.content}`;
    })
    .join("\n");
}

function buildDiaryContext(
  entries: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    rating: number | null;
    notes: string | null;
  }>
): string {
  if (entries.length === 0) {
    return "No titles watched yet. Encourage them to add their first title!";
  }

  const highRated = entries
    .filter((e) => e.rating && e.rating >= 4)
    .slice(0, 5)
    .map((e) => `${e.title} (${e.rating}/5)${e.notes ? ` - "${e.notes}"` : ""}`)
    .join("\n");

  const lowRated = entries
    .filter((e) => e.rating && e.rating <= 2)
    .slice(0, 3)
    .map((e) => `${e.title} (${e.rating}/5)`)
    .join(", ");

  const genres = [
    ...new Set(entries.map((e) => e.type)),
  ]
    .join(", ");

  const completed = entries.filter((e) => e.status === "COMPLETED").length;
  const watching = entries.filter((e) => e.status === "WATCHING").length;
  const dropped = entries.filter((e) => e.status === "DROPPED").length;

  return `
Total titles: ${entries.length}
- Completed: ${completed}
- Currently watching: ${watching}
- Dropped: ${dropped}

Types watched: ${genres}

Highest-rated titles:
${highRated || "None rated yet"}

Lowest-rated titles: ${lowRated || "None rated yet"}

Recent entries:
${entries
  .slice(0, 5)
  .map((e) => `- ${e.title} (${e.type}) - Status: ${e.status}, Rating: ${e.rating || "None"}`)
  .join("\n")}
  `;
}
