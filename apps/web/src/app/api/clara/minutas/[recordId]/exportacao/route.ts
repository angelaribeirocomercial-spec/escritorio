import { NextRequest, NextResponse } from "next/server";

import { mapClaraApiError } from "@/app/api/clara/_shared";
import { getClaraRecord } from "@/server/services/clara/clara-record-store";
import { getClaraMinuta } from "@/server/services/clara/clara-minutas-store";
import {
  buildTextDraftDefaultBody,
  buildTextDraftDefaultTitle,
  buildTextDraftExportLines
} from "@/server/services/clara/clara-text-draft-renderer";
import { getClaraTextDraftArtifact } from "@/server/services/clara/get-clara-artifacts";

type TextDraftPayload = Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;

const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const PDF_MARGIN = 48;
const PDF_TITLE_SIZE = 18;
const PDF_SUBTITLE_SIZE = 10;
const PDF_BODY_SIZE = 11;
const PDF_LINE_HEIGHT = 14;
const PDF_MAX_BODY_LINES_PER_PAGE = 34;

function escapePdfText(text: string) {
  return text.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function wrapPdfLine(text: string, maxLength = 84) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [""];
  }

  const words = normalized.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxLength) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    if (word.length > maxLength) {
      let sliceStart = 0;

      while (sliceStart < word.length) {
        const chunk = word.slice(sliceStart, sliceStart + maxLength);
        if (chunk.length === maxLength) {
          lines.push(chunk);
        } else {
          currentLine = chunk;
        }
        sliceStart += maxLength;
      }
      continue;
    }

    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [""];
}

function wrapPdfParagraph(text: string, maxLength = 84) {
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    lines.push(...wrapPdfLine(paragraph, maxLength));
  }

  return lines;
}

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function buildPdfContent(lines: string[]) {
  const pages = chunkArray(lines, PDF_MAX_BODY_LINES_PER_PAGE);

  return pages
    .map((pageLines) => {
      const pageContent: string[] = [];
      const titleY = PDF_PAGE_HEIGHT - PDF_MARGIN - 18;
      const subtitleY = titleY - 24;
      let bodyY = subtitleY - 28;

      pageContent.push(
        `BT\n/F1 ${PDF_TITLE_SIZE} Tf\n1 0 0 1 ${PDF_MARGIN} ${titleY.toFixed(2)} Tm\n(${escapePdfText(
          "Minuta assistida da Clara"
        )}) Tj\nET`
      );
      pageContent.push(
        `BT\n/F1 ${PDF_SUBTITLE_SIZE} Tf\n1 0 0 1 ${PDF_MARGIN} ${subtitleY.toFixed(2)} Tm\n(${escapePdfText(
          "Documento juridico simulado para demonstracao interna"
        )}) Tj\nET`
      );

      for (const line of pageLines) {
        pageContent.push(
          `BT\n/F1 ${PDF_BODY_SIZE} Tf\n1 0 0 1 ${PDF_MARGIN} ${bodyY.toFixed(2)} Tm\n(${escapePdfText(
            line
          )}) Tj\nET`
        );
        bodyY -= PDF_LINE_HEIGHT;
      }

      return pageContent.join("\n");
    })
    .map((pageContent) => ({
      content: pageContent,
      length: Buffer.byteLength(pageContent, "utf8")
    }));
}

function buildPdfDocument(lines: string[]) {
  const pages = buildPdfContent(lines);
  const objectCount = 3 + pages.length * 2;
  const objects = new Array<string>(objectCount).fill("");
  const fontObjectNumber = 3;
  const contentStartObjectNumber = 4;
  const pageStartObjectNumber = contentStartObjectNumber + pages.length;
  const pagesObjectNumber = 2;

  objects[fontObjectNumber - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  pages.forEach((page, index) => {
    const contentObjectNumber = contentStartObjectNumber + index;
    const pageObjectNumber = pageStartObjectNumber + index;

    objects[contentObjectNumber - 1] = [
      `<< /Length ${page.length} >>`,
      "stream",
      page.content,
      "endstream"
    ].join("\n");

    objects[pageObjectNumber - 1] = [
      "<< /Type /Page",
      `/Parent ${pagesObjectNumber} 0 R`,
      `/MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}]`,
      `/Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >>`,
      `/Contents ${contentObjectNumber} 0 R >>`
    ].join(" ");
  });

  objects[pagesObjectNumber - 1] = [
    "<< /Type /Pages",
    `/Kids [${pages
      .map((_, index) => `${pageStartObjectNumber + index} 0 R`)
      .join(" ")}]`,
    `/Count ${pages.length} >>`
  ].join(" ");

  objects[0] = `<< /Type /Catalog /Pages ${pagesObjectNumber} 0 R >>`;

  const chunks: string[] = ["%PDF-1.4\n"];
  const offsets: number[] = [0];
  let byteOffset = Buffer.byteLength(chunks[0], "utf8");

  for (let index = 0; index < objects.length; index += 1) {
    const objectBlock = `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
    offsets.push(byteOffset);
    chunks.push(objectBlock);
    byteOffset += Buffer.byteLength(objectBlock, "utf8");
  }

  const xrefOffset = byteOffset;
  const xrefLines = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];

  for (let index = 1; index < offsets.length; index += 1) {
    xrefLines.push(`${String(offsets[index]).padStart(10, "0")} 00000 n `);
  }

  const trailer = [
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    `${xrefOffset}`,
    "%%EOF"
  ].join("\n");

  const pdf = `${chunks.join("")}${xrefLines.join("\n")}\n${trailer}`;
  return Buffer.from(pdf, "utf8");
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await context.params;
    const record = (await getClaraMinuta(recordId)) ?? (await getClaraRecord(recordId));

    if (!record || record.kind !== "text-draft") {
      return NextResponse.json({ ok: false, error: `Registro ${recordId} nao encontrado.` }, { status: 404 });
    }

    const payload = record.payload as TextDraftPayload;
    const editedTitle = record.editedTitle?.trim() || buildTextDraftDefaultTitle(payload);
    const editedDetail = record.editedDetail?.trim() || buildTextDraftDefaultBody(payload);

    const url = new URL(request.url);
    const format = url.searchParams.get("format") ?? "txt";
    const editorHref = `/editor-de-texto/meus-textos?record=${record.id}`;
    const baseName = editedTitle.replace(/\s+/g, " ").trim();
    const exportLines = buildTextDraftExportLines(payload, editedDetail);

    if (format === "pdf") {
      const pdfBytes = buildPdfDocument(
        wrapPdfParagraph(`Minuta: ${baseName}\n${exportLines.join("\n")}`)
      );

      return new NextResponse(pdfBytes, {
        headers: {
          "Cache-Control": "no-store",
          "Content-Disposition": `inline; filename="${baseName}.pdf"`,
          "Content-Type": "application/pdf"
        }
      });
    }

    if (format === "txt" || format === "docx") {
      return new NextResponse(exportLines.join("\n"), {
        headers: {
          "Cache-Control": "no-store",
          "Content-Disposition": `attachment; filename="${baseName}.txt"`,
          "Content-Type": "text/plain; charset=utf-8",
          "X-Clara-Editor-Href": editorHref
        }
      });
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          recordId: record.id,
          format,
          printable: true,
          editorHref,
          exports: {
            txt: {
              fileName: `${baseName}.txt`,
              available: true
            },
            pdf: {
              fileName: `${baseName}.pdf`,
              available: true
            }
          },
          summary: `Exportacao controlada da minuta ${record.id} pronta para texto base, PDF e impressao.`
        }
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    return mapClaraApiError(error);
  }
}
