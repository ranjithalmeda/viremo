"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import { ProfileSearchForm } from "@/src/components/profile-search-form";
import { SiteLogo } from "@/src/components/site-logo";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { cn } from "@/src/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Diary" },
  { href: "/search", label: "Search" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="shell sticky top-0 z-40 py-4">
      <div className="glass-strong flex flex-col gap-4 rounded-[1.5rem] border-slate-200/70 bg-white/95 px-4 py-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <SiteLogo className="w-[168px] sm:w-[196px]" priority />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold",
                    active
                      ? "theme-button-primary"
                      : "theme-button-secondary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <ProfileSearchForm compact />

          {status === "authenticated" ? (
            <div className="flex flex-wrap items-center gap-3">
              {session.user.publicId ? (
                <Link
                  href={`/profile/${session.user.publicId}`}
                  className="theme-button-secondary rounded-full px-4 py-2 text-sm font-semibold"
                >
                  View profile
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="theme-button-neutral rounded-full px-4 py-2 text-sm font-semibold"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="theme-button-neutral rounded-full px-4 py-2 text-sm font-semibold"
            >
              {status === "loading" ? "Checking session..." : "Sign in"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
