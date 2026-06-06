import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

type ReplyRouteContext = {
  params: Promise<{ replyId: string }>;
};

export async function PUT(_request: Request, context: ReplyRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { replyId } = await context.params;
  const reply = await prisma.communityReply.update({
    where: { id: replyId },
    data: { upvotes: { increment: 1 } },
  });

  return NextResponse.json({ reply });
}
