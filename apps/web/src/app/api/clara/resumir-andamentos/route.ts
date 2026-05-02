import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { mapClaraApiError } from "@/app/api/clara/_shared";
import { getClaraProcessSummaryApiPayload } from "@/server/services/clara/clara-api";

const bodySchema = z.object({
  processId: z.string().min(1, "Informe o processo."),
  clientId: z.string().optional(),
  documentId: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.parse(await request.json());
    const data = await getClaraProcessSummaryApiPayload(body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return mapClaraApiError(error);
  }
}

