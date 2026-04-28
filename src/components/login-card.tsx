"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

type LoginCardProps = {
  error?: string;
};

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Email or password was incorrect.",
  AccessDenied: "This account is not allowed to sign in.",
  Configuration: "Authentication is not configured correctly yet.",
  default: "We could not sign you in. Please try again.",
};

type Mode = "signin" | "signup";

async function readJsonSafely(response: Response) {
  const text = await response.text();

  if (!text) {
    return {} as { error?: string; details?: { message?: string; code?: string } };
  }

  try {
    return JSON.parse(text) as {
      error?: string;
      details?: { message?: string; code?: string };
    };
  } catch {
    return {} as { error?: string; details?: { message?: string; code?: string } };
  }
}

export function LoginCard({ error }: LoginCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(
    error ? errorMessages[error] || `Sign-in failed: ${error}` : null,
  );
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn() {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (!result || result.error) {
      setMessage(
        errorMessages[result?.error || "default"] ||
          `Sign-in failed: ${result?.error}`,
      );
      return;
    }

    setMessage(null);
    router.push(result.url || "/dashboard");
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });

        const payload = await readJsonSafely(response);

        if (!response.ok) {
          setMessage(
            payload.details?.message
              ? `${payload.error || "Account creation failed."} (${payload.details.message}${payload.details.code ? `, ${payload.details.code}` : ""})`
              : payload.error || "Account creation failed.",
          );
          return;
        }

        setMessage("Account created. Signing you in...");
      }

      startTransition(() => {
        void handleSignIn();
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const busy = isSubmitting || isPending;

  return (
    <div className="glass-strong mx-auto w-full max-w-md rounded-[2rem] border border-slate-200/70 bg-white/95 p-8 shadow-xl sm:p-10">
      <span className="inline-flex rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
        Email login
      </span>
      <h1 className="theme-heading mt-5 text-4xl font-semibold">
        {mode === "signin" ? "Welcome back." : "Create your account."}
      </h1>
      <p className="theme-muted mt-4 text-base leading-7">
        {mode === "signin"
          ? "Use your email and password to open the diary and keep building the UI flow."
          : "Create a normal login for now so we can keep shipping the app while GitHub auth stays paused."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-full border border-slate-200/70 bg-slate-50 p-1 text-sm font-semibold text-slate-700">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setMessage(null);
          }}
          className={`rounded-full px-4 py-2 ${
            mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setMessage(null);
          }}
          className={`rounded-full px-4 py-2 ${
            mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
        >
          Create account
        </button>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <label className="block">
            <span className="theme-text mb-2 block text-sm font-semibold">
              Name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
              placeholder="Optional display name"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="theme-text mb-2 block text-sm font-semibold">
            Email
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="theme-text mb-2 block text-sm font-semibold">
            Password
          </span>
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="At least 8 characters"
          />
        </label>

        {message ? (
          <div className="theme-soft-panel theme-text rounded-2xl px-4 py-3 text-sm font-medium leading-6">
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="theme-button-neutral inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy
            ? mode === "signin"
              ? "Signing in..."
              : "Creating account..."
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="theme-button-secondary inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold"
        >
          Back to home
        </Link>
        <Link
          href="/"
          className="theme-button-secondary inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold"
        >
          See product overview
        </Link>
      </div>
    </div>
  );
}
