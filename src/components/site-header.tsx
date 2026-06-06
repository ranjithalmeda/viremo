"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/src/components/theme-toggle";
import { UserAvatar } from "@/src/components/user-avatar";
import { cn } from "@/src/lib/utils";

type NavigationItem = {
  href: string;
  label: string;
  icon: string;
  badge?: "messages" | "notifications";
};

const mainNavItems: NavigationItem[] = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/dashboard", label: "Diary", icon: "📓" },
  { href: "/folders", label: "Folders", icon: "📁" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/community", label: "Community", icon: "👥" },
  { href: "/messages", label: "Messages", icon: "💬", badge: "messages" },
  {
    href: "/notifications",
    label: "Notifications",
    icon: "🔔",
    badge: "notifications",
  },
  { href: "/ai-chat", label: "AI Chat", icon: "🤖" },
  { href: "/search", label: "Find Users", icon: "🔍" },
  { href: "/help", label: "Help", icon: "❓" },
  { href: "/tickets", label: "Support", icon: "🎫" },
] as const;

const mobileNavItems: NavigationItem[] = [
  { href: "/dashboard", label: "Diary", icon: "📓" },
  { href: "/community", label: "Community", icon: "👥" },
  { href: "/messages", label: "Messages", icon: "💬", badge: "messages" },
  { href: "/search", label: "Find", icon: "🔍" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
] as const;

function isActive(pathname: string | null, href: string) {
  return href === "/" ? pathname === "/" : pathname?.startsWith(href);
}

function Badge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative grid size-9 shrink-0 place-items-center rounded-2xl bg-[var(--surface-soft)] text-xs font-black text-[var(--foreground-strong)]">
      {children}
    </span>
  );
}

function SidebarLink({
  item,
  pathname,
  unreadMessages,
  unreadNotifications,
}: {
  item: NavigationItem;
  pathname: string | null;
  unreadMessages: number;
  unreadNotifications: number;
}) {
  const active = isActive(pathname, item.href);
  const badgeCount =
    item.badge === "messages"
      ? unreadMessages
      : item.badge === "notifications"
        ? unreadNotifications
        : 0;

  return (
    <Link
      href={item.href}
      title={item.label}
      className={cn(
        "group/link flex h-11 items-center gap-3 rounded-2xl px-2 text-sm font-semibold text-[var(--muted)] transition-all",
        active
          ? "bg-[var(--accent)] text-white shadow-[0_14px_30px_rgba(139,92,246,0.28)]"
          : "hover:bg-[var(--surface-soft)] hover:text-[var(--foreground-strong)]",
      )}
    >
      <span
        className={cn(
          "relative grid size-9 shrink-0 place-items-center rounded-xl text-xs font-black",
          active
            ? "bg-white/16 text-white"
            : "bg-[var(--surface-soft)] text-[var(--foreground-strong)]",
        )}
      >
        {item.icon}
        <Badge count={badgeCount} />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-40 group-hover:opacity-100">
        {item.label}
      </span>
    </Link>
  );
}

