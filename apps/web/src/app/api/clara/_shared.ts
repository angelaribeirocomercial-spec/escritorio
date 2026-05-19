import { NextResponse } from "next/server";

export function mapClaraApiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Falha inesperada na API da Clara.";

  if (
    message.includes("Workspace session is required") ||
    message.includes("Session is required")
  ) {
    return NextResponse.json({ ok: false, error: message }, { status: 401 });
  }

  if (message.includes("nao encontrado") || message.includes("not found")) {
    return NextResponse.json({ ok: false, error: message }, { status: 404 });
  }

  if (
    message.includes("Informe") ||
    message.includes("valido") ||
    message.includes("required") ||
    message.includes("campo")
  ) {
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}

