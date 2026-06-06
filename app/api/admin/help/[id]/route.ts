import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/admin";
import {
  deleteHelpArticle,
  parseHelpPayload,
  updateHelpArticle,
} from "@/src/lib/help";

type AdminHelpArticleRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: Request,
  context: AdminHelpArticleRouteContext,
) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const body = await request.json();
  const parsed = parseHelpPayload(body);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { id } = await context.params;

  const article = await updateHelpArticle(id, parsed.data);

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function DELETE(
  _request: Request,
  context: AdminHelpArticleRouteContext,
) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await context.params;

  const deleted = await deleteHelpArticle(id);

  if (!deleted) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
