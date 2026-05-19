import { getClaraStructuredCore } from "@/server/services/clara/get-clara-structured-core";
import { getProceduralUpdatesByProcessId } from "@/server/services/procedural-updates/get-procedural-updates";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function findDateCandidate(input: string) {
  const match = input.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
  return match?.[1] ?? null;
}

export async function getClaraIntimationAnalysis(params: {
  clientId: string;
  caseId: string;
  processId?: string;
  documentId?: string;
}) {
  const structuredCore = await getClaraStructuredCore({
    clientId: params.clientId,
    caseId: params.caseId,
    processId: params.processId,
    documentId: params.documentId,
    strict: true
  });
  const updates = params.processId ? await getProceduralUpdatesByProcessId(params.processId).catch(() => []) : [];
  const relevantUpdate =
    updates.find((update) => {
      const haystack = normalize(`${update.movementType} ${update.operationalSummary} ${update.sourceLabel}`);
      return (
        haystack.includes("intimacao") ||
        haystack.includes("prazo") ||
        haystack.includes("manifestacao") ||
        haystack.includes("recurso") ||
        haystack.includes("contestacao")
      );
    }) ?? null;

  const sourceText = relevantUpdate
    ? `${relevantUpdate.movementType} ${relevantUpdate.operationalSummary}`
    : structuredCore.documentsFound[0]?.detail ?? structuredCore.summary;
  const deadlineLabel = findDateCandidate(sourceText) ?? "Prazo nao identificado com seguranca.";
  const actionRequired = normalize(sourceText).includes("recurso")
    ? "Analisar recurso ou contrarrazoes cabiveis."
    : normalize(sourceText).includes("contestacao")
      ? "Preparar contestacao com base nos fatos confirmados."
      : normalize(sourceText).includes("manifestacao")
        ? "Preparar manifestacao controlada com revisao humana."
        : "Confirmar o ato intimado e preparar resposta com revisao humana.";

  return {
    title: "Analise de intimacao",
    sourceLabel: relevantUpdate ? relevantUpdate.sourceLabel : "Contexto estruturado da Clara",
    deadlineLabel,
    actionRequired,
    riskLabel:
      deadlineLabel === "Prazo nao identificado com seguranca."
        ? "Risco de prova ou prazo insuficiente sem leitura complementar."
        : "Risco controlado, sujeito a confirmacao humana da contagem do prazo.",
    pendingItems: [
      deadlineLabel === "Prazo nao identificado com seguranca."
        ? "Confirmar a data de ciencia e a contagem do prazo."
        : "Validar a contagem do prazo com revisao humana.",
      ...structuredCore.documentsMissing.slice(0, 2)
    ],
    nextAction: structuredCore.nextStep,
    sourceTrail: {
      origem_interna: structuredCore.classification.sourceTrail.origem_interna,
      origem_documental: structuredCore.classification.sourceTrail.origem_documental,
      origem_api: relevantUpdate ? [`Andamento processual considerado: ${relevantUpdate.id}`] : [],
      inferencia_controlada: [
        relevantUpdate
          ? "Prazo e ato foram organizados a partir do andamento processual mais aderente encontrado no contexto."
          : "Nao houve intimacao oficial claramente identificada; a resposta foi rebaixada para leitura controlada."
      ]
    }
  };
}
