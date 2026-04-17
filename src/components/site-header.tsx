"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import { ProfileSearchForm } from "@/src/components/profile-search-form";
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
    <header className="shell sticky top-0 z-40 pt-4">
      <div className="glass flex flex-col gap-4 rounded-[1.6rem] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
              VR
            </span>
            <div>
              <p className="font-display text-xl font-semibold text-slate-950">
                Viremo
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Personal watch tracker
              </p>
            </div>
          </Link>
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
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-white/80 hover:text-slate-950",
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
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-800"
                >
                  ID {session.user.publicId}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {status === "loading" ? "Checking session..." : "Sign in"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
