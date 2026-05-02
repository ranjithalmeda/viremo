import type { EntryTypeValue } from "@/src/lib/watchlist";

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

export type BooksSearchResult = {
  id: string;
  source: "books";
  tmdbId: null;
  title: string;
  type: EntryTypeValue;
  mediaType: string;
  poster: string | null;
  year: string | null;
  overview: string | null;
};

export function hasGoogleBooksKey() {
  return Boolean(GOOGLE_BOOKS_API_KEY);
}

function getGoogleBooksKey() {
  if (!GOOGLE_BOOKS_API_KEY) {
    throw new Error("Google Books API key is not configured.");
  }

  return GOOGLE_BOOKS_API_KEY;
}

export async function searchBooks(query: string): Promise<BooksSearchResult[]> {
  const apiKey = getGoogleBooksKey();

  const params = new URLSearchParams({
    q: query,
    maxResults: "12",
    key: apiKey,
  });

  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${params}`, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Google Books request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    items?: Array<{
      id?: string;
      volumeInfo?: {
        title?: string | null;
        authors?: string[] | null;
        publishedDate?: string | null;
        description?: string | null;
        imageLinks?: {
          thumbnail?: string | null;
          smallThumbnail?: string | null;
        } | null;
      } | null;
    }>;
  };

  return (payload.items ?? [])
    .filter((item): item is { id: string; volumeInfo: NonNullable<typeof item.volumeInfo> } =>
      Boolean(item.id && item.volumeInfo?.title),
    )
    .slice(0, 12)
    .map((item) => {
      const volume = item.volumeInfo;
      const thumbnail =
        volume.imageLinks?.thumbnail || volume.imageLinks?.smallThumbnail || null;

      return {
        id: `books-${item.id}`,
        source: "books",
        tmdbId: null,
        title: volume.title || "Untitled",
        type: "BOOK" as EntryTypeValue,
        mediaType: "book",
        poster: thumbnail ? thumbnail.replace(/^http:/, "https:") : null,
        year: volume.publishedDate?.slice(0, 4) || null,
        overview: volume.description || volume.authors?.join(", ") || null,
      };
    });
}
