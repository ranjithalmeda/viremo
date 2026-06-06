import { NextResponse } from "next/server";

import { getPublicFolderForProfile } from "@/src/lib/data";

type PublicProfileFolderRouteContext = {
  params: Promise<{
    username: string;
    folderId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: PublicProfileFolderRouteContext,
) {
  const { username, folderId } = await context.params;
  const folder = await getPublicFolderForProfile(username, folderId);

  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  return NextResponse.json({ folder });
}
