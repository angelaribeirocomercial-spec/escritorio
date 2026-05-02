import { NextRequest, NextResponse } from "next/server";

import { DEMO_AUTH_COOKIE } from "@/lib/auth/demo-access";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    await supabase.auth.signOut();
  }

  const response = NextResponse.redirect(new URL("/sign-in", request.url));

  response.cookies.set({
    name: DEMO_AUTH_COOKIE,
    value: "",
    path: "/",
    maxAge: 0
  });

  return response;
}
