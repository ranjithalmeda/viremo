import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { LoginCard } from "@/src/components/login-card";
import { SiteLogo } from "@/src/components/site-logo";
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
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-violet-500 to-blue-500" />
            Sign in to your watch diary
          </div>

          <div className="space-y-6 rounded-[2rem] border border-slate-200/80 bg-white/95 p-10 shadow-xl">
            <div className="flex items-center gap-4">
              <SiteLogo className="w-[220px] sm:w-[260px]" />
            </div>
            <h1 className="theme-heading max-w-2xl text-5xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl">
              A cleaner way to track what you watch.
            </h1>
            <p className="theme-muted max-w-xl text-lg leading-8">
              Log titles quickly, keep notes, and publish your watch profile.
              The new interface is built around better visibility and faster navigation.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">Fast input</p>
                <p className="theme-muted mt-2 text-sm leading-6">
                  Add or update entries with fewer steps and clearer feedback.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">Smart sharing</p>
                <p className="theme-muted mt-2 text-sm leading-6">
                  Your public profile is built to show your favorites first.
                </p>
              </div>
            </div>
          </div>
        </div>

        <LoginCard error={error} />
      </div>
    </div>
  );
}
