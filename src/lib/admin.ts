import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isBanned: true },
  });

  if (!user || user.isBanned || user.role !== "ADMIN") {
    return null;
  }

  return session;
}

export async function requireAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isBanned: true },
  });

  if (!user || user.isBanned || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}

export async function requireAdminApi() {
  const session = await getAdminSession();

  if (!session?.user?.id) {
    return {
      session: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    session,
    response: null,
  };
}
