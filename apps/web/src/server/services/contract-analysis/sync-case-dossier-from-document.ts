import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  BankingCaseRecord,
  ClientRecord,
  ContractAnalysisRecord,
  DocumentRecord,
  DocumentStructuredExtractionField
} from "@lexia/domain";

import { getBankingRevisionalCalculation } from "@/server/services/clara/get-banking-revisional-calculation";

type ExtractionConfidence = "low" | "medium" | "high";

type ExtractionFieldMap = Record<string, DocumentStructuredExtractionField>;

type BcbSnapshot = {
  status: "consulted" | "unavailable";
  modalityLabel: string;
  competenceLabel: string;
  contractRateLabel: string;
  referenceRateLabel: string;
  differenceLabel: string;
  classificationLabel: string;
  sourceLabel: string;
  summary: string;
};

type StrategicSnapshot = {
  chanceOfSuccess: number;
  riskLabel: "low" | "medium" | "high";
  abusivenessLabel: string;
  executiveSummary: string;
  suggestedThesis: string;
  suggestedRequests: string[];
};

type PetitionSnapshot = {
  readyForReview: boolean;
  factualSummary: string;
  legalGrounds: string[];
  requests: string[];
  reviewChecklist: string[];
};

type CalculationSnapshot = ReturnType<typeof getBankingRevisionalCalculation> & {
  legalImpactSummary: string[];
};

const CONTRACT_DOCUMENT_TYPES = new Set(["Contrato bancario", "CCB"]);

const BACEN_REFERENCE_BY_MODALITY: Record<
  string,
  { monthlyRate: number; sourceLabel: string }
> = {
  "financiamento-veiculo": {
    monthlyRate: 2.11,
    sourceLabel: "BACEN | referencia controlada de financiamento de veiculo"
  },
  ccb: {
    monthlyRate: 2.64,
    sourceLabel: "BACEN | referencia controlada de CCB"
  },
  "cartao-consignado": {
    monthlyRate: 1.85,
    sourceLabel: "BACEN | referencia controlada de cartao consignado / RMC"
  },
  "beneficio-descontos": {
    monthlyRate: 1.73,
    sourceLabel: "BACEN | referencia controlada de desconto em beneficio"
  },
  fraude: {
    monthlyRate: 0,
    sourceLabel: "BACEN | sem referencia economica aplicavel para fraude bancaria"
  },
  "busca-apreensao": {
    monthlyRate: 2.48,
    sourceLabel: "BACEN | referencia controlada de financiamento com risco de mora"
  }
};

function normalizeFreeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function parseCurrencyValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value
    .replace(/[R$\s.]/g, "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePercentValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return "Nao identificado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return "Nao identificado";
  }

  return `${value.toFixed(2).replace(".", ",")}%`;
}

function formatDifference(contractRate: number | null, referenceRate: number | null) {
  if (contractRate == null || referenceRate == null || referenceRate === 0) {
    return "Nao calculado";
  }

  const diff = contractRate - referenceRate;
  const relative = (diff / referenceRate) * 100;
  return `${diff >= 0 ? "+" : ""}${diff.toFixed(2).replace(".", ",")} p.p. (${relative >= 0 ? "+" : ""}${relative
    .toFixed(2)
    .replace(".", ",")}%)`;
}

function classifyDifference(contractRate: number | null, referenceRate: number | null) {
  if (contractRate == null || referenceRate == null || referenceRate === 0) {
    return "Atencao";
  }

  const relative = ((contractRate - referenceRate) / referenceRate) * 100;

  if (relative >= 60) {
    return "Abusividade relevante";
  }

  if (relative >= 20) {
    return "Possivel abusividade";
  }

  return "Dentro da media";
}

function readField(fields: ExtractionFieldMap, key: string) {
  return fields[key]?.value ?? "";
}

function field(value: string, confidence: ExtractionConfidence, sourceLabel: string) {
  return {
    value,
    confidence,
    sourceLabel
  } satisfies DocumentStructuredExtractionField;
}

function extractFirst(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  return match?.[1]?.trim() ?? null;
}

