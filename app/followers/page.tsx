import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { SocialUserList } from "@/src/components/social-user-list";
import { authOptions } from "@/src/lib/auth";
import { getFollowerUsers } from "@/src/lib/data";

export default async function FollowersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const users = await getFollowerUsers(session.user.id);

  return (
    <SocialUserList
      title="Followers"
      subtitle="People following your public Viremo profile."
      users={users}
      emptyMessage="No one is following you yet."
    />
  );
}
