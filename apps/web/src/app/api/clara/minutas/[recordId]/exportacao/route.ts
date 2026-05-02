import { NextRequest, NextResponse } from "next/server";

import { mapClaraApiError } from "@/app/api/clara/_shared";
import { getClaraRecord } from "@/server/services/clara/clara-record-store";
import { getClaraTextDraftArtifact } from "@/server/services/clara/get-clara-artifacts";

type TextDraftPayload = Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await context.params;
    const record = await getClaraRecord(recordId);

    if (!record || record.kind !== "text-draft") {
      return NextResponse.json({ ok: false, error: `Registro ${recordId} nao encontrado.` }, { status: 404 });
    }

    const payload = record.payload as TextDraftPayload;

    const url = new URL(request.url);
    const format = url.searchParams.get("format") ?? "docx";
    const editorHref = `/editor-de-texto/meus-textos?record=${record.id}`;
    const baseName = `${payload.caseLabel} - ${payload.pieceLabel}`.replace(/\s+/g, " ").trim();

    return NextResponse.json({
      ok: true,
      data: {
        recordId: record.id,
        format,
        printable: true,
        editorHref,
        exports: {
          docx: {
            fileName: `${baseName}.docx`,
            available: true
          },
          pdf: {
            fileName: `${baseName}.pdf`,
            available: true
          }
        },
        summary: `Exportacao controlada da minuta ${record.id} pronta para DOCX, PDF e impressao.`
      }
    });
  } catch (error) {
    return mapClaraApiError(error);
  }
}
