import { NextResponse } from "next/server";
import { z } from "zod";

import { mapClaraApiError } from "@/app/api/clara/_shared";
import { getClaraCaseModelsApiPayload } from "@/server/services/clara/clara-api";

const paramsSchema = z.object({
  id: z.string().min(1, "Informe o caso.")
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = paramsSchema.parse(params);
    const data = await getClaraCaseModelsApiPayload(id);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return mapClaraApiError(error);
  }
}

