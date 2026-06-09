import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { PersonalizedDiarySections } from "@/src/components/personalized-diary-sections";
import { ProfileSocialPanel } from "@/src/components/profile-social-panel";
import { StatsBar } from "@/src/components/stats-bar";
import { UserAvatar } from "@/src/components/user-avatar";
import { authOptions } from "@/src/lib/auth";
import {
  getProfileSocialSummary,
  getPublicProfile,
  type EntryRecord,
  type ProfileCommentRecord,
} from "@/src/lib/data";
import { formatRating } from "@/src/lib/watchlist";
import {
  getPreferenceStyle,
  normalizePreferences,
} from "@/src/lib/preferences";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

type ProfileFolderEntryRecord = {
  id: string;
  entry: EntryRecord;
};

type SerializedEntryRecord = Omit<EntryRecord, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type ProfileFolderRecord = {
  id: string;
  name: string;
  entries: ProfileFolderEntryRecord[];
};

type SerializedProfileFolderEntry = {
  id: string;
  entry: SerializedEntryRecord;
};

type SerializedProfileFolder = {
  id: string;
  name: string;
  entryCount: number;
  entries: SerializedProfileFolderEntry[];
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username: identifier } = await params;
  const [profile, session] = await Promise.all([
    getPublicProfile(identifier),
    getServerSession(authOptions),
  ]);

  if (!profile) {
    notFound();
  }

  const entries = profile.entries.map((entry: EntryRecord) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));
  const preferences = normalizePreferences(profile.preferences);
  const preferenceStyle = getPreferenceStyle(preferences);
  const social = await getProfileSocialSummary(
    profile.id,
    session?.user?.id ?? null,
  );
  const comments = profile.comments.map((comment: ProfileCommentRecord) => ({
    ...comment,
    createdAt: comment.createdAt.toISOString(),
  }));
  const folders: SerializedProfileFolder[] = profile.folders.map((folder: ProfileFolderRecord) => ({
    id: folder.id,
    name: folder.name,
    entryCount: folder.entries.length,
    entries: folder.entries.map((folderEntry: ProfileFolderEntryRecord) => ({
      id: folderEntry.id,
      entry: {
        ...folderEntry.entry,
        createdAt: folderEntry.entry.createdAt.toISOString(),
        updatedAt: folderEntry.entry.updatedAt.toISOString(),
      },
    })),
  }));
  const memberSince = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(profile.createdAt);

  return (
    <div style={preferenceStyle} className="mobile-font-scale shell py-16 sm:py-20">
      <section className="space-y-10">
        <div className="glass-strong rounded-[2rem] border border-[var(--profile-border)] bg-[var(--profile-surface)] p-8 text-[var(--profile-text)] shadow-xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
            <div
              className="rounded-[2rem] p-8 text-white shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--profile-accent), rgba(15, 23, 42, 0.96))",
              }}
            >
              <UserAvatar
                name={profile.name}
                username={profile.username}
                publicId={profile.publicId}
                image={profile.image}
                avatarUrl={profile.avatarUrl}
                size="xl"
                className="bg-white/10 text-white"
              />
              <p className="mt-8 text-sm uppercase tracking-[0.24em] text-white/75">Public profile</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">
                {profile.name || "Anonymous watcher"}
              </h1>
              <p className="mt-2 text-sm text-white/75">@{profile.username}</p>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--profile-muted)]">About this shelf</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--profile-text)]">
                  A curated view of what matters to this watcher.
                </p>
              </div>
              <p className="max-w-2xl text-base leading-7 text-[var(--profile-muted)]">
                {profile.bio ||
                  "Browse public entries, discover the story behind each watch, and see how this profile organizes movies, series, and anime."}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-[var(--profile-border)] bg-[var(--profile-surface-soft)] p-4">
                  <p className="text-3xl font-semibold text-[var(--profile-text)]">{entries.length}</p>
                  <p className="mt-1 text-sm text-[var(--profile-muted)]">Public titles</p>
                </div>
                <div className="rounded-3xl border border-[var(--profile-border)] bg-[var(--profile-surface-soft)] p-4">
                  <p className="text-3xl font-semibold text-[var(--profile-text)]">{memberSince}</p>
                  <p className="mt-1 text-sm text-[var(--profile-muted)]">Member since</p>
                </div>
                <div className="rounded-3xl border border-[var(--profile-border)] bg-[var(--profile-surface-soft)] p-4">
                  <p className="text-3xl font-semibold text-[var(--profile-text)]">{profile.publicId}</p>
                  <p className="mt-1 text-sm text-[var(--profile-muted)]">Share ID</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <StatsBar entries={entries} />

        <ProfileSocialPanel
          profileUser={{
            id: profile.id,
            name: profile.name,
            username: profile.username,
            image: profile.image,
            avatarUrl: profile.avatarUrl,
            publicId: profile.publicId,
          }}
          viewerId={session?.user?.id ?? null}
          isOwner={session?.user?.id === profile.id}
          initialSocial={social}
          initialComments={comments}
        />

        {entries.length ? (
          <PersonalizedDiarySections
            entries={entries}
            preferences={preferences}
            publicView
          />
        ) : (
          <div className="glass rounded-[2rem] border border-slate-200/70 bg-white/95 p-10 text-center text-base text-slate-700 shadow-sm">
            This profile is set up, but there are no public entries yet.
          </div>
        )}

        {folders.length ? (
          <section className="space-y-5">
            <div>
              <p className="theme-muted text-sm uppercase tracking-[0.18em]">
                Public folders
              </p>
              <h2 className="theme-heading mt-2 text-3xl font-semibold">
                Curated collections
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {folders.map((folder: SerializedProfileFolder) => (
                <Link
                  key={folder.id}
                  href={`/profile/${profile.username || profile.publicId}/folders/${folder.id}`}
                  className="glass rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-950">
                        {folder.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {folder.entryCount} entries
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Public
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {folder.entries.slice(0, 4).map((item: SerializedProfileFolderEntry) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">
                            {item.entry.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.entry.type}
                          </p>
                        </div>
                        {item.entry.rating ? (
                          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                            {formatRating(item.entry.rating)}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

      </section>
    </div>
  );
}
