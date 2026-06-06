import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { deleteProfileCommentForOwner } from "@/src/lib/data";

type CommentDeleteRouteContext = {
  params: Promise<{ commentId: string }>;
};

export async function DELETE(
  _request: Request,
  { params }: CommentDeleteRouteContext,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = await params;
  const deleted = await deleteProfileCommentForOwner(commentId, session.user.id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Comment not found or you cannot delete it" },
      { status: 404 },
    );
  }

  return NextResponse.json({ deleted: true });
}
