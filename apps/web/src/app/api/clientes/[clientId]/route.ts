import { NextResponse } from "next/server";
import { z } from "zod";

import { mapClaraApiError } from "@/app/api/clara/_shared";
import { getClaraClientApiPayload } from "@/server/services/clara/clara-api";

const paramsSchema = z.object({
  clientId: z.string().min(1, "Informe o cliente.")
});

export async function GET(_request: Request, { params }: { params: { clientId: string } }) {
  try {
    const { clientId } = paramsSchema.parse(params);
    const data = await getClaraClientApiPayload(clientId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return mapClaraApiError(error);
  }
}
