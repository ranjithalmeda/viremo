import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/admin";
import { getAdminUsers } from "@/src/lib/admin-data";

export async function GET() {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const users = await getAdminUsers();
  return NextResponse.json({ users });
}
