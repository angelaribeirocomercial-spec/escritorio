import { ClientRecord } from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";

export type CrmConversionRecord = {
  id: string;
  clientId: string;
  clientName: string;
  caseId: string | null;
  sourceLabel: string;
  stageLabel: string;
  summary: string;
  nextAction: string;
};

type ClientRow = {
  id: string;
  full_name: string;
  document_id: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  lead_source: string;
  bank_name: string;
  service_status: ClientRecord["serviceStatus"];
  signed_contract: boolean;
  legal_viability_score: number;
  fees_label: string;
  documents_sent: number;
  notes: string;
  ia_context: string;
  linked_cases: ClientRecord["linkedCases"] | null;
  linked_documents: string[] | null;
  timeline: string[] | null;
};

type CaseRow = {
  id: string;
  client_id: string;
  title: string;
  bank_name: string;
  process_number: string;
  contract_number: string;
  claim_type: string;
  stage: string;
  status: string;
  amount_in_dispute: number;
  estimated_value: number;
  main_thesis: string;
  legal_risk: string;
  suggested_strategy: string;
  owner_label: string;
  niche: string;
  linked_documents: string[] | null;
  linked_tasks: string[] | null;
  linked_deadlines: string[] | null;
  lexia_insights: string[] | null;
  workflow_state: unknown | null;
  checklist_state: unknown | null;
};

type CrmLeadRow = {
  id: string;
  tenant_id: string;
  client_id: string | null;
  case_id: string | null;
  full_name: string;
  bank_name: string;
  source_channel: string;
  pipeline_stage: string;
  stage_label: string;
  risk_label: string;
  next_action: string;
  summary: string;
  status: "active" | "converted" | "lost";
  client: ClientRow | ClientRow[] | null;
  banking_case: CaseRow | CaseRow[] | null;
}

function mapClientRow(row: ClientRow): ClientRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    documentId: row.document_id,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    address: row.address,
    leadSource: row.lead_source,
    bankName: row.bank_name,
    serviceStatus: row.service_status,
    signedContract: row.signed_contract,
    legalViabilityScore: row.legal_viability_score,
    feesLabel: row.fees_label,
    documentsSent: row.documents_sent,
    notes: row.notes,
    iaContext: row.ia_context,
    linkedCases: row.linked_cases ?? [],
    linkedDocuments: row.linked_documents ?? [],
    timeline: row.timeline ?? []
  };
}

function mapCaseRow(row: CaseRow) {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    bankName: row.bank_name,
    processNumber: row.process_number,
    contractNumber: row.contract_number,
    claimType: row.claim_type,
    stage: row.stage,
    status: row.status,
    amountInDispute: row.amount_in_dispute,
    estimatedValue: row.estimated_value,
    mainThesis: row.main_thesis,
    legalRisk: row.legal_risk,
    suggestedStrategy: row.suggested_strategy,
    ownerLabel: row.owner_label,
    niche: row.niche,
    linkedDocuments: row.linked_documents ?? [],
    linkedTasks: row.linked_tasks ?? [],
    linkedDeadlines: row.linked_deadlines ?? [],
    lexiaInsights: row.lexia_insights ?? [],
    workflowState:
      row.workflow_state ?? {
        phaseLabel: row.stage,
        nextStep: row.suggested_strategy,
        completionLabel: "0/0 documentos-base no caso",
        currentStepId: "cadastro",
        steps: []
      },
    checklistState:
      row.checklist_state ?? {
        completionLabel: "0/0 documentos-base no caso",
        requiredDocuments: [],
        missingDocuments: [],
        items: []
      }
  };
}

function getPipelineLabel(client: ClientRecord, caseCount: number) {
  const serviceStatus = client.serviceStatus.toLowerCase();

  if (client.signedContract || serviceStatus.includes("signed")) {
    return "Contrato fechado";
  }

  if (serviceStatus.includes("proposal") || serviceStatus.includes("proposta")) {
    return "Proposta enviada";
  }

  if (serviceStatus.includes("talk") || serviceStatus.includes("contato") || caseCount > 0) {
    return "Em conversa";
  }

  return "Novo lead";
}

function getNextAction(client: ClientRecord, caseCount: number) {
  if (client.signedContract) {
    return "Levar o cliente ao cockpit do caso e vincular o fluxo operacional.";
  }

  if (caseCount > 0) {
    return "Revisar caso vinculado e avançar o follow-up para conversao.";
  }

  return "Registrar proposta, definir follow-up e abrir o caso quando houver autorizacao.";
}

function getRiskLabel(client: ClientRecord) {
  if (client.legalViabilityScore >= 80) {
    return "Baixo";
  }

  if (client.legalViabilityScore >= 60) {
    return "Moderado";
  }

  return "Alto";
}

