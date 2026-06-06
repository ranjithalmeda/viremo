import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/admin";
import { setProDailyAiLimit } from "@/src/lib/ai-limits";

export async function PUT(request: Request) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const body = await request.json();
  const limit = Number(body.limit);

  if (!Number.isFinite(limit) || limit < 1) {
    return NextResponse.json({ error: "Limit must be at least 1." }, { status: 400 });
  }

  return NextResponse.json({ limit: await setProDailyAiLimit(limit) });
}
