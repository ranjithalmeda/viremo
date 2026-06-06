import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/admin";
import {
  createHelpArticle,
  getAllHelpArticlesForAdmin,
  parseHelpPayload,
} from "@/src/lib/help";

export async function GET() {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const articles = await getAllHelpArticlesForAdmin();
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const body = await request.json();
  const parsed = parseHelpPayload(body);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const article = await createHelpArticle(parsed.data);

  return NextResponse.json({ article }, { status: 201 });
}
