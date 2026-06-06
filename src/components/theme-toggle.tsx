"use client";

const storageKey = "viremo-theme";
type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(storageKey, theme);
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  function getCurrentTheme(): Theme {
    const currentTheme = document.documentElement.dataset.theme;

    if (currentTheme === "dark" || currentTheme === "light") {
      return currentTheme;
    }

    const stored = window.localStorage.getItem(storageKey);

    if (stored === "dark" || stored === "light") {
      return stored;
    }

    return "dark";
  }

  function toggleTheme() {
    const nextTheme = getCurrentTheme() === "light" ? "dark" : "light";
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      suppressHydrationWarning
      className={
        compact
          ? "flex h-11 w-full items-center gap-3 rounded-2xl px-2 text-left text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground-strong)]"
          : "theme-button-secondary rounded-full px-4 py-2 text-sm font-semibold"
      }
      aria-label="Toggle theme"
    >
      {compact ? (
        <>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-soft)] text-xs font-black text-[var(--foreground-strong)]">
            ◐
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-40 group-hover:opacity-100">
            Theme
          </span>
        </>
      ) : (
        <>Theme</>
      )}
    </button>
  );
}