function MobileLink({
  item,
  pathname,
  unreadMessages,
}: {
  item: NavigationItem;
  pathname: string | null;
  unreadMessages: number;
}) {
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold",
        active
          ? "bg-[var(--accent)] text-white"
          : "text-[var(--muted)] hover:text-[var(--foreground-strong)]",
      )}
    >
      <span className="relative grid size-7 place-items-center rounded-xl text-xs font-black">
        {item.icon}
        {item.badge === "messages" ? <Badge count={unreadMessages} /> : null}
      </span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (status === "authenticated" && session.user.isBanned) {
      void signOut({ callbackUrl: "/login?error=AccessDenied" });
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    let active = true;

    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications", {
          cache: "no-store",
        });
        const data = await response.json();

        if (active && response.ok) {
          setUnreadMessages(Number(data.unreadMessages || 0));
          setUnreadNotifications(Number(data.unreadNotifications || 0));
        }
      } catch {
        if (active) {
          setUnreadMessages(0);
          setUnreadNotifications(0);
        }
      }
    }

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [status, pathname, session?.user?.isBanned]);

  const visibleUnreadMessages =
    status === "authenticated" ? unreadMessages : 0;
  const visibleUnreadNotifications =
    status === "authenticated" ? unreadNotifications : 0;
  const profileId = session?.user?.username || session?.user?.publicId;
  const username =
    session?.user?.username || session?.user?.name || session?.user?.email;

  return (
    <>
      <aside className="group fixed inset-y-0 left-0 z-50 hidden w-14 flex-col border-r border-[var(--border)] bg-[var(--surface-strong)] shadow-[20px_0_60px_rgba(0,0,0,0.12)] transition-all duration-300 hover:w-56 md:flex">
        <div className="flex h-full flex-col overflow-hidden px-2 py-4">
          <Link
            href="/"
            className="mb-4 flex h-12 items-center gap-3 rounded-2xl px-1 text-[var(--foreground-strong)]"
            title="Viremo"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-lg font-black text-white shadow-[0_14px_30px_rgba(139,92,246,0.28)]">
              V
            </span>
            <span className="max-w-0 overflow-hidden text-2xl font-black tracking-tight text-[var(--foreground-strong)] opacity-0 transition-all duration-200 group-hover:max-w-36 group-hover:opacity-100">
              Viremo
            </span>
          </Link>

          {status === "authenticated" ? (
            <div className="mb-4 flex h-14 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-1.5">
              <UserAvatar
                name={session.user.name}
                username={session.user.username}
                publicId={session.user.publicId}
                image={session.user.image}
                size="sm"
                className="size-10"
              />
              <div className="min-w-0 max-w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-w-36 group-hover:opacity-100">
                <p className="truncate text-sm font-bold text-[var(--foreground-strong)]">
                  {username}
                </p>
                <p className="text-xs font-semibold text-[var(--muted)]">
                  {session.user.role}
                </p>
              </div>
            </div>
          ) : null}

          <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden pr-1">
            {mainNavItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                pathname={pathname}
                unreadMessages={visibleUnreadMessages}
                unreadNotifications={visibleUnreadNotifications}
              />
            ))}
          </nav>

          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <div className="mb-2 overflow-hidden rounded-2xl">
              <ThemeToggle compact />
            </div>
            <SidebarLink
              item={{ href: "/settings", label: "Settings", icon: "⚙️" }}
              pathname={pathname}
              unreadMessages={0}
              unreadNotifications={0}
            />
            {profileId ? (
              <SidebarLink
                item={{
                  href: `/profile/${profileId}`,
                  label: "View Profile",
                  icon: "👤",
                }}
                pathname={pathname}
                unreadMessages={0}
                unreadNotifications={0}
              />
            ) : null}
            {session?.user?.role === "ADMIN" ? (
              <SidebarLink
                item={{ href: "/admin", label: "Admin", icon: "🛡️" }}
                pathname={pathname}
                unreadMessages={0}
                unreadNotifications={0}
              />
            ) : null}
            {status === "authenticated" ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mt-1 flex h-11 w-full items-center gap-3 rounded-2xl px-2 text-left text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground-strong)]"
                title="Sign out"
              >
                <NavIcon>↪</NavIcon>
                <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-40 group-hover:opacity-100">
                  Sign out
                </span>
              </button>
            ) : (
              <SidebarLink
                item={{ href: "/login", label: "Sign in", icon: "↪" }}
                pathname={pathname}
                unreadMessages={0}
                unreadNotifications={0}
              />
            )}
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-50 flex gap-1 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-strong)] p-1.5 shadow-[0_20px_55px_rgba(0,0,0,0.24)] md:hidden">
        {mobileNavItems.map((item) => (
          <MobileLink
            key={item.href}
            item={item}
            pathname={pathname}
            unreadMessages={visibleUnreadMessages}
          />
        ))}
      </nav>
    </>
  );
}
