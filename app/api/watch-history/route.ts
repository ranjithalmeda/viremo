import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";

import { authOptions } from "@/src/lib/auth";
import {
  addWatchHistoryEntry,
  getWatchHistoryForUser,
  getWatchHistoryForDate,
} from "@/src/lib/data";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  try {
    if (date) {
      // Get watch history for a specific date
      const watchedDate = new Date(date);
      const history = await getWatchHistoryForDate(
        session.user.id,
        watchedDate,
      );
      return NextResponse.json({ history });
    }

    if (from && to) {
      // Get watch history for a date range
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const history = await getWatchHistoryForUser(
        session.user.id,
        fromDate,
        toDate,
      );

      // Group by date and count
      const grouped = history.reduce(
        (acc, item) => {
          const key = format(item.watchedAt, "yyyy-MM-dd");
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        },
        {} as Record<string, (typeof history)>,
      );

      return NextResponse.json({
        history,
        grouped,
      });
    }

    return NextResponse.json(
      { error: "Missing date parameters" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Watch history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch watch history" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { entryId, watchedAt, note } = await request.json();

    if (!entryId || typeof entryId !== "string") {
      return NextResponse.json(
        { error: "entryId is required" },
        { status: 400 },
      );
    }

    if (!watchedAt || typeof watchedAt !== "string") {
      return NextResponse.json(
        { error: "watchedAt is required" },
        { status: 400 },
      );
    }

    const watchedDate = new Date(watchedAt);
    if (Number.isNaN(watchedDate.getTime())) {
      return NextResponse.json(
        { error: "watchedAt must be a valid date" },
        { status: 400 },
      );
    }

    const entry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 },
      );
    }

    const history = await addWatchHistoryEntry(
      session.user.id,
      entryId,
      watchedDate,
      typeof note === "string" && note.trim() ? note.trim() : undefined,
    );

    return NextResponse.json({ history }, { status: 201 });
  } catch (error) {
    console.error("Watch history create error:", error);
    return NextResponse.json(
      { error: "Failed to log watch history" },
      { status: 500 },
    );
  }
}
