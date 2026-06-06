import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { SettingsClient } from "@/src/components/settings-client";
import { authOptions } from "@/src/lib/auth";
import { getSettingsProfile } from "@/src/lib/settings-data";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await getSettingsProfile(session.user.id);

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Account
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            Settings
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Manage your profile, login details, appearance, and account safety.
          </p>
        </div>

        <SettingsClient initialProfile={profile} />
      </div>
    </div>
  );
}
