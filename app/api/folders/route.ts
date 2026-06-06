import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { createFolderForUser, getFoldersForUser } from "@/src/lib/data";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const folders = await getFoldersForUser(session.user.id);
    return NextResponse.json({ folders });
  } catch (error) {
    console.error("Folders list error:", error);
    return NextResponse.json(
      { error: "Failed to load folders" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, isPublic } = await request.json();
    const parsedName = typeof name === "string" ? name.trim() : "";

    if (!parsedName) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 },
      );
    }

    const folder = await createFolderForUser(session.user.id, {
      name: parsedName,
      isPublic: Boolean(isPublic),
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    console.error("Folder create error:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 },
    );
  }
}
