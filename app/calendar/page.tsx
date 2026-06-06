import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/src/lib/auth";
import { WatchCalendarClient } from "@/src/components/watch-calendar-client";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-950 mb-2">
            Watch Calendar
          </h1>
          <p className="text-lg text-slate-600">
            Explore your viewing history month by month. Click any date to see what you watched or log a new entry.
          </p>
        </div>

        <WatchCalendarClient />
      </div>
    </div>
  );
}
