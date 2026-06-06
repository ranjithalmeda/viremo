"use client";

import type { HelpArticle } from "@prisma/client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { helpCategories } from "@/src/lib/help-categories";

type ArticleDraft = {
  id?: string;
  title: string;
  category: string;
  content: string;
  isPublished: boolean;
  order: number;
};

const emptyDraft: ArticleDraft = {
  title: "",
  category: helpCategories[0],
  content: "",
  isPublished: true,
  order: 0,
};

export function AdminHelpClient({
  initialArticles,
}: {
  initialArticles: HelpArticle[];
}) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [draft, setDraft] = useState<ArticleDraft>(emptyDraft);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editing = Boolean(draft.id);

  const groupedArticles = useMemo(
    () =>
      helpCategories.map((category) => ({
        category,
        articles: articles.filter((article) => article.category === category),
      })),
    [articles],
  );

  function editArticle(article: HelpArticle) {
    setDraft({
      id: article.id,
      title: article.title,
      category: article.category,
      content: article.content,
      isPublished: article.isPublished,
      order: article.order,
    });
    setMessage(null);
  }

  async function saveArticle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        editing ? `/api/admin/help/${draft.id}` : "/api/admin/help",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save article.");
      }

      setArticles((current) =>
        editing
          ? current.map((article) =>
              article.id === data.article.id ? data.article : article,
            )
          : [...current, data.article],
      );
      setDraft(emptyDraft);
      setMessage("Article saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save article.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteArticle(articleId: string) {
    if (!window.confirm("Delete this help article?")) {
      return;
    }

    const response = await fetch(`/api/admin/help/${articleId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error || "Could not delete article.");
      return;
    }

    setArticles((current) => current.filter((article) => article.id !== articleId));
    if (draft.id === articleId) {
      setDraft(emptyDraft);
    }
  }

  async function togglePublished(article: HelpArticle) {
    const response = await fetch(`/api/admin/help/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: article.title,
        category: article.category,
        content: article.content,
        order: article.order,
        isPublished: !article.isPublished,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not update article.");
      return;
    }

    setArticles((current) =>
      current.map((item) => (item.id === article.id ? data.article : item)),
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <form
        onSubmit={saveArticle}
        className="h-fit rounded-[2rem] border border-slate-200/70 bg-white/95 p-6 shadow-sm"
      >
        <h2 className="text-2xl font-bold text-slate-950">
          {editing ? "Edit article" : "Create article"}
        </h2>
        <div className="mt-5 space-y-4">
          <input
            required
            value={draft.title}
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
            className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="Article title"
          />
          <select
            value={draft.category}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
          >
            {helpCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <textarea
            required
            value={draft.content}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                content: event.target.value,
              }))
            }
            className="theme-input min-h-56 w-full rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="Article content"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Display order
              </span>
              <input
                type="number"
                value={draft.order}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    order: Number(event.target.value),
                  }))
                }
                className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={draft.isPublished}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    isPublished: event.target.checked,
                  }))
                }
              />
              Published
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="theme-button-neutral rounded-full px-5 py-3 text-sm font-bold disabled:opacity-60"
            >
              {saving ? "Saving..." : editing ? "Update article" : "Create article"}
            </button>
            {editing ? (
              <button
                type="button"
                onClick={() => setDraft(emptyDraft)}
                className="theme-button-secondary rounded-full px-5 py-3 text-sm font-bold"
              >
                Cancel
              </button>
            ) : null}
          </div>
          {message ? (
            <p className="text-sm font-semibold text-slate-600">{message}</p>
          ) : null}
        </div>
      </form>

      <div className="space-y-5">
        {groupedArticles.map(({ category, articles }) =>
          articles.length ? (
            <section
              key={category}
              className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-5 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-950">{category}</h2>
              <div className="mt-4 divide-y divide-slate-200">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">
                        {article.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Order {article.order} ·{" "}
                        {article.isPublished ? "Published" : "Unpublished"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => togglePublished(article)}
                        className="theme-button-secondary rounded-full px-3 py-2 text-xs font-bold"
                      >
                        {article.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => editArticle(article)}
                        className="theme-button-secondary rounded-full px-3 py-2 text-xs font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteArticle(article.id)}
                        className="theme-button-danger rounded-full px-3 py-2 text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null,
        )}
      </div>
    </div>
  );
}
