import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { SocialUserList } from "@/src/components/social-user-list";
import { authOptions } from "@/src/lib/auth";
import { getFollowingUsers } from "@/src/lib/data";

export default async function FollowingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const users = await getFollowingUsers(session.user.id);

  return (
    <SocialUserList
      title="Following"
      subtitle="People whose public diary spaces you are keeping up with."
      users={users}
      emptyMessage="You are not following anyone yet."
    />
  );
}
