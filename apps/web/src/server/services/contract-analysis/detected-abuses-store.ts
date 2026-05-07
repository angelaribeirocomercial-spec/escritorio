import { randomUUID } from "node:crypto";

import type { ContractAnalysisRecord } from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type DetectedAbuseRecord = {
  id: string;
  tenantId: string;
  caseId: string;
  contractId: string;
  contractAnalysisId: string;
  signalKey: string;
  signalLabel: string;
  description: string;
  severity: "low" | "medium" | "high";
  evidenceLabel: string;
  financialImpactLabel: string;
  legalSuggestion: string;
  createdAt: string;
  updatedAt: string;
};

type DetectedAbuseRow = {
  id: string;
  tenant_id: string;
  case_id: string;
  contract_id: string;
  contract_analysis_id: string;
  signal_key: string;
  signal_label: string;
  description: string;
  severity: DetectedAbuseRecord["severity"];
  evidence_label: string;
  financial_impact_label: string;
  legal_suggestion: string;
  created_at: string;
  updated_at: string;
};

const SEVERITY_LABELS: Record<DetectedAbuseRecord["severity"], string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta"
};

function normalizeSignalKey(signal: string) {
  return signal
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toSentenceCase(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    return trimmed;
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function classifySignal(signal: string, analysis: ContractAnalysisRecord) {
  const normalized = signal.toLowerCase();

  if (/rmc|rcc|venda casada/.test(normalized)) {
    return {
      severity: "high" as const,
      evidenceLabel: analysis.bundledInsuranceLabel,
      financialImpactLabel: "Risco de cobrança disfarçada e impacto direto no custo total do contrato.",
      legalSuggestion: "Delimitar a venda casada e pedir expurgo dos encargos atrelados ao produto indevido."
    };
  }

  if (/seguro|tarif|cobranca indevida|indevid/.test(normalized)) {
    return {
      severity: "medium" as const,
      evidenceLabel: analysis.feesLabel,
      financialImpactLabel: "Eleva o custo efetivo da operação e pode inflar a parcela sem transparência adequada.",
      legalSuggestion: "Questionar a tarifa ou seguro embutido, com pedido de restituição e recálculo."
    };
  }

  if (/capitaliza|juros|taxa|cet/.test(normalized)) {
    return {
      severity: "high" as const,
      evidenceLabel: analysis.rateLabel,
      financialImpactLabel: "Amplia saldo e parcela com efeito composto na trajetória do contrato.",
      legalSuggestion: "Pedir revisão da taxa contratada, afastamento da capitalização abusiva e recálculo do saldo."
    };
  }

  if (/permanencia|multa|encargo/.test(normalized)) {
    return {
      severity: "medium" as const,
      evidenceLabel: analysis.permanenceCommissionLabel,
      financialImpactLabel: "Pode cumular encargos e agravar a mora além do limite defensável.",
      legalSuggestion: "Impugnar a comissão de permanência ou a cumulação irregular com juros e multa."
    };
  }

  if (/refinanci|saldo|evolu/.test(normalized)) {
    return {
      severity: "medium" as const,
      evidenceLabel: analysis.executiveSummary,
      financialImpactLabel: "Pode esconder novação ou alongamento da dívida sem clareza dos encargos acrescidos.",
      legalSuggestion: "Verificar refinanciamento oculto, saldo inconsistente e pedir reabertura da memória de cálculo."
    };
  }

  return {
    severity: "medium" as const,
    evidenceLabel: analysis.suggestedThesis,
    financialImpactLabel: "Indicio útil para reforçar a narrativa revisional e sustentar a discrepancia contratual.",
    legalSuggestion: "Usar o sinal como apoio argumentativo e cruzar com a memoria de cálculo e os documentos base."
  };
}

function buildDetectedAbuseDrafts(params: {
  tenantId: string;
  caseId: string;
  contractId: string;
  analysis: ContractAnalysisRecord;
}): DetectedAbuseRecord[] {
  const seen = new Set<string>();

  return params.analysis.abusivenessSignals
    .map((signal) => signal.trim())
    .filter((signal) => signal.length > 0)
    .filter((signal) => {
      const key = normalizeSignalKey(signal);
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .map((signal) => {
      const signalKey = normalizeSignalKey(signal);
      const classification = classifySignal(signal, params.analysis);

      return {
        id: `abuse-${randomUUID()}`,
        tenantId: params.tenantId,
        caseId: params.caseId,
        contractId: params.contractId,
        contractAnalysisId: params.analysis.id,
        signalKey,
        signalLabel: toSentenceCase(signal),
        description: toSentenceCase(signal),
        severity: classification.severity,
        evidenceLabel: classification.evidenceLabel,
        financialImpactLabel: classification.financialImpactLabel,
        legalSuggestion: classification.legalSuggestion,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
}

function mapDetectedAbuseRow(row: DetectedAbuseRow): DetectedAbuseRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    caseId: row.case_id,
    contractId: row.contract_id,
    contractAnalysisId: row.contract_analysis_id,
    signalKey: row.signal_key,
    signalLabel: row.signal_label,
    description: row.description,
    severity: row.severity,
    evidenceLabel: row.evidence_label,
    financialImpactLabel: row.financial_impact_label,
    legalSuggestion: row.legal_suggestion,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function syncDetectedAbusesForAnalysis(params: {
  analysis: ContractAnalysisRecord;
  caseId: string;
  contractId: string;
}): Promise<DetectedAbuseRecord[]> {
  const session = await getWorkspaceSession();
  const baseDrafts = buildDetectedAbuseDrafts({
    tenantId: session?.workspace.tenant.id ?? "demo-tenant",
    caseId: params.caseId,
    contractId: params.contractId,
    analysis: params.analysis
  });

  if (!session || session.workspace.tenant.slug === "clara-bancaria-demo") {
    return baseDrafts;
  }

  const supabase = getSupabaseAdminClient();
  const { data: existingRows, error: existingError } = await supabase
    .from("detected_abuses")
    .select("id, signal_key")
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("case_id", params.caseId)
    .eq("contract_id", params.contractId);

  if (existingError) {
    console.warn(
      `Failed to inspect detected abuses for case ${params.caseId} and contract ${params.contractId}.`
    );
  }

  const existingBySignalKey = new Map<string, string>();
  (existingRows ?? []).forEach((row) => {
    const abuseRow = row as { id: string; signal_key: string };
    existingBySignalKey.set(abuseRow.signal_key, abuseRow.id);
  });

  const payload = baseDrafts.map((draft) => ({
    id: existingBySignalKey.get(draft.signalKey) ?? draft.id,
    tenant_id: draft.tenantId,
    case_id: draft.caseId,
    contract_id: draft.contractId,
    contract_analysis_id: draft.contractAnalysisId,
    signal_key: draft.signalKey,
    signal_label: draft.signalLabel,
    description: draft.description,
    severity: draft.severity,
    evidence_label: draft.evidenceLabel,
    financial_impact_label: draft.financialImpactLabel,
    legal_suggestion: draft.legalSuggestion
  }));

  const { error: upsertError } = await supabase
    .from("detected_abuses")
    .upsert(payload, { onConflict: "tenant_id,case_id,contract_id,signal_key" });

  if (upsertError) {
    console.warn(
      `Failed to persist detected abuses for case ${params.caseId} and contract ${params.contractId}: ${upsertError.message}`
    );
    return baseDrafts;
  }

  const { data, error } = await supabase
    .from("detected_abuses")
    .select(
      "id, tenant_id, case_id, contract_id, contract_analysis_id, signal_key, signal_label, description, severity, evidence_label, financial_impact_label, legal_suggestion, created_at, updated_at"
    )
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("case_id", params.caseId)
    .eq("contract_id", params.contractId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn(
      `Failed to reload detected abuses for case ${params.caseId} and contract ${params.contractId}.`
    );
    return baseDrafts;
  }

  return (data ?? []).map((row) => mapDetectedAbuseRow(row as DetectedAbuseRow));
}

export { SEVERITY_LABELS };
