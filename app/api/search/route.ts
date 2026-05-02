import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/src/lib/auth";
import { searchBooks } from "@/src/lib/books";
import { searchTmdb } from "@/src/lib/tmdb";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", results: [] }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const source = searchParams.get("source") || "tmdb";

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results =
      source === "books"
        ? await searchBooks(query)
        : await searchTmdb(query);
    return NextResponse.json({ results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search failed.";

    return NextResponse.json({ error: message, results: [] }, { status: 503 });
  }
}
