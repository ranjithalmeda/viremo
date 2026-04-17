import { prisma } from "@/src/lib/prisma";

export async function getEntriesForUser(userId: string) {
  return prisma.entry.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublicProfile(identifier: string) {
  return prisma.user.findFirst({
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
    },
  });
}
