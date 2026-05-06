import { BankingCaseRecord, ClientRecord } from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  DEMO_CASE_RECORD,
  DEMO_CLIENT_ID,
  DEMO_CASE_ID
} from "@/server/services/demo/demo-workspace-data";

type BankingCaseWithClient = BankingCaseRecord & {
  client: ClientRecord;
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
  status: BankingCaseRecord["status"];
  amount_in_dispute: number;
  estimated_value: number;
  main_thesis: string;
  legal_risk: BankingCaseRecord["legalRisk"];
  suggested_strategy: string;
  owner_label: string;
  niche: BankingCaseRecord["niche"];
  linked_documents: string[] | null;
  linked_tasks: string[] | null;
  linked_deadlines: string[] | null;
  lexia_insights: string[] | null;
  workflow_state: BankingCaseRecord["workflowState"] | null;
  checklist_state: BankingCaseRecord["checklistState"] | null;
  client: ClientRow | ClientRow[] | null;
};

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

function mapCaseRow(row: CaseRow): BankingCaseWithClient | null {
  const clientRow = Array.isArray(row.client) ? row.client[0] : row.client;

  if (!clientRow) {
    return null;
  }

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
    workflowState: row.workflow_state ?? {
      phaseLabel: row.stage,
      nextStep: row.suggested_strategy,
      completionLabel: "0/0 documentos-base no caso",
      currentStepId: "cadastro",
      steps: []
    },
    checklistState: row.checklist_state ?? {
      completionLabel: "0/0 documentos-base no caso",
      requiredDocuments: [],
      missingDocuments: [],
      items: []
    },
    client: mapClientRow(clientRow)
  };
}

const CASE_SELECT = `
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
  checklist_state,
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
`;

export async function getCases(filters?: {
  clientId?: string;
  caseId?: string;
}): Promise<BankingCaseWithClient[]> {
  const session = await getWorkspaceSession();

  if (!session) {
    return [];
  }

  if (
    session.workspace.tenant.slug === "clara-bancaria-demo" ||
    process.env.NEXT_PUBLIC_SUPABASE_URL == null ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY == null
  ) {
    const matchesClient = !filters?.clientId || filters.clientId === DEMO_CLIENT_ID;
    const matchesCase = !filters?.caseId || filters.caseId === DEMO_CASE_ID;

    return matchesClient && matchesCase ? [DEMO_CASE_RECORD] : [];
  }

  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("cases")
    .select(CASE_SELECT)
    .eq("tenant_id", session.workspace.tenant.id);

  if (filters?.clientId) {
    query = query.eq("client_id", filters.clientId);
  }

  if (filters?.caseId) {
    query = query.eq("id", filters.caseId);
  }

  const { data, error } = await query.order("process_number", { ascending: true });

  if (error) {
    console.warn(`Failed to load cases for tenant ${session.workspace.tenant.id}.`);
    return [];
  }

  return (data ?? [])
    .map((row) => mapCaseRow(row as CaseRow))
    .filter((row): row is BankingCaseWithClient => row !== null);
}

export async function getCaseById(caseId: string): Promise<BankingCaseWithClient | null> {
  const session = await getWorkspaceSession();

  if (
    session &&
    (session.workspace.tenant.slug === "clara-bancaria-demo" ||
      process.env.NEXT_PUBLIC_SUPABASE_URL == null ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY == null) &&
    caseId === DEMO_CASE_ID
  ) {
    return DEMO_CASE_RECORD;
  }

  const [bankingCase] = await getCases({ caseId });

  return bankingCase ?? null;
}
