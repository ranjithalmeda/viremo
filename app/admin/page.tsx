import Link from "next/link";

import { AdminAiLimitForm } from "@/src/components/admin/admin-ai-limit-form";
import { getProDailyAiLimit } from "@/src/lib/ai-limits";
import { getAdminStats } from "@/src/lib/admin-data";
import { requireAdminPage } from "@/src/lib/admin";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export default async function AdminPage() {
  await requireAdminPage();
  const [stats, aiLimit] = await Promise.all([
    getAdminStats(),
    getProDailyAiLimit(),
  ]);

  const statCards = [
    { label: "Users", value: stats.totals.users, href: "/admin/users" },
    { label: "Entries", value: stats.totals.entries, href: "/admin/entries" },
    { label: "Messages", value: stats.totals.messages, href: "/messages" },
    { label: "Tickets", value: stats.totals.tickets, href: "/admin/tickets" },
  ];

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            Overview
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Monitor the app, moderate content, and handle user support.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                {card.label}
              </p>
              <p className="mt-4 text-4xl font-black text-slate-950">
                {card.value}
              </p>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {[
            ["/admin/users", "Manage Users"],
            ["/admin/entries", "Moderate Entries"],
            ["/admin/comments", "Moderate Comments"],
            ["/admin/tickets", "Support Tickets"],
            ["/admin/help", "Help Articles"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="theme-button-secondary rounded-2xl px-5 py-4 text-center text-sm font-bold"
            >
              {label}
            </Link>
          ))}
        </div>

        <AdminAiLimitForm initialLimit={aiLimit} />

        <section className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">Recent signups</h2>
          <div className="mt-5 divide-y divide-slate-200">
            {stats.recentSignups.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {user.name || user.username || user.email || "Unnamed user"}
                  </p>
                  <p className="text-sm text-slate-500">
                    @{user.username || "no-username"} · {user.email || "No email"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {user.role}
                  </span>
                  {user.isBanned ? (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                      Banned
                    </span>
                  ) : null}
                  <p className="text-sm text-slate-500">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
