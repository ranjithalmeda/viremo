import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { ProfileSearchForm } from "@/src/components/profile-search-form";
import { SearchClient } from "@/src/components/search-client";
import { authOptions } from "@/src/lib/auth";

export default async function SearchPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="shell py-10 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <ProfileSearchForm />
        <SearchClient />
      </div>
    </div>
  );
}
