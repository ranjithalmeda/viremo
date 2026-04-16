"use client";

import type { EntryRecord } from "@/src/lib/watchlist";

export function StatsBar({ entries }: { entries: EntryRecord[] }) {
  const ratedEntries = entries.filter((entry) => typeof entry.rating === "number");
  const averageRating = ratedEntries.length
    ? (
        ratedEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) /
        ratedEntries.length
      ).toFixed(1)
    : "0.0";

  const stats = [
    { label: "Total titles", value: entries.length },
    {
      label: "Completed",
      value: entries.filter((entry) => entry.status === "COMPLETED").length,
    },
    {
      label: "Watching",
      value: entries.filter((entry) => entry.status === "WATCHING").length,
    },
    { label: "Avg. rating", value: averageRating },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass rounded-[1.4rem] p-5">
          <p className="text-sm text-slate-500">{stat.label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {stat.value}
          </p>
        </div>
      ))}
    </section>
  );
}
