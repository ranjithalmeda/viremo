import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import {
  isValidEmail,
  isValidUsername,
  normalizeUsername,
  updateSettingsProfile,
} from "@/src/lib/settings-data";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : null;
  const username =
    typeof body.username === "string" ? normalizeUsername(body.username) : "";
  const bio =
    typeof body.bio === "string" && body.bio.trim() ? body.bio.trim() : null;
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (name && name.length > 80) {
    return NextResponse.json(
      { error: "Display name must be 80 characters or less." },
      { status: 400 },
    );
  }

  if (!isValidUsername(username)) {
    return NextResponse.json(
      {
        error:
          "Username must be 3-24 characters and use only lowercase letters, numbers, or underscores.",
      },
      { status: 400 },
    );
  }

  if (bio && bio.length > 180) {
    return NextResponse.json(
      { error: "Bio must be 180 characters or less." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const profile = await updateSettingsProfile(session.user.id, {
      name,
      username,
      bio,
      email,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update profile settings.",
      },
      { status: 400 },
    );
  }
}
