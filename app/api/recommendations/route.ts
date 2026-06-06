import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { getEntriesForUser } from "@/src/lib/data";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Recommendation = {
  id: string;
  title: string;
  reason: string;
  type: "MOVIE" | "SERIES" | "ANIME" | "BOOK";
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const entries = await getEntriesForUser(session.user.id);
    const fallbackRecommendations = buildFallbackRecommendations(entries);

    if (session.user.role === "USER" || !apiKey) {
      return NextResponse.json({
        recommendations: fallbackRecommendations,
        source: "fallback",
      });
    }

    // Build a summary from user's diary
    const highRatedTitles = entries
      .filter((e) => e.rating && e.rating >= 4)
      .slice(0, 5)
      .map((e) => `${e.title} (${e.type})`)
      .join(", ");

    const lowRatedTitles = entries
      .filter((e) => e.rating && e.rating <= 2)
      .slice(0, 3)
      .map((e) => `${e.title} (${e.type})`)
      .join(", ");

    const notes = entries
      .filter((e) => e.notes)
      .slice(0, 3)
      .map((e) => e.notes)
      .join(" | ");

    const diaryContext = entries
      .slice(0, 20)
      .map(
        (entry) =>
          `- ${entry.title} (${entry.type}) status=${entry.status}, rating=${
            entry.rating || "unrated"
          }${entry.notes ? `, notes="${entry.notes}"` : ""}`,
      )
      .join("\n");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `You recommend movies, series, anime, and books for Viremo users.

User diary:
${diaryContext || "No diary entries yet."}

Taste signals:
- High-rated: ${highRatedTitles || "none"}
- Low-rated: ${lowRatedTitles || "none"}
- Recent notes: ${notes || "none"}

Return exactly 6 personalized recommendations as raw JSON. Do not include markdown.
Schema:
[
  {
    "title": "Title",
    "reason": "One concise reason based on the user's diary.",
    "type": "MOVIE"
  }
]
Allowed type values: MOVIE, SERIES, ANIME, BOOK.`;

    const result = await model.generateContent(prompt);
    const recommendations = parseRecommendations(result.response.text());

    return NextResponse.json({
      recommendations: recommendations.length
        ? recommendations
        : fallbackRecommendations,
      source: recommendations.length ? "gemini" : "fallback",
    });
  } catch (error) {
    console.warn("Recommendations fallback used:", error);

    try {
      const entries = session?.user?.id
        ? await getEntriesForUser(session.user.id)
        : [];

      return NextResponse.json({
        recommendations: buildFallbackRecommendations(entries),
        source: "fallback",
      });
    } catch (fallbackError) {
      console.error("Recommendations fallback error:", fallbackError);
      return NextResponse.json(
        { error: "Failed to fetch recommendations" },
        { status: 500 },
      );
    }
  }
}

function parseRecommendations(text: string): Recommendation[] {
  const trimmed = text.trim();
  const fencedJson = trimmed
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const arrayStart = fencedJson.indexOf("[");
  const arrayEnd = fencedJson.lastIndexOf("]");
  const jsonText =
    arrayStart >= 0 && arrayEnd > arrayStart
      ? fencedJson.slice(arrayStart, arrayEnd + 1)
      : fencedJson;
  const parsed = JSON.parse(jsonText);

  if (!Array.isArray(parsed)) {
    throw new Error("AI response was not a recommendation array");
  }

  return parsed
    .map((item, index) => {
      const type = normalizeType(item?.type);

      if (!item?.title || !item?.reason || !type) {
        return null;
      }

      return {
        id: `ai-rec-${index + 1}`,
        title: String(item.title),
        reason: String(item.reason),
        type,
      };
    })
    .filter((item): item is Recommendation => Boolean(item))
    .slice(0, 6);
}

function normalizeType(type: unknown): Recommendation["type"] | null {
  if (
    type === "MOVIE" ||
    type === "SERIES" ||
    type === "ANIME" ||
    type === "BOOK"
  ) {
    return type;
  }

  return null;
}

function buildFallbackRecommendations(
  entries: Awaited<ReturnType<typeof getEntriesForUser>>,
): Recommendation[] {
  const hasAnime = entries.some((entry) => entry.type === "ANIME");
  const hasBooks = entries.some((entry) => entry.type === "BOOK");
  const hasSeries = entries.some((entry) => entry.type === "SERIES");
  const highRated = entries.find(
    (entry) => typeof entry.rating === "number" && entry.rating >= 4,
  );

  const picks: Recommendation[] = [
    {
      id: "fallback-rec-1",
      title: hasAnime ? "Frieren: Beyond Journey's End" : "Dune: Part Two",
      reason: highRated
        ? `A strong match if you liked ${highRated.title}.`
        : "A widely loved pick to start shaping your taste profile.",
      type: hasAnime ? "ANIME" : "MOVIE",
    },
    {
      id: "fallback-rec-2",
      title: hasSeries ? "Severance" : "The Bear",
      reason: "Tense, character-driven storytelling that fits many watchlists.",
      type: "SERIES",
    },
    {
      id: "fallback-rec-3",
      title: hasBooks ? "Project Hail Mary" : "The Three-Body Problem",
      reason: "A smart genre pick with big ideas and strong momentum.",
      type: "BOOK",
    },
    {
      id: "fallback-rec-4",
      title: "Monster",
      reason: "A layered thriller choice for a diary with darker or dramatic titles.",
      type: "ANIME",
    },
    {
      id: "fallback-rec-5",
      title: "Arrival",
      reason: "Thoughtful sci-fi with emotional weight and replay value.",
      type: "MOVIE",
    },
    {
      id: "fallback-rec-6",
      title: "Mindhunter",
      reason: "A sharp crime series pick for fans of careful suspense.",
      type: "SERIES",
    },
  ];

  return picks;
}
