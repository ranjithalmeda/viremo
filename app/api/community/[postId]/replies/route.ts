import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

type CommunityReplyRouteContext = {
  params: Promise<{ postId: string }>;
};

export async function POST(request: Request, context: CommunityReplyRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await context.params;
  const body = await request.json();
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    return NextResponse.json({ error: "Reply cannot be empty." }, { status: 400 });
  }

  const reply = await prisma.communityReply.create({
    data: {
      postId,
      userId: session.user.id,
      content,
    },
  });

  return NextResponse.json({ reply }, { status: 201 });
}
