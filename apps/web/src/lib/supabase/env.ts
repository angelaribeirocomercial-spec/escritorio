export class SupabaseConfigError extends Error {
  constructor(message = "Supabase environment variables are not configured.") {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

function readSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getSupabaseEnv() {
  const env = readSupabaseEnv();

  if (!env) {
    throw new SupabaseConfigError();
  }

  return env;
}

export function isSupabaseConfigured() {
  return Boolean(readSupabaseEnv());
}
