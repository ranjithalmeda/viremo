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
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Username or ID"
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
        <button
          type="submit"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Find
        </button>
      </form>
    );
  }

  return (
    <div className="glass rounded-[1.6rem] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
        Find a profile
      </p>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
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
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
        <button
          type="submit"
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Open profile
        </button>
      </form>
      {error ? (
        <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}
