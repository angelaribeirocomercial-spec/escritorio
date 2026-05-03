import { NextResponse } from "next/server";
import { z } from "zod";

import { mapClaraApiError } from "@/app/api/clara/_shared";
import { getJurisprudenceConsultation } from "@/server/services/jurisprudence/get-jurisprudence-consultation";

const querySchema = z.object({
  consulta: z.string().trim().min(1, "Informe uma consulta valida para a jurisprudencia.")
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { consulta } = querySchema.parse({
      consulta: url.searchParams.get("consulta") ?? ""
    });

    const data = await getJurisprudenceConsultation("stj", consulta);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return mapClaraApiError(error);
  }
}
