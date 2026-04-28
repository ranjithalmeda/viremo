import {
  entryTypes,
  watchStatuses,
  type EntryTypeValue,
  type WatchStatusValue,
} from "@/src/lib/watchlist";

export type ParsedEntryPayload = {
  title: string;
  type: EntryTypeValue;
  status: WatchStatusValue;
  rating: number | null;
  notes: string | null;
  poster: string | null;
  tmdbId: number | null;
};

type ParseResult =
  | {
      success: true;
      data: ParsedEntryPayload;
    }
  | {
      success: false;
      error: string;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return { ok: true as const, value: null };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return { ok: false as const, error: "Numeric fields must contain valid numbers." };
  }

  return { ok: true as const, value: parsed };
}

function parseRating(value: unknown) {
  const parsed = parseNullableNumber(value);

  if (!parsed.ok) {
    return parsed;
  }

  if (parsed.value === null) {
    return parsed;
  }

  if (!Number.isInteger(parsed.value) || parsed.value < 1 || parsed.value > 5) {
    return {
      ok: false as const,
      error: "Rating must be a whole number between 1 and 5.",
    };
  }

  return parsed;
}

function parseTmdbId(value: unknown) {
  const parsed = parseNullableNumber(value);

  if (!parsed.ok) {
    return parsed;
  }

  if (parsed.value === null) {
    return parsed;
  }

  if (!Number.isInteger(parsed.value) || parsed.value < 1) {
    return {
      ok: false as const,
      error: "TMDB IDs must be positive whole numbers.",
    };
  }

  return parsed;
}

function parseNullableText(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text || null;
}

export function parseEntryPayload(body: unknown): ParseResult {
  if (!isRecord(body)) {
    return {
      success: false,
      error: "Request body must be a valid JSON object.",
    };
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return {
      success: false,
      error: "Title is required.",
    };
  }

  if (!entryTypes.includes(body.type as EntryTypeValue)) {
    return {
      success: false,
      error: "Type must be Movie, Series, or Anime.",
    };
  }

  if (!watchStatuses.includes(body.status as WatchStatusValue)) {
    return {
      success: false,
      error: "Status must be Watched, Finished, or Dropped.",
    };
  }

  const rating = parseRating(body.rating);
  if (!rating.ok) {
    return {
      success: false,
      error: rating.error,
    };
  }

  const tmdbId = parseTmdbId(body.tmdbId);
  if (!tmdbId.ok) {
    return {
      success: false,
      error: tmdbId.error,
    };
  }

  return {
    success: true,
    data: {
      title,
      type: body.type as EntryTypeValue,
      status: body.status as WatchStatusValue,
      rating: rating.value,
      notes: parseNullableText(body.notes),
      poster: parseNullableText(body.poster),
      tmdbId: tmdbId.value,
    },
  };
}
