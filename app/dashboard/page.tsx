import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { DashboardClient } from "@/src/components/dashboard-client";
import { authOptions } from "@/src/lib/auth";
import { getEntriesForUser } from "@/src/lib/data";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const entries = await getEntriesForUser(session.user.id);
  const initialEntries = entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));

  return (
    <div className="shell py-10 sm:py-14">
      <DashboardClient
        initialEntries={initialEntries}
        profile={{
          publicId: session.user.publicId ?? null,
          username: session.user.username ?? null,
          name: session.user.name ?? null,
        }}
      />
    </div>
  );
}