function mapDerivedConversion(client: ClientRecord, caseId: string | null): CrmConversionRecord {
  const hasContract = client.signedContract || client.serviceStatus.toLowerCase().includes("signed");

  return {
    id: `${client.id}-${caseId ?? "conversion"}`,
    clientId: client.id,
    clientName: client.fullName,
    caseId,
    sourceLabel: client.leadSource || "Canal nao informado",
    stageLabel: caseId ? "Cliente convertido em caso" : hasContract ? "Contrato fechado" : "Lead em conversao",
    summary: caseId
      ? `O lead virou cliente e caso no fluxo do escritorio.`
      : hasContract
        ? "O lead assinou o contrato e aguarda abertura do caso."
        : "O lead ainda precisa de classificacao, proposta e follow-up para conversao.",
    nextAction: caseId
      ? "Manter acompanhamento juridico e registrar os proximos atos do caso."
      : hasContract
        ? "Abrir o novo atendimento bancario e formalizar o caso."
        : "Registrar origem, classificar o lead e acionar o chatbot de intake quando disponivel."
  };
}

async function getConversionsFromSupabase(): Promise<CrmConversionRecord[] | null> {
  const session = await getWorkspaceSession();

  if (!session) {
    return null;
  }

  let supabase;

  try {
    supabase = getSupabaseAdminClient();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("crm_leads")
    .select(
      `
        id,
        tenant_id,
        client_id,
        case_id,
        full_name,
        bank_name,
        source_channel,
        pipeline_stage,
        stage_label,
        risk_label,
        next_action,
        summary,
        status,
        client:clients (
          id,
          full_name,
          document_id,
          email,
          phone,
          whatsapp,
          address,
          lead_source,
          bank_name,
          service_status,
          signed_contract,
          legal_viability_score,
          fees_label,
          documents_sent,
          notes,
          ia_context,
          linked_cases,
          linked_documents,
          timeline
        ),
        banking_case:cases (
          id,
          client_id,
          title,
          bank_name,
          process_number,
          contract_number,
          claim_type,
          stage,
          status,
          amount_in_dispute,
          estimated_value,
          main_thesis,
          legal_risk,
          suggested_strategy,
          owner_label,
          niche,
          linked_documents,
          linked_tasks,
          linked_deadlines,
          lexia_insights,
          workflow_state,
          checklist_state
        )
      `
    )
    .eq("tenant_id", session.workspace.tenant.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn(`Failed to load CRM conversions for tenant ${session.workspace.tenant.id}: ${error.message}`);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const rows = data as CrmLeadRow[];
  const conversions: CrmConversionRecord[] = [];

  for (const row of rows) {
      const clientRow = Array.isArray(row.client) ? row.client[0] : row.client;
      const caseRow = Array.isArray(row.banking_case) ? row.banking_case[0] : row.banking_case;

      if (!clientRow) {
        continue;
      }

      const client = mapClientRow(clientRow);
      const caseId = row.case_id ?? caseRow?.id ?? client.linkedCases[0]?.id ?? null;

      conversions.push({
        id: row.id,
        clientId: client.id,
        clientName: client.fullName,
        caseId,
        sourceLabel: client.leadSource || row.source_channel || "Canal nao informado",
        stageLabel:
          row.stage_label ||
          (caseId ? "Cliente convertido em caso" : client.signedContract ? "Contrato fechado" : "Lead em conversao"),
        summary:
          row.summary ||
          (caseId
            ? `O lead virou cliente e caso no fluxo do escritorio.`
            : client.signedContract
              ? "O lead assinou o contrato e aguarda abertura do caso."
              : "O lead ainda precisa de classificacao, proposta e follow-up para conversao."),
        nextAction:
          row.next_action ||
          (caseId
            ? "Manter acompanhamento juridico e registrar os proximos atos do caso."
            : client.signedContract
              ? "Abrir o novo atendimento bancario e formalizar o caso."
              : "Registrar origem, classificar o lead e acionar o chatbot de intake quando disponivel.")
      } satisfies CrmConversionRecord);
  }

  return conversions;
}

export async function getCrmConversions(): Promise<CrmConversionRecord[]> {
  const storedConversions = await getConversionsFromSupabase();

  if (storedConversions) {
    return storedConversions;
  }

  try {
    const [clients, cases] = await Promise.all([getClients(), getCases()]);

    return clients.map((client) => {
      const clientCase = cases.find((bankingCase) => bankingCase.clientId === client.id) ?? null;
      const hasContract = client.signedContract || client.serviceStatus.toLowerCase().includes("signed");

      return mapDerivedConversion(client, clientCase?.id ?? null);
    });
  } catch (error) {
    console.warn(
      error instanceof Error
        ? `Failed to derive CRM conversions from workspace data: ${error.message}`
        : "Failed to derive CRM conversions from workspace data."
    );
    return [];
  }
}
