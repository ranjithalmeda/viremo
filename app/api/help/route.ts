import { NextResponse } from "next/server";

import { getPublishedHelpArticles } from "@/src/lib/help";

export async function GET() {
  const articles = await getPublishedHelpArticles();
  return NextResponse.json({ articles });
}
