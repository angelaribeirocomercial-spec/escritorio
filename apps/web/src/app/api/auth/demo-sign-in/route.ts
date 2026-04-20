import { NextRequest, NextResponse } from "next/server";

import {
  DEMO_AUTH_COOKIE,
  isLocalDemoAccessEnabled
} from "@/lib/auth/demo-access";

export async function POST(request: NextRequest) {
  if (!isLocalDemoAccessEnabled()) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));

  response.cookies.set({
    name: DEMO_AUTH_COOKIE,
    value: "enabled",
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  return response;
}
