import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";

export type CrmPipelineStage = {
  id: string;
  label: string;
  count: number;
  summary: string;
};

export type CrmFollowUpRecord = {
  id: string;
  clientId: string;
  clientName: string;
  caseId: string | null;
  title: string;
  detail: string;
  priority: "low" | "medium" | "high";
  nextAction: string;
};

type CrmPipelineStageRow = {
  id: string;
  tenant_id: string;
  name: string;
  order_index: number;
  description: string;
  status: "active" | "archived";
};

type ClientRow = {
  id: string;
  full_name: string;
  document_id: string | null;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  address: string;
  lead_source: string | null;
  bank_name: string | null;
  service_status: string;
  signed_contract: boolean;
  legal_viability_score: number;
  fees_label: string | null;
  documents_sent: number;
  notes: string;
  ia_context: string;
  linked_cases: Array<{ id: string; title: string }> | null;
  linked_documents: string[] | null;
  timeline: string[] | null;
};

type CaseRow = {
  id: string;
  client_id: string;
  title: string;
  bank_name: string | null;
  process_number: string;
  contract_number: string | null;
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
  created_at: string;
  updated_at: string;
  client: ClientRow | ClientRow[] | null;
};

type CrmLeadRelationRow = {
  id: string;
  full_name: string;
  pipeline_stage: string;
  stage_label: string;
  next_action: string;
  client: ClientRow | ClientRow[] | null;
  banking_case: CaseRow | CaseRow[] | null;
};

type CrmFollowUpRow = {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  note: string;
  due_date: string | null;
  status: "open" | "done" | "canceled";
  created_at: string;
  updated_at: string;
  lead: CrmLeadRelationRow | CrmLeadRelationRow[] | null;
};

function getStageBucket(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("contract")) {
    return "contracts";
  }

  if (normalized.includes("proposal") || normalized.includes("pipeline")) {
    return "proposal";
  }

  if (normalized.includes("follow")) {
    return "followup";
  }

  if (normalized.includes("lead")) {
    return "lead";
  }

  return normalized;
}

function getStageLabel(stageId: string) {
  switch (stageId) {
    case "contracts":
      return "Contratos";
    case "proposal":
      return "Pipeline";
    case "followup":
      return "Follow-ups";
    default:
      return "Leads";
  }
}

function getStageSummary(stageId: string) {
  switch (stageId) {
    case "contracts":
      return "Clientes com contrato fechado e prontos para transicao ao fluxo juridico.";
    case "proposal":
      return "Clientes com proposta ou tratativa avancada.";
    case "followup":
      return "Clientes que exigem retorno e validacao para avancar.";
    default:
      return "Leads em entrada inicial ou triagem.";
  }
}

function getStageId(serviceStatus: string, hasCases: boolean) {
  const normalized = serviceStatus.toLowerCase();

  if (normalized.includes("signed") || normalized.includes("contrat")) {
    return "contracts";
  }

  if (normalized.includes("proposal") || normalized.includes("proposta")) {
    return "proposal";
  }

  if (normalized.includes("talk") || normalized.includes("contato") || hasCases) {
    return "followup";
  }

  return "lead";
}

function getFollowUpPriority(serviceStatus: string, caseCount: number): "low" | "medium" | "high" {
  const normalized = serviceStatus.toLowerCase();

  if (normalized.includes("signed") || caseCount > 0) {
    return "high";
  }

  if (normalized.includes("proposal") || normalized.includes("proposta")) {
    return "medium";
  }

  return "low";
}

function mapClientRow(row: ClientRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    bankName: row.bank_name ?? "",
    serviceStatus: row.service_status,
    signedContract: row.signed_contract,
    legalViabilityScore: row.legal_viability_score,
    linkedCases: row.linked_cases ?? [],
    timeline: row.timeline ?? []
  };
}

function mapCaseRow(row: CaseRow) {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    bankName: row.bank_name ?? "",
    suggestedStrategy: row.suggested_strategy,
    ownerLabel: row.owner_label
  };
}

function firstItem<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function getDerivedStageCountMap() {
  return new Map<string, number>([
    ["contracts", 0],
    ["proposal", 0],
    ["followup", 0],
    ["lead", 0]
  ]);
}

function getPriorityOrder(priority: "high" | "medium" | "low") {
  const priorityOrder = { high: 3, medium: 2, low: 1 } as const;
  return priorityOrder[priority];
}

function derivePipelineFromLeads() {
  return Promise.all([getClients(), getCases()])
    .then(([clients, cases]) => {
    const stagesMap = new Map<string, CrmPipelineStage>();
    const followUps: CrmFollowUpRecord[] = [];

    for (const client of clients) {
      const clientCases = cases.filter((bankingCase) => bankingCase.clientId === client.id);
      const stageId = getStageId(client.serviceStatus, clientCases.length > 0);
      const existingStage = stagesMap.get(stageId);

      stagesMap.set(stageId, {
        id: stageId,
        label: getStageLabel(stageId),
        count: (existingStage?.count ?? 0) + 1,
        summary: getStageSummary(stageId)
      });

      const latestTimeline = client.timeline[0] ?? "Aguardando registro de follow-up";
      followUps.push({
        id: `${client.id}-${clientCases[0]?.id ?? "lead"}`,
        clientId: client.id,
        clientName: client.fullName,
        caseId: clientCases[0]?.id ?? null,
        title: client.signedContract ? "Acompanhar contrato fechado" : "Retomar contato comercial",
        detail: latestTimeline,
        priority: getFollowUpPriority(client.serviceStatus, clientCases.length),
        nextAction: client.signedContract
          ? "Validar se o caso ja entrou no fluxo juridico."
          : clientCases.length > 0
            ? "Agendar retorno para avancar o lead para conversao."
            : "Registrar novo contato e revisar proposta."
      });
    }

    const stages = Array.from(stagesMap.values());

    return {
      stages,
      followUps: followUps.sort(
        (left, right) => getPriorityOrder(right.priority) - getPriorityOrder(left.priority)
      ),
      totals: {
        clients: clients.length,
        cases: cases.length,
        stages: stages.length,
        followUps: followUps.length
      }
    };
    })
    .catch((error) => {
      console.warn(
        error instanceof Error
          ? `Failed to derive CRM pipeline from workspace data: ${error.message}`
          : "Failed to derive CRM pipeline from workspace data."
      );

      return {
        stages: [],
        followUps: [],
        totals: {
          clients: 0,
          cases: 0,
          stages: 0,
          followUps: 0
        }
      };
    });
}

