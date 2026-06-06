export const entryTypes = ["MOVIE", "SERIES", "ANIME", "BOOK"] as const;
export const watchStatuses = ["WATCHING", "COMPLETED", "DROPPED"] as const;

export type EntryTypeValue = (typeof entryTypes)[number];
export type WatchStatusValue = (typeof watchStatuses)[number];
export type EntryFilter = "ALL" | EntryTypeValue | WatchStatusValue;

export type EntryRecord = {
  id: string;
  title: string;
  type: EntryTypeValue;
  status: WatchStatusValue;
  rating: number | null;
  notes: string | null;
  poster: string | null;
  tmdbId: number | null;
  createdAt: string;
  updatedAt: string;
};

export const typeLabels: Record<EntryTypeValue, string> = {
  MOVIE: "Movie",
  SERIES: "Series",
  ANIME: "Anime",
  BOOK: "Book",
};

export const statusLabels: Record<WatchStatusValue, string> = {
  WATCHING: "Watching",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
};

export function typeFromMediaType(
  mediaType?: string | null,
): EntryTypeValue {
  if (mediaType === "movie") return "MOVIE";
  if (mediaType === "tv") return "SERIES";
  return "BOOK";
}

export function formatType(type: EntryTypeValue) {
  return typeLabels[type];
}

export function formatStatus(status: WatchStatusValue, type?: EntryTypeValue) {
  if (type === "BOOK" && status === "WATCHING") {
    return "Reading";
  }

  return statusLabels[status];
}

export function formatRating(rating: number | null) {
  return typeof rating === "number" ? `${rating.toFixed(1)} ★` : "No rating";
}

export function getPosterFallback(title: string) {
  const letter = title.trim().charAt(0).toUpperCase() || "W";
  return letter;
}
