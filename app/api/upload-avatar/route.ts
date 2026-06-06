import { randomUUID } from "node:crypto";

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { updateAvatarForUser } from "@/src/lib/data";
import { createSupabaseStorageClient } from "@/src/lib/supabase-storage";

const maxAvatarSize = 2 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Avatar file is required" }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type);

  if (!extension) {
    return NextResponse.json(
      { error: "Only JPG and PNG avatars are allowed" },
      { status: 400 },
    );
  }

  if (file.size > maxAvatarSize) {
    return NextResponse.json(
      { error: "Avatar must be 2MB or smaller" },
      { status: 400 },
    );
  }

  try {
    const supabase = createSupabaseStorageClient();
    const path = `${session.user.id}/${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const user = await updateAvatarForUser(session.user.id, data.publicUrl);

    return NextResponse.json({ avatarUrl: user.avatarUrl, user });
  } catch (error) {
    console.error("Avatar upload error:", error);
    const message = error instanceof Error ? error.message : "Could not upload avatar";
    const isConfigError = message.includes("Supabase Storage is not configured");

    return NextResponse.json(
      {
        error: isConfigError
          ? "Supabase Storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env."
          : "Could not upload avatar",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: isConfigError ? 503 : 500 },
    );
  }
}
