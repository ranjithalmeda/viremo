import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { LoginCard } from "@/src/components/login-card";
import { authOptions } from "@/src/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);
  const { error } = await searchParams;

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="shell py-16 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="pill text-emerald-800">Private dashboard + public profile</div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-tight text-slate-950 sm:text-6xl">
            Keep every title in one place, from comfort rewatches to current
            obsessions.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600">
            We are pausing GitHub OAuth for now and using a normal email login
            so the product flow stays unblocked while we finish the UI.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass rounded-[1.5rem] p-5">
              <p className="text-sm font-semibold text-slate-900">Track</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add movies, series, and anime with ratings, notes, posters, and statuses.
              </p>
            </div>
            <div className="glass rounded-[1.5rem] p-5">
              <p className="text-sm font-semibold text-slate-900">Manage</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Edit or delete entries any time through the protected CRUD flow.
              </p>
            </div>
            <div className="glass rounded-[1.5rem] p-5">
              <p className="text-sm font-semibold text-slate-900">Share</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Turn your watch history into a clean public profile when auth is live.
              </p>
            </div>
          </div>
        </div>
        <LoginCard error={error} />
      </div>
    </div>
  );
}
