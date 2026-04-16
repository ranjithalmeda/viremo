import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/src/lib/auth";
import { parseEntryPayload } from "@/src/lib/entry-payload";
import { prisma } from "@/src/lib/prisma";

type EntryRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: EntryRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.entry.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }

  const body = await request.json();
  const parsed = parseEntryPayload(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updated = await prisma.entry.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: EntryRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.entry.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }

  await prisma.entry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
