"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { UserAvatar } from "@/src/components/user-avatar";
import type { ProfileCommentRecord, SocialUser } from "@/src/lib/data";

type SerializedComment = Omit<ProfileCommentRecord, "createdAt"> & {
  createdAt: string;
};

type ProfileSocialPanelProps = {
  profileUser: SocialUser;
  viewerId: string | null;
  isOwner: boolean;
  initialSocial: {
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
  };
  initialComments: SerializedComment[];
};

function displayName(user: SocialUser) {
  return user.name || user.username || user.publicId;
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ProfileSocialPanel({
  profileUser,
  viewerId,
  isOwner,
  initialSocial,
  initialComments,
}: ProfileSocialPanelProps) {
  const [social, setSocial] = useState(initialSocial);
  const [comments, setComments] = useState(initialComments);
  const [commentDraft, setCommentDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const signedIn = Boolean(viewerId);

  const messageHref = useMemo(
    () => `/messages/${profileUser.id}`,
    [profileUser.id],
  );

  async function toggleFollow() {
    if (!signedIn || isOwner) return;

    setFollowBusy(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/follows/${profileUser.id}`, {
        method: social.isFollowing ? "DELETE" : "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update follow status.");
      }

      setSocial(data.social);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not update follow status.");
    } finally {
      setFollowBusy(false);
    }
  }

  async function addComment() {
    const content = commentDraft.trim();
    if (!content) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/profile-comments/users/${profileUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not add comment.");
      }

      setComments((current) => [
        {
          ...data.comment,
          createdAt: new Date(data.comment.createdAt).toISOString(),
        },
        ...current,
      ]);
      setCommentDraft("");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not add comment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteComment(commentId: string) {
    const response = await fetch(`/api/profile-comments/${commentId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      setFeedback(data.error || "Could not delete comment.");
      return;
    }

    setComments((current) => current.filter((comment) => comment.id !== commentId));
  }

  return (
    <section className="rounded-[2rem] border border-[var(--profile-border)] bg-[var(--profile-surface)] p-6 text-[var(--profile-text)] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--profile-muted)]">
            Social
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            Connect with {displayName(profileUser)}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isOwner ? (
            <button
              type="button"
              onClick={toggleFollow}
              disabled={!signedIn || followBusy}
              className="theme-button-primary rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {followBusy
                ? "Updating..."
                : social.isFollowing
                  ? "Unfollow"
                  : "Follow"}
            </button>
          ) : null}
          {!isOwner && signedIn ? (
            <Link
              href={messageHref}
              className="theme-button-secondary rounded-full px-5 py-3 text-sm font-semibold"
            >
              Message
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          href="/followers"
          className="rounded-3xl border border-[var(--profile-border)] bg-[var(--profile-surface-soft)] p-4"
        >
          <p className="text-3xl font-semibold">{social.followersCount}</p>
          <p className="mt-1 text-sm text-[var(--profile-muted)]">Followers</p>
        </Link>
        <Link
          href="/following"
          className="rounded-3xl border border-[var(--profile-border)] bg-[var(--profile-surface-soft)] p-4"
        >
          <p className="text-3xl font-semibold">{social.followingCount}</p>
          <p className="mt-1 text-sm text-[var(--profile-muted)]">Following</p>
        </Link>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-semibold">Profile comments</h3>

        {signedIn ? (
          <div className="mt-4 rounded-[1.5rem] border border-[var(--profile-border)] bg-[var(--profile-surface-soft)] p-4">
            <textarea
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              maxLength={500}
              rows={3}
              className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
              placeholder="Leave a comment..."
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--profile-muted)]">
                {commentDraft.length}/500
              </p>
              <button
                type="button"
                onClick={addComment}
                disabled={submitting || !commentDraft.trim()}
                className="theme-button-primary rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {submitting ? "Posting..." : "Post comment"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-[1.5rem] border border-[var(--profile-border)] bg-[var(--profile-surface-soft)] p-4 text-sm text-[var(--profile-muted)]">
            Sign in to follow, message, or leave a comment.
          </div>
        )}

        {feedback ? (
          <div className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
            {feedback}
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {comments.length ? (
            comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-[1.5rem] border border-[var(--profile-border)] bg-[var(--profile-surface-soft)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <UserAvatar
                      name={comment.author.name}
                      username={comment.author.username}
                      publicId={comment.author.publicId}
                      image={comment.author.image}
                      avatarUrl={comment.author.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/profile/${comment.author.publicId}`}
                        className="font-semibold hover:underline"
                      >
                        {displayName(comment.author)}
                      </Link>
                      <p className="text-xs text-[var(--profile-muted)]">
                        {formatTimestamp(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => deleteComment(comment.id)}
                      className="theme-button-danger rounded-full px-3 py-1 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--profile-muted)]">
                  {comment.content}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--profile-border)] bg-[var(--profile-surface-soft)] p-5 text-sm text-[var(--profile-muted)]">
              No comments yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
