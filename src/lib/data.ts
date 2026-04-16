import { prisma } from "@/src/lib/prisma";

export async function getEntriesForUser(userId: string) {
  return prisma.entry.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublicProfile(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      image: true,
      username: true,
      createdAt: true,
      entries: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}
