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
    <div className="shell py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
        <div className="relative min-h-[620px] overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--dark-surface-2)] p-8 shadow-2xl">
          <div className="absolute inset-0 opacity-70">
            <div className="absolute left-8 top-8 h-64 w-40 rotate-[-8deg] rounded-2xl bg-[linear-gradient(160deg,#8B5CF6,#171923_58%,#D4AF37)] shadow-2xl" />
            <div className="absolute left-40 top-20 h-72 w-44 rotate-[7deg] rounded-2xl bg-[linear-gradient(160deg,#D4AF37,#252836_52%,#8B5CF6)] shadow-2xl" />
            <div className="absolute bottom-20 left-16 h-72 w-44 rotate-[5deg] rounded-2xl bg-[linear-gradient(160deg,#2D3748,#8B5CF6_55%,#171923)] shadow-2xl" />
            <div className="absolute bottom-10 right-14 h-80 w-48 rotate-[-6deg] rounded-2xl bg-[linear-gradient(160deg,#171923,#D4AF37_48%,#8B5CF6)] shadow-2xl" />
            <div className="absolute right-28 top-12 h-60 w-36 rotate-[12deg] rounded-2xl bg-[linear-gradient(160deg,#252836,#8B5CF6_60%,#D4AF37)] shadow-2xl" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,25,35,0.95),rgba(23,25,35,0.62),rgba(23,25,35,0.9))]" />

          <div className="relative flex min-h-[560px] flex-col justify-between">
            <div>
              <SiteLogo className="w-[220px] sm:w-[260px]" />
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-gold)]" />
                Your personal entertainment diary
              </div>
            </div>

            <div className="max-w-xl">
              <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl">
                Track every story that stays with you.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-200">
                Movies, series, anime, and books in one personal space, with folders,
                community, and a profile that feels like yours.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                  <p className="font-semibold text-white">Diary first</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Rate, review, and organize entries faster.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                  <p className="font-semibold text-[var(--accent-gold)]">
                    Profile ready
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Share public folders and your latest picks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LoginCard error={error} />
      </div>
    </div>
  );
}