function inferModality(params: {
  document: Pick<DocumentRecord, "documentType" | "category" | "summary" | "fileName">;
  bankingCase: Pick<BankingCaseRecord, "niche" | "claimType" | "title">;
}) {
  const evidence = normalizeFreeText(
    [
      params.document.documentType,
      params.document.category,
      params.document.summary,
      params.document.fileName,
      params.bankingCase.claimType,
      params.bankingCase.title
    ].join(" ")
  );

  if (params.document.documentType === "CCB") {
    return { key: "ccb", label: "CCB" };
  }

  if (/consignado|rmc|rcc/.test(evidence) || params.bankingCase.niche === "cartao-consignado") {
    return { key: "cartao-consignado", label: "Cartao consignado / RMC" };
  }

  if (/beneficio|inss/.test(evidence) || params.bankingCase.niche === "beneficio-descontos") {
    return { key: "beneficio-descontos", label: "Desconto em beneficio" };
  }

  if (/fraude|pix/.test(evidence) || params.bankingCase.niche === "fraude") {
    return { key: "fraude", label: "Fraude bancaria" };
  }

  if (/busca|apreens|mora/.test(evidence) || params.bankingCase.niche === "busca-apreensao") {
    return { key: "busca-apreensao", label: "Financiamento com risco de mora" };
  }

  return { key: "financiamento-veiculo", label: "Financiamento de veiculo" };
}

function buildStructuredExtraction(params: {
  document: Pick<
    DocumentRecord,
    "documentType" | "category" | "summary" | "fileName" | "uploadedAt" | "aiStatus"
  >;
  client: Pick<ClientRecord, "bankName">;
  bankingCase: Pick<BankingCaseRecord, "bankName" | "niche" | "claimType" | "title">;
}) {
  const baseText = [
    params.document.documentType,
    params.document.category,
    params.document.summary,
    params.document.fileName
  ].join(" ");
  const normalized = normalizeFreeText(baseText);
  const modality = inferModality({
    document: params.document,
    bankingCase: params.bankingCase
  });
  const rateMatch = extractFirst(baseText, /(\d{1,2}[.,]\d{1,2})\s*%/i);
  const cetMatch = extractFirst(baseText, /CET[^0-9]*(\d{1,2}[.,]\d{1,2})\s*%/i);
  const installmentCountMatch = extractFirst(baseText, /(\d{1,3})\s*parcelas?/i);
  const financedAmountMatch = extractFirst(
    baseText,
    /(?:valor financiado|saldo|financiado)[^0-9]*([0-9\.\,]{4,})/i
  );
  const installmentAmountMatch = extractFirst(
    baseText,
    /(?:parcela|prestacao)[^0-9]*([0-9\.\,]{3,})/i
  );
  const competenceMatch = extractFirst(baseText, /(\d{2}\/\d{4}|\d{4}-\d{2})/i);
  const bundledInsurance = /seguro|protecao/i.test(normalized)
    ? "Seguro embutido detectado"
    : "Sem seguro embutido identificado";
  const feesLabel = /tarif|cadastro|servico/i.test(normalized)
    ? "Tarifas acessorias detectadas"
    : "Sem tarifa acessoria identificada";
  const permanenceLabel = /permanencia/i.test(normalized)
    ? "Comissao de permanencia mencionada"
    : "Comissao de permanencia nao identificada";
  const penaltyLabel = /multa|mora/i.test(normalized)
    ? "Encargos moratorios presentes"
    : "Encargos moratorios nao identificados";
  const bankName =
    params.bankingCase.bankName || params.client.bankName || extractFirst(baseText, /banco\s+([a-zA-Z\s]+)/i) || "Banco pendente";
  const contractDate =
    competenceMatch?.includes("/")
      ? competenceMatch
      : competenceMatch
        ? `${competenceMatch.slice(5, 7)}/${competenceMatch.slice(0, 4)}`
        : params.document.uploadedAt.slice(5, 7) + "/" + params.document.uploadedAt.slice(0, 4);
  const contractRate = rateMatch ?? (params.bankingCase.niche === "fraude" ? "" : "2,98");
  const derivedCet =
    contractRate != null && contractRate !== ""
      ? ((parsePercentValue(contractRate) ?? 0) + 0.7).toFixed(2).replace(".", ",")
      : "";
  const cet = cetMatch ?? derivedCet;
  const installmentCount = installmentCountMatch ?? (params.bankingCase.niche === "fraude" ? "0" : "48");
  const financedAmount = financedAmountMatch ?? (params.bankingCase.niche === "fraude" ? "" : "68.400,00");
  const chargedInstallment = installmentAmountMatch ?? (params.bankingCase.niche === "fraude" ? "" : "2.214,00");
  const contractedInstallment =
    chargedInstallment && params.bankingCase.niche !== "fraude"
      ? formatCurrency((parseCurrencyValue(chargedInstallment) ?? 0) * 0.84)
      : "";

  const fields: ExtractionFieldMap = {
    banco: field(bankName, bankName.includes("pendente") ? "medium" : "high", "Envelope do caso"),
    modalidade: field(modality.label, "medium", "Heuristica por nicho e documento"),
    competencia: field(contractDate, competenceMatch ? "high" : "medium", competenceMatch ? "Documento" : "Upload do caso"),
    taxaContrato: field(contractRate ? `${contractRate}%` : "Nao identificada", rateMatch ? "high" : "medium", rateMatch ? "Documento" : "Heuristica controlada"),
    cet: field(cet ? `${cet}%` : "Nao identificado", cetMatch ? "high" : "medium", cetMatch ? "Documento" : "Heuristica controlada"),
    parcelas: field(installmentCount === "0" ? "Nao aplicavel" : `${installmentCount} parcelas`, installmentCountMatch ? "high" : "medium", installmentCountMatch ? "Documento" : "Heuristica controlada"),
    valorFinanciado: field(financedAmount ? formatCurrency(parseCurrencyValue(financedAmount) ?? 0) : "Nao identificado", financedAmountMatch ? "high" : "medium", financedAmountMatch ? "Documento" : "Heuristica controlada"),
    parcelaCobrada: field(chargedInstallment ? formatCurrency(parseCurrencyValue(chargedInstallment) ?? 0) : "Nao identificada", installmentAmountMatch ? "high" : "medium", installmentAmountMatch ? "Documento" : "Heuristica controlada"),
    parcelaContratada: field(contractedInstallment || "Nao identificada", chargedInstallment ? "medium" : "low", "Derivacao controlada da leitura inicial"),
    seguro: field(bundledInsurance, /seguro/i.test(normalized) ? "high" : "medium", "Leitura do documento"),
    tarifas: field(feesLabel, /tarif/i.test(normalized) ? "high" : "medium", "Leitura do documento"),
    permanencia: field(permanenceLabel, /permanencia/i.test(normalized) ? "high" : "medium", "Leitura do documento"),
    multa: field(penaltyLabel, /multa|mora/i.test(normalized) ? "high" : "medium", "Leitura do documento")
  };

  const missingCriticalField = !rateMatch || !installmentCountMatch;
  const aiStatus = missingCriticalField ? "needs_review" : "analyzed";

  return {
    fields,
    aiStatus,
    previewLabel:
      aiStatus === "analyzed"
        ? "Leitura estruturada persistida e pronta para revisao humana."
        : "Leitura estruturada parcial. Conferir campos criticos antes do uso processual.",
    sourceTrace: {
      origem_documental: [params.document.fileName],
      origem_interna: [params.document.documentType, params.document.category],
      inferencia_controlada: missingCriticalField
        ? ["Campos ausentes foram completados por heuristica controlada e pedem revisao."]
        : ["Leitura estruturada consolidada com apoio do envelope do caso."]
    },
    reviewStatus: "pending" as const,
    extractionError: null as string | null,
    modality
  };
}

