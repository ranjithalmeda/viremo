import Link from "next/link";
import { getServerSession } from "next-auth";

import { CommunityCreateForm } from "@/src/components/community-create-form";
import { UserAvatar } from "@/src/components/user-avatar";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { formatType, type EntryTypeValue } from "@/src/lib/watchlist";

type CommunityPageProps = {
  searchParams: Promise<{ category?: string }>;
};

const categories: EntryTypeValue[] = ["MOVIE", "SERIES", "ANIME", "BOOK"];

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const [{ category }, session] = await Promise.all([
    searchParams,
    getServerSession(authOptions),
  ]);
  const activeCategory = categories.includes(category as EntryTypeValue)
    ? (category as EntryTypeValue)
    : null;
  const posts = await prisma.communityPost.findMany({
    where: activeCategory ? { category: activeCategory } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          publicId: true,
          image: true,
          avatarUrl: true,
        },
      },
      _count: { select: { replies: true } },
    },
  });

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Community
          </p>
          <h1 className="mt-3 text-4xl font-bold text-[var(--foreground-strong)] sm:text-5xl">
            Recommendation requests
          </h1>
        </div>

        {session?.user?.id ? <CommunityCreateForm /> : null}

        <div className="flex flex-wrap gap-2">
          <Link
            href="/community"
            className={`rounded-full px-4 py-2 text-sm font-bold ${!activeCategory ? "theme-button-primary" : "theme-button-secondary"}`}
          >
            All
          </Link>
          {categories.map((item) => (
            <Link
              key={item}
              href={`/community?category=${item}`}
              className={`rounded-full px-4 py-2 text-sm font-bold ${activeCategory === item ? "theme-button-primary" : "theme-button-secondary"}`}
            >
              {formatType(item)}
            </Link>
          ))}
        </div>

        <div className="grid gap-5">
          {posts.map((post) => {
            const profileHref = `/profile/${post.user.username || post.user.publicId}`;

            return (
            <article
              key={post.id}
              className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.65)] hover:shadow-lg"
            >
              <Link href={profileHref} className="flex w-fit items-center gap-3 hover:underline">
                <UserAvatar {...post.user} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                    {post.user.name || post.user.username || post.user.publicId}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {post.createdAt.toLocaleString()}
                  </p>
                </div>
              </Link>
              <Link
                href={`/community/${post.id}`}
                className="mt-4 block text-2xl font-bold text-[var(--foreground-strong)] hover:text-[var(--accent)] hover:underline"
              >
                {post.title}
              </Link>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                {post.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[rgba(212,175,55,0.18)] px-3 py-1 text-xs font-bold text-[var(--accent-gold)]">
                  {formatType(post.category)}
                </span>
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
                  {post._count.replies} replies
                </span>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
