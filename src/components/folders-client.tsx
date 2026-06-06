"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type FolderListItem = {
  id: string;
  name: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  entryCount: number;
};

export function FoldersClient({
  initialFolders,
}: {
  initialFolders: FolderListItem[];
}) {
  const [folders, setFolders] = useState(initialFolders);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingPublic, setEditingPublic] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function createFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isPublic }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create folder.");
      }

      setFolders((current) => [
        {
          id: data.folder.id,
          name: data.folder.name,
          isPublic: data.folder.isPublic,
          createdAt: data.folder.createdAt,
          updatedAt: data.folder.updatedAt,
          entryCount: data.folder._count?.entries ?? 0,
        },
        ...current,
      ]);
      setName("");
      setIsPublic(false);
      setFeedback("Folder created.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not create folder.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(folder: FolderListItem) {
    setEditingId(folder.id);
    setEditingName(folder.name);
    setEditingPublic(folder.isPublic);
    setFeedback(null);
  }

  async function saveEdit(folderId: string) {
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingName,
          isPublic: editingPublic,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update folder.");
      }

      setFolders((current) =>
        current.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                name: data.folder.name,
                isPublic: data.folder.isPublic,
                updatedAt: data.folder.updatedAt,
              }
            : folder,
        ),
      );
      setEditingId(null);
      setFeedback("Folder updated.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not update folder.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteFolder(folder: FolderListItem) {
    const confirmed = window.confirm(`Delete "${folder.name}"?`);
    if (!confirmed) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete folder.");
      }

      setFolders((current) => current.filter((item) => item.id !== folder.id));
      setFeedback("Folder deleted.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not delete folder.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form
        onSubmit={createFolder}
        className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm"
      >
        <h2 className="text-2xl font-semibold text-slate-950">Create folder</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Public folders appear on your public profile. Private folders stay
          visible only to you.
        </p>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Name
          </span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Top 10 Anime"
            className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
          />
        </label>

        <label className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">Public</span>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
            className="h-5 w-5 accent-violet-600"
          />
        </label>

        {feedback ? (
          <div className="mt-4 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-700">
            {feedback}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="theme-button-primary mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Create folder"}
        </button>
      </form>

      <section className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-950">
            Your folders
          </h2>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {folders.length} total
          </span>
        </div>

        <div className="mt-5 grid gap-4">
          {folders.length ? (
            folders.map((folder) => {
              const editing = editingId === folder.id;

              return (
                <article
                  key={folder.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                >
                  {editing ? (
                    <div className="grid gap-3">
                      <input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                      />
                      <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <span className="text-sm font-semibold text-slate-700">
                          Public
                        </span>
                        <input
                          type="checkbox"
                          checked={editingPublic}
                          onChange={(event) =>
                            setEditingPublic(event.target.checked)
                          }
                          className="h-5 w-5 accent-violet-600"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(folder.id)}
                          disabled={submitting}
                          className="theme-button-primary flex-1 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="theme-button-secondary flex-1 rounded-full px-4 py-2 text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/folders/${folder.id}`}
                            className="text-xl font-semibold text-slate-950 hover:text-violet-700"
                          >
                            {folder.name}
                          </Link>
                          <p className="mt-1 text-sm text-slate-500">
                            {folder.entryCount} entries
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            folder.isPublic
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {folder.isPublic ? "Public" : "Private"}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/folders/${folder.id}`}
                          className="theme-button-secondary rounded-full px-4 py-2 text-sm font-semibold"
                        >
                          Open
                        </Link>
                        <button
                          type="button"
                          onClick={() => startEditing(folder)}
                          className="theme-button-secondary rounded-full px-4 py-2 text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFolder(folder)}
                          className="theme-button-danger rounded-full px-4 py-2 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
              No folders yet. Create your first collection.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
