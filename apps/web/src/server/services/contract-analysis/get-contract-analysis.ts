import { ContractAnalysisRecord } from "@lexia/domain";
import { notFound } from "next/navigation";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getBankingRevisionalCalculation } from "@/server/services/clara/get-banking-revisional-calculation";
import { getBcbSgsConsultation } from "@/server/services/bcb/get-bcb-consultation";
import { getCaseById } from "@/server/services/cases/get-cases";
import { getClientById } from "@/server/services/clients/get-clients";
import { getDocumentById, getDocuments } from "@/server/services/documents/get-documents";
import { syncDetectedAbusesForAnalysis } from "@/server/services/contract-analysis/detected-abuses-store";

type ContractAnalysisRow = {
  id: string;
  case_id: string | null;
  document_id: string;
  rate_label: string;
  cet_label: string;
  capitalization_label: string;
  fees_label: string;
  bundled_insurance_label: string;
  permanence_commission_label: string;
  penalty_label: string;
  sensitive_clauses: string[] | null;
  abusiveness_signals: string[] | null;
  suggested_thesis: string;
  procedural_risk: ContractAnalysisRecord["proceduralRisk"];
  suggested_requests: string[] | null;
  executive_summary: string;
  calculation_snapshot: Record<string, unknown> | null;
  bacen_snapshot: Record<string, unknown> | null;
  strategic_snapshot: Record<string, unknown> | null;
  petition_snapshot: Record<string, unknown> | null;
  approved_for_filing: boolean | null;
  synced_at: string | null;
};

type ContractAnalysisDossier = {
  clara: {
    summary: string;
    focusPoints: string[];
  };
  laudo: {
    summary: string;
    sources: string[];
  };
  peticoes: {
    summary: string;
    sources: string[];
  };
};

type CaseCalculationDescriptor = {
  id: string;
  label: string;
  enabled: boolean;
  reason: string;
  priority: 1 | 2;
};

