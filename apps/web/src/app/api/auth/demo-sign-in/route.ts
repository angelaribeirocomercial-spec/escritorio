import { NextRequest, NextResponse } from "next/server";

import {
  DEMO_AUTH_COOKIE,
  isDemoAccessEnabled
} from "@/lib/auth/demo-access";

export async function POST(request: NextRequest) {
  if (!isDemoAccessEnabled()) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));

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
