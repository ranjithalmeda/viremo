import { type EntryTypeValue, typeFromMediaType } from "@/src/lib/watchlist";

export type TmdbSearchResult = {
  id: string;
  source: "tmdb";
  tmdbId: number;
  title: string;
  type: EntryTypeValue;
  mediaType: string;
  poster: string | null;
  year: string | null;
  overview: string | null;
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

export function hasTmdbKey() {
  const key = process.env.TMDB_API_KEY;
  return Boolean(key && key !== "your-tmdb-api-key");
}

export async function searchTmdb(query: string): Promise<TmdbSearchResult[]> {
  if (!hasTmdbKey()) {
    throw new Error("TMDB_API_KEY is not configured yet.");
  }

  const params = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY as string,
    query,
    include_adult: "false",
  });

  const response = await fetch(`${TMDB_BASE_URL}/search/multi?${params}`, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    results?: Array<{
      id: number;
      media_type?: string | null;
      title?: string | null;
      name?: string | null;
      release_date?: string | null;
      first_air_date?: string | null;
      poster_path?: string | null;
      overview?: string | null;
    }>;
  };

  return (payload.results ?? [])
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .slice(0, 12)
    .map((item) => ({
      id: `tmdb-${item.id}`,
      source: "tmdb",
      tmdbId: item.id,
      title: item.title || item.name || "Untitled",
      type: typeFromMediaType(item.media_type),
      mediaType: item.media_type || "unknown",
      poster: item.poster_path ? `${TMDB_IMAGE_URL}${item.poster_path}` : null,
      year: (item.release_date || item.first_air_date || "").slice(0, 4) || null,
      overview: item.overview || null,
    }));
}
