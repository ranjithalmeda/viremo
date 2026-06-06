import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import {
  getUnreadMessageCount,
  getUnreadSocialNotificationCount,
} from "@/src/lib/data";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({
      unreadMessages: 0,
      unreadNotifications: 0,
      totalUnread: 0,
    });
  }

  const [unreadMessages, unreadNotifications] = await Promise.all([
    getUnreadMessageCount(session.user.id),
    getUnreadSocialNotificationCount(session.user.id),
  ]);

  return NextResponse.json({
    unreadMessages,
    unreadNotifications,
    totalUnread: unreadMessages + unreadNotifications,
  });
}
