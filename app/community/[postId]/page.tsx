import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import {
  CommunityReplyActions,
  CommunityReplyPanel,
} from "@/src/components/community-reply-panel";
import { UserAvatar } from "@/src/components/user-avatar";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { formatType } from "@/src/lib/watchlist";

type CommunityPostPageProps = {
  params: Promise<{ postId: string }>;
};

function youtubeEmbedUrl(url: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const id =
      parsed.hostname.includes("youtu.be")
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get("v");

    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

export default async function CommunityPostPage({
  params,
}: CommunityPostPageProps) {
  const [{ postId }, session] = await Promise.all([
    params,
    getServerSession(authOptions),
  ]);
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          publicId: true,
          image: true,
          avatarUrl: true,
        },
      },
      replies: {
        orderBy: [{ isBestAnswer: "desc" }, { upvotes: "desc" }, { createdAt: "asc" }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              publicId: true,
              image: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const embedUrl = youtubeEmbedUrl(post.youtubeUrl);
  const isAuthor = session?.user?.id === post.userId;
  const postAuthorHref = `/profile/${post.user.username || post.user.publicId}`;

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link
          href="/community"
          className="theme-button-secondary inline-flex rounded-full px-5 py-3 text-sm font-bold"
        >
          Back to community
        </Link>

        <article className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm">
          <Link href={postAuthorHref} className="flex w-fit items-center gap-3 hover:underline">
            <UserAvatar {...post.user} size="md" />
            <div>
              <p className="font-semibold text-slate-950">
                {post.user.name || post.user.username || post.user.publicId}
              </p>
              <p className="text-sm text-slate-500">{post.createdAt.toLocaleString()}</p>
            </div>
          </Link>
          <h1 className="mt-5 text-4xl font-bold text-slate-950">{post.title}</h1>
          <span className="mt-4 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
            {formatType(post.category)}
          </span>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {post.description}
          </p>
          {post.imageUrls.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {post.imageUrls.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt={post.title}
                  className="aspect-video rounded-2xl object-cover"
                />
              ))}
            </div>
          ) : null}
          {embedUrl ? (
            <iframe
              className="mt-5 aspect-video w-full rounded-2xl"
              src={embedUrl}
              title="YouTube trailer"
              allowFullScreen
            />
          ) : null}
        </article>

        <CommunityReplyPanel postId={post.id} canReply={Boolean(session?.user?.id)} />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-950">Replies</h2>
          {post.replies.map((reply) => (
            <article
              key={reply.id}
              className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={`/profile/${reply.user.username || reply.user.publicId}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  <UserAvatar {...reply.user} size="sm" />
                  <div>
                    <p className="font-semibold text-slate-950">
                      {reply.user.name || reply.user.username || reply.user.publicId}
                    </p>
                    <p className="text-xs text-slate-500">
                      {reply.createdAt.toLocaleString()}
                    </p>
                  </div>
                </Link>
                {reply.isBestAnswer ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Best answer
                  </span>
                ) : null}
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {reply.content}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">
                  {reply.upvotes} helpful
                </p>
                <CommunityReplyActions replyId={reply.id} canMarkBest={isAuthor} />
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
