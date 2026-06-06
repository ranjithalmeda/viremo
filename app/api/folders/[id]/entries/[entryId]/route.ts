import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { removeEntryFromFolderForUser } from "@/src/lib/data";

type FolderEntryRouteContext = {
  params: Promise<{
    id: string;
    entryId: string;
  }>;
};

export async function DELETE(_: Request, context: FolderEntryRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, entryId } = await context.params;
    const result = await removeEntryFromFolderForUser(
      session.user.id,
      id,
      entryId,
    );

    if (!result) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, removed: result.count });
  } catch (error) {
    console.error("Folder entry remove error:", error);
    return NextResponse.json(
      { error: "Failed to remove entry from folder" },
      { status: 500 },
    );
  }
}
