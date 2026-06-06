import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { FoldersClient } from "@/src/components/folders-client";
import { authOptions } from "@/src/lib/auth";
import { getFoldersForUser } from "@/src/lib/data";

export default async function FoldersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const folders = await getFoldersForUser(session.user.id);
  const initialFolders = folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    isPublic: folder.isPublic,
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
    entryCount: folder._count.entries,
  }));

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Collections
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            Folders
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Group your diary into custom shelves like comfort shows, crime
            thrillers, yearly completions, or top anime lists.
          </p>
        </div>

        <FoldersClient initialFolders={initialFolders} />
      </div>
    </div>
  );
}
