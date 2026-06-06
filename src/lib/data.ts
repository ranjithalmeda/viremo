import { prisma } from "@/src/lib/prisma";
import type { ChatRole, Entry, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import {
  normalizePreferences,
  serializePreferences,
  type UserPreferences,
} from "@/src/lib/preferences";

export type SocialUser = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  avatarUrl?: string | null;
  publicId: string;
};

export type ProfileCommentRecord = {
  id: string;
  content: string;
  createdAt: Date;
  author: SocialUser;
};

export type DirectMessageRecord = {
  id: string;
  content: string;
  createdAt: Date;
  readAt: Date | null;
  senderId: string;
  recipientId: string;
};

export type ConversationRecord = {
  user: SocialUser;
  latestMessage: DirectMessageRecord;
  unreadCount: number;
};

export type NotificationRecord = {
  id: string;
  type: "FOLLOW";
  readAt: Date | null;
  createdAt: Date;
  actor: SocialUser | null;
};

export type EntryRecord = Entry;

export type FolderSummaryRecord = Prisma.FolderGetPayload<{
  include: {
    _count: {
      select: { entries: true };
    };
  };
}>;

export type ChatMessageRecord = {
  id: string;
  userId: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
};

export async function getEntriesForUser(userId: string): Promise<EntryRecord[]> {
  return prisma.entry.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublicProfile(identifier: string) {
  const profile = await prisma.user.findFirst({
    where: {
      OR: [{ publicId: identifier.toUpperCase() }, { username: identifier }],
    },
    select: {
      id: true,
      name: true,
      image: true,
      publicId: true,
      username: true,
      createdAt: true,
      entries: {
        orderBy: { updatedAt: "desc" },
      },
      folders: {
        where: { isPublic: true },
        orderBy: { updatedAt: "desc" },
        include: {
          entries: {
            orderBy: { addedAt: "desc" },
            include: {
              entry: true,
            },
          },
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  const metadata = await getAvatarForUser(profile.id);
  const preferences = await getPreferencesForUser(profile.id);
  const [social, comments] = await Promise.all([
    getProfileSocialSummary(profile.id),
    getProfileComments(profile.id),
  ]);

  return {
    ...profile,
    avatarUrl: metadata?.avatarUrl ?? null,
    bio: metadata?.bio ?? null,
    preferences,
    social,
    comments,
  };
}

export async function getPreferencesForUser(userId: string) {
  const [user] = await prisma.$queryRaw<Array<{ preferences: unknown }>>`
    SELECT preferences
    FROM "User"
    WHERE id = ${userId}
    LIMIT 1
  `;

  return normalizePreferences(user?.preferences);
}

export async function getAvatarForUser(userId: string) {
  const [user] = await prisma.$queryRaw<
    Array<{
      avatarUrl: string | null;
      image: string | null;
      name: string | null;
      username: string | null;
      bio: string | null;
      publicId: string;
    }>
  >`
    SELECT "avatarUrl", image, name, username, bio, "publicId"
    FROM "User"
    WHERE id = ${userId}
    LIMIT 1
  `;

  return user ?? null;
}

export async function updateAvatarForUser(userId: string, avatarUrl: string) {
  const [user] = await prisma.$queryRaw<
    Array<{
      avatarUrl: string | null;
      image: string | null;
      name: string | null;
      username: string | null;
      bio: string | null;
      publicId: string;
    }>
  >`
    UPDATE "User"
    SET "avatarUrl" = ${avatarUrl}
    WHERE id = ${userId}
    RETURNING "avatarUrl", image, name, username, bio, "publicId"
  `;

  return user;
}

export async function updatePreferencesForUser(
  userId: string,
  preferences: UserPreferences,
) {
  const normalized = normalizePreferences(preferences);
  const payload = JSON.stringify(serializePreferences(normalized));

  const [user] = await prisma.$queryRaw<Array<{ preferences: unknown }>>`
    UPDATE "User"
    SET preferences = ${payload}::jsonb
    WHERE id = ${userId}
    RETURNING preferences
  `;

  return normalizePreferences(user?.preferences);
}

export async function getFoldersForUser(
  userId: string,
): Promise<FolderSummaryRecord[]> {
  return prisma.folder.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { entries: true },
      },
    },
  });
}

export async function getFolderForUser(userId: string, folderId: string) {
  return prisma.folder.findFirst({
    where: {
      id: folderId,
      userId,
    },
    include: {
      entries: {
        orderBy: { addedAt: "desc" },
        include: {
          entry: true,
        },
      },
      _count: {
        select: { entries: true },
      },
    },
  });
}

export async function getPublicFolderForProfile(
  identifier: string,
  folderId: string,
) {
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      isPublic: true,
      user: {
        OR: [{ publicId: identifier.toUpperCase() }, { username: identifier }],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          publicId: true,
        },
      },
      entries: {
        orderBy: { addedAt: "desc" },
        include: {
          entry: true,
        },
      },
    },
  });

  if (!folder) {
    return null;
  }

  const avatar = await getAvatarForUser(folder.user.id);

  return {
    ...folder,
    user: {
      ...folder.user,
      avatarUrl: avatar?.avatarUrl ?? null,
    },
  };
}

