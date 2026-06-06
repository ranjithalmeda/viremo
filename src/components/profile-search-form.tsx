"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileSearchFormProps = {
  compact?: boolean;
};

export function ProfileSearchForm({
  compact = false,
}: ProfileSearchFormProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const identifier = value.trim();

    if (!identifier) {
      setError("Enter a username or share ID.");
      return;
    }

    setError(null);
    router.push(`/profile/${encodeURIComponent(identifier)}`);
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Find by username or ID"
          className="theme-input min-w-0 flex-1 rounded-full px-4 py-2 text-sm outline-none"
        />
        <button
          type="submit"
          className="theme-button-primary rounded-full px-4 py-2 text-sm font-semibold"
        >
          Find
        </button>
      </form>
    );
  }

  return (
    <div className="glass rounded-[1.8rem] p-6 sm:p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">
        Find a profile
      </p>
      <h2 className="theme-heading mt-3 text-2xl font-semibold">
        Jump to someone&apos;s public watchlist.
      </h2>
      <p className="theme-muted mt-2 max-w-xl text-sm leading-6">
        Enter a username like <span className="font-semibold">almeda</span> or
        a share ID like <span className="font-semibold">A7K2P9</span> to open a
        public watchlist.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Username or 6-character share ID"
          className="theme-input min-w-0 flex-1 rounded-2xl px-4 py-3 text-sm outline-none"
        />
        <button
          type="submit"
          className="theme-button-primary rounded-2xl px-5 py-3 text-sm font-semibold"
        >
          Open profile
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="pill theme-text">Search by username</div>
        <div className="pill theme-text">Search by share ID</div>
      </div>
      {error ? (
        <p className="mt-3 text-sm font-medium text-rose-400">{error}</p>
      ) : null}
    </div>
  );
}
