import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/admin";
import { getAdminEntries } from "@/src/lib/admin-data";

export async function GET() {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const entries = await getAdminEntries();
  return NextResponse.json({ entries });
}
