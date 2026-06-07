"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Role } from "@/src/lib/domain-types";

type AdminUserActionsProps = {
  userId: string;
  role: Role;
  isBanned: boolean;
};

export function AdminUserActions({
  userId,
  role,
  isBanned,
}: AdminUserActionsProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateUser(action: string, payload: Record<string, unknown>) {
    setPendingAction(action);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "User update failed");
      }

      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "User update failed",
      );
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            updateUser("ban", {
              isBanned: !isBanned,
            })
          }
          disabled={Boolean(pendingAction)}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "ban"
            ? "Saving..."
            : isBanned
              ? "Unban"
              : "Ban"}
        </button>
        {role !== "PRO" ? (
          <button
            type="button"
            onClick={() =>
              updateUser("pro", {
                role: "PRO",
              })
            }
            disabled={Boolean(pendingAction)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingAction === "pro" ? "Saving..." : "Make PRO"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              updateUser("pro", {
                role: "USER",
              })
            }
            disabled={Boolean(pendingAction)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingAction === "pro" ? "Saving..." : "Demote to USER"}
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            updateUser("role", {
              role: role === "ADMIN" ? "USER" : "ADMIN",
            })
          }
          disabled={Boolean(pendingAction)}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "role"
            ? "Saving..."
            : role === "ADMIN"
              ? "Demote"
              : "Promote"}
        </button>
      </div>
      {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
