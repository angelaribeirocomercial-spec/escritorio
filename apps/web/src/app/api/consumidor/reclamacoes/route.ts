import { NextResponse } from "next/server";
import { z } from "zod";

import { mapClaraApiError } from "@/app/api/clara/_shared";
import { getConsumidorReclamacoesConsultation } from "@/server/services/consumidor/get-consumidor-reclamacoes";

const querySchema = z.object({
  empresa: z.string().trim().min(1, "Informe uma empresa valida para consulta no Consumidor.gov.br.")
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { empresa } = querySchema.parse({
      empresa: url.searchParams.get("empresa") ?? ""
    });

    const data = await getConsumidorReclamacoesConsultation(empresa);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return mapClaraApiError(error);
  }
}
