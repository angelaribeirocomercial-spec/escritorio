const fallbackUrl = "https://example.supabase.co";
const fallbackAnonKey = "public-anon-key-placeholder";

export function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallbackUrl,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? fallbackAnonKey
  };
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
