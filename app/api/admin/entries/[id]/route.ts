import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/admin";
import { deleteAdminEntry } from "@/src/lib/admin-data";

type AdminEntryRouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, context: AdminEntryRouteContext) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await context.params;

  try {
    await deleteAdminEntry(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }
}
