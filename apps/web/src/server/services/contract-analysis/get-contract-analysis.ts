import { ContractAnalysisRecord } from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getBankingRevisionalCalculation } from "@/server/services/clara/get-banking-revisional-calculation";
import { getCaseById, getCases } from "@/server/services/cases/get-cases";
import { getClientById, getClients } from "@/server/services/clients/get-clients";
import { getDocumentById, getDocuments } from "@/server/services/documents/get-documents";

type ContractAnalysisRow = {
  id: string;
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
};

function mapContractAnalysisRow(row: ContractAnalysisRow): ContractAnalysisRecord {
  return {
    id: row.id,
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
    executiveSummary: row.executive_summary
  };
}

const CONTRACT_ANALYSIS_SELECT = `
  id,
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
  executive_summary
`;

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
    ["Contrato bancario", "CCB"].includes(document.documentType)
  );

  if (!contractDocuments.length) {
    throw new Error("No contract documents are available for the contract analysis workspace.");
  }

  const selectedDocument =
    (documentId ? await getDocumentById(documentId) : null) ??
    contractDocuments.find((document) => document.id === documentId) ??
    contractDocuments[0];

  const analysis = await getContractAnalysisByDocumentId(selectedDocument.id);
  const client =
    selectedDocument.client ??
    (await getClientById(selectedDocument.clientId)) ??
    (await getClients())[0];
  const bankingCase =
    selectedDocument.bankingCase ??
    (await getCaseById(selectedDocument.caseId)) ??
    (await getCases())[0];

  if (!analysis || !client || !bankingCase) {
    throw new Error("Contract analysis workspace is missing linked context data.");
  }

  const scenarioProfile = getScenarioProfile({
    bankName: bankingCase.bankName,
    documentType: selectedDocument.documentType
  });

  return {
    contractDocuments: contractDocuments.map((document) => ({
      id: document.id,
      label: document.fileName,
      documentType: document.documentType
    })),
    selectedDocument,
    analysis,
    client,
    bankingCase,
    scenarioProfile,
    calculationMemory: getBankingRevisionalCalculation(
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
    ),
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
    revisionalRequests: [
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
    ]
  };
}

export async function getContractAnalyses(): Promise<ContractAnalysisRecord[]> {
  const session = await getWorkspaceSession();

  if (!session) {
    throw new Error("Workspace session is required to load contract analyses.");
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("contract_analyses")
    .select(CONTRACT_ANALYSIS_SELECT)
    .eq("tenant_id", session.workspace.tenant.id)
    .order("document_id", { ascending: true });

  if (error) {
    throw new Error(`Failed to load contract analyses for tenant ${session.workspace.tenant.id}.`);
  }

  return (data ?? []).map((row) => mapContractAnalysisRow(row as ContractAnalysisRow));
}

export async function getContractAnalysisByDocumentId(
  documentId: string
): Promise<ContractAnalysisRecord | null> {
  const session = await getWorkspaceSession();

  if (!session) {
    throw new Error("Workspace session is required to load contract analysis details.");
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("contract_analyses")
    .select(CONTRACT_ANALYSIS_SELECT)
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("document_id", documentId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load contract analysis for document ${documentId} and tenant ${session.workspace.tenant.id}.`
    );
  }

  return data ? mapContractAnalysisRow(data as ContractAnalysisRow) : null;
}
