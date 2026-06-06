import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { addProfileComment, getUserById } from "@/src/lib/data";

type CommentRouteContext = {
  params: Promise<{ userId: string }>;
};

export async function POST(request: Request, { params }: CommentRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const target = await getUserById(userId);

  if (!target) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json();
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    return NextResponse.json(
      { error: "Comment cannot be empty" },
      { status: 400 },
    );
  }

  if (content.length > 500) {
    return NextResponse.json(
      { error: "Comment must be 500 characters or less" },
      { status: 400 },
    );
  }

  const comment = await addProfileComment(userId, session.user.id, content);
  return NextResponse.json({ comment }, { status: 201 });
}
