import { NextResponse } from "next/server";

import { getBcbSgsConsultation } from "@/server/services/bcb/get-bcb-consultation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const serie = url.searchParams.get("serie") ?? undefined;
  const dataInicial = url.searchParams.get("dataInicial") ?? undefined;
  const dataFinal = url.searchParams.get("dataFinal") ?? undefined;
  const consultation = await getBcbSgsConsultation(serie, dataInicial, dataFinal);

  return NextResponse.json(consultation);
}
