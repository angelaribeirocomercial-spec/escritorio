import type { ClaraSourceAdapterResult } from "@/server/services/clara/clara-source-adapters";

export type ClaraAuditOrigin = "origem_interna" | "origem_documental" | "origem_api" | "inferencia_controlada";

export type ClaraAuditEntry = {
  label: string;
  detail: string;
  origin: ClaraAuditOrigin;
  confidence: "high" | "medium" | "low";
  confirmed: boolean;
};

export type ClaraAuditTrail = {
  generatedAt: string;
  reviewRequired: boolean;
  originCounts: Record<ClaraAuditOrigin, number>;
  entries: ClaraAuditEntry[];
  warnings: string[];
  failures: string[];
  summary: string;
};

function isFailed(adapter: ClaraSourceAdapterResult) {
  return adapter.status === "failed";
}

export function buildClaraAuditTrail(structuredCore: {
  classification: {
    confidenceLabel: string;
    rationale: string;
  };
  confirmedFacts: string[];
  documentsFound: Array<{
    label: string;
    detail: string;
  }>;
  documentsMissing: string[];
  risks: string[];
  sourceAdapters: ClaraSourceAdapterResult[];
  nextStep: string;
  recommendation: string;
  checklist: string[];
  summary: string;
}): ClaraAuditTrail {
  const apiEntries: ClaraAuditEntry[] = structuredCore.sourceAdapters.map((adapter) => ({
    label: adapter.sourceLabel,
    detail: adapter.status === "failed" ? adapter.failureReason ?? "Falha na consulta" : adapter.queryHint,
    origin: "origem_api" as const,
    confidence: adapter.status === "available" ? "high" : adapter.status === "failed" ? "low" : "medium",
    confirmed: adapter.status === "available"
  }));

  const documentEntries: ClaraAuditEntry[] = structuredCore.documentsFound.slice(0, 6).map((document) => ({
    label: document.label,
    detail: document.detail,
    origin: "origem_documental" as const,
    confidence: "high" as const,
    confirmed: true
  }));

  const internalEntries: ClaraAuditEntry[] = structuredCore.confirmedFacts.slice(0, 6).map((fact) => ({
    label: fact.split(":")[0] ?? "Dado interno",
    detail: fact,
    origin: "origem_interna" as const,
    confidence: "high" as const,
    confirmed: true
  }));

  const inferenceEntries: ClaraAuditEntry[] = [
    {
      label: "Classificacao juridica",
      detail: structuredCore.classification.rationale,
      origin: "inferencia_controlada" as const,
      confidence: structuredCore.classification.confidenceLabel === "Alta" ? "high" : "medium",
      confirmed: false
    },
    {
      label: "Proxima decisao",
      detail: structuredCore.nextStep,
      origin: "inferencia_controlada" as const,
      confidence: structuredCore.documentsMissing.length > 0 ? "medium" : "high",
      confirmed: false
    },
    {
      label: "Recomendacao operacional",
      detail: structuredCore.recommendation,
      origin: "inferencia_controlada" as const,
      confidence: structuredCore.documentsMissing.length > 0 ? "medium" : "high",
      confirmed: false
    }
  ];

  const failures = structuredCore.sourceAdapters
    .filter(isFailed)
    .map((adapter) => `${adapter.sourceLabel}: ${adapter.failureReason ?? "falha nao especificada"}`);

  const warnings = [
    ...(structuredCore.documentsMissing.length > 0
      ? [`Lacunas documentais ativas: ${structuredCore.documentsMissing.join(", ")}`]
      : []),
    ...(failures.length > 0 ? [`Fontes externas com falha: ${failures.join(" | ")}`] : []),
    "A saida continua sujeita a revisao humana antes de protocolo ou entrega externa."
  ];

  const originCounts: Record<ClaraAuditOrigin, number> = {
    origem_interna: internalEntries.length,
    origem_documental: documentEntries.length,
    origem_api: apiEntries.length,
    inferencia_controlada: inferenceEntries.length
  };

  return {
    generatedAt: new Date().toISOString(),
    reviewRequired: true,
    originCounts,
    entries: [...internalEntries, ...documentEntries, ...apiEntries, ...inferenceEntries],
    warnings,
    failures,
    summary:
      "Trilha de auditoria preparada com origem interna, documental, api e inferencia controlada, sem tratar inferencia como fato confirmado."
  };
}
