import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AppearanceSettingsClient } from "@/src/components/appearance-settings-client";
import { authOptions } from "@/src/lib/auth";
import { getAvatarForUser, getPreferencesForUser } from "@/src/lib/data";

export default async function AppearanceSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [preferences, avatar] = await Promise.all([
    getPreferencesForUser(session.user.id),
    getAvatarForUser(session.user.id),
  ]);

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Personal space
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            Appearance
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Customize how your diary feels for you and for visitors on your
            public profile.
          </p>
        </div>

        <AppearanceSettingsClient
          initialPreferences={preferences}
          initialAvatar={avatar}
        />
      </div>
    </div>
  );
}
