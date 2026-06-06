import { AdminDeleteButton } from "@/src/components/admin/admin-delete-button";
import { AdminUserActions } from "@/src/components/admin/admin-user-actions";
import { getAdminUsers } from "@/src/lib/admin-data";
import { requireAdminPage } from "@/src/lib/admin";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export default async function AdminUsersPage() {
  await requireAdminPage();
  const users = await getAdminUsers();

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            Users
          </h1>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/95 shadow-sm">
          <div className="grid gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 lg:grid-cols-[1.6fr_1.2fr_0.8fr_1fr_1.4fr]">
            <span>User</span>
            <span>Email</span>
            <span>Joined</span>
            <span>Role</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-slate-200">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid gap-4 px-5 py-5 lg:grid-cols-[1.6fr_1.2fr_0.8fr_1fr_1.4fr]"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {user.name || user.username || "Unnamed user"}
                  </p>
                  <p className="text-sm text-slate-500">
                    @{user.username || "no-username"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {user._count.entries} entries ·{" "}
                    {user._count.sentMessages + user._count.receivedMessages} messages ·{" "}
                    {user._count.tickets} tickets
                  </p>
                </div>
                <p className="break-all text-sm text-slate-600">
                  {user.email || "No email"}
                </p>
                <p className="text-sm text-slate-600">
                  {formatDate(user.createdAt)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {user.role}
                  </span>
                  {user.isBanned ? (
                    <span className="h-fit rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                      Banned
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3">
                  <AdminUserActions
                    userId={user.id}
                    role={user.role}
                    isBanned={user.isBanned}
                  />
                  <AdminDeleteButton
                    endpoint={`/api/admin/users/${user.id}`}
                    confirmMessage="Delete this user and all their data?"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
