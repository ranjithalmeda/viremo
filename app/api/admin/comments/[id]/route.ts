import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/admin";
import { deleteAdminComment } from "@/src/lib/admin-data";

type AdminCommentRouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, context: AdminCommentRouteContext) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await context.params;

  try {
    await deleteAdminComment(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }
}
