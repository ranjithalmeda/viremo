"use client";

type ConfirmToastProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmToast({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmToastProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-lg rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_24px_70px_rgba(45,27,78,0.28)] sm:bottom-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black text-[var(--foreground-strong)]">
            {title}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {message}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="theme-button-secondary flex-1 rounded-full px-4 py-2 text-sm font-bold disabled:opacity-60 sm:flex-none"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="theme-button-danger flex-1 rounded-full px-4 py-2 text-sm font-bold disabled:opacity-60 sm:flex-none"
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
