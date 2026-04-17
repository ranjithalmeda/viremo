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
    <div className="shell py-10 sm:py-14">
      <section className="space-y-8">
        <div className="glass-strong rounded-[2rem] p-8 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.8rem] bg-[linear-gradient(160deg,#11365f_0%,#1e6bb8_55%,#0f766e_100%)] text-3xl font-bold text-white">
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
            <div>
              <p className="pill w-fit text-sky-900">Public profile</p>
              <h1 className="mt-4 text-4xl font-semibold text-slate-950">
                {profile.name || "Anonymous watcher"}
              </h1>
              <p className="mt-2 text-base text-slate-500">@{profile.username}</p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                A shareable shelf of completed favorites, current watches, and
                everything in between.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <div className="pill text-slate-700">
                  Share ID {profile.publicId}
                </div>
                <div className="pill text-slate-700">
                  {entries.length} {entries.length === 1 ? "title" : "titles"}
                </div>
                <div className="pill text-slate-700">
                  Member since {memberSince}
                </div>
              </div>
            </div>
          </div>
        </div>

        <StatsBar entries={entries} />

        {entries.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-[2rem] p-10 text-center text-base text-slate-600">
            This profile is set up, but there are no public entries yet.
          </div>
        )}
      </section>
    </div>
  );
}
