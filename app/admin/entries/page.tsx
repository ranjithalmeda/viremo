import { AdminDeleteButton } from "@/src/components/admin/admin-delete-button";
import { getAdminEntries } from "@/src/lib/admin-data";
import { requireAdminPage } from "@/src/lib/admin";

function displayOwner(entry: Awaited<ReturnType<typeof getAdminEntries>>[number]) {
  return entry.user.name || entry.user.username || entry.user.email || entry.user.publicId;
}

export default async function AdminEntriesPage() {
  await requireAdminPage();
  const entries = await getAdminEntries();

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            Entries
          </h1>
        </div>

        <div className="grid gap-4">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-950">
                      {entry.title}
                    </h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {entry.type}
                    </span>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                      {entry.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Owner: {displayOwner(entry)}
                  </p>
                  {entry.notes ? (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                      {entry.notes}
                    </p>
                  ) : null}
                </div>
                <AdminDeleteButton
                  endpoint={`/api/admin/entries/${entry.id}`}
                  confirmMessage="Delete this diary entry?"
                />
              </div>
            </article>
          ))}
          {!entries.length ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-10 text-center text-slate-600">
              No entries found.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
