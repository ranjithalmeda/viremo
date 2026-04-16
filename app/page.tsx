import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/src/lib/auth";

const highlights = [
  "Personal diary with watch status, ratings, and notes",
  "Email login with private dashboard and public profile",
  "TMDB-powered search flow for films, shows, and anime",
];

const buildSteps = [
  "Create an account and start your diary in seconds.",
  "Search titles or add them manually with status, notes, and ratings.",
  "Share your public profile so friends can browse your watch history.",
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="shell py-10 sm:py-14">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-strong soft-grid rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
          <div className="pill mb-6 text-sky-900">
            Movies, series, anime, and public profiles
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
            Build a watch diary that feels{" "}
            <span className="title-gradient">personal</span>, not disposable.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Viremo turns your viewing history into a portfolio-worthy
            full-stack app: authentication, protected CRUD, TMDB search, and a
            clean public profile all in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={session ? "/dashboard" : "/login"}
              className="inline-flex items-center justify-center rounded-full bg-sky-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-700/20 hover:-translate-y-0.5 hover:bg-sky-800"
            >
              {session ? "Open my diary" : "Create account"}
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white"
            >
              Explore the search flow
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/70 bg-white/70 p-4 text-sm leading-6 text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
              Build stack
            </p>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
              <li>Next.js app router for pages and route handlers</li>
              <li>Prisma + PostgreSQL for typed database access</li>
              <li>NextAuth credentials login for authentication</li>
              <li>Tailwind CSS for a polished, responsive UI</li>
            </ul>
          </div>

          <div className="glass rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              How it flows
            </p>
            <ol className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
              {buildSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
