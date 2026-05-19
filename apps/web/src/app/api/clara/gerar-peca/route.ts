import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { mapClaraApiError } from "@/app/api/clara/_shared";
import { getClaraPieceDraftApiPayload } from "@/server/services/clara/clara-api";

const bodySchema = z.object({
  caseId: z.string().min(1, "Informe o caso."),
  documentId: z.string().optional(),
  piece: z.string().optional(),
  objective: z.string().optional(),
  committed: z.boolean().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.parse(await request.json());
    const data = await getClaraPieceDraftApiPayload(body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return mapClaraApiError(error);
  }
}