async function loadPipelineFromSupabase() {
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

  const [stagesResult, followUpsResult, leadsResult] = await Promise.all([
    supabase
      .from("crm_pipeline_stages")
      .select("id, tenant_id, name, order_index, description, status")
      .eq("tenant_id", session.workspace.tenant.id)
      .order("order_index", { ascending: true }),
    supabase
      .from("crm_followups")
      .select(
        `
          id,
          tenant_id,
          lead_id,
          note,
          due_date,
          status,
          created_at,
          updated_at,
          lead:crm_leads (
            id,
            full_name,
            pipeline_stage,
            stage_label,
            next_action,
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
          )
        `
      )
      .eq("tenant_id", session.workspace.tenant.id)
      .order("created_at", { ascending: false }),
    supabase
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
          created_at,
          updated_at,
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
          )
        `
      )
      .eq("tenant_id", session.workspace.tenant.id)
      .order("updated_at", { ascending: false })
  ]);

  if (stagesResult.error || followUpsResult.error || leadsResult.error) {
    return null;
  }

  const leadRows = (leadsResult.data ?? []) as CrmLeadRow[];

  if (leadRows.length === 0 && (stagesResult.data ?? []).length === 0 && (followUpsResult.data ?? []).length === 0) {
    return null;
  }

  const leadStageCountMap = getDerivedStageCountMap();
  for (const lead of leadRows) {
    const clientRow = firstItem(lead.client);

    if (!clientRow) {
      continue;
    }

    const derivedStageId = getStageId(clientRow.service_status, (clientRow.linked_cases ?? []).length > 0);
    const bucket = getStageBucket(lead.pipeline_stage || lead.stage_label || derivedStageId);
    leadStageCountMap.set(bucket, (leadStageCountMap.get(bucket) ?? 0) + 1);
  }

  const stages =
    (stagesResult.data ?? []).length > 0
      ? (stagesResult.data as CrmPipelineStageRow[]).map((stage) => {
          const bucket = getStageBucket(stage.id || stage.name);
          const count =
            leadStageCountMap.get(bucket) ??
            leadStageCountMap.get(getStageBucket(stage.name)) ??
            0;

          return {
            id: stage.id,
            label: stage.name,
            count,
            summary: stage.description || getStageSummary(bucket)
          };
        })
      : Array.from(leadStageCountMap.entries())
          .filter(([, count]) => count > 0)
          .map(([stageId, count]) => ({
            id: stageId,
            label: getStageLabel(stageId),
            count,
            summary: getStageSummary(stageId)
          }));

  const followUps =
    (followUpsResult.data ?? []).length > 0
      ? (followUpsResult.data as CrmFollowUpRow[])
          .map((row) => {
            const lead = firstItem(row.lead);
            const leadClient = firstItem(lead?.client);
            const leadCase = firstItem(lead?.banking_case);

            if (!lead || !leadClient) {
              return null;
            }

            const client = mapClientRow(leadClient);
            const caseId = leadCase
              ? leadCase.id
              : firstItem(leadClient.linked_cases)?.id ?? null;

            return {
              id: row.id,
              clientId: client.id,
              clientName: client.fullName,
              caseId,
              title: row.note || (client.signedContract ? "Acompanhar contrato fechado" : "Retomar contato comercial"),
              detail: row.due_date ?? client.timeline[0] ?? "Aguardando registro de follow-up",
              priority:
                row.status === "done"
                  ? "low"
                  : client.signedContract || (client.linkedCases?.length ?? 0) > 0
                    ? "high"
                    : "medium",
              nextAction: lead.next_action || "Revisar o follow-up mais recente e alinhar o próximo contato."
            } satisfies CrmFollowUpRecord;
          })
          .filter((item): item is CrmFollowUpRecord => item !== null)
      : [];

  const derivedLeadCount = leadRows.length;
  const derivedCaseCount = leadRows.reduce((sum, lead) => {
    const clientRow = Array.isArray(lead.client) ? lead.client[0] : lead.client;
    return sum + (clientRow?.linked_cases?.length ?? 0);
  }, 0);

  return {
    stages,
    followUps: followUps.sort((left, right) => getPriorityOrder(right.priority) - getPriorityOrder(left.priority)),
    totals: {
      clients: derivedLeadCount,
      cases: derivedCaseCount,
      stages: stages.length,
      followUps: followUps.length
    }
  };
}

export async function getCrmPipeline() {
  const pipeline = await loadPipelineFromSupabase();

  if (pipeline) {
    return pipeline;
  }

  return derivePipelineFromLeads();
}
