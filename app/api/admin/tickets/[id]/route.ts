import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/admin";
import { updateAdminTicket } from "@/src/lib/admin-data";
import type { TicketStatus } from "@/src/lib/domain-types";

const ticketStatuses = new Set<TicketStatus>([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
]);

type AdminTicketRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: AdminTicketRouteContext) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const body = await request.json();
  const data: { status?: TicketStatus; adminReply?: string | null } = {};

  if (ticketStatuses.has(body.status)) {
    data.status = body.status;
  }

  if (typeof body.adminReply === "string") {
    data.adminReply = body.adminReply.trim() || null;
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "No valid changes supplied" }, { status: 400 });
  }

  try {
    const ticket = await updateAdminTicket(id, data);
    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
}
