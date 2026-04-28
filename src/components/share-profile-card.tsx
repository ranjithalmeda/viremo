"use client";

import Link from "next/link";
import { useState } from "react";

type ShareProfileCardProps = {
  publicId: string | null;
  username: string | null;
  displayName: string | null;
};

export function ShareProfileCard({
  publicId,
  username,
  displayName,
}: ShareProfileCardProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const profileIdentifier = publicId || username;
  const profilePath = profileIdentifier ? `/profile/${profileIdentifier}` : null;

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(`${label} copied.`);
    } catch {
      setFeedback(`Could not copy ${label.toLowerCase()}.`);
    }
  }

  async function copyProfileLink() {
    if (!profilePath) return;

    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : "";
    await copyValue(`${baseUrl}${profilePath}`, "Profile link");
  }

  return (
    <section className="glass-strong rounded-[1.8rem] p-6 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="pill theme-faint w-fit">Share your watchlist</div>
          <div>
            <h2 className="theme-heading text-2xl font-semibold">
              Your public profile is ready.
            </h2>
            <p className="theme-muted mt-2 max-w-2xl text-sm leading-6">
              Give friends your share ID or profile link so they can open your
              watchlist and reviews without needing your login details.
            </p>
          </div>
        </div>

        {profilePath ? (
          <Link
            href={profilePath}
            className="theme-button-secondary rounded-full px-5 py-3 text-sm font-semibold"
          >
            Open public profile
          </Link>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="theme-soft-panel rounded-[1.5rem] p-5">
          <p className="theme-muted text-xs font-semibold uppercase tracking-[0.2em]">
            Share ID
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="theme-heading font-display text-3xl font-semibold tracking-[0.18em]">
              {publicId || "Pending"}
            </p>
            {publicId ? (
              <button
                type="button"
                onClick={() => copyValue(publicId, "Share ID")}
                className="theme-button-secondary rounded-full px-4 py-2 text-sm font-semibold"
              >
                Copy ID
              </button>
            ) : null}
          </div>
          <p className="theme-muted mt-3 text-sm leading-6">
            Best for quick sharing in messages or social bios.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/70 bg-[linear-gradient(145deg,rgba(17,54,95,0.92),rgba(30,107,184,0.9),rgba(15,118,110,0.88))] p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Public link
          </p>
          <p className="mt-3 break-all text-sm leading-6 text-white/90">
            {profilePath || "Create a profile identifier to unlock sharing."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {profilePath ? (
              <button
                type="button"
                onClick={copyProfileLink}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                Copy link
              </button>
            ) : null}
            {displayName || username ? (
              <div className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90">
                {displayName || `@${username}`}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {feedback ? (
        <p className="theme-status-positive mt-4 text-sm font-medium">{feedback}</p>
      ) : (
        <p className="theme-muted mt-4 text-sm">
          People can open your profile by share ID or username.
        </p>
      )}
    </section>
  );
}
