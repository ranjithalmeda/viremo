import { notFound } from "next/navigation";

import { EntryCard } from "@/src/components/entry-card";
import { StatsBar } from "@/src/components/stats-bar";
import { getPublicProfile } from "@/src/lib/data";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username: identifier } = await params;
  const profile = await getPublicProfile(identifier);

  if (!profile) {
    notFound();
  }

  const entries = profile.entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));
  const memberSince = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(profile.createdAt);

  return (
    <div className="shell py-16 sm:py-20">
      <section className="space-y-10">
        <div className="glass-strong rounded-[2rem] border border-slate-200/70 bg-white/95 p-8 shadow-xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
            <div className="rounded-[2rem] bg-gradient-to-br from-violet-600 to-blue-600 p-8 text-white shadow-lg">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.8rem] bg-white/10 text-4xl font-bold text-white">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name || profile.username || "Profile avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (profile.name || profile.username || "W").charAt(0).toUpperCase()
                )}
              </div>
              <p className="mt-8 text-sm uppercase tracking-[0.24em] text-violet-100/80">Public profile</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">
                {profile.name || "Anonymous watcher"}
              </h1>
              <p className="mt-2 text-sm text-violet-100/80">@{profile.username}</p>
            </div>

            <div className="space-y-5">
              <div>
                <p className="theme-muted text-sm uppercase tracking-[0.18em]">About this shelf</p>
                <p className="theme-heading mt-3 text-3xl font-semibold">
                  A curated view of what matters to this watcher.
                </p>
              </div>
              <p className="theme-muted max-w-2xl text-base leading-7">
                Browse public entries, discover the story behind each watch, and
                see how this profile organizes movies, series, and anime.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-3xl font-semibold text-slate-900">{entries.length}</p>
                  <p className="mt-1 text-sm text-slate-600">Public titles</p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-3xl font-semibold text-slate-900">{memberSince}</p>
                  <p className="mt-1 text-sm text-slate-600">Member since</p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-3xl font-semibold text-slate-900">{profile.publicId}</p>
                  <p className="mt-1 text-sm text-slate-600">Share ID</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <StatsBar entries={entries} />

        {entries.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-[2rem] border border-slate-200/70 bg-white/95 p-10 text-center text-base text-slate-700 shadow-sm">
            This profile is set up, but there are no public entries yet.
          </div>
        )}
      </section>
    </div>
  );
}
