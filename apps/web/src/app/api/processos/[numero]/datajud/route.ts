import { NextResponse } from "next/server";
import { z } from "zod";

import { mapClaraApiError } from "@/app/api/clara/_shared";
import { getDataJudProcessConsultation } from "@/server/services/datajud/get-datajud-process";

const paramsSchema = z.object({
  numero: z.string().min(1, "Informe o numero do processo.")
});

export async function GET(_request: Request, { params }: { params: { numero: string } }) {
  try {
    const { numero } = paramsSchema.parse(params);
    const data = await getDataJudProcessConsultation(numero);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return mapClaraApiError(error);
  }
}
