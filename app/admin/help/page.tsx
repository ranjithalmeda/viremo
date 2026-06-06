import { AdminHelpClient } from "@/src/components/admin/admin-help-client";
import { requireAdminPage } from "@/src/lib/admin";
import { getAllHelpArticlesForAdmin } from "@/src/lib/help";

export default async function AdminHelpPage() {
  await requireAdminPage();
  const articles = await getAllHelpArticlesForAdmin();

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            Help Articles
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Create, edit, publish, unpublish, and delete help center articles.
          </p>
        </div>

        <AdminHelpClient initialArticles={articles} />
      </div>
    </div>
  );
}