function buildBacenSnapshot(params: {
  extraction: ExtractionFieldMap;
  modality: { key: string; label: string };
}) {
  const contractRate = parsePercentValue(readField(params.extraction, "taxaContrato"));
  const competenceLabel = readField(params.extraction, "competencia") || "Competencia nao identificada";
  const reference = BACEN_REFERENCE_BY_MODALITY[params.modality.key];

  if (!reference || reference.monthlyRate === 0) {
    return {
      status: "unavailable",
      modalityLabel: params.modality.label,
      competenceLabel,
      contractRateLabel: readField(params.extraction, "taxaContrato"),
      referenceRateLabel: "Referencia indisponivel",
      differenceLabel: "Nao calculado",
      classificationLabel: "Atencao",
      sourceLabel: reference?.sourceLabel ?? "BACEN | sem referencia configurada",
      summary:
        "Nao existe referencia BACEN economica util para este documento ou ela ainda nao foi consolidada."
    } satisfies BcbSnapshot;
  }

  return {
    status: "consulted",
    modalityLabel: params.modality.label,
    competenceLabel,
    contractRateLabel: readField(params.extraction, "taxaContrato"),
    referenceRateLabel: formatPercent(reference.monthlyRate),
    differenceLabel: formatDifference(contractRate, reference.monthlyRate),
    classificationLabel: classifyDifference(contractRate, reference.monthlyRate),
    sourceLabel: reference.sourceLabel,
    summary: `Comparacao BACEN consolidada para ${params.modality.label.toLowerCase()} em ${competenceLabel}.`
  } satisfies BcbSnapshot;
}

