import type {
  AutomationReadinessRecord,
  ContractAnalysisRecord,
  DocumentRecord,
  DocumentStructuredExtractionField
} from "@lexia/domain";

type ExtractionFieldMap = Record<string, DocumentStructuredExtractionField>;

const CRITICAL_EXTRACTION_KEYS = [
  "banco",
  "modalidade",
  "competencia",
  "taxaContrato",
  "cet",
  "parcelas",
  "valorFinanciado",
  "parcelaCobrada"
] as const;

function asFieldMap(
  fields: DocumentRecord["structuredExtraction"] | ContractAnalysisRecord["calculationSnapshot"]
): ExtractionFieldMap {
  return (fields ?? {}) as ExtractionFieldMap;
}

function isMissingField(value: string | undefined) {
  if (!value) {
    return true;
  }

  return /nao identificado|nao identificada|sem leitura|pendente/i.test(value);
}

function scoreConfidence(confidence: DocumentStructuredExtractionField["confidence"]) {
  switch (confidence) {
    case "high":
      return 1;
    case "medium":
      return 0.65;
    default:
      return 0.3;
  }
}

function confidenceLabel(score: number): AutomationReadinessRecord["confidenceLabel"] {
  if (score >= 85) {
    return "high";
  }

  if (score >= 65) {
    return "medium";
  }

  return "low";
}

function documentSignals(fields: ExtractionFieldMap) {
  const criticalFields = CRITICAL_EXTRACTION_KEYS
    .map((key) => fields[key])
    .filter((field): field is DocumentStructuredExtractionField => Boolean(field));
  const averageConfidence = criticalFields.length
    ? criticalFields.reduce((total, field) => total + scoreConfidence(field.confidence), 0) /
      criticalFields.length
    : 0;

  return {
    averageConfidence,
    missingCriticalFields: CRITICAL_EXTRACTION_KEYS.filter((key) =>
      isMissingField(fields[key]?.value)
    )
  };
}

export function getDocumentAutomationReadiness(document: Pick<
  DocumentRecord,
  "aiStatus" | "extractionError" | "reviewStatus" | "structuredExtraction"
>): AutomationReadinessRecord {
  const fields = asFieldMap(document.structuredExtraction);
  const { averageConfidence, missingCriticalFields } = documentSignals(fields);
  const blockers: string[] = [];
  const signals: string[] = [];
  let score = Math.round(averageConfidence * 100);

  if (document.aiStatus === "not_analyzed") {
    blockers.push("OCR estruturado ainda nao foi concluido.");
    score = Math.min(score, 25);
  }

  if (document.aiStatus === "needs_review") {
    blockers.push("Leitura estruturada parcial com necessidade de conferencia.");
    score -= 15;
  }

  if (document.extractionError) {
    blockers.push("Falha de extracao registrada no documento.");
    score -= 25;
  }

  if (missingCriticalFields.length) {
    blockers.push(`Campos criticos ausentes: ${missingCriticalFields.join(", ")}.`);
    score -= missingCriticalFields.length * 8;
  } else {
    signals.push("Todos os campos criticos do documento foram materializados.");
  }

  if (document.reviewStatus === "corrected") {
    signals.push("Extracao corrigida manualmente e ressincronizada.");
    score += 8;
  } else if (document.reviewStatus === "reviewed") {
    signals.push("Extracao validada para uso operacional assistido.");
    score += 5;
  }

  const normalizedScore = Math.max(0, Math.min(100, score));
  const label = confidenceLabel(normalizedScore);
  const state: AutomationReadinessRecord["state"] =
    blockers.length > 0
      ? "blocked"
      : normalizedScore >= 85
        ? "autonomous"
        : "assisted";

  const summary =
    state === "autonomous"
      ? "Documento autoaprovado por consistencia estrutural. Revisao humana vira camada de seguranca."
      : state === "assisted"
        ? "Documento pode seguir com automacao assistida, mas ainda merece conferencia leve."
        : "Documento ainda abre excecao operacional e nao deve sustentar automacao forte sozinho.";

  return {
    state,
    confidenceScore: normalizedScore,
    confidenceLabel: label,
    summary,
    blockers,
    signals
  };
}

export function getCaseAutomationReadiness(params: {
  document: Pick<DocumentRecord, "aiStatus" | "extractionError" | "reviewStatus" | "structuredExtraction">;
  analysis: Pick<
    ContractAnalysisRecord,
    "calculationSnapshot" | "bacenSnapshot" | "strategicSnapshot" | "petitionSnapshot" | "approvedForFiling"
  >;
}): AutomationReadinessRecord {
  const documentReadiness = getDocumentAutomationReadiness(params.document);
  const blockers = [...documentReadiness.blockers];
  const signals = [...documentReadiness.signals];
  let score = documentReadiness.confidenceScore;

  const bacenSnapshot = params.analysis.bacenSnapshot as Record<string, unknown> | undefined;
  const calculationSnapshot = params.analysis.calculationSnapshot as Record<string, unknown> | undefined;
  const strategicSnapshot = params.analysis.strategicSnapshot as Record<string, unknown> | undefined;
  const petitionSnapshot = params.analysis.petitionSnapshot as Record<string, unknown> | undefined;

  if (!calculationSnapshot || !strategicSnapshot) {
    blockers.push("Calculo ou estrategia do caso ainda nao foram persistidos.");
    score -= 20;
  } else {
    signals.push("Calculo e estrategia do caso ja estao persistidos.");
  }

  const bacenStatus = typeof bacenSnapshot?.status === "string" ? bacenSnapshot.status : null;
  const bacenSourceQuality =
    typeof bacenSnapshot?.sourceQuality === "string" ? bacenSnapshot.sourceQuality : null;

  if (bacenStatus === "consulted" && bacenSourceQuality === "official") {
    signals.push("Comparacao BACEN materializada com fonte oficial consolidada para a competencia do caso.");
    score += 10;
  } else if (bacenStatus === "consulted") {
    signals.push("Comparacao BACEN materializada, mas ainda em fallback controlado.");
    score += 2;
  } else if (bacenStatus === "unavailable") {
    signals.push("BACEN ficou em fallback controlado e explicitado.");
    score -= 8;
  } else {
    blockers.push("Comparacao BACEN ainda nao foi consolidada.");
    score -= 15;
  }

  if (petitionSnapshot && params.analysis.approvedForFiling) {
    signals.push("Peticao aprovada para handoff operacional.");
    score += 5;
  } else if (petitionSnapshot) {
    signals.push("Peticao pronta para revisao final do advogado.");
  }

  const normalizedScore = Math.max(0, Math.min(100, score));
  const label = confidenceLabel(normalizedScore);
  const state: AutomationReadinessRecord["state"] =
    blockers.length > 0
      ? "blocked"
      : normalizedScore >= 88
        ? "autonomous"
        : "assisted";

  const summary =
    state === "autonomous"
      ? "Caso apto para automacao operacional quase total, mantendo revisao humana apenas como camada de seguranca."
      : state === "assisted"
        ? "Caso apto para esteira assistida: o sistema toca quase tudo, e o humano entra para conferencia final."
        : "Caso ainda depende de excecao operacional antes de ser tratado como fluxo confiavel de ponta a ponta.";

  return {
    state,
    confidenceScore: normalizedScore,
    confidenceLabel: label,
    summary,
    blockers,
    signals
  };
}
