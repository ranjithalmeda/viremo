"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { SettingsProfile } from "@/src/lib/settings-data";

type SettingsClientProps = {
  initialProfile: SettingsProfile;
};

export function SettingsClient({ initialProfile }: SettingsClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save profile.");
      }

      setProfile(data.profile);
      setProfileMessage("Profile saved.");
      router.refresh();
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordMessage(null);

    try {
      const response = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordFields),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not change password.");
      }

      setPasswordFields({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage("Password changed.");
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "Could not change password.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function deleteAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!window.confirm("This action is permanent and cannot be undone.")) {
      return;
    }

    setDeletingAccount(true);
    setDeleteMessage(null);

    try {
      const response = await fetch("/api/settings/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          confirmText: deleteConfirmText,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete account.");
      }

      await signOut({ callbackUrl: "/" });
    } catch (error) {
      setDeleteMessage(error instanceof Error ? error.message : "Could not delete account.");
      setDeletingAccount(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950">Profile Info</h2>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={saveProfile}>
          <label className="block">
            <span className="theme-text mb-2 block text-sm font-semibold">
              Display name
            </span>
            <input
              value={profile.name || ""}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="theme-text mb-2 block text-sm font-semibold">
              Username
            </span>
            <input
              required
              value={profile.username || ""}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
              placeholder="username"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="theme-text mb-2 block text-sm font-semibold">
              Bio
            </span>
            <textarea
              value={profile.bio || ""}
              maxLength={180}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  bio: event.target.value,
                }))
              }
              className="theme-input min-h-24 w-full rounded-2xl px-4 py-3 text-sm outline-none"
              placeholder="A short note for your public profile"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="theme-text mb-2 block text-sm font-semibold">
              Email
            </span>
            <input
              required
              type="email"
              value={profile.email || ""}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
              placeholder="you@example.com"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="theme-button-neutral rounded-full px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? "Saving..." : "Save changes"}
            </button>
            {profileMessage ? (
              <p className="text-sm font-semibold text-slate-600">
                {profileMessage}
              </p>
            ) : null}
          </div>
        </form>
      </section>

      {profile.hasPassword ? (
        <section className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-slate-950">Password</h2>
          <form className="mt-6 grid gap-4 md:grid-cols-3" onSubmit={savePassword}>
            {[
              ["currentPassword", "Current password"],
              ["newPassword", "New password"],
              ["confirmPassword", "Confirm new password"],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="theme-text mb-2 block text-sm font-semibold">
                  {label}
                </span>
                <input
                  required
                  minLength={key === "currentPassword" ? undefined : 8}
                  type="password"
                  value={passwordFields[key as keyof typeof passwordFields]}
                  onChange={(event) =>
                    setPasswordFields((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                />
              </label>
            ))}

            <div className="flex flex-wrap items-center gap-3 md:col-span-3">
              <button
                type="submit"
                disabled={savingPassword}
                className="theme-button-neutral rounded-full px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword ? "Changing..." : "Change password"}
              </button>
              {passwordMessage ? (
                <p className="text-sm font-semibold text-slate-600">
                  {passwordMessage}
                </p>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950">Appearance</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Update profile picture, layout, theme, accent color, and section order.
        </p>
        <Link
          href="/settings/appearance"
          className="theme-button-secondary mt-5 inline-flex rounded-full px-5 py-3 text-sm font-bold"
        >
          Open appearance settings
        </Link>
      </section>

      <section className="rounded-[2rem] border border-red-200 bg-red-50/90 p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-red-700">Danger Zone</h2>
        <p className="mt-2 text-sm leading-6 text-red-700">
          This action is permanent and cannot be undone.
        </p>
        <form className="mt-6 space-y-4" onSubmit={deleteAccount}>
          {profile.hasPassword ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-red-800">
                Confirm password
              </span>
              <input
                required
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-950 outline-none"
              />
            </label>
          ) : (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-red-800">
                Type DELETE to confirm
              </span>
              <input
                required
                value={deleteConfirmText}
                onChange={(event) => setDeleteConfirmText(event.target.value)}
                className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-950 outline-none"
              />
            </label>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={deletingAccount}
              className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingAccount ? "Deleting..." : "Delete account"}
            </button>
            {deleteMessage ? (
              <p className="text-sm font-semibold text-red-700">
                {deleteMessage}
              </p>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