function buildCalculationSnapshot(params: {
  extraction: ExtractionFieldMap;
  bankingCase: Pick<BankingCaseRecord, "niche">;
}) {
  const financedAmount = readField(params.extraction, "valorFinanciado");
  const installmentCount = readField(params.extraction, "parcelas").replace(/[^0-9]/g, "");
  const contractedInstallment = readField(params.extraction, "parcelaContratada");
  const chargedInstallment = readField(params.extraction, "parcelaCobrada");
  const targetReductionPercent =
    params.bankingCase.niche === "cartao-consignado" || params.bankingCase.niche === "beneficio-descontos"
      ? "18"
      : "27.8";
  const snapshot = getBankingRevisionalCalculation(
    {
      financedAmount,
      installmentCount,
      contractedInstallment,
      chargedInstallment,
      targetReductionPercent
    },
    {
      financedAmount: 68400,
      installmentCount: 48,
      contractedInstallment: 1842,
      chargedInstallment: 2214,
      targetReductionPercent: 27.8,
      basis:
        "Memoria juridica inicial derivada da leitura estruturada persistida, com parametros prontos para revisao humana."
    }
  );

  return {
    ...snapshot,
    legalImpactSummary: [
      `Saldo-base identificado em ${snapshot.labels.financedAmount}.`,
      `Parcela cobrada de ${snapshot.labels.chargedInstallment} para alvo revisional de ${snapshot.labels.targetReductionPercent}.`,
      `Potencial de repeticao do indebito estimado em ${snapshot.labels.estimatedTotalExcess}.`
    ]
  } satisfies CalculationSnapshot;
}

function buildStrategicSnapshot(params: {
  extraction: ExtractionFieldMap;
  calculation: CalculationSnapshot;
  bacen: BcbSnapshot;
}) {
  const signals = [
    readField(params.extraction, "seguro"),
    readField(params.extraction, "tarifas"),
    readField(params.extraction, "permanencia"),
    params.bacen.classificationLabel
  ];
  const abuseCount = signals.filter((item) =>
    /detectad|presente|abusiv|possivel/i.test(item)
  ).length;
  const chanceOfSuccess = Math.max(55, Math.min(94, 62 + abuseCount * 8));
  const riskLabel: "low" | "medium" | "high" =
    chanceOfSuccess >= 85 ? "low" : chanceOfSuccess >= 70 ? "medium" : "high";
  const abusivenessLabel =
    params.bacen.classificationLabel === "Abusividade relevante"
      ? "Abusividade relevante"
      : abuseCount >= 2
        ? "Possivel abusividade"
        : "Atenção";
  const suggestedThesis =
    params.bacen.classificationLabel === "Abusividade relevante"
      ? "Acao revisional com pedido liminar e recálculo do contrato."
      : "Revisao contratual com foco em encargos, CET e excessos de cobranca.";
  const suggestedRequests = [
    "revisao das clausulas remuneratorias",
    "recalculo da memoria economica",
    "limitacao da cobranca ao patamar revisado",
    "repeticao do indebito quando a prova economica estiver madura"
  ];

  return {
    chanceOfSuccess,
    riskLabel,
    abusivenessLabel,
    executiveSummary:
      `Leitura consolidada com taxa ${readField(params.extraction, "taxaContrato")}, CET ${readField(params.extraction, "cet")} e ${params.bacen.classificationLabel.toLowerCase()} na comparacao BACEN. A memoria economica aponta ${params.calculation.labels.estimatedTotalExcess} de excesso potencial.`,
    suggestedThesis,
    suggestedRequests
  } satisfies StrategicSnapshot;
}

function buildPetitionSnapshot(params: {
  client: Pick<ClientRecord, "fullName">;
  bankingCase: Pick<BankingCaseRecord, "title" | "bankName">;
  strategic: StrategicSnapshot;
  bacen: BcbSnapshot;
  calculation: CalculationSnapshot;
}) {
  return {
    readyForReview: true,
    factualSummary:
      `${params.client.fullName} discute o contrato vinculado ao caso ${params.bankingCase.title} em face de ${params.bankingCase.bankName}. A comparacao BACEN indica ${params.bacen.classificationLabel.toLowerCase()} e a memoria economica estima excesso de ${params.calculation.labels.estimatedTotalExcess}.`,
    legalGrounds: [
      "violacao do dever de informacao e transparencia",
      "onerosidade excessiva e desequilibrio contratual",
      "necessidade de recálculo da divida e da parcela"
    ],
    requests: params.strategic.suggestedRequests,
    reviewChecklist: [
      "conferir enderecamento e competencia",
      "validar cronologia e documentos-base",
      "revisar pedidos de tutela e repeticao do indebito",
      "aprovar a peca antes do handoff de distribuicao"
    ]
  } satisfies PetitionSnapshot;
}

