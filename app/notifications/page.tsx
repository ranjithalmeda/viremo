import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { UserAvatar } from "@/src/components/user-avatar";
import { authOptions } from "@/src/lib/auth";
import {
  getNotificationsForUser,
  markNotificationsRead,
  type SocialUser,
} from "@/src/lib/data";

function displayName(user: SocialUser) {
  return user.name || user.username || user.publicId;
}

function formatTimestamp(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await getNotificationsForUser(session.user.id);
  await markNotificationsRead(session.user.id);

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Activity
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            Notifications
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            New followers and social activity appear here.
          </p>
        </div>

        {notifications.length ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const actor = notification.actor;
              const href = actor ? `/profile/${actor.username || actor.publicId}` : "/followers";

              return (
                <Link
                  key={notification.id}
                  href={href}
                  className="block rounded-[2rem] border border-slate-200/70 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      name={actor?.name}
                      username={actor?.username}
                      publicId={actor?.publicId || "N"}
                      image={actor?.image}
                      avatarUrl={actor?.avatarUrl}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-base text-slate-700">
                        <span className="font-semibold text-slate-950">
                          {actor ? displayName(actor) : "Someone"}
                        </span>{" "}
                        started following you.
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.readAt ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-10 text-center text-slate-600">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}
