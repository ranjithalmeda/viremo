import { NextResponse } from "next/server";

import { getAdminStats } from "@/src/lib/admin-data";
import { requireAdminApi } from "@/src/lib/admin";

export async function GET() {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
