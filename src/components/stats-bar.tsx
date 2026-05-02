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
      label: "Finished",
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
        <div
          key={stat.label}
          className="glass rounded-[1.6rem] border border-white/8 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            {stat.label}
          </p>
          <p className="theme-heading mt-3 text-4xl font-semibold tracking-[-0.04em]">
            {stat.value}
          </p>
          <div className="mt-4 h-1.5 rounded-full bg-[var(--border)]">
            <div className="h-full w-2/3 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-strong))]" />
          </div>
        </div>
      ))}
    </section>
  );
}
