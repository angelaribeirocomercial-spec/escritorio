import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/supabase/env";

export function getSupabaseServerClient() {
  const cookieStore = cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server Components cannot mutate cookies directly during render.
        }
      },
      remove(name: string, options) {
        try {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        } catch {
          // Server Components cannot mutate cookies directly during render.
        }
      }
    }
  });
}
