import type { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/admin";
import { deleteAdminUser, updateAdminUser } from "@/src/lib/admin-data";

type AdminUserRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: AdminUserRouteContext) {
  const { session, response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const body = await request.json();
  const data: { role?: Role; isBanned?: boolean } = {};

  if (body.role === "USER" || body.role === "PRO" || body.role === "ADMIN") {
    data.role = body.role;
  }

  if (typeof body.isBanned === "boolean") {
    data.isBanned = body.isBanned;
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "No valid changes supplied" }, { status: 400 });
  }

  if (session?.user?.id === id && (data.isBanned || (data.role && data.role !== "ADMIN"))) {
    return NextResponse.json(
      { error: "You cannot ban or demote your own admin account" },
      { status: 400 },
    );
  }

  try {
    const user = await updateAdminUser(id, data);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}

export async function DELETE(_: Request, context: AdminUserRouteContext) {
  const { session, response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await context.params;

  if (session?.user?.id === id) {
    return NextResponse.json(
      { error: "You cannot delete your own admin account" },
      { status: 400 },
    );
  }

  try {
    await deleteAdminUser(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
