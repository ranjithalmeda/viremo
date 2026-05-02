import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/src/lib/auth";
import { getEntriesForUser } from "@/src/lib/data";
import { parseEntryPayload } from "@/src/lib/entry-payload";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await getEntriesForUser(session.user.id);
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = parseEntryPayload(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const entry = await prisma.entry.create({
      data: {
        user: { connect: { id: session.user.id } },
        ...parsed.data,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create entry. Please try again later.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
