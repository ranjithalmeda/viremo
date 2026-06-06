import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { DashboardClient } from "@/src/components/dashboard-client";
import { authOptions } from "@/src/lib/auth";
import {
  getEntriesForUser,
  getPreferencesForUser,
  type EntryRecord,
} from "@/src/lib/data";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [entries, preferences] = await Promise.all([
    getEntriesForUser(session.user.id),
    getPreferencesForUser(session.user.id),
  ]);
  const initialEntries = entries.map((entry: EntryRecord) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <DashboardClient
        initialEntries={initialEntries}
        preferences={preferences}
        profile={{
          publicId: session.user.publicId ?? null,
          username: session.user.username ?? null,
          name: session.user.name ?? null,
        }}
      />
    </div>
  );
}
