import { NextResponse } from "next/server";

import { searchTmdb } from "@/src/lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchTmdb(query);
    return NextResponse.json({ results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "TMDB search failed.";

    return NextResponse.json({ error: message, results: [] }, { status: 503 });
  }
}
