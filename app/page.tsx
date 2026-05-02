import Link from "next/link";
import { getServerSession } from "next-auth";

import { SiteLogo } from "@/src/components/site-logo";
import { authOptions } from "@/src/lib/auth";

const features = [
  {
    title: "Built for binge tracking",
    description: "Log movies, series, and anime with ratings, notes, and watch status.",
  },
  {
    title: "Search with TMDB and Books",
    description: "Browse verified metadata from movies, shows, and books, then add titles directly to your diary.",
  },
  {
    title: "Share your shelf",
    description: "Publish a public profile so friends can discover your favorites.",
  },
];

const benefits = [
  "Modern diary interface with quick actions and progress cards.",
  "Minimal, responsive layout designed for screen reading.",
  "Shared public profiles that focus on your story, not just scores.",
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="shell py-16 sm:py-20">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] items-start">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-violet-500 to-blue-500" />
            Watchlist for movies, shows, and anime
          </div>

          <div className="space-y-6 rounded-[2rem] border border-slate-200/70 bg-white/95 p-10 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <SiteLogo className="w-[220px] sm:w-[260px]" />
              <div className="hidden rounded-3xl bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 sm:block">
                New look, same workflow
              </div>
            </div>
            <h1 className="theme-heading max-w-3xl text-5xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl">
              Track your watch history with clarity and confidence.
            </h1>
            <p className="theme-muted max-w-2xl text-lg leading-8">
              Viremo helps you organize every Watching title, keep quick notes,
              and share a public shelf that feels curated, not cluttered.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-slate-200/70 bg-slate-50 p-5 shadow-sm"
                >
                  <p className="font-semibold text-slate-900">{feature.title}</p>
                  <p className="theme-muted mt-2 text-sm leading-6">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={session ? "/dashboard" : "/login"}
                className="theme-button-primary inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold"
              >
                {session ? "Open my diary" : "Create account"}
              </Link>
              <Link
                href="/search"
                className="theme-button-secondary inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold"
              >
                Browse TMDB search
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass rounded-[2rem] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-700">
              What you get
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
              {benefits.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-violet-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-[2rem] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Fast launch
            </p>
            <ol className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
              <li className="flex gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">1</span>
                Sign up or log in with your email.
              </li>
              <li className="flex gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">2</span>
                Add a title from search or manually.
              </li>
              <li className="flex gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">3</span>
                Share your watchlist with a public profile.
              </li>
            </ol>
          </div>
        </aside>
      </section>
    </div>
  );
}
