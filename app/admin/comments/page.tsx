import { AdminDeleteButton } from "@/src/components/admin/admin-delete-button";
import { getAdminComments, type AdminComment } from "@/src/lib/admin-data";
import { requireAdminPage } from "@/src/lib/admin";

function displayUser(user: { name: string | null; username: string | null; publicId: string }) {
  return user.name || user.username || user.publicId;
}

function renderComment(comment: AdminComment) {
  return (
    <article
      key={comment.id}
      className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {displayUser(comment.author)} on {displayUser(comment.profileUser)}
            {"'"}s profile
          </p>
          <p className="mt-3 text-base leading-7 text-slate-800">
            {comment.content}
          </p>
        </div>
        <AdminDeleteButton
          endpoint={`/api/admin/comments/${comment.id}`}
          confirmMessage="Delete this profile comment?"
        />
      </div>
    </article>
  );
}

export default async function AdminCommentsPage() {
  await requireAdminPage();
  const comments: AdminComment[] = await getAdminComments();

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            Comments
          </h1>
        </div>

        <div className="space-y-4">
          {comments.map(renderComment)}
          {!comments.length ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-10 text-center text-slate-600">
              No comments found.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
