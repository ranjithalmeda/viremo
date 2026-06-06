import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/admin";
import { getAdminTickets } from "@/src/lib/admin-data";

export async function GET() {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const tickets = await getAdminTickets();
  return NextResponse.json({ tickets });
}
