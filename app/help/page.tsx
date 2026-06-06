import { HelpCenterClient } from "@/src/components/help-center-client";
import { getPublishedHelpArticles } from "@/src/lib/help";

export default async function HelpPage() {
  const articles = await getPublishedHelpArticles();

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Help Center
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            How can we help?
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Browse guides for using Viremo, from diary basics to community,
            folders, Pro features, and profile customization.
          </p>
        </div>

        <HelpCenterClient
          articles={articles.map((article) => ({
            id: article.id,
            title: article.title,
            content: article.content,
            category: article.category,
            order: article.order,
          }))}
        />
      </div>
    </div>
  );
}
