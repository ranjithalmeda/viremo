import Link from "next/link";
import { notFound } from "next/navigation";

import { UserAvatar } from "@/src/components/user-avatar";
import { getPublicFolderForProfile } from "@/src/lib/data";
import { formatRating } from "@/src/lib/watchlist";

type PublicFolderPageProps = {
  params: Promise<{
    username: string;
    folderId: string;
  }>;
};

function ownerLabel(user: {
  name: string | null;
  username: string | null;
  publicId: string;
}) {
  return user.name || user.username || user.publicId;
}

export default async function PublicProfileFolderPage({
  params,
}: PublicFolderPageProps) {
  const { username, folderId } = await params;
  const folder = await getPublicFolderForProfile(username, folderId);

  if (!folder) {
    notFound();
  }

  const profileHref = `/profile/${folder.user.username || folder.user.publicId}`;

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={profileHref}
            className="theme-button-secondary rounded-full px-5 py-3 text-sm font-semibold"
          >
            Back to profile
          </Link>
          <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Public folder
          </span>
        </div>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm sm:p-8">
          <Link href={profileHref} className="inline-flex items-center gap-4 hover:underline">
            <UserAvatar
              name={folder.user.name}
              username={folder.user.username}
              publicId={folder.user.publicId}
              image={folder.user.image}
              avatarUrl={folder.user.avatarUrl}
              size="lg"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                @{folder.user.username || folder.user.publicId}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-950">
                {ownerLabel(folder.user)}
              </p>
            </div>
          </Link>

          <h1 className="mt-8 text-4xl font-bold text-slate-950 sm:text-5xl">
            {folder.name}
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            {folder.entries.length} public entries in this collection.
          </p>
        </section>

        {folder.entries.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {folder.entries.map((item) => {
              const entry = item.entry;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/95 shadow-sm"
                >
                  <div className="aspect-[2/3] bg-slate-100">
                    {entry.poster ? (
                      <img
                        src={entry.poster}
                        alt={entry.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-6 text-center text-xl font-bold text-slate-400">
                        {entry.title}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {entry.type}
                      </span>
                      {entry.rating ? (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                          {formatRating(entry.rating)}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-slate-950">
                      {entry.title}
                    </h2>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-10 text-center text-slate-600">
            This public folder has no entries yet.
          </div>
        )}
      </div>
    </div>
  );
}
