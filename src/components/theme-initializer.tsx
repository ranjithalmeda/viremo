"use client";

import { useEffect } from "react";

const storageKey = "viremo-theme";

export function ThemeInitializer() {
  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    const theme =
      stored === "light" || stored === "dark"
        ? stored
        : "dark";

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, []);

  return null;
}
