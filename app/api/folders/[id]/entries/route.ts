import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { addEntryToFolderForUser } from "@/src/lib/data";

type FolderEntriesRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: FolderEntriesRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const { entryId } = await request.json();

    if (!entryId || typeof entryId !== "string") {
      return NextResponse.json(
        { error: "entryId is required" },
        { status: 400 },
      );
    }

    const result = await addEntryToFolderForUser(
      session.user.id,
      id,
      entryId,
    );

    if (!result) {
      return NextResponse.json(
        { error: "Folder or entry not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    console.error("Folder entry add error:", error);
    return NextResponse.json(
      { error: "Failed to add entry to folder" },
      { status: 500 },
    );
  }
}
