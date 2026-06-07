import Link from "next/link";

import { UserAvatar } from "@/src/components/user-avatar";
import type { SocialUser } from "@/src/lib/data";

type SocialUserListProps = {
  title: string;
  subtitle: string;
  users: Array<SocialUser & { followedAt: Date }>;
  emptyMessage: string;
};

function displayName(user: SocialUser) {
  return user.name || user.username || user.publicId;
}

export function SocialUserList({
  title,
  subtitle,
  users,
  emptyMessage,
}: SocialUserListProps) {
  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Social
          </p>
          <h1 className="mt-3 text-4xl font-bold text-[var(--foreground-strong)] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-[var(--muted)]">{subtitle}</p>
        </div>

        {users.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.publicId}`}
                className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <UserAvatar
                    name={user.name}
                    username={user.username}
                    publicId={user.publicId}
                    image={user.image}
                    avatarUrl={user.avatarUrl}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold text-[var(--foreground-strong)]">
                      {displayName(user)}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      @{user.username || user.publicId}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[var(--accent)] bg-[var(--surface)] p-10 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[rgba(200,168,233,0.22)] text-2xl font-black text-[var(--accent)]">
              U
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[var(--foreground-strong)]">
              {title.toLowerCase().includes("following")
                ? "You're not following anyone yet"
                : emptyMessage}
            </h2>
            <Link
              href="/search"
              className="theme-button-primary mt-6 inline-flex rounded-full px-5 py-3 text-sm font-bold"
            >
              Find users
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
