import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";

export type CrmContractRecord = {
  id: string;
  clientId: string;
  clientName: string;
  caseId: string | null;
  contractNumber: string;
  bankName: string;
  statusLabel: string;
  detail: string;
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
  service_status: string;
  signed_contract: boolean;
  legal_viability_score: number;
  fees_label: string;
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

type CrmContractRow = {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  title: string;
  status: "draft" | "review" | "signed" | "archived";
  signed_at: string | null;
  source_label: string;
  summary: string;
  client: ClientRow | ClientRow[] | null;
  lead:
    | {
        id: string;
        full_name: string;
        client: ClientRow | ClientRow[] | null;
        banking_case: CaseRow | CaseRow[] | null;
      }
    | {
        id: string;
        full_name: string;
        client: ClientRow | ClientRow[] | null;
        banking_case: CaseRow | CaseRow[] | null;
      }[]
    | null;
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
    bankName: row.bank_name,
    serviceStatus: row.service_status,
    signedContract: row.signed_contract,
    linkedCases: row.linked_cases ?? [],
    timeline: row.timeline ?? []
  };
}

function mapCaseRow(row: CaseRow) {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    bankName: row.bank_name,
    contractNumber: row.contract_number
  };
}

function mapDerivedContract(client: ReturnType<typeof mapClientRow>, caseId: string | null, contractNumber: string) {
  const hasContract = client.signedContract || client.serviceStatus.toLowerCase().includes("signed");

  return {
    id: `${client.id}-${caseId ?? "contract"}`,
    clientId: client.id,
    clientName: client.fullName,
    caseId,
    contractNumber: contractNumber || "Contrato pendente de vinculo",
    bankName: client.bankName,
    statusLabel: hasContract ? "Contrato assinado" : "Contrato em validacao",
    detail: caseId
      ? `Contrato vinculado ao caso ${caseId} e ao banco ${client.bankName}.`
      : `Contrato fechado com ${client.bankName}, aguardando vinculacao completa ao caso.`,
    nextAction: caseId
      ? "Conferir se a transicao para o fluxo juridico ja ocorreu."
      : "Vincular o contrato ao caso e registrar a entrada juridica."
  };
}

async function getContractsFromSupabase(): Promise<CrmContractRecord[] | null> {
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
    .from("crm_contratos")
    .select(
      `
        id,
        tenant_id,
        lead_id,
        title,
        status,
        signed_at,
        source_label,
        summary,
        lead:crm_leads (
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
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(`Failed to load CRM contracts for tenant ${session.workspace.tenant.id}: ${error.message}`);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const rows = data as CrmContractRow[];

  const contracts: CrmContractRecord[] = [];

  for (const row of rows) {
      const lead = firstItem(row.lead);
      const leadClient = firstItem(lead?.client);
      const leadCase = firstItem(lead?.banking_case);
      const clientRow = firstItem(row.client) ?? leadClient;

      if (!clientRow) {
        continue;
      }

      const client = mapClientRow(clientRow);
      const caseId = leadCase?.id ?? client.linkedCases[0]?.id ?? null;
      const contractNumber = leadCase?.contract_number ?? "Contrato pendente de vinculo";

      contracts.push({
        id: row.id,
        clientId: client.id,
        clientName: client.fullName,
        caseId,
        contractNumber,
        bankName: client.bankName,
        statusLabel:
          row.status === "signed" || client.signedContract
            ? "Contrato assinado"
            : row.status === "review"
              ? "Contrato em validacao"
              : "Contrato em rascunho",
        detail:
          row.summary ||
          (caseId
            ? `Contrato vinculado ao caso ${caseId} e ao banco ${client.bankName}.`
            : `Contrato fechado com ${client.bankName}, aguardando vinculacao completa ao caso.`),
        nextAction:
          row.status === "signed" || client.signedContract
            ? caseId
              ? "Conferir se a transicao para o fluxo juridico ja ocorreu."
              : "Vincular o contrato ao caso e registrar a entrada juridica."
            : "Revisar clausulas e validar a assinatura com o escritorio."
      } satisfies CrmContractRecord);
  }

  return contracts;
}

export async function getCrmContracts(): Promise<CrmContractRecord[]> {
  const storedContracts = await getContractsFromSupabase();

  if (storedContracts) {
    return storedContracts;
  }

  try {
    const [clients, cases] = await Promise.all([getClients(), getCases()]);

    return clients
      .filter((client) => client.signedContract || client.serviceStatus.toLowerCase().includes("signed"))
      .map((client) => {
        const clientCase = cases.find((bankingCase) => bankingCase.clientId === client.id) ?? null;

        return {
          id: `${client.id}-${clientCase?.id ?? "contract"}`,
          clientId: client.id,
          clientName: client.fullName,
          caseId: clientCase?.id ?? null,
          contractNumber: clientCase?.contractNumber ?? "Contrato pendente de vinculo",
          bankName: client.bankName,
          statusLabel: client.signedContract ? "Contrato assinado" : "Contrato em validacao",
          detail: clientCase
            ? `Contrato vinculado ao caso ${clientCase.title} e ao banco ${client.bankName}.`
            : `Contrato fechado com ${client.bankName}, aguardando vinculacao completa ao caso.`,
          nextAction: clientCase
            ? "Conferir se a transicao para o fluxo juridico ja ocorreu."
            : "Vincular o contrato ao caso e registrar a entrada juridica."
        };
      });
  } catch (error) {
    console.warn(
      error instanceof Error
        ? `Failed to derive CRM contracts from workspace data: ${error.message}`
        : "Failed to derive CRM contracts from workspace data."
    );
    return [];
  }
}
