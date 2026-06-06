import type { Role, TicketCategory, TicketStatus } from "@prisma/client";

import { prisma } from "@/src/lib/prisma";

export async function getAdminStats() {
  const [totalUsers, totalEntries, totalMessages, totalTickets, recentSignups] =
    await Promise.all([
      prisma.user.count(),
      prisma.entry.count(),
      prisma.directMessage.count(),
      prisma.ticket.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
          role: true,
          isBanned: true,
          createdAt: true,
        },
      }),
    ]);

  return {
    totals: {
      users: totalUsers,
      entries: totalEntries,
      messages: totalMessages,
      tickets: totalTickets,
    },
    recentSignups,
  };
}

export async function getAdminUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      role: true,
      isBanned: true,
      createdAt: true,
      _count: {
        select: {
          entries: true,
          sentMessages: true,
          receivedMessages: true,
          tickets: true,
        },
      },
    },
  });
}

export async function updateAdminUser(
  userId: string,
  data: {
    role?: Role;
    isBanned?: boolean;
  },
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      role: true,
      isBanned: true,
    },
  });
}

export async function deleteAdminUser(userId: string) {
  return prisma.user.delete({
    where: { id: userId },
    select: { id: true },
  });
}

export async function getAdminEntries() {
  return prisma.entry.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          publicId: true,
        },
      },
    },
  });
}

export async function deleteAdminEntry(entryId: string) {
  return prisma.entry.delete({
    where: { id: entryId },
    select: { id: true },
  });
}

export async function getAdminComments() {
  return prisma.profileComment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profileUser: {
        select: { id: true, name: true, username: true, publicId: true },
      },
      author: {
        select: { id: true, name: true, username: true, publicId: true },
      },
    },
  });
}

export async function deleteAdminComment(commentId: string) {
  return prisma.profileComment.delete({
    where: { id: commentId },
    select: { id: true },
  });
}

export async function getAdminTickets() {
  return prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          publicId: true,
        },
      },
    },
  });
}

export async function updateAdminTicket(
  ticketId: string,
  data: {
    status?: TicketStatus;
    adminReply?: string | null;
  },
) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          publicId: true,
        },
      },
    },
  });
}

export async function getTicketsForUser(userId: string) {
  return prisma.ticket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTicketForUser(
  userId: string,
  data: {
    subject: string;
    category: TicketCategory;
    description: string;
    reportedUser?: string | null;
  },
) {
  return prisma.ticket.create({
    data: {
      userId,
      subject: data.subject,
      category: data.category,
      description: data.description,
      reportedUser: data.reportedUser || null,
    },
  });
}