export async function createFolderForUser(
  userId: string,
  data: {
    name: string;
    isPublic: boolean;
  },
) {
  return prisma.folder.create({
    data: {
      userId,
      name: data.name,
      isPublic: data.isPublic,
    },
    include: {
      _count: {
        select: { entries: true },
      },
    },
  });
}

export async function updateFolderForUser(
  userId: string,
  folderId: string,
  data: {
    name: string;
    isPublic: boolean;
  },
) {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId },
    select: { id: true },
  });

  if (!folder) {
    return null;
  }

  return prisma.folder.update({
    where: { id: folderId },
    data,
    include: {
      _count: {
        select: { entries: true },
      },
    },
  });
}

export async function deleteFolderForUser(userId: string, folderId: string) {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId },
    select: { id: true },
  });

  if (!folder) {
    return null;
  }

  return prisma.folder.delete({
    where: { id: folderId },
  });
}

export async function addEntryToFolderForUser(
  userId: string,
  folderId: string,
  entryId: string,
) {
  const [folder, entry] = await Promise.all([
    prisma.folder.findFirst({
      where: { id: folderId, userId },
      select: { id: true },
    }),
    prisma.entry.findFirst({
      where: { id: entryId, userId },
      select: { id: true },
    }),
  ]);

  if (!folder || !entry) {
    return null;
  }

  const existing = await prisma.folderEntry.findUnique({
    where: {
      folderId_entryId: {
        folderId,
        entryId,
      },
    },
    include: {
      entry: true,
    },
  });

  if (existing) {
    return {
      folderEntry: existing,
      created: false,
    };
  }

  const folderEntry = await prisma.folderEntry.create({
    data: {
      folderId,
      entryId,
    },
    include: {
      entry: true,
    },
  });

  return {
    folderEntry,
    created: true,
  };
}

export async function removeEntryFromFolderForUser(
  userId: string,
  folderId: string,
  entryId: string,
) {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId },
    select: { id: true },
  });

  if (!folder) {
    return null;
  }

  return prisma.folderEntry.deleteMany({
    where: {
      folderId,
      entryId,
    },
  });
}

export async function getWatchHistoryForUser(
  userId: string,
  from: Date,
  to: Date,
) {
  return prisma.watchHistory.findMany({
    where: {
      userId,
      watchedAt: {
        gte: from,
        lte: to,
      },
    },
    include: {
      entry: true,
    },
    orderBy: { watchedAt: "desc" },
  });
}

export async function getWatchHistoryForDate(userId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return prisma.watchHistory.findMany({
    where: {
      userId,
      watchedAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      entry: true,
    },
    orderBy: { watchedAt: "desc" },
  });
}

export async function addWatchHistoryEntry(
  userId: string,
  entryId: string,
  watchedAt: Date,
  note?: string,
) {
  return prisma.watchHistory.create({
    data: {
      userId,
      entryId,
      watchedAt,
      note: note || null,
    },
  });
}

export async function getChatMessagesForUser(
  userId: string,
  limit = 50,
): Promise<ChatMessageRecord[]> {
  const messages = await prisma.$queryRaw<ChatMessageRecord[]>`
    SELECT id, "userId", role, content, "createdAt"
    FROM "ChatMessage"
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" DESC
    LIMIT ${limit}
  `;

  return messages.reverse();
}

export async function addChatMessage(
  userId: string,
  role: ChatRole,
  content: string,
) {
  const id = randomUUID();
  const [message] = await prisma.$queryRaw<
    Array<{
      id: string;
      userId: string;
      role: ChatRole;
      content: string;
      createdAt: Date;
    }>
  >`
    INSERT INTO "ChatMessage" (id, "userId", role, content)
    VALUES (${id}, ${userId}, CAST(${role} AS "ChatRole"), ${content})
    RETURNING id, "userId", role, content, "createdAt"
  `;

  return message;
}

