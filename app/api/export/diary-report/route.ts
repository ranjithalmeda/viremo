import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { getEntriesForUser } from "@/src/lib/data";
import { generateDiaryReportPdf } from "@/src/lib/diary-report-pdf";

function filenameDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const generatedAt = new Date();
  const entries = await getEntriesForUser(session.user.id);
  const userLabel =
    session.user.name ||
    session.user.username ||
    session.user.email ||
    session.user.publicId ||
    "Viremo user";
  const pdf = generateDiaryReportPdf({
    entries,
    userLabel,
    generatedAt,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="viremo-diary-report-${filenameDate(generatedAt)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
