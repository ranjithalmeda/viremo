import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { MessagesThreadClient } from "@/src/components/messages-thread-client";
import { authOptions } from "@/src/lib/auth";
import {
  getConversation,
  getUserById,
  markConversationRead,
  type DirectMessageRecord,
} from "@/src/lib/data";

type MessageThreadPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function MessageThreadPage({
  params,
}: MessageThreadPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { userId } = await params;

  if (userId === session.user.id) {
    redirect("/messages");
  }

  const [otherUser, messages] = await Promise.all([
    getUserById(userId),
    getConversation(session.user.id, userId),
  ]);

  if (!otherUser) {
    notFound();
  }

  await markConversationRead(session.user.id, userId);

  return (
    <MessagesThreadClient
      currentUserId={session.user.id}
      otherUser={otherUser}
      initialMessages={messages.map((message: DirectMessageRecord) => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
      }))}
    />
  );
}
