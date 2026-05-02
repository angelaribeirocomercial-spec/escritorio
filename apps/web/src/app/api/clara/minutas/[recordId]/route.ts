import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { mapClaraApiError } from "@/app/api/clara/_shared";
import {
  getClaraRecord,
  updateClaraRecordContent,
  updateClaraRecordReviewNote,
  updateClaraRecordWorkflowStatus
} from "@/server/services/clara/clara-record-store";
import { getClaraTextDraftArtifact } from "@/server/services/clara/get-clara-artifacts";

type TextDraftPayload = Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;

const bodySchema = z.object({
  workflowStatus: z.enum(["created", "reviewed", "completed"]).optional(),
  reviewNote: z.string().optional(),
  editedTitle: z.string().optional(),
  editedDetail: z.string().optional()
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await context.params;
    const record = await getClaraRecord(recordId);

    if (!record || record.kind !== "text-draft") {
      return NextResponse.json({ ok: false, error: `Registro ${recordId} nao encontrado.` }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: record });
  } catch (error) {
    return mapClaraApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await context.params;
    const body = bodySchema.parse(await request.json());
    const current = await getClaraRecord(recordId);

    if (!current || current.kind !== "text-draft") {
      return NextResponse.json({ ok: false, error: `Registro ${recordId} nao encontrado.` }, { status: 404 });
    }

    if (body.workflowStatus) {
      await updateClaraRecordWorkflowStatus(recordId, body.workflowStatus);
    }

    if (typeof body.reviewNote === "string") {
      await updateClaraRecordReviewNote(recordId, body.reviewNote);
    }

    if (body.editedTitle || body.editedDetail) {
      await updateClaraRecordContent({
        recordId,
        editedTitle: body.editedTitle ?? current.editedTitle ?? (current.payload as TextDraftPayload).caseLabel,
        editedDetail: body.editedDetail ?? current.editedDetail ?? (current.payload as TextDraftPayload).preview
      });
    }

    const updated = await getClaraRecord(recordId);
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    return mapClaraApiError(error);
  }
}
