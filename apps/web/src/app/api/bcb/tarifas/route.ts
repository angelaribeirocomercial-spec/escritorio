import { NextResponse } from "next/server";

import { getBcbTarifasConsultation } from "@/server/services/bcb/get-bcb-consultation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const instituicao = url.searchParams.get("instituicao") ?? undefined;
  const consultation = await getBcbTarifasConsultation(instituicao);

  return NextResponse.json(consultation);
}
