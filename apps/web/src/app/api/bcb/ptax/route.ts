import { NextResponse } from "next/server";

import { getBcbPtaxConsultation } from "@/server/services/bcb/get-bcb-consultation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const moeda = url.searchParams.get("moeda") ?? undefined;
  const data = url.searchParams.get("data") ?? undefined;
  const consultation = await getBcbPtaxConsultation(moeda, data);

  return NextResponse.json(consultation);
}