export async function getUserById(userId: string) {
  const [user] = await prisma.$queryRaw<SocialUser[]>`
    SELECT id, name, username, COALESCE("avatarUrl", image) AS image, "avatarUrl", "publicId"
    FROM "User"
    WHERE id = ${userId}
    LIMIT 1
  `;

  return user ?? null;
}

export async function getProfileSocialSummary(
  profileUserId: string,
  viewerId?: string | null,
) {
  const [summary] = await prisma.$queryRaw<
    Array<{
      followersCount: number | bigint;
      followingCount: number | bigint;
      isFollowing: boolean;
    }>
  >`
    SELECT
      (SELECT COUNT(*) FROM "Follow" WHERE "followingId" = ${profileUserId}) AS "followersCount",
      (SELECT COUNT(*) FROM "Follow" WHERE "followerId" = ${profileUserId}) AS "followingCount",
      EXISTS(
        SELECT 1
        FROM "Follow"
        WHERE "followerId" = ${viewerId ?? ""}
          AND "followingId" = ${profileUserId}
      ) AS "isFollowing"
  `;

  return {
    followersCount: Number(summary?.followersCount ?? 0),
    followingCount: Number(summary?.followingCount ?? 0),
    isFollowing: Boolean(summary?.isFollowing),
  };
}

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    return null;
  }

  const id = randomUUID();

  const created = await prisma.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "Follow" (id, "followerId", "followingId")
    VALUES (${id}, ${followerId}, ${followingId})
    ON CONFLICT ("followerId", "followingId") DO NOTHING
    RETURNING id
  `;

  if (created.length > 0) {
    await addFollowNotification(followingId, followerId);
  }

  return {
    social: await getProfileSocialSummary(followingId, followerId),
    created: created.length > 0,
  };
}

export async function unfollowUser(followerId: string, followingId: string) {
  await prisma.$executeRaw`
    DELETE FROM "Follow"
    WHERE "followerId" = ${followerId}
      AND "followingId" = ${followingId}
  `;

  await removeUnreadFollowNotification(followingId, followerId);

  return getProfileSocialSummary(followingId, followerId);
}

export async function getFollowingUsers(userId: string) {
  return prisma.$queryRaw<Array<SocialUser & { followedAt: Date }>>`
    SELECT u.id, u.name, u.username, COALESCE(u."avatarUrl", u.image) AS image, u."avatarUrl", u."publicId", f."createdAt" AS "followedAt"
    FROM "Follow" f
    JOIN "User" u ON u.id = f."followingId"
    WHERE f."followerId" = ${userId}
    ORDER BY f."createdAt" DESC
  `;
}

export async function getFollowerUsers(userId: string) {
  return prisma.$queryRaw<Array<SocialUser & { followedAt: Date }>>`
    SELECT u.id, u.name, u.username, COALESCE(u."avatarUrl", u.image) AS image, u."avatarUrl", u."publicId", f."createdAt" AS "followedAt"
    FROM "Follow" f
    JOIN "User" u ON u.id = f."followerId"
    WHERE f."followingId" = ${userId}
    ORDER BY f."createdAt" DESC
  `;
}

export async function getProfileComments(profileUserId: string) {
  const comments = await prisma.$queryRaw<
    Array<{
      id: string;
      content: string;
      createdAt: Date;
      authorId: string;
      authorName: string | null;
      authorUsername: string | null;
      authorImage: string | null;
      authorAvatarUrl: string | null;
      authorPublicId: string;
    }>
  >`
    SELECT
      c.id,
      c.content,
      c."createdAt",
      u.id AS "authorId",
      u.name AS "authorName",
      u.username AS "authorUsername",
      COALESCE(u."avatarUrl", u.image) AS "authorImage",
      u."avatarUrl" AS "authorAvatarUrl",
      u."publicId" AS "authorPublicId"
    FROM "ProfileComment" c
    JOIN "User" u ON u.id = c."authorId"
    WHERE c."profileUserId" = ${profileUserId}
    ORDER BY c."createdAt" DESC
  `;

  return comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: {
      id: comment.authorId,
      name: comment.authorName,
      username: comment.authorUsername,
      image: comment.authorImage,
      avatarUrl: comment.authorAvatarUrl,
      publicId: comment.authorPublicId,
    },
  }));
}

export async function addProfileComment(
  profileUserId: string,
  authorId: string,
  content: string,
) {
  const id = randomUUID();
  const [comment] = await prisma.$queryRaw<
    Array<{
      id: string;
      content: string;
      createdAt: Date;
      authorId: string;
      authorName: string | null;
      authorUsername: string | null;
      authorImage: string | null;
      authorAvatarUrl: string | null;
      authorPublicId: string;
    }>
  >`
    INSERT INTO "ProfileComment" (id, "profileUserId", "authorId", content)
    VALUES (${id}, ${profileUserId}, ${authorId}, ${content})
    RETURNING
      id,
      content,
      "createdAt",
      "authorId",
      (SELECT name FROM "User" WHERE id = ${authorId}) AS "authorName",
      (SELECT username FROM "User" WHERE id = ${authorId}) AS "authorUsername",
      (SELECT COALESCE("avatarUrl", image) FROM "User" WHERE id = ${authorId}) AS "authorImage",
      (SELECT "avatarUrl" FROM "User" WHERE id = ${authorId}) AS "authorAvatarUrl",
      (SELECT "publicId" FROM "User" WHERE id = ${authorId}) AS "authorPublicId"
  `;

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: {
      id: comment.authorId,
      name: comment.authorName,
      username: comment.authorUsername,
      image: comment.authorImage,
      avatarUrl: comment.authorAvatarUrl,
      publicId: comment.authorPublicId,
    },
  };
}

export async function deleteProfileCommentForOwner(
  commentId: string,
  ownerId: string,
) {
  const result = await prisma.$queryRaw<Array<{ id: string }>>`
    DELETE FROM "ProfileComment"
    WHERE id = ${commentId}
      AND "profileUserId" = ${ownerId}
    RETURNING id
  `;

  return result.length > 0;
}

export async function getConversationsForUser(
  userId: string,
): Promise<ConversationRecord[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      messageId: string;
      content: string;
      createdAt: Date;
      senderId: string;
      recipientId: string;
      readAt: Date | null;
      userId: string;
      name: string | null;
      username: string | null;
      image: string | null;
      avatarUrl: string | null;
      publicId: string;
      unreadCount: number | bigint;
    }>
  >`
    WITH ranked AS (
      SELECT
        m.*,
        CASE
          WHEN m."senderId" = ${userId} THEN m."recipientId"
          ELSE m."senderId"
        END AS "otherUserId",
        ROW_NUMBER() OVER (
          PARTITION BY CASE
            WHEN m."senderId" = ${userId} THEN m."recipientId"
            ELSE m."senderId"
          END
          ORDER BY m."createdAt" DESC
        ) AS rn
      FROM "DirectMessage" m
      WHERE m."senderId" = ${userId}
         OR m."recipientId" = ${userId}
    )
    SELECT
      ranked.id AS "messageId",
      ranked.content,
      ranked."createdAt",
      ranked."senderId",
      ranked."recipientId",
      ranked."readAt",
      u.id AS "userId",
      u.name,
      u.username,
      COALESCE(u."avatarUrl", u.image) AS image,
      u."avatarUrl",
      u."publicId",
      (
        SELECT COUNT(*)
        FROM "DirectMessage" unread
        WHERE unread."senderId" = ranked."otherUserId"
          AND unread."recipientId" = ${userId}
          AND unread."readAt" IS NULL
      ) AS "unreadCount"
    FROM ranked
    JOIN "User" u ON u.id = ranked."otherUserId"
    WHERE ranked.rn = 1
    ORDER BY ranked."createdAt" DESC
  `;

  return rows.map((row): ConversationRecord => ({
    user: {
      id: row.userId,
      name: row.name,
      username: row.username,
      image: row.image,
      avatarUrl: row.avatarUrl,
      publicId: row.publicId,
    },
    latestMessage: {
      id: row.messageId,
      content: row.content,
      createdAt: row.createdAt,
      readAt: row.readAt,
      senderId: row.senderId,
      recipientId: row.recipientId,
    },
    unreadCount: Number(row.unreadCount ?? 0),
  }));
}

export async function getConversation(
  userId: string,
  otherUserId: string,
): Promise<DirectMessageRecord[]> {
  return prisma.$queryRaw<DirectMessageRecord[]>`
    SELECT id, content, "createdAt", "readAt", "senderId", "recipientId"
    FROM "DirectMessage"
    WHERE ("senderId" = ${userId} AND "recipientId" = ${otherUserId})
       OR ("senderId" = ${otherUserId} AND "recipientId" = ${userId})
    ORDER BY "createdAt" ASC
  `;
}

export async function sendDirectMessage(
  senderId: string,
  recipientId: string,
  content: string,
) {
  if (senderId === recipientId) {
    return null;
  }

  const id = randomUUID();
  const [message] = await prisma.$queryRaw<DirectMessageRecord[]>`
    INSERT INTO "DirectMessage" (id, "senderId", "recipientId", content)
    VALUES (${id}, ${senderId}, ${recipientId}, ${content})
    RETURNING id, content, "createdAt", "readAt", "senderId", "recipientId"
  `;

  return message ?? null;
}

export async function getUnreadMessageCount(userId: string) {
  const [row] = await prisma.$queryRaw<Array<{ count: number | bigint }>>`
    SELECT COUNT(*) AS count
    FROM "DirectMessage"
    WHERE "recipientId" = ${userId}
      AND "readAt" IS NULL
  `;

  return Number(row?.count ?? 0);
}

export async function markConversationRead(userId: string, otherUserId: string) {
  await prisma.$executeRaw`
    UPDATE "DirectMessage"
    SET "readAt" = NOW()
    WHERE "senderId" = ${otherUserId}
      AND "recipientId" = ${userId}
      AND "readAt" IS NULL
  `;
}

export async function addFollowNotification(userId: string, actorId: string) {
  if (userId === actorId) {
    return null;
  }

  const id = randomUUID();
  const [notification] = await prisma.$queryRaw<
    Array<{ id: string; type: "FOLLOW"; readAt: Date | null; createdAt: Date }>
  >`
    INSERT INTO "Notification" (id, "userId", "actorId", type)
    VALUES (${id}, ${userId}, ${actorId}, CAST('FOLLOW' AS "NotificationType"))
    RETURNING id, type, "readAt", "createdAt"
  `;

  return notification ?? null;
}

export async function removeUnreadFollowNotification(
  userId: string,
  actorId: string,
) {
  await prisma.$executeRaw`
    DELETE FROM "Notification"
    WHERE "userId" = ${userId}
      AND "actorId" = ${actorId}
      AND type = CAST('FOLLOW' AS "NotificationType")
      AND "readAt" IS NULL
  `;
}

export async function getUnreadSocialNotificationCount(userId: string) {
  const [row] = await prisma.$queryRaw<Array<{ count: number | bigint }>>`
    SELECT COUNT(*) AS count
    FROM "Notification"
    WHERE "userId" = ${userId}
      AND "readAt" IS NULL
  `;

  return Number(row?.count ?? 0);
}

export async function getNotificationsForUser(
  userId: string,
): Promise<NotificationRecord[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      type: "FOLLOW";
      readAt: Date | null;
      createdAt: Date;
      actorId: string | null;
      actorName: string | null;
      actorUsername: string | null;
      actorImage: string | null;
      actorAvatarUrl: string | null;
      actorPublicId: string | null;
    }>
  >`
    SELECT
      n.id,
      n.type,
      n."readAt",
      n."createdAt",
      u.id AS "actorId",
      u.name AS "actorName",
      u.username AS "actorUsername",
      COALESCE(u."avatarUrl", u.image) AS "actorImage",
      u."avatarUrl" AS "actorAvatarUrl",
      u."publicId" AS "actorPublicId"
    FROM "Notification" n
    LEFT JOIN "User" u ON u.id = n."actorId"
    WHERE n."userId" = ${userId}
    ORDER BY n."createdAt" DESC
    LIMIT 50
  `;

  return rows.map((row): NotificationRecord => ({
    id: row.id,
    type: row.type,
    readAt: row.readAt,
    createdAt: row.createdAt,
    actor: row.actorId && row.actorPublicId
      ? {
          id: row.actorId,
          name: row.actorName,
          username: row.actorUsername,
          image: row.actorImage,
          avatarUrl: row.actorAvatarUrl,
          publicId: row.actorPublicId,
        }
      : null,
  }));
}

export async function markNotificationsRead(userId: string) {
  await prisma.$executeRaw`
    UPDATE "Notification"
    SET "readAt" = NOW()
    WHERE "userId" = ${userId}
      AND "readAt" IS NULL
  `;
}
