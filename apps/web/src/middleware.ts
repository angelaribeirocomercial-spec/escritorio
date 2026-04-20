import { NextResponse, type NextRequest } from "next/server";

import { DEMO_AUTH_COOKIE, isLocalDemoAccessEnabled } from "@/lib/auth/demo-access";

const protectedPrefixes = [
  "/dashboard",
  "/pessoas",
  "/clientes",
  "/casos",
  "/processos",
  "/diario-oficial",
  "/andamentos",
  "/agenda",
  "/financeiro",
  "/relatorios",
  "/estatisticas",
  "/documentos",
  "/site",
  "/editor-de-texto",
  "/tarefas",
  "/clara",
  "/lexia",
  "/equipe",
  "/configuracoes"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const hasSupabaseAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  const hasDemoCookie =
    isLocalDemoAccessEnabled() &&
    request.cookies.get(DEMO_AUTH_COOKIE)?.value === "enabled";

  if (hasSupabaseAuthCookie || hasDemoCookie) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/sign-in", request.url));
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pessoas/:path*",
    "/clientes/:path*",
    "/casos/:path*",
    "/processos/:path*",
    "/diario-oficial/:path*",
    "/andamentos/:path*",
    "/agenda/:path*",
    "/financeiro/:path*",
    "/relatorios/:path*",
    "/estatisticas/:path*",
    "/documentos/:path*",
    "/site/:path*",
    "/editor-de-texto/:path*",
    "/tarefas/:path*",
    "/clara/:path*",
    "/lexia/:path*",
    "/equipe/:path*",
    "/configuracoes/:path*"
  ]
};
