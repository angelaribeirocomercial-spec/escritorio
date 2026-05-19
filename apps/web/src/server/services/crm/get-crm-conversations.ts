import { ClientRecord } from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";

export type CrmConversationRecord = {
  id: string;
  clientId: string;
  clientName: string;
  caseId: string | null;
  lastMessage: string;
  summary: string;
  statusLabel: string;
  nextAction: string;
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
  service_status: ClientRecord["serviceStatus"];
  signed_contract: boolean;
  legal_viability_score: number;
  fees_label: string | null;
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

type CrmLeadRelationRow = {
  id: string;
  full_name: string;
  client: ClientRow | ClientRow[] | null;
  banking_case: CaseRow | CaseRow[] | null;
};

type CrmLeadRow = {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  channel: string;
  summary: string;
  last_message_at: string | null;
  status: "open" | "closed";
  client: CrmLeadRelationRow | CrmLeadRelationRow[] | null;
};

function firstItem<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function mapClientRow(row: ClientRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    bankName: row.bank_name ?? "",
    serviceStatus: row.service_status,
    signedContract: row.signed_contract,
    timeline: row.timeline ?? [],
    linkedCases: row.linked_cases ?? []
  };
}

function mapCaseRow(row: CaseRow) {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    bankName: row.bank_name ?? ""
  };
}

function mapDerivedConversation(client: ReturnType<typeof mapClientRow>, caseId: string | null): CrmConversationRecord {
  const latestTimeline = client.timeline[0] ?? "Sem conversa recente registrada.";
  const hasCase = caseId !== null;

  return {
    id: `${client.id}-${caseId ?? "conversation"}`,
    clientId: client.id,
    clientName: client.fullName,
    caseId,
    lastMessage: latestTimeline,
    summary: hasCase
      ? `Conversa conectada ao caso ${caseId}.`
      : "Conversa comercial ainda antes da conversao juridica.",
    statusLabel: hasCase ? "Conversa juridica" : client.signedContract ? "Contrato fechado" : "Em conversa",
    nextAction: hasCase
      ? "Reforcar alinhamento documental e proximos passos do caso."
      : client.signedContract
        ? "Abrir o caso juridico e consolidar o contrato."
        : "Registrar novo contato e manter o follow-up ativo."
  };
}

async function getConversationsFromSupabase(): Promise<CrmConversationRecord[] | null> {
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
    .from("crm_conversas")
    .select(
      `
        id,
        tenant_id,
        lead_id,
        channel,
        summary,
        last_message_at,
        status,
        client:crm_leads!crm_conversas_lead_id_fkey (
          id,
          full_name,
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
    .order("last_message_at", { ascending: false });

  if (error) {
    console.warn(`Failed to load CRM conversations for tenant ${session.workspace.tenant.id}: ${error.message}`);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const rows = data as CrmLeadRow[];

  const conversations: CrmConversationRecord[] = [];

  for (const row of rows) {
      const lead = firstItem(row.client);
      const leadClient = firstItem(lead?.client);
      const leadCase = firstItem(lead?.banking_case);

      if (!leadClient) {
        continue;
      }

      const client = mapClientRow(leadClient);
      const caseId = leadCase?.id ?? client.linkedCases[0]?.id ?? null;
      const lastMessage = row.summary || client.timeline[0] || "Sem conversa recente registrada.";

      conversations.push({
        id: row.id,
        clientId: client.id,
        clientName: client.fullName,
        caseId,
        lastMessage,
        summary:
          row.summary ||
          (caseId
            ? `Conversa conectada ao caso ${caseId}.`
            : "Conversa comercial ainda antes da conversao juridica."),
        statusLabel:
          row.status === "closed" || caseId
            ? "Conversa juridica"
            : client.signedContract
              ? "Contrato fechado"
              : "Em conversa",
        nextAction:
          row.status === "closed" || caseId
            ? "Reforcar alinhamento documental e proximos passos do caso."
            : client.signedContract
              ? "Abrir o caso juridico e consolidar o contrato."
              : "Registrar novo contato e manter o follow-up ativo."
      } satisfies CrmConversationRecord);
  }

  return conversations;
}

export async function getCrmConversations(): Promise<CrmConversationRecord[]> {
  const storedConversations = await getConversationsFromSupabase();

  if (storedConversations) {
    return storedConversations;
  }

  try {
    const [clients, cases] = await Promise.all([getClients(), getCases()]);

    return clients.map((client) => {
      const clientCase = cases.find((bankingCase) => bankingCase.clientId === client.id) ?? null;
      const latestTimeline = client.timeline[0] ?? "Sem conversa recente registrada.";
      const hasCase = clientCase !== null;

      return {
        id: `${client.id}-${clientCase?.id ?? "conversation"}`,
        clientId: client.id,
        clientName: client.fullName,
        caseId: clientCase?.id ?? null,
        lastMessage: latestTimeline,
        summary: hasCase
          ? `Conversa conectada ao caso ${clientCase.title}.`
          : "Conversa comercial ainda antes da conversao juridica.",
        statusLabel: hasCase ? "Conversa juridica" : client.signedContract ? "Contrato fechado" : "Em conversa",
        nextAction: hasCase
          ? "Reforcar alinhamento documental e proximos passos do caso."
          : client.signedContract
            ? "Abrir o caso juridico e consolidar o contrato."
            : "Registrar novo contato e manter o follow-up ativo."
      };
    });
  } catch (error) {
    console.warn(
      error instanceof Error
        ? `Failed to derive CRM conversations from workspace data: ${error.message}`
        : "Failed to derive CRM conversations from workspace data."
    );
    return [];
  }
}