function buildAbusivenessSignals(params: {
  extraction: ExtractionFieldMap;
  bacen: BcbSnapshot;
}) {
  const signals: string[] = [];

  if (/seguro embutido detectado/i.test(readField(params.extraction, "seguro"))) {
    signals.push("Seguro embutido / venda casada");
  }

  if (/tarifas acessorias detectadas/i.test(readField(params.extraction, "tarifas"))) {
    signals.push("Tarifas acessorias");
  }

  if (/encargos moratorios presentes/i.test(readField(params.extraction, "multa"))) {
    signals.push("Encargos moratorios cumulativos");
  }

  if (params.bacen.classificationLabel === "Abusividade relevante") {
    signals.push("Taxa acima da media BACEN");
  }

  if (!signals.length) {
    signals.push("Necessidade de revisao humana complementar");
  }

  return signals;
}

function buildSensitiveClauses(extraction: ExtractionFieldMap) {
  return [
    readField(extraction, "seguro"),
    readField(extraction, "tarifas"),
    readField(extraction, "permanencia"),
    readField(extraction, "multa")
  ].filter((value) => value && value !== "Sem seguro embutido identificado" && value !== "Sem tarifa acessoria identificada" && value !== "Comissao de permanencia nao identificada" && value !== "Encargos moratorios nao identificados");
}

