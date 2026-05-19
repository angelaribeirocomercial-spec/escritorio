import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function getDocumentFileSignedUrl(params: {
  bucket: string;
  path: string;
  expiresInSeconds?: number;
}) {
  if (!params.bucket || !params.path) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(params.bucket)
    .createSignedUrl(params.path, params.expiresInSeconds ?? 300);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
