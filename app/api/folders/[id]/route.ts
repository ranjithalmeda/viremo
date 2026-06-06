import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { deleteFolderForUser, updateFolderForUser } from "@/src/lib/data";

type FolderRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: FolderRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const { name, isPublic } = await request.json();
    const parsedName = typeof name === "string" ? name.trim() : "";

    if (!parsedName) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 },
      );
    }

    const folder = await updateFolderForUser(session.user.id, id, {
      name: parsedName,
      isPublic: Boolean(isPublic),
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ folder });
  } catch (error) {
    console.error("Folder update error:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: FolderRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const folder = await deleteFolderForUser(session.user.id, id);

    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Folder delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 },
    );
  }
}
