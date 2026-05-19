import { NextRequest, NextResponse } from "next/server";

import {
  DEMO_AUTH_COOKIE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  isDemoAccessEnabled
} from "@/lib/auth/demo-access";
import { getDemoClaraFirstHref } from "@/lib/auth/demo-entry";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!isDemoAccessEnabled()) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD
    });

    if (!error) {
      const response = NextResponse.redirect(new URL(getDemoClaraFirstHref(), request.url));

      response.cookies.set({
        name: DEMO_AUTH_COOKIE,
        value: "",
        path: "/",
        maxAge: 0
      });

      return response;
    }
  }

  const response = NextResponse.redirect(new URL(getDemoClaraFirstHref(), request.url));

  response.cookies.set({
    name: DEMO_AUTH_COOKIE,
    value: "enabled",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  return response;
}
