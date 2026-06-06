import type { TicketCategory } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { createTicketForUser, getTicketsForUser } from "@/src/lib/admin-data";

const ticketCategories = new Set<TicketCategory>([
  "BUG",
  "INAPPROPRIATE_CONTENT",
  "ACCOUNT_ISSUE",
  "OTHER",
]);

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await getTicketsForUser(session.user.id);
  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const reportedUser =
    typeof body.reportedUser === "string" ? body.reportedUser.trim() : "";
  const category = ticketCategories.has(body.category) ? body.category : null;

  if (!subject || !description || !category) {
    return NextResponse.json(
      { error: "Subject, category, and description are required" },
      { status: 400 },
    );
  }

  if (subject.length > 160 || description.length > 4000 || reportedUser.length > 80) {
    return NextResponse.json(
      { error: "Ticket fields are too long" },
      { status: 400 },
    );
  }

  const ticket = await createTicketForUser(session.user.id, {
    subject,
    category,
    description,
    reportedUser,
  });

  return NextResponse.json({ ticket }, { status: 201 });
}
