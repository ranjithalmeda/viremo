"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import {
  mobileFontScale,
  mobileFontSizes,
  type MobileFontSize,
} from "@/src/lib/preferences";

export const mobileFontStorageKey = "viremo-mobile-font-size";

export function applyMobileFontSize(size: MobileFontSize) {
  document.documentElement.style.setProperty(
    "--mobile-font-scale",
    mobileFontScale[size],
  );
  window.localStorage.setItem(mobileFontStorageKey, size);
}

function isMobileFontSize(value: unknown): value is MobileFontSize {
  return mobileFontSizes.includes(value as MobileFontSize);
}

export function MobileFontInitializer() {
  const { status } = useSession();

  useEffect(() => {
    const stored = window.localStorage.getItem(mobileFontStorageKey);

    if (isMobileFontSize(stored)) {
      applyMobileFontSize(stored);
    } else {
      applyMobileFontSize("medium");
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let active = true;

    async function loadMobileFontSize() {
      try {
        const response = await fetch("/api/preferences", { cache: "no-store" });
        const data = await response.json();
        const size = data.preferences?.mobileFontSize;

        if (active && response.ok && isMobileFontSize(size)) {
          applyMobileFontSize(size);
        }
      } catch {
        // Keep the local fallback if preferences cannot be loaded.
      }
    }

    void loadMobileFontSize();

    return () => {
      active = false;
    };
  }, [status]);

  return null;
}
