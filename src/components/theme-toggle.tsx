"use client";

import { useState } from "react";

const storageKey = "viremo-theme";
type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(storageKey, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const currentTheme = document.documentElement.dataset.theme;

    if (currentTheme === "dark" || currentTheme === "light") {
      return currentTheme;
    }

    const stored = window.localStorage.getItem(storageKey);
    return stored === "dark" || stored === "light" ? stored : getSystemTheme();
  });

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      suppressHydrationWarning
      className="theme-button-secondary rounded-full px-4 py-2 text-sm font-semibold"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {theme === "light" ? "Dark mode" : "Light mode"}
    </button>
  );
}
