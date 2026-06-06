import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/admin";
import { getAdminComments } from "@/src/lib/admin-data";

export async function GET() {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const comments = await getAdminComments();
  return NextResponse.json({ comments });
}
