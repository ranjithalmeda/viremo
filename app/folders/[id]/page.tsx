import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { FolderDetailClient } from "@/src/components/folder-detail-client";
import { authOptions } from "@/src/lib/auth";
import { getFolderForUser } from "@/src/lib/data";

type FolderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FolderPage({ params }: FolderPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const folder = await getFolderForUser(session.user.id, id);

  if (!folder) {
    notFound();
  }

  const initialFolder = {
    id: folder.id,
    name: folder.name,
    isPublic: folder.isPublic,
    entryCount: folder._count.entries,
    entries: folder.entries.map((folderEntry) => ({
      id: folderEntry.id,
      entryId: folderEntry.entryId,
      addedAt: folderEntry.addedAt.toISOString(),
      entry: {
        ...folderEntry.entry,
        createdAt: folderEntry.entry.createdAt.toISOString(),
        updatedAt: folderEntry.entry.updatedAt.toISOString(),
      },
    })),
  };

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FolderDetailClient initialFolder={initialFolder} />
      </div>
    </div>
  );
}
