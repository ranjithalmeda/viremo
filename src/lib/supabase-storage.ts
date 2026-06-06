import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const configuredUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(databaseUrl);
    const [, projectRef] = decodeURIComponent(parsedUrl.username).split(".");

    return projectRef ? `https://${projectRef}.supabase.co` : undefined;
  } catch {
    return undefined;
  }
}

function getSupabaseServiceKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function createSupabaseStorageClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseServiceKey();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase Storage is not configured.");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
