"use client";

import { useMemo, useState } from "react";

import { helpCategories } from "@/src/lib/help-categories";

type HelpArticleView = {
  id: string;
  title: string;
  content: string;
  category: string;
  order: number;
};

export function HelpCenterClient({
  articles,
}: {
  articles: HelpArticleView[];
}) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(articles[0]?.id ?? null);

  const filteredByCategory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return helpCategories.map((category) => ({
      category,
      articles: articles.filter((article) => {
        if (article.category !== category) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return `${article.title} ${article.content}`
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    }));
  }, [articles, query]);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-5 shadow-sm">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
          placeholder="Search help articles..."
        />
      </div>

      {filteredByCategory.map(({ category, articles: categoryArticles }) =>
        categoryArticles.length ? (
          <section key={category} className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-500">
                {category}
              </p>
            </div>
            <div className="space-y-3">
              {categoryArticles.map((article) => {
                const open = openId === article.id;

                return (
                  <article
                    key={article.id}
                    className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/95 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : article.id)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="text-lg font-bold text-slate-950">
                        {article.title}
                      </span>
                      <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-600">
                        {open ? "-" : "+"}
                      </span>
                    </button>
                    {open ? (
                      <div className="border-t border-slate-200 px-6 py-5">
                        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {article.content}
                        </p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}
