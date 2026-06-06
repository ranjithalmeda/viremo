import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import {
  getConversation,
  getUserById,
  markConversationRead,
  sendDirectMessage,
} from "@/src/lib/data";

type MessageRouteContext = {
  params: Promise<{ userId: string }>;
};

export async function GET(_request: Request, { params }: MessageRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const user = await getUserById(userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const messages = await getConversation(session.user.id, userId);
  await markConversationRead(session.user.id, userId);

  return NextResponse.json({ user, messages });
}

export async function POST(request: Request, { params }: MessageRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  if (session.user.id === userId) {
    return NextResponse.json(
      { error: "You cannot message yourself" },
      { status: 400 },
    );
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    return NextResponse.json(
      { error: "Message cannot be empty" },
      { status: 400 },
    );
  }

  if (content.length > 1000) {
    return NextResponse.json(
      { error: "Message must be 1000 characters or less" },
      { status: 400 },
    );
  }

  const message = await sendDirectMessage(session.user.id, userId, content);

  if (!message) {
    return NextResponse.json(
      { error: "Could not send this message" },
      { status: 400 },
    );
  }

  return NextResponse.json({ message }, { status: 201 });
}
