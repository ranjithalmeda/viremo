import { NextResponse } from "next/server";

import { getPublicProfile } from "@/src/lib/data";

type ProfileRouteContext = {
  params: Promise<{
    username: string;
  }>;
};

export async function GET(_: Request, context: ProfileRouteContext) {
  const { username: identifier } = await context.params;
  const profile = await getPublicProfile(identifier);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json(profile);
}