function parsePercentLabel(value: string) {
  const normalized = value
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatPercentNumber(value: number) {
  return `${value.toFixed(2).replace(".", ",")}%`;
}

function formatBasisPoints(value: number) {
  return `${value.toFixed(2).replace(".", ",")} p.p.`;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mapContractAnalysisRow(row: ContractAnalysisRow): ContractAnalysisRecord {
  return {
    id: row.id,
    caseId: row.case_id ?? undefined,
    documentId: row.document_id,
    rateLabel: row.rate_label,
    cetLabel: row.cet_label,
    capitalizationLabel: row.capitalization_label,
    feesLabel: row.fees_label,
    bundledInsuranceLabel: row.bundled_insurance_label,
    permanenceCommissionLabel: row.permanence_commission_label,
    penaltyLabel: row.penalty_label,
    sensitiveClauses: row.sensitive_clauses ?? [],
    abusivenessSignals: row.abusiveness_signals ?? [],
    suggestedThesis: row.suggested_thesis,
    proceduralRisk: row.procedural_risk,
    suggestedRequests: row.suggested_requests ?? [],
    executiveSummary: row.executive_summary,
    calculationSnapshot: row.calculation_snapshot ?? undefined,
    bacenSnapshot: row.bacen_snapshot ?? undefined,
    strategicSnapshot: row.strategic_snapshot ?? undefined,
    petitionSnapshot: row.petition_snapshot ?? undefined,
    approvedForFiling: row.approved_for_filing ?? undefined,
    syncedAt: row.synced_at ?? undefined
  };
}

const CONTRACT_ANALYSIS_SELECT = `
  id,
  case_id,
  document_id,
  rate_label,
  cet_label,
  capitalization_label,
  fees_label,
  bundled_insurance_label,
  permanence_commission_label,
  penalty_label,
  sensitive_clauses,
  abusiveness_signals,
  suggested_thesis,
  procedural_risk,
  suggested_requests,
  executive_summary,
  calculation_snapshot,
  bacen_snapshot,
  strategic_snapshot,
  petition_snapshot,
  approved_for_filing,
  synced_at
`;

const CONTRACT_ANALYSIS_DOCUMENT_TYPES = new Set(["Contrato bancario", "CCB"]);

function isContractAnalysisDocument(documentType: string) {
  return CONTRACT_ANALYSIS_DOCUMENT_TYPES.has(documentType);
}

function resolveCompatibleContractDocument(params: {
  requestedDocument: Awaited<ReturnType<typeof getDocumentById>>;
  contractDocuments: Awaited<ReturnType<typeof getDocuments>>;
}) {
  const { requestedDocument, contractDocuments } = params;

  if (!requestedDocument) {
    return contractDocuments[0] ?? null;
  }

  if (isContractAnalysisDocument(requestedDocument.documentType)) {
    return contractDocuments.find((document) => document.id === requestedDocument.id) ?? requestedDocument;
  }

  return contractDocuments.find((document) => document.caseId === requestedDocument.caseId) ?? null;
}

function getScenarioProfile(params: { documentType: string; bankName: string }) {
  if (params.documentType === "CCB") {
    return {
      label: "CCB com foco em capitalizacao",
      summary: `Operacao empresarial com leitura orientada para capitalizacao mensal, CET elevado e encargos agregados na relacao com ${params.bankName}.`,
      thesisFocus: [
        "capitalizacao mensal indevida ou excessivamente onerosa",
        "revisao do CET e dos custos incorporados ao saldo",
        "controle de comissao de permanencia e cumulos moratorios"
      ]
    };
  }

  return {
    label: "Financiamento ao consumidor",
    summary: `Operacao voltada ao consumidor com leitura orientada para seguro embutido, venda casada e distorcao entre parcela prometida e parcela cobrada na relacao com ${params.bankName}.`,
    thesisFocus: [
      "seguro embutido e venda casada",
      "falta de transparencia sobre CET e composicao da parcela",
      "onerosidade excessiva no cumprimento do contrato"
    ]
  };
}

function getCaseDossier(params: {
  selectedDocument: {
    documentType: string;
    fileName: string;
  };
  client: {
    fullName: string;
  };
  bankingCase: {
    id: string;
    title: string;
  };
  analysis: ContractAnalysisRecord;
  bacenComparisonLabel: string;
  calculationMemory: ReturnType<typeof getBankingRevisionalCalculation>;
  detectedAbuses: {
    length: number;
  };
}) {
  const { selectedDocument, client, bankingCase, analysis, bacenComparisonLabel, calculationMemory, detectedAbuses } =
    params;

  return {
    clara: {
      summary:
        `Clara vive no contexto do caso ${bankingCase.title} e sintetiza o contrato ${selectedDocument.documentType} de ${client.fullName}, ` +
        `as parcelas contratada e cobrada, a leitura BACEN (${bacenComparisonLabel}) e os sinais de abusividade já consolidados.`,
      focusPoints: [
        `Contrato em foco: ${selectedDocument.fileName}`,
        `Parcelas: ${calculationMemory.labels.contractedInstallment} contra ${calculationMemory.labels.chargedInstallment}`,
        `BACEN: ${bacenComparisonLabel}`,
        `Abusividades detectadas: ${detectedAbuses.length} sinais`,
        `Tese de trabalho: ${analysis.suggestedThesis}`
      ]
    },
    laudo: {
      summary:
        "Laudo gerado automaticamente a partir de OCR, BACEN, cálculos e análises para consolidar a leitura técnica do contrato.",
      sources: ["OCR", "BACEN", "cálculos", "análises"]
    },
    peticoes: {
      summary:
        "Petições geradas automaticamente a partir de cliente, contrato, abusividades, BACEN, cálculos e tese para manter a peça ancorada no dossiê do caso.",
      sources: ["cliente", "contrato", "abusividades", "BACEN", "cálculos", "tese"]
    }
  } satisfies ContractAnalysisDossier;
}

function getBacenComparisonLabel(params: {
  analysis: ContractAnalysisRecord;
  consultationStatus: "consulted" | "unavailable" | "failed";
}) {
  const signalScore = params.analysis.abusivenessSignals.length;
  const rateEvidence = `${params.analysis.rateLabel} ${params.analysis.cetLabel} ${params.analysis.capitalizationLabel}`.toLowerCase();

  if (params.consultationStatus !== "consulted") {
    return "Atenção";
  }

  if (signalScore >= 3 || /abusiv|indeb|oneros|capitaliza/.test(rateEvidence)) {
    return "Abusividade relevante";
  }

  if (signalScore > 0 || /seguro|tarif|permanencia|multa/.test(rateEvidence)) {
    return "Possível abusividade";
  }

  if (/taxa\s+padrao|nao identificada|sem consolidacao/.test(rateEvidence)) {
    return "Atenção";
  }

  return "Dentro da média";
}

function getCaseCalculationDescriptors(params: {
  niche: string;
  documentType: string;
  analysis: ContractAnalysisRecord;
}) {
  const evidence = [
    params.analysis.rateLabel,
    params.analysis.cetLabel,
    params.analysis.capitalizationLabel,
    params.analysis.feesLabel,
    params.analysis.bundledInsuranceLabel,
    params.analysis.permanenceCommissionLabel,
    params.analysis.penaltyLabel,
    ...params.analysis.abusivenessSignals
  ]
    .join(" ")
    .toLowerCase();

  const has = (pattern: RegExp) => pattern.test(evidence);
  const isVehicleRevisional =
    params.niche === "revisional" || params.documentType === "CCB";
  const isConsignado =
    params.niche === "cartao-consignado" ||
    has(/consignad|beneficio|rmc|rcc/);
  const isSearchAndSeizureCase =
    params.niche === "busca-apreensao" || has(/busca|apreens|mora/);

  return [
    {
      id: "revisional-veiculo",
      label: "Revisional de veiculo",
      enabled: isVehicleRevisional,
      reason: "Ativado quando o contrato do caso pede leitura revisional da divida e da parcela.",
      priority: 1
    },
    {
      id: "cet",
      label: "CET",
      enabled: has(/cet|custo efetivo|tarifa|seguro/) || isVehicleRevisional,
      reason: "Ativado para verificar custo efetivo e rubricas acessorias embutidas no contrato.",
      priority: 1
    },
    {
      id: "juros-abusivos",
      label: "Juros abusivos",
      enabled: has(/juros|taxa|abusiv|oneros/) || isVehicleRevisional,
      reason: "Ativado para comparar taxa contratual, custo efetivo e peso da remuneracao no caso.",
      priority: 1
    },
    {
      id: "recalculo-parcelas",
      label: "Recalculo de parcelas",
      enabled: true,
      reason: "Ativado sempre que ha memoria de calculo com parcela contratada, cobrada e revisada.",
      priority: 1
    },
    {
      id: "consignado",
      label: "Consignado",
      enabled: isConsignado,
      reason: "Ativado quando a leitura do caso indica desconto em folha, beneficio ou cartao consignado.",
      priority: 1
    },
    {
      id: "soma-descontada",
      label: "Soma descontada",
      enabled: isConsignado,
      reason: "Ativado para consolidar o total abatido ao longo do contrato quando o caso envolve descontos recorrentes.",
      priority: 1
    },
    {
      id: "repeticao-indebito",
      label: "Repeticao do indebito",
      enabled: has(/indeb|seguro|tarifa|cobranc/) || isConsignado,
      reason: "Ativado quando a cobranca excessiva permite pedir devolucao ou compensacao.",
      priority: 1
    },
    {
      id: "rmc",
      label: "RMC",
      enabled: has(/rmc|margem/) || params.niche === "cartao-consignado",
      reason: "Ativado para casos de reserva de margem consignavel ou cartao associado ao beneficio.",
      priority: 1
    },
    {
      id: "busca-apreensao",
      label: "Busca e apreensao",
      enabled: isSearchAndSeizureCase,
      reason: "Ativado quando o risco do caso inclui consolidacao da mora ou retomada do bem.",
      priority: 1
    },
    {
      id: "purgacao-mora",
      label: "Purgacao da mora",
      enabled: isSearchAndSeizureCase,
      reason: "Ativado para medir o esforco de regularizacao e sustentar pedido de manutencao da posse.",
      priority: 1
    },
    {
      id: "saldo-revisado",
      label: "Saldo revisado",
      enabled: true,
      reason: "Ativado para projetar o saldo juridicamente defensavel apos expurgo dos excessos.",
      priority: 1
    },
    {
      id: "timeline-financeira",
      label: "Timeline financeira visual",
      enabled: true,
      reason: "Mantida pronta para organizar a sequencia financeira do contrato conforme o caso amadurece.",
      priority: 2
    },
    {
      id: "detector-refinanciamento",
      label: "Detector de refinanciamento abusivo",
      enabled: has(/refinanc|renegoci/) || params.documentType === "CCB",
      reason: "Preparado para apontar substituicoes sucessivas de divida e rollover oneroso.",
      priority: 2
    },
    {
      id: "motor-acordos",
      label: "Motor de acordos",
      enabled: true,
      reason: "Mantido disponivel para simular cenarios de acordo com base no saldo revisado.",
      priority: 2
    },
    {
      id: "calculo-judicial",
      label: "Calculo judicial automatico",
      enabled: true,
      reason: "Mantido pronto para converter a memoria revisional em base de liquidacao judicial.",
      priority: 2
    }
  ] satisfies CaseCalculationDescriptor[];
}

function getLegalImpactSuggestions(params: {
  descriptors: ReadonlyArray<CaseCalculationDescriptor>;
  analysis: ContractAnalysisRecord;
  calculationMemory: ReturnType<typeof getBankingRevisionalCalculation>;
}) {
  const enabledIds = new Set(
    params.descriptors.filter((descriptor) => descriptor.enabled).map((descriptor) => descriptor.id)
  );
  const impacts = [
    enabledIds.has("juros-abusivos")
      ? `Sustentar revisao da remuneracao contratual com base na taxa ${params.analysis.rateLabel}.`
      : null,
    enabledIds.has("cet")
      ? `Questionar composicao do CET (${params.analysis.cetLabel}) e seus reflexos na formacao da parcela.`
      : null,
    enabledIds.has("recalculo-parcelas")
      ? `Ancorar pedido de recalculo com reducao alvo de ${params.calculationMemory.labels.targetReductionPercent}.`
      : null,
    enabledIds.has("repeticao-indebito")
      ? "Avaliar compensacao ou repeticao do indebito a partir dos excessos estimados."
      : null,
    enabledIds.has("busca-apreensao")
      ? "Reforcar tutela para conter agravamento da mora e preservar a posse enquanto o contrato e revisto."
      : null,
    enabledIds.has("rmc")
      ? "Apoiar pedido de cancelamento da RMC e recomposicao dos descontos vinculados ao beneficio."
      : null
  ].filter((item): item is string => Boolean(item));

  return impacts.length
    ? impacts
    : ["Concentrar a tese na leitura contratual e na memoria economica inicial do caso."];
}

export async function getContractAnalysisWorkspace(
  documentId?: string,
  calculationParams?: {
    financedAmount?: string;
    installmentCount?: string;
    contractedInstallment?: string;
    chargedInstallment?: string;
    targetReductionPercent?: string;
  }
) {
  const allDocuments = await getDocuments();
  const contractDocuments = allDocuments.filter((document) =>
    isContractAnalysisDocument(document.documentType)
  );
  const requestedDocument = documentId
    ? allDocuments.find((document) => document.id === documentId) ??
      (await getDocumentById(documentId))
    : null;
  const selectedDocument = resolveCompatibleContractDocument({
    requestedDocument,
    contractDocuments
  });

  if (!selectedDocument) {
    notFound();
  }

  const analysis = await getContractAnalysisByDocumentId(selectedDocument.id);
  const client =
    selectedDocument.client ??
    (await getClientById(selectedDocument.clientId));
  const bankingCase =
    selectedDocument.bankingCase ??
    (await getCaseById(selectedDocument.caseId));

  if (!analysis || !client || !bankingCase) {
    notFound();
  }

  const scenarioProfile = getScenarioProfile({
    bankName: bankingCase.bankName,
    documentType: selectedDocument.documentType
  });
  const persistedBacenSnapshot = isObjectRecord(analysis.bacenSnapshot) ? analysis.bacenSnapshot : null;
  const persistedCalculationSnapshot = isObjectRecord(analysis.calculationSnapshot)
    ? analysis.calculationSnapshot
    : null;
  const persistedStrategicSnapshot = isObjectRecord(analysis.strategicSnapshot)
    ? analysis.strategicSnapshot
    : null;
  const persistedPetitionSnapshot = isObjectRecord(analysis.petitionSnapshot)
    ? analysis.petitionSnapshot
    : null;
  const bacenConsultation = await getBcbSgsConsultation(
    selectedDocument.documentType === "CCB" ? "1" : "433"
  );
  const bacenComparisonLabel =
    typeof persistedBacenSnapshot?.classificationLabel === "string"
      ? persistedBacenSnapshot.classificationLabel
      : getBacenComparisonLabel({
          analysis,
          consultationStatus: bacenConsultation.status
        });
  const detectedAbuses = await syncDetectedAbusesForAnalysis({
    analysis,
    caseId: bankingCase.id,
    contractId: selectedDocument.id
  });
  const calculationMemory =
    persistedCalculationSnapshot &&
    isObjectRecord(persistedCalculationSnapshot.labels) &&
    typeof persistedCalculationSnapshot.basis === "string"
      ? (persistedCalculationSnapshot as ReturnType<typeof getBankingRevisionalCalculation>)
      : getBankingRevisionalCalculation(
          calculationParams,
          selectedDocument.id === "doc-004"
            ? {
                financedAmount: 248000,
                installmentCount: 21,
                contractedInstallment: 8420,
                chargedInstallment: 10185,
                targetReductionPercent: 21.8,
                basis:
                  "Estimativa preliminar com expurgo de capitalizacao mensal e de custos agregados de baixa transparencia."
              }
            : {
                financedAmount: 68400,
                installmentCount: 29,
                contractedInstallment: 1842,
                chargedInstallment: 2214,
                targetReductionPercent: 27.8,
                basis:
                  "Estimativa preliminar com exclusao de seguro embutido, readequacao do CET e afastamento de encargos cumulativos."
              }
        );
  const caseDossier = getCaseDossier({
    selectedDocument,
    client,
    bankingCase,
    analysis,
    bacenComparisonLabel,
    calculationMemory,
    detectedAbuses
  });
  const marketRateSource =
    persistedBacenSnapshot &&
    typeof persistedBacenSnapshot.referenceRateLabel === "string"
      ? {
          label:
            typeof persistedBacenSnapshot.sourceLabel === "string"
              ? persistedBacenSnapshot.sourceLabel
              : "Referencia BACEN persistida",
          value: persistedBacenSnapshot.referenceRateLabel
        }
      : bacenConsultation.status === "consulted"
        ? {
            label: bacenConsultation.payload.items[0]?.label ?? "Serie BACEN",
            value: bacenConsultation.payload.items[0]?.value ?? ""
          }
        : null;
  const contractRatePercent = parsePercentLabel(analysis.rateLabel);
  const marketRatePercent = parsePercentLabel(marketRateSource?.value ?? "");
  const rateDifference =
    contractRatePercent !== null && marketRatePercent !== null
      ? contractRatePercent - marketRatePercent
      : null;
  const relativeDifference =
    rateDifference !== null && marketRatePercent && marketRatePercent !== 0
      ? (rateDifference / marketRatePercent) * 100
      : null;
  const calculationDescriptors = getCaseCalculationDescriptors({
    niche: bankingCase.niche,
    documentType: selectedDocument.documentType,
    analysis
  });
  const legalImpactSuggestions = getLegalImpactSuggestions({
    descriptors: calculationDescriptors,
    analysis,
    calculationMemory
  });
  const calculationResults = [
    {
      id: "parcela-revisada",
      label: "Recalculo de parcelas",
      resultLabel: `${calculationMemory.labels.revisedInstallment} por parcela`,
      detail:
        `Parcela cobrada de ${calculationMemory.labels.chargedInstallment} com alvo revisional de ${calculationMemory.labels.targetReductionPercent}.`,
      legalImpact: "Serve de base para tutela de readequacao da parcela e limitacao da cobranca."
    },
    {
      id: "excesso-mensal",
      label: "Excesso mensal identificado",
      resultLabel: calculationMemory.labels.estimatedMonthlyExcess,
      detail:
        `Diferenca mensal entre a parcela cobrada e a parcela revisada, hoje medida em ${calculationMemory.labels.estimatedMonthlyExcess}.`,
      legalImpact: "Sustenta narrativa de onerosidade excessiva atual e urgencia economica."
    },
    {
      id: "excesso-acumulado",
      label: "Repeticao do indebito potencial",
      resultLabel: calculationMemory.labels.estimatedTotalExcess,
      detail:
        `Excesso acumulado estimado ao longo de ${calculationMemory.labels.installmentCount}.`,
      legalImpact: "Orienta pedido de compensacao ou repeticao do indebito quando a prova estiver madura."
    },
    {
      id: "saldo-revisado",
      label: "Saldo revisado",
      resultLabel: calculationMemory.labels.financedAmount,
      detail:
        `Saldo-base hoje lido a partir do capital financiado de ${calculationMemory.labels.financedAmount} com expurgo dos excessos apontados.`,
      legalImpact: "Ajuda a recalibrar saldo devedor, pedido revisional e proposta de acordo."
    }
  ];
  const bacenSummary =
    typeof persistedBacenSnapshot?.summary === "string"
      ? persistedBacenSnapshot.summary
      : bacenConsultation.status === "consulted"
        ? `Taxa contratual ${analysis.rateLabel} contra media BACEN ${marketRateSource?.value ?? "indisponivel"}.`
        : "Comparacao BACEN mantida em boundary controlado enquanto a consulta automatica nao retorna no formato esperado.";
  const strategicSummary =
    typeof persistedStrategicSnapshot?.executiveSummary === "string"
      ? persistedStrategicSnapshot.executiveSummary
      : analysis.executiveSummary;
  const strategicThesis =
    typeof persistedStrategicSnapshot?.suggestedThesis === "string"
      ? persistedStrategicSnapshot.suggestedThesis
      : analysis.suggestedThesis;
  const persistedRequests =
    Array.isArray(persistedStrategicSnapshot?.suggestedRequests) &&
    persistedStrategicSnapshot.suggestedRequests.every((item) => typeof item === "string")
      ? (persistedStrategicSnapshot.suggestedRequests as string[])
      : analysis.suggestedRequests;
  const petitionReviewChecklist =
    Array.isArray(persistedPetitionSnapshot?.reviewChecklist) &&
    persistedPetitionSnapshot.reviewChecklist.every((item) => typeof item === "string")
      ? (persistedPetitionSnapshot.reviewChecklist as string[])
      : [];

  const resolvedAnalysis = {
    ...analysis,
    executiveSummary: strategicSummary,
    suggestedThesis: strategicThesis,
    suggestedRequests: persistedRequests
  };

  return {
    contractDocuments: contractDocuments.map((document) => ({
      id: document.id,
      label: document.fileName,
      documentType: document.documentType
    })),
    selectedDocument,
    analysis: resolvedAnalysis,
    client,
    bankingCase,
    scenarioProfile,
    bacenConsultation,
    bacenComparison: {
      contractRateLabel: analysis.rateLabel,
      marketReferenceLabel:
        marketRateSource
          ? `${marketRateSource.label}: ${marketRateSource.value}`
          : "Referencia BACEN indisponivel no momento",
      modalityLabel:
        typeof persistedBacenSnapshot?.modalityLabel === "string"
          ? persistedBacenSnapshot.modalityLabel
          : bacenConsultation.kind === "sgs"
            ? "SGS / taxa base"
            : "Referencia BACEN",
      consultedPeriodLabel:
        typeof persistedBacenSnapshot?.competenceLabel === "string"
          ? persistedBacenSnapshot.competenceLabel
          : bacenConsultation.status === "consulted"
            ? bacenConsultation.consultedAt?.slice(0, 10) ?? "Hoje"
            : "Indisponivel",
      differencePercentLabel:
        typeof persistedBacenSnapshot?.differenceLabel === "string"
          ? persistedBacenSnapshot.differenceLabel
          : rateDifference !== null
          ? `${rateDifference >= 0 ? "+" : ""}${formatBasisPoints(rateDifference)} ${
              relativeDifference !== null ? `(${relativeDifference >= 0 ? "+" : ""}${formatPercentNumber(relativeDifference)})` : ""
            }`.trim()
          : "Nao calculado",
      classificationLabel: bacenComparisonLabel,
      summary: bacenSummary
    },
    caseCalculations: {
      scenarioDetected: {
        label: scenarioProfile.label,
        summary: scenarioProfile.summary
      },
      activatedCalculations: calculationDescriptors
        .filter((descriptor) => descriptor.enabled)
        .map((descriptor) => ({
          id: descriptor.id,
          label: descriptor.label,
          reason: descriptor.reason,
          priority: descriptor.priority
        })),
      availableCalculations: calculationDescriptors.map((descriptor) => ({
        id: descriptor.id,
        label: descriptor.label,
        enabled: descriptor.enabled,
        reason: descriptor.reason,
        priority: descriptor.priority
      })),
      inputData: [
        { label: "Valor financiado", value: calculationMemory.labels.financedAmount },
        { label: "Numero de parcelas", value: calculationMemory.labels.installmentCount },
        { label: "Parcela contratada", value: calculationMemory.labels.contractedInstallment },
        { label: "Parcela cobrada", value: calculationMemory.labels.chargedInstallment },
        { label: "Reducao alvo", value: calculationMemory.labels.targetReductionPercent },
        { label: "Taxa contratual", value: analysis.rateLabel },
        { label: "CET", value: analysis.cetLabel }
      ],
      memory: {
        summary: calculationMemory.basis,
        highlights: calculationMemory.highlights,
        legalImpactSuggestions
      },
      results: calculationResults
    },
    bacenDossier: {
      contractDetectedLabel: `${selectedDocument.documentType} | ${selectedDocument.fileName}`,
      referenceDateLabel:
        typeof persistedBacenSnapshot?.competenceLabel === "string"
          ? persistedBacenSnapshot.competenceLabel
          : bacenConsultation.status === "consulted"
            ? bacenConsultation.consultedAt?.slice(0, 10) ?? "Hoje"
            : "Indisponivel",
      contractRateLabel: analysis.rateLabel,
      marketRateLabel: marketRateSource?.value ?? "Referencia BACEN indisponivel",
      marketRateSourceLabel: marketRateSource?.label ?? "Serie BACEN indisponivel",
      modalityLabel:
        typeof persistedBacenSnapshot?.modalityLabel === "string"
          ? persistedBacenSnapshot.modalityLabel
          : bacenConsultation.kind === "sgs"
            ? "SGS / taxa base"
            : "Referencia BACEN",
      comparisonSummary: bacenSummary,
      differenceLabel:
        typeof persistedBacenSnapshot?.differenceLabel === "string"
          ? persistedBacenSnapshot.differenceLabel
          : rateDifference !== null
            ? `${rateDifference >= 0 ? "+" : ""}${formatBasisPoints(rateDifference)}`
            : "Nao calculado",
      legalAlert:
        bacenComparisonLabel === "Abusividade relevante"
          ? "Alerta juridico alto: a distancia para a media e os sinais contratuais sustentam revisao forte."
          : bacenComparisonLabel === "Possível abusividade"
            ? "Alerta juridico moderado: a comparacao BACEN reforca a necessidade de prova economica e leitura contratual."
            : bacenComparisonLabel === "Atenção"
              ? "Alerta juridico de atencao: a consulta existe, mas a classificacao ainda pede validacao contextual."
              : "Alerta juridico controlado: a taxa nao destoa da media de forma suficiente, sem afastar outros abusos."
    },
    detectedAbuses,
    calculationMemory,
    revisionalChecklist: [
      "Contrato principal com clausulas legiveis e identificacao do produto bancario",
      "Historico de parcelas pagas, vencidas e renegociadas",
      "Memoria de calculo ou planilha minima para sustentar o excesso",
      "Extratos ou comprovantes que mostrem o comportamento da cobranca",
      "Definicao objetiva das clausulas e encargos que serao rediscutidos"
    ],
    thesisFrames: [
      {
        title: "Transparencia e informacao adequada",
        detail:
          "Usar quando CET, seguros, tarifas ou a formacao da parcela nao estiverem expostos de forma clara ao consumidor."
      },
      {
        title: "Desequilibrio contratual",
        detail:
          "Fundamento util quando a execucao economica do contrato produz onerosidade superior ao desenho inicialmente apresentado."
      },
      {
        title: "Controle dos encargos financeiros",
        detail:
          "Abrange juros, capitalizacao, comissao de permanencia e outros cumulos que elevem parcela e saldo alem do patamar juridicamente defensavel."
      },
      {
        title: "Foco principal deste cenario",
        detail: `Neste tipo de operacao, a Clara prioriza ${scenarioProfile.thesisFocus.join(", ")}.`
      }
    ],
    revisionalRequests: persistedRequests.length
      ? persistedRequests
      : [
          "Tutela para conter cobranca excessiva e impedir agravamento da mora",
          "Revisao das clausulas remuneratorias e recalcule das parcelas",
          "Recomposicao do saldo contratual sem encargos abusivos",
          "Compensacao ou repeticao do indebito, quando a prova economica estiver madura"
        ],
    proofStrategy: [
      "Separar contrato, aditivos, proposta comercial e quadro-resumo da operacao",
      "Montar memoria minima do excesso com parcelas contratadas, cobradas e revisadas",
      "Anexar extratos, boletos, comunicacoes de cobranca e eventual negativacao"
    ],
    revisionalStructure: [
      "Sintese da contratacao e evolucao da divida",
      "Clausulas abusivas e onerosidade excessiva",
      "Impacto no valor das parcelas e no saldo",
      "Tutela para limitar cobranca ou readequar a parcela",
      "Pedidos revisionais e eventual repeticao de indebito"
    ],
    caseDossier: {
      clara: {
        ...caseDossier.clara,
        summary:
          typeof persistedStrategicSnapshot?.executiveSummary === "string"
            ? persistedStrategicSnapshot.executiveSummary
            : caseDossier.clara.summary
      },
      laudo: {
        ...caseDossier.laudo,
        summary: strategicSummary
      },
      peticoes: {
        ...caseDossier.peticoes,
        summary:
          typeof persistedPetitionSnapshot?.factualSummary === "string"
            ? `${persistedPetitionSnapshot.factualSummary} Revisao obrigatoria: ${petitionReviewChecklist.join("; ")}.`
            : caseDossier.peticoes.summary,
        sources: petitionReviewChecklist.length
          ? [...caseDossier.peticoes.sources, "revisao humana obrigatoria"]
          : caseDossier.peticoes.sources
      }
    }
  };
}

export async function getContractAnalyses(): Promise<ContractAnalysisRecord[]> {
  const session = await getWorkspaceSession();

  if (!session) {
    return [];
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("contract_analyses")
    .select(CONTRACT_ANALYSIS_SELECT)
    .eq("tenant_id", session.workspace.tenant.id)
    .order("document_id", { ascending: true });

  if (error) {
    console.warn(`Failed to load contract analyses for tenant ${session.workspace.tenant.id}.`);
    return [];
  }

  return (data ?? []).map((row) => mapContractAnalysisRow(row as ContractAnalysisRow));
}

export async function getContractAnalysisByDocumentId(
  documentId: string
): Promise<ContractAnalysisRecord | null> {
  const session = await getWorkspaceSession();

  if (!session) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("contract_analyses")
    .select(CONTRACT_ANALYSIS_SELECT)
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("document_id", documentId)
    .maybeSingle();

  if (error) {
    console.warn(
      `Failed to load contract analysis for document ${documentId} and tenant ${session.workspace.tenant.id}.`
    );
    return null;
  }

  return data ? mapContractAnalysisRow(data as ContractAnalysisRow) : null;
}
