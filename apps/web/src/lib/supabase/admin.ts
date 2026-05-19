import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv, SupabaseConfigError } from "@/lib/supabase/env";

export function getSupabaseAdminClient() {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new SupabaseConfigError(
      "SUPABASE_SERVICE_ROLE_KEY is required for privileged Supabase server operations."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
