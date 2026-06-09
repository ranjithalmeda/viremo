import type { Prisma } from "@prisma/client";
import type { CSSProperties } from "react";

export const layoutModes = ["grid", "list", "card"] as const;
export const profileThemes = ["dark", "light", "warm", "minimal"] as const;
export const mobileFontSizes = ["small", "medium", "large"] as const;
export const profileBlocks = [
  "recentlyWatched",
  "favorites",
  "watchlist",
] as const;

export type LayoutMode = (typeof layoutModes)[number];
export type ProfileTheme = (typeof profileThemes)[number];
export type MobileFontSize = (typeof mobileFontSizes)[number];
export type ProfileBlock = (typeof profileBlocks)[number];

export type UserPreferences = {
  layout: LayoutMode;
  theme: ProfileTheme;
  accentColor: string;
  mobileFontSize: MobileFontSize;
  blocks: ProfileBlock[];
};

export const defaultPreferences: UserPreferences = {
  layout: "grid",
  theme: "dark",
  accentColor: "#e63946",
  mobileFontSize: "medium",
  blocks: ["recentlyWatched", "favorites", "watchlist"],
};

const themeStyles: Record<
  ProfileTheme,
  {
    background: string;
    surface: string;
    surfaceSoft: string;
    text: string;
    muted: string;
    border: string;
  }
> = {
  dark: {
    background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
    surface: "rgba(15, 23, 42, 0.94)",
    surfaceSoft: "rgba(30, 41, 59, 0.78)",
    text: "#f8fafc",
    muted: "#cbd5e1",
    border: "rgba(148, 163, 184, 0.24)",
  },
  light: {
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    surface: "rgba(255, 255, 255, 0.96)",
    surfaceSoft: "rgba(248, 250, 252, 0.96)",
    text: "#0f172a",
    muted: "#475569",
    border: "rgba(148, 163, 184, 0.28)",
  },
  warm: {
    background: "linear-gradient(180deg, #fff7ed 0%, #fef3c7 100%)",
    surface: "rgba(255, 251, 235, 0.96)",
    surfaceSoft: "rgba(254, 243, 199, 0.72)",
    text: "#1c1917",
    muted: "#78716c",
    border: "rgba(180, 83, 9, 0.22)",
  },
  minimal: {
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    surface: "rgba(255, 255, 255, 1)",
    surfaceSoft: "rgba(241, 245, 249, 0.86)",
    text: "#111827",
    muted: "#6b7280",
    border: "rgba(17, 24, 39, 0.12)",
  },
};

export const mobileFontScale: Record<MobileFontSize, string> = {
  small: "0.94",
  medium: "1",
  large: "1.1",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAccentColor(value: unknown) {
  if (typeof value !== "string") return defaultPreferences.accentColor;

  const color = value.trim();
  return /^#[0-9A-Fa-f]{6}$/.test(color)
    ? color
    : defaultPreferences.accentColor;
}

export function normalizePreferences(value: unknown): UserPreferences {
  if (!isRecord(value)) {
    return defaultPreferences;
  }

  const layout = layoutModes.includes(value.layout as LayoutMode)
    ? (value.layout as LayoutMode)
    : defaultPreferences.layout;
  const theme = profileThemes.includes(value.theme as ProfileTheme)
    ? (value.theme as ProfileTheme)
    : defaultPreferences.theme;
  const mobileFontSize = mobileFontSizes.includes(
    value.mobileFontSize as MobileFontSize,
  )
    ? (value.mobileFontSize as MobileFontSize)
    : defaultPreferences.mobileFontSize;
  const blocks = Array.isArray(value.blocks)
    ? value.blocks.filter((block): block is ProfileBlock =>
        profileBlocks.includes(block as ProfileBlock),
      )
    : defaultPreferences.blocks;
  const uniqueBlocks = profileBlocks.filter((block) => blocks.includes(block));

  return {
    layout,
    theme,
    accentColor: normalizeAccentColor(value.accentColor),
    mobileFontSize,
    blocks: uniqueBlocks.length ? uniqueBlocks : defaultPreferences.blocks,
  };
}

export function serializePreferences(
  preferences: UserPreferences,
): Prisma.InputJsonValue {
  return preferences as unknown as Prisma.InputJsonValue;
}

export function getPreferenceStyle(preferences: UserPreferences) {
  const theme = themeStyles[preferences.theme];

  return {
    "--profile-bg": theme.background,
    "--profile-surface": theme.surface,
    "--profile-surface-soft": theme.surfaceSoft,
    "--profile-text": theme.text,
    "--profile-muted": theme.muted,
    "--profile-border": theme.border,
    "--profile-accent": preferences.accentColor,
    "--mobile-font-scale": mobileFontScale[preferences.mobileFontSize],
  } as CSSProperties;
}
