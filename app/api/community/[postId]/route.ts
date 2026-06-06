import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

type CommunityPostRouteContext = {
  params: Promise<{ postId: string }>;
};

export async function GET(_request: Request, context: CommunityPostRouteContext) {
  const { postId } = await context.params;
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          publicId: true,
          image: true,
          avatarUrl: true,
        },
      },
      replies: {
        orderBy: [{ isBestAnswer: "desc" }, { upvotes: "desc" }, { createdAt: "asc" }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              publicId: true,
              image: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function DELETE(_request: Request, context: CommunityPostRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await context.params;
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  if (!post || post.userId !== session.user.id) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.communityPost.delete({ where: { id: postId } });
  return NextResponse.json({ ok: true });
}
