import { NextRequest, NextResponse } from "next/server";

import { listClaraRecords } from "@/server/services/clara/clara-record-store";
import { listClaraMinutas } from "@/server/services/clara/clara-minutas-store";
import { getClaraTextDraftArtifact } from "@/server/services/clara/get-clara-artifacts";

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return 12;
  }

  return Math.min(parsed, 50);
}

export async function GET(request: NextRequest) {
  const limit = parseLimit(new URL(request.url).searchParams.get("limit"));
  const persistedRecords = await listClaraMinutas(limit);
  const records =
    persistedRecords.length > 0
      ? persistedRecords
      : (await listClaraRecords(limit)).filter((record) => record.kind === "text-draft");
  type TextDraftPayload = Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;

  return NextResponse.json({
    ok: true,
    data: {
      limit,
      records: records.map((record) => ({
        ...(record.payload as TextDraftPayload),
        id: record.id,
        workflowStatus: record.workflowStatus,
        reviewNote: record.reviewNote ?? "",
        updatedAt: record.updatedAt,
        createdAt: record.createdAt,
        title: record.editedTitle ?? (record.payload as TextDraftPayload).caseLabel,
        detail: record.editedDetail ?? (record.payload as TextDraftPayload).preview,
        caseLabel: (record.payload as TextDraftPayload).caseLabel,
        documentLabel: (record.payload as TextDraftPayload).documentLabel,
        pieceLabel: (record.payload as TextDraftPayload).pieceLabel
      })),
      summary: `Minutas da Clara com ${records.length} registro(s) text-draft.`
    }
  });
}
