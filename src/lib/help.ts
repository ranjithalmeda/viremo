import { helpCategories, type HelpCategory } from "@/src/lib/help-categories";
import { pgPool } from "@/src/lib/postgres";

export type HelpArticleRecord = {
  id: string;
  title: string;
  content: string;
  category: string;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type DefaultHelpArticle = {
  title: string;
  category: HelpCategory;
  content: string;
};

const defaultArticles: DefaultHelpArticle[] = [
  {
    category: "Getting Started",
    title: "How to create an account",
    content:
      "Open the sign in page, choose Create account, then enter your email and password. You can also sign in with Google if it is enabled.",
  },
  {
    category: "Getting Started",
    title: "How to set up your profile",
    content:
      "Visit Settings to update your display name, username, bio, and email. Use Appearance settings to upload a profile picture and customize your public profile.",
  },
  {
    category: "Diary & Entries",
    title: "How to add a movie/series/anime/book",
    content:
      "Go to Diary or Search, choose Add entry, select the title type, status, rating, poster, and notes, then save it to your diary.",
  },
  {
    category: "Diary & Entries",
    title: "How to rate and review entries",
    content:
      "Use ratings from 1.0 to 5.0 in 0.5 steps. Add notes to capture thoughts, reviews, favorite moments, or why you dropped something.",
  },
  {
    category: "Diary & Entries",
    title: "Understanding watch status",
    content:
      "Watching means currently watching. Completed means finished. Dropped means stopped. For books, Watching is displayed as Reading.",
  },
  {
    category: "Folders",
    title: "How to create folders",
    content:
      "Open Folders, enter a folder name, choose Public or Private, then create it. Folders help organize entries into custom collections.",
  },
  {
    category: "Folders",
    title: "How to add entries to folders",
    content:
      "From your Diary entry card, choose Add to folder, select a folder, and save. One entry can belong to multiple folders.",
  },
  {
    category: "Folders",
    title: "Public vs private folders",
    content:
      "Public folders appear on your profile and can be opened by visitors. Private folders are visible only to you.",
  },
  {
    category: "Community",
    title: "How to post a recommendation request",
    content:
      "Open Community, write a clear title and description, choose a category, optionally add images or a YouTube link, then post your request.",
  },
  {
    category: "Community",
    title: "How to reply and upvote",
    content:
      "Open a community post, write a reply, and submit it. Use Helpful to upvote replies that are useful.",
  },
  {
    category: "Community",
    title: "How to mark best answer",
    content:
      "If you created the post, you can mark one reply as Best Answer. This highlights the most useful recommendation for everyone.",
  },
  {
    category: "Social Features",
    title: "How to follow other users",
    content:
      "Open a public profile and choose Follow. Follow notifications appear in the Notifications page.",
  },
  {
    category: "Social Features",
    title: "How to send direct messages",
    content:
      "Open another user's profile and choose Message. Messages are basic page-load conversations with unread badges.",
  },
  {
    category: "Social Features",
    title: "How to leave profile comments",
    content:
      "Open a public profile, write a profile comment, and post it. Profile owners can delete comments on their own profile.",
  },
  {
    category: "AI Features",
    title: "What is AI Chat",
    content:
      "AI Chat is a Pro feature that helps discuss recommendations based on your diary, ratings, notes, and chat history.",
  },
  {
    category: "AI Features",
    title: "What are AI Recommendations",
    content:
      "AI Recommendations suggest movies, series, anime, and books from your diary signals. Free users receive local fallback recommendations.",
  },
  {
    category: "AI Features",
    title: "Pro feature limits",
    content:
      "Pro users have a daily AI Chat request limit set by the admin. The counter resets the next day.",
  },
  {
    category: "Settings & Appearance",
    title: "How to customize your diary layout",
    content:
      "Open Settings, then Appearance. Choose Grid, List, or Card layout and reorder profile sections.",
  },
  {
    category: "Settings & Appearance",
    title: "How to change themes and accent color",
    content:
      "Open Appearance settings to choose a theme and custom accent color. These choices also shape your public profile.",
  },
  {
    category: "Pro Features",
    title: "What is Pro",
    content:
      "Pro unlocks AI Chat and Gemini-powered recommendations when available. Admins manage Pro access.",
  },
  {
    category: "Pro Features",
    title: "How to get Pro access",
    content:
      "Contact an admin to request Pro access. Admins can promote users from the admin user management page.",
  },
];

function mapHelpArticle(row: Record<string, unknown>): HelpArticleRecord {
  return {
    id: String(row.id),
    title: String(row.title),
    content: String(row.content),
    category: String(row.category),
    isPublished: Boolean(row.isPublished),
    order: Number(row.order ?? 0),
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(String(row.createdAt)),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(String(row.updatedAt)),
  };
}

export async function seedDefaultHelpArticles() {
  const countResult = await pgPool.query(
    `SELECT COUNT(*)::int AS count FROM "HelpArticle"`,
  );
  const count = Number(countResult.rows[0]?.count ?? 0);

  if (count > 0) {
    return;
  }

  for (const [index, article] of defaultArticles.entries()) {
    await pgPool.query(
      `INSERT INTO "HelpArticle" (id, title, content, category, "isPublished", "order", "createdAt", "updatedAt")
       VALUES (replace(gen_random_uuid()::text, '-', ''), $1, $2, $3, true, $4, now(), now())`,
      [article.title, article.content, article.category, index + 1],
    );
  }
}

export async function getPublishedHelpArticles(): Promise<HelpArticleRecord[]> {
  await seedDefaultHelpArticles();

  const result = await pgPool.query(
    `SELECT id, title, content, category, "isPublished", "order", "createdAt", "updatedAt"
     FROM "HelpArticle"
     WHERE "isPublished" = true
     ORDER BY category ASC, "order" ASC, title ASC`,
  );

  return result.rows.map((row: Record<string, unknown>) => mapHelpArticle(row));
}

export async function getAllHelpArticlesForAdmin(): Promise<HelpArticleRecord[]> {
  await seedDefaultHelpArticles();

  const result = await pgPool.query(
    `SELECT id, title, content, category, "isPublished", "order", "createdAt", "updatedAt"
     FROM "HelpArticle"
     ORDER BY category ASC, "order" ASC, "updatedAt" DESC`,
  );

  return result.rows.map((row: Record<string, unknown>) => mapHelpArticle(row));
}

export async function createHelpArticle(data: {
  title: string;
  content: string;
  category: string;
  isPublished: boolean;
  order: number;
}) {
  const result = await pgPool.query(
    `INSERT INTO "HelpArticle" (id, title, content, category, "isPublished", "order", "createdAt", "updatedAt")
     VALUES (replace(gen_random_uuid()::text, '-', ''), $1, $2, $3, $4, $5, now(), now())
     RETURNING id, title, content, category, "isPublished", "order", "createdAt", "updatedAt"`,
    [data.title, data.content, data.category, data.isPublished, data.order],
  );

  return mapHelpArticle(result.rows[0]);
}

export async function updateHelpArticle(
  id: string,
  data: {
    title: string;
    content: string;
    category: string;
    isPublished: boolean;
    order: number;
  },
) {
  const result = await pgPool.query(
    `UPDATE "HelpArticle"
     SET title = $1, content = $2, category = $3, "isPublished" = $4, "order" = $5, "updatedAt" = now()
     WHERE id = $6
     RETURNING id, title, content, category, "isPublished", "order", "createdAt", "updatedAt"`,
    [data.title, data.content, data.category, data.isPublished, data.order, id],
  );

  return result.rows[0] ? mapHelpArticle(result.rows[0]) : null;
}

export async function deleteHelpArticle(id: string) {
  const result = await pgPool.query(
    `DELETE FROM "HelpArticle" WHERE id = $1 RETURNING id`,
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}

export function parseHelpPayload(body: Record<string, unknown>) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const category =
    typeof body.category === "string" ? body.category.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const order = Number(body.order ?? 0);
  const isPublished = Boolean(body.isPublished);

  if (!title || !category || !content) {
    return {
      ok: false as const,
      error: "Title, category, and content are required.",
    };
  }

  if (!helpCategories.includes(category as HelpCategory)) {
    return {
      ok: false as const,
      error: "Invalid help category.",
    };
  }

  return {
    ok: true as const,
    data: {
      title,
      category,
      content,
      isPublished,
      order: Number.isFinite(order) ? Math.floor(order) : 0,
    },
  };
}
