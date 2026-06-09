"use client";

import { useMemo, useState } from "react";

import {
  getPreferenceStyle,
  layoutModes,
  mobileFontSizes,
  normalizePreferences,
  profileThemes,
  type ProfileBlock,
  type UserPreferences,
} from "@/src/lib/preferences";
import { UserAvatar } from "@/src/components/user-avatar";

const blockLabels: Record<ProfileBlock, string> = {
  recentlyWatched: "Recently Watched",
  favorites: "Favorites",
  watchlist: "Watchlist",
};

const themeLabels = {
  dark: "Dark",
  light: "Light",
  warm: "Warm",
  minimal: "Minimal",
};

const layoutLabels = {
  grid: "Grid",
  list: "List",
  card: "Card",
};

const mobileFontLabels = {
  small: "Small",
  medium: "Default",
  large: "Large",
};

export function AppearanceSettingsClient({
  initialPreferences,
  initialAvatar,
}: {
  initialPreferences: UserPreferences;
  initialAvatar: {
    avatarUrl: string | null;
    image: string | null;
    name: string | null;
    username: string | null;
    publicId: string;
  } | null;
}) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [draggingBlock, setDraggingBlock] = useState<ProfileBlock | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const previewStyle = useMemo(
    () => getPreferenceStyle(preferences),
    [preferences],
  );

  function updatePreference<T extends keyof UserPreferences>(
    key: T,
    value: UserPreferences[T],
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setFeedback(null);
  }

  function reorderBlocks(targetBlock: ProfileBlock) {
    if (!draggingBlock || draggingBlock === targetBlock) return;

    setPreferences((current) => {
      const blocks = current.blocks.filter((block) => block !== draggingBlock);
      const targetIndex = blocks.indexOf(targetBlock);
      blocks.splice(targetIndex, 0, draggingBlock);
      return { ...current, blocks };
    });
  }

  async function savePreferences() {
    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save appearance.");
      }

      setPreferences(normalizePreferences(data.preferences));
      setFeedback("Appearance saved.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not save appearance.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarUploading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not upload avatar.");
      }

      setAvatar(data.user);
      setFeedback("Profile picture updated.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not upload avatar.");
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <section className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              Profile picture
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Upload a JPG or PNG up to 2MB. It appears anywhere your profile
              is shown.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <UserAvatar
              name={avatar?.name}
              username={avatar?.username}
              publicId={avatar?.publicId}
              image={avatar?.image}
              avatarUrl={avatar?.avatarUrl}
              size="lg"
            />
            <label className="theme-button-secondary cursor-pointer rounded-full px-5 py-3 text-sm font-semibold">
              {avatarUploading ? "Uploading..." : "Upload picture"}
              <input
                type="file"
                accept="image/jpeg,image/png"
                disabled={avatarUploading}
                onChange={uploadAvatar}
                className="sr-only"
              />
            </label>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              Display style
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These choices are saved to your account and shown on your public
              profile.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Layout</p>
            <div className="grid grid-cols-3 gap-2">
              {layoutModes.map((layout) => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => updatePreference("layout", layout)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
                    preferences.layout === layout
                      ? "border-[var(--accent)] bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {layoutLabels[layout]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Theme</p>
            <div className="grid grid-cols-2 gap-2">
              {profileThemes.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => updatePreference("theme", theme)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
                    preferences.theme === theme
                      ? "border-[var(--accent)] bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {themeLabels[theme]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Mobile font size
            </p>
            <div className="grid grid-cols-3 gap-2">
              {mobileFontSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updatePreference("mobileFontSize", size)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
                    preferences.mobileFontSize === size
                      ? "border-[var(--accent)] bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {mobileFontLabels[size]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Applies on phone-sized screens only.
            </p>
          </div>

          <label className="block">
            <span className="mb-3 block text-sm font-semibold text-slate-700">
              Accent color
            </span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <input
                type="color"
                value={preferences.accentColor}
                onChange={(event) =>
                  updatePreference("accentColor", event.target.value)
                }
                className="h-11 w-16 rounded-xl border-0 bg-transparent"
              />
              <input
                value={preferences.accentColor}
                onChange={(event) =>
                  updatePreference("accentColor", event.target.value)
                }
                className="theme-input flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
          </label>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Section order
            </p>
            <div className="space-y-2">
              {preferences.blocks.map((block) => (
                <div
                  key={block}
                  draggable
                  onDragStart={() => setDraggingBlock(block)}
                  onDragEnter={() => reorderBlocks(block)}
                  onDragEnd={() => setDraggingBlock(null)}
                  onDragOver={(event) => event.preventDefault()}
                  className="cursor-grab rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 active:cursor-grabbing"
                >
                  {blockLabels[block]}
                </div>
              ))}
            </div>
          </div>

          {feedback ? (
            <div className="rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-700">
              {feedback}
            </div>
          ) : null}

          <button
            type="button"
            onClick={savePreferences}
            disabled={saving}
            className="theme-button-primary w-full rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save appearance"}
          </button>
        </div>
      </section>

      <section
        style={previewStyle}
        className="mobile-font-scale overflow-hidden rounded-[2rem] border border-[var(--profile-border)] bg-[var(--profile-surface)] p-6 shadow-sm"
      >
        <div className="rounded-[1.75rem] bg-[var(--profile-bg)] p-6 text-[var(--profile-text)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--profile-muted)]">
                Live preview
              </p>
              <h2 className="mt-3 text-4xl font-semibold">Your diary space</h2>
            </div>
            <div
              className="h-14 w-14 rounded-2xl"
              style={{ background: "var(--profile-accent)" }}
            />
          </div>

          <div
            className={`mt-6 gap-4 ${
              preferences.layout === "grid"
                ? "grid sm:grid-cols-3"
                : preferences.layout === "list"
                  ? "grid"
                  : "grid sm:grid-cols-[1.2fr_0.8fr]"
            }`}
          >
            {preferences.blocks.map((block) => (
              <div
                key={block}
                className="rounded-[1.5rem] border border-[var(--profile-border)] bg-[var(--profile-surface)] p-4"
              >
                <p className="text-sm font-semibold">{blockLabels[block]}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--profile-muted)]">
                  A personalized section shaped by your saved choices.
                </p>
                <div
                  className="mt-4 h-1.5 rounded-full"
                  style={{ background: "var(--profile-accent)" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
