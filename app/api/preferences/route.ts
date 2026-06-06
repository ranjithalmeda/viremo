import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import {
  getPreferencesForUser,
  updatePreferencesForUser,
} from "@/src/lib/data";
import { normalizePreferences } from "@/src/lib/preferences";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const preferences = await getPreferencesForUser(session.user.id);
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Preferences load error:", error);
    return NextResponse.json(
      { error: "Failed to load preferences" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const preferences = await updatePreferencesForUser(
      session.user.id,
      normalizePreferences(body),
    );

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Preferences save error:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 },
    );
  }
}
