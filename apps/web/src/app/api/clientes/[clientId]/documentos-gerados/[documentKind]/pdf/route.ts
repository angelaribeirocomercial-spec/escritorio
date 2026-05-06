import { NextRequest, NextResponse } from "next/server";

import { getBankingNicheLabel } from "@lexia/domain";

import { getCases } from "@/server/services/cases/get-cases";
import { getClientById } from "@/server/services/clients/get-clients";

type DocumentKind = "peticao-inicial" | "procuracao" | "contrato-honorarios";

const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const PDF_MARGIN = 48;
const PDF_TITLE_SIZE = 18;
const PDF_SUBTITLE_SIZE = 10;
const PDF_BODY_SIZE = 11;
const PDF_LINE_HEIGHT = 14;
const PDF_MAX_BODY_LINES_PER_PAGE = 34;

const CASE_STATUS_PRIORITY = {
  active: 0,
  "awaiting-action": 1,
  draft: 2,
  closed: 3
} as const;

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

function buildPdfContent(title: string, subtitle: string, lines: string[]) {
  const pages = chunkArray(lines, PDF_MAX_BODY_LINES_PER_PAGE);

  return pages
    .map((pageLines) => {
      const pageContent: string[] = [];
      const titleY = PDF_PAGE_HEIGHT - PDF_MARGIN - 18;
      const subtitleY = titleY - 24;
      let bodyY = subtitleY - 28;

      pageContent.push(
        `BT\n/F1 ${PDF_TITLE_SIZE} Tf\n1 0 0 1 ${PDF_MARGIN} ${titleY.toFixed(2)} Tm\n(${escapePdfText(
          title
        )}) Tj\nET`
      );
      pageContent.push(
        `BT\n/F1 ${PDF_SUBTITLE_SIZE} Tf\n1 0 0 1 ${PDF_MARGIN} ${subtitleY.toFixed(2)} Tm\n(${escapePdfText(
          subtitle
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

function buildPdfDocument(title: string, subtitle: string, lines: string[]) {
  const pages = buildPdfContent(title, subtitle, lines);
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
    `/Kids [${pages.map((_, index) => `${pageStartObjectNumber + index} 0 R`).join(" ")}]`,
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

function slugifyFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function resolveActiveCase(cases: Awaited<ReturnType<typeof getCases>>, requestedCaseId?: string | null) {
  if (requestedCaseId) {
    const requestedCase = cases.find((caseItem) => caseItem.id === requestedCaseId);

    if (requestedCase) {
      return requestedCase;
    }
  }

  return (
    [...cases].sort((left, right) => {
      const statusPriorityDiff = CASE_STATUS_PRIORITY[left.status] - CASE_STATUS_PRIORITY[right.status];

      if (statusPriorityDiff !== 0) {
        return statusPriorityDiff;
      }

      const processNumberDiff = left.processNumber.localeCompare(right.processNumber);

      if (processNumberDiff !== 0) {
        return processNumberDiff;
      }

      return left.id.localeCompare(right.id);
    })[0] ?? null
  );
}

function requiredField(value: string | null | undefined, label: string) {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : `[PENDENTE: ${label}]`;
}

function buildDocumentLines(input: {
  kind: DocumentKind;
  clientName: string;
  clientDocumentId: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  bankName: string;
  caseTitle: string;
  processNumber: string;
  nicheLabel: string;
  mainThesis: string;
  suggestedStrategy: string;
}) {
  switch (input.kind) {
    case "procuracao":
      return [
        "PROCURAÇÃO AD JUDICIA ET EXTRA",
        "",
        `${input.clientName}, inscrito(a) no CPF sob o n. ${requiredField(input.clientDocumentId, "CPF do outorgante")}, residente e domiciliado(a) em ${requiredField(input.clientAddress, "endereco completo do outorgante")}, nomeia e constitui como bastante procurador(es) [PENDENTE: nome completo do advogado responsavel], inscrito(a) na OAB [PENDENTE: numero da OAB], com endereco profissional em [PENDENTE: endereco profissional do escritorio], a quem confere poderes da clausula ad judicia et extra, para o foro em geral, com poderes especiais para propor acoes, contestar, transigir, firmar compromissos, receber e dar quitacao, praticando todos os atos necessarios a defesa de seus interesses.`,
        "",
        `Caso relacionado: ${input.caseTitle}.`,
        `Banco relacionado: ${input.bankName}.`,
        `Processo de referencia: ${requiredField(input.processNumber, "numero do processo")}.`,
        "",
        "Campos sujeitos a validacao humana antes da assinatura:",
        "- qualificacao completa do outorgante;",
        "- nome civil e OAB do patrono responsavel;",
        "- endereco profissional do escritorio;",
        "- poderes especiais eventualmente exigidos para o caso concreto.",
        "",
        "Status documental: Gerado e obrigatoriamente em revisao humana antes de uso externo."
      ];
    case "contrato-honorarios":
      return [
        "CONTRATO DE HONORARIOS ADVOCATICIOS",
        "",
        `CONTRATANTE: ${input.clientName}, CPF ${requiredField(input.clientDocumentId, "CPF do contratante")}, endereco ${requiredField(input.clientAddress, "endereco do contratante")}, contato ${requiredField(input.clientPhone, "telefone do contratante")} e email ${requiredField(input.clientEmail, "email do contratante")}.`,
        `CONTRATADO: [PENDENTE: nome da sociedade de advogados ou advogada responsavel], inscrito(a) na OAB sob n. [PENDENTE: numero da OAB], com sede em [PENDENTE: endereco profissional completo].`,
        "",
        "CLAUSULA 1 - OBJETO",
        `Prestacao de servicos advocaticios no caso ${input.caseTitle}, ligado ao nicho ${input.nicheLabel.toLowerCase()}, envolvendo ${input.bankName}.`,
        "",
        "CLAUSULA 2 - HONORARIOS",
        "Honorarios iniciais: [PENDENTE: valor ou criterio de cobranca].",
        "Honorarios de exito: [PENDENTE: percentual de exito e base de calculo].",
        "",
        "CLAUSULA 3 - DESPESAS",
        "Custas, diligencias, emolumentos, deslocamentos e despesas extraordinarias correrao na forma a ser validada na contratacao real.",
        "",
        "CLAUSULA 4 - REVISAO HUMANA OBRIGATORIA",
        "Este contrato so pode ser considerado apto apos validacao humana de valores, percentuais, qualificacao das partes e clausulas especificas do escritorio.",
        "",
        "Status documental: Gerado e obrigatoriamente em revisao humana antes de assinatura."
      ];
    default:
      return [
        "PETICAO INICIAL",
        "",
        "[PENDENTE: ENDERECAMENTO DO JUIZO COMPETENTE]",
        "",
        `${input.clientName}, CPF ${requiredField(input.clientDocumentId, "CPF da parte autora")}, residente em ${requiredField(input.clientAddress, "endereco da parte autora")}, por seus advogados [PENDENTE: qualificacao completa dos patronos], vem, com fundamento na legislacao aplicavel ao direito bancario e do consumidor, propor a presente ACAO em face de ${input.bankName}.`,
        "",
        "I - FATOS CONFIRMADOS",
        `O caso interno foi registrado como: ${input.caseTitle}.`,
        `Tese principal mapeada pela Clara: ${requiredField(input.mainThesis, "tese principal validada")}.`,
        `Estrategia sugerida para revisao humana: ${requiredField(input.suggestedStrategy, "estrategia processual")}.`,
        "",
        "II - PONTOS QUE EXIGEM CONFERENCIA HUMANA",
        "- competencia territorial e enderecamento;",
        "- cronologia precisa dos fatos e datas criticas;",
        "- documentos essenciais e sua correspondencia com a narrativa;",
        "- pedidos finais, tutela e parametros economicos do caso.",
        "",
        "III - PEDIDOS BASE",
        "- recebimento da inicial;",
        "- citacao da parte re;",
        "- producao das provas cabiveis;",
        "- procedencia conforme a tese juridica validada na revisao final.",
        "",
        "IV - OBSERVACAO DE SEGURANCA",
        "Este documento e um template juridico estruturado com dados confirmados e marcacoes pendentes. Nao deve ser protocolado, distribuido ou usado externamente sem revisao humana final.",
        "",
        "Status documental: Gerado e obrigatoriamente em revisao humana antes de aprovacao."
      ];
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ clientId: string; documentKind: string }> }
) {
  const { clientId, documentKind } = await context.params;

  if (!["peticao-inicial", "procuracao", "contrato-honorarios"].includes(documentKind)) {
    return NextResponse.json({ ok: false, error: "Documento gerado desconhecido." }, { status: 404 });
  }

  const client = await getClientById(clientId).catch(() => null);
  if (!client) {
    return NextResponse.json({ ok: false, error: `Cliente ${clientId} nao encontrado.` }, { status: 404 });
  }

  const requestedCaseId = new URL(request.url).searchParams.get("caseId");
  const cases = await getCases({ clientId });
  const activeCase = resolveActiveCase(cases, requestedCaseId);

  if (!activeCase) {
    return NextResponse.json({ ok: false, error: `Caso do cliente ${clientId} nao encontrado.` }, { status: 404 });
  }

  const lines = buildDocumentLines({
    kind: documentKind as DocumentKind,
    clientName: client.fullName,
    clientDocumentId: client.documentId,
    clientAddress: client.address,
    clientEmail: client.email,
    clientPhone: client.phone,
    bankName: activeCase.bankName,
    caseTitle: activeCase.title,
    processNumber: activeCase.processNumber,
    nicheLabel: getBankingNicheLabel(activeCase.niche),
    mainThesis: activeCase.mainThesis,
    suggestedStrategy: activeCase.suggestedStrategy
  });
  const documentTitle =
    documentKind === "procuracao"
      ? "Procuracao em revisao humana"
      : documentKind === "contrato-honorarios"
        ? "Contrato de honorarios em revisao humana"
        : "Peticao inicial em revisao humana";
  const pdf = buildPdfDocument(
    documentTitle,
    "Template juridico estruturado com validacao humana obrigatoria",
    lines.flatMap((line) => wrapPdfParagraph(line))
  );
  const fileName = `${slugifyFileName(documentKind)}-${slugifyFileName(client.fullName)}.pdf`;

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Content-Length": String(pdf.length)
    }
  });
}
