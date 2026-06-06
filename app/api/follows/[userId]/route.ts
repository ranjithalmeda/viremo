import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { followUser, getUserById, unfollowUser } from "@/src/lib/data";

type FollowRouteContext = {
  params: Promise<{ userId: string }>;
};

export async function POST(_request: Request, { params }: FollowRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  if (session.user.id === userId) {
    return NextResponse.json(
      { error: "You cannot follow yourself" },
      { status: 400 },
    );
  }

  const target = await getUserById(userId);
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const result = await followUser(session.user.id, userId);
  return NextResponse.json({ social: result?.social ?? null });
}

export async function DELETE(_request: Request, { params }: FollowRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const social = await unfollowUser(session.user.id, userId);

  return NextResponse.json({ social });
}