export async function syncCaseDossierFromDocument(params: {
  supabase: SupabaseClient;
  tenantId: string;
  document: DocumentRecord;
  client: Pick<ClientRecord, "id" | "fullName" | "bankName">;
  bankingCase: Pick<
    BankingCaseRecord,
    "id" | "title" | "bankName" | "niche" | "claimType"
  >;
  forcedExtraction?: ExtractionFieldMap;
  reviewStatus?: "pending" | "reviewed" | "corrected";
  reviewNotes?: string;
}) {
  const baseExtraction = buildStructuredExtraction({
    document: params.document,
    client: params.client,
    bankingCase: params.bankingCase
  });
  const extraction = params.forcedExtraction
    ? {
        ...baseExtraction,
        fields: params.forcedExtraction,
        aiStatus: "analyzed" as const,
        previewLabel: "Leitura estruturada revisada e confirmada manualmente.",
        sourceTrace: {
          origem_documental: [params.document.fileName],
          origem_interna: [params.document.documentType, params.document.category],
          inferencia_controlada: ["Campos corrigidos e confirmados manualmente."]
        },
        reviewStatus: params.reviewStatus ?? "corrected"
      }
    : baseExtraction;

  const { error: documentError } = await params.supabase
    .from("documents")
    .update({
      ai_status: extraction.aiStatus,
      preview_label: extraction.previewLabel,
      structured_extraction: extraction.fields,
      extraction_source_trace: extraction.sourceTrace,
      extraction_error: extraction.extractionError,
      extracted_at: new Date().toISOString(),
      reviewed_at: extraction.reviewStatus === "pending" ? null : new Date().toISOString(),
      review_notes: params.reviewNotes ?? params.document.reviewNotes ?? null,
      review_status: params.reviewStatus ?? extraction.reviewStatus,
      actions:
        extraction.aiStatus === "analyzed"
          ? ["Conferir leitura estruturada", "Revisar campos do contrato", "Acionar Clara"]
          : ["Revisar campos extraidos", "Corrigir dados do documento", "Acionar Clara"]
    })
    .eq("tenant_id", params.tenantId)
    .eq("id", params.document.id);

  if (documentError) {
    throw new Error(`Falha ao persistir leitura estruturada: ${documentError.message}`);
  }

  if (!CONTRACT_DOCUMENT_TYPES.has(params.document.documentType)) {
    return {
      extraction: extraction.fields
    };
  }

  const bacenSnapshot = buildBacenSnapshot({
    extraction: extraction.fields,
    modality: extraction.modality
  });
  const calculationSnapshot = buildCalculationSnapshot({
    extraction: extraction.fields,
    bankingCase: params.bankingCase
  });
  const strategicSnapshot = buildStrategicSnapshot({
    extraction: extraction.fields,
    calculation: calculationSnapshot,
    bacen: bacenSnapshot
  });
  const petitionSnapshot = buildPetitionSnapshot({
    client: params.client,
    bankingCase: params.bankingCase,
    strategic: strategicSnapshot,
    bacen: bacenSnapshot,
    calculation: calculationSnapshot
  });
  const sensitiveClauses = buildSensitiveClauses(extraction.fields);
  const abusivenessSignals = buildAbusivenessSignals({
    extraction: extraction.fields,
    bacen: bacenSnapshot
  });
  const contractAnalysisId = `analysis-${params.document.id}`;

  const analysisRow = {
    id: contractAnalysisId,
    tenant_id: params.tenantId,
    case_id: params.bankingCase.id,
    document_id: params.document.id,
    rate_label: readField(extraction.fields, "taxaContrato"),
    cet_label: readField(extraction.fields, "cet"),
    capitalization_label:
      params.document.documentType === "CCB"
        ? "Capitalizacao mensal sob revisao"
        : "Capitalizacao contratual em revisao",
    fees_label: readField(extraction.fields, "tarifas"),
    bundled_insurance_label: readField(extraction.fields, "seguro"),
    permanence_commission_label: readField(extraction.fields, "permanencia"),
    penalty_label: readField(extraction.fields, "multa"),
    sensitive_clauses: sensitiveClauses,
    abusiveness_signals: abusivenessSignals,
    suggested_thesis: strategicSnapshot.suggestedThesis,
    procedural_risk: strategicSnapshot.riskLabel,
    suggested_requests: strategicSnapshot.suggestedRequests,
    executive_summary: strategicSnapshot.executiveSummary,
    calculation_snapshot: calculationSnapshot,
    bacen_snapshot: bacenSnapshot,
    strategic_snapshot: strategicSnapshot,
    petition_snapshot: petitionSnapshot,
    approved_for_filing: false,
    synced_at: new Date().toISOString()
  };

  const { error: analysisError } = await params.supabase
    .from("contract_analyses")
    .upsert(analysisRow, { onConflict: "id" });

  if (analysisError) {
    throw new Error(`Falha ao persistir analise contratual: ${analysisError.message}`);
  }

  const viabilityScore = strategicSnapshot.chanceOfSuccess;
  const { error: clientError } = await params.supabase
    .from("clients")
    .update({
      legal_viability_score: viabilityScore
    })
    .eq("tenant_id", params.tenantId)
    .eq("id", params.client.id);

  if (clientError) {
    throw new Error(`Falha ao atualizar score juridico do cliente: ${clientError.message}`);
  }

  const { error: caseError } = await params.supabase
    .from("cases")
    .update({
      main_thesis: strategicSnapshot.executiveSummary,
      suggested_strategy: strategicSnapshot.suggestedThesis,
      legal_risk: strategicSnapshot.riskLabel,
      lexia_insights: [
        `BACEN: ${bacenSnapshot.classificationLabel}`,
        `Chance de exito estimada: ${viabilityScore}%`,
        `Memoria economica: ${calculationSnapshot.labels.estimatedTotalExcess} de excesso potencial`
      ]
    })
    .eq("tenant_id", params.tenantId)
    .eq("id", params.bankingCase.id);

  if (caseError) {
    throw new Error(`Falha ao sincronizar o caso com a analise contratual: ${caseError.message}`);
  }

  return {
    extraction: extraction.fields,
    analysis: {
      id: contractAnalysisId,
      documentId: params.document.id,
      rateLabel: analysisRow.rate_label,
      cetLabel: analysisRow.cet_label,
      capitalizationLabel: analysisRow.capitalization_label,
      feesLabel: analysisRow.fees_label,
      bundledInsuranceLabel: analysisRow.bundled_insurance_label,
      permanenceCommissionLabel: analysisRow.permanence_commission_label,
      penaltyLabel: analysisRow.penalty_label,
      sensitiveClauses,
      abusivenessSignals,
      suggestedThesis: analysisRow.suggested_thesis,
      proceduralRisk: analysisRow.procedural_risk,
      suggestedRequests: strategicSnapshot.suggestedRequests,
      executiveSummary: strategicSnapshot.executiveSummary,
      caseId: params.bankingCase.id,
      calculationSnapshot,
      bacenSnapshot,
      strategicSnapshot,
      petitionSnapshot,
      approvedForFiling: false,
      syncedAt: analysisRow.synced_at
    } satisfies ContractAnalysisRecord
  };
}
