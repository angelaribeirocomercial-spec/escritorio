import {
  BankingCaseRecord,
  ClientLinkedCaseSummary,
  ClientRecord,
  JudicialProcessRecord,
  JudicialTimelineItem
} from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  DEMO_CASE_RECORD,
  DEMO_CLIENT_RECORD,
  DEMO_PROCESS_RECORD
} from "@/server/services/demo/demo-workspace-data";

export type JudicialProcessWithRelations = JudicialProcessRecord & {
  client: ClientRecord;
  bankingCase: BankingCaseRecord;
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
  linked_cases: ClientLinkedCaseSummary[] | null;
  linked_documents: string[] | null;
  timeline: string[] | null;
};

type ProcessRow = {
  id: string;
  case_id: string;
  client_id: string;
  process_number: string;
  tribunal: string;
  court_district: string;
  court_name: string;
  procedural_phase: string;
  status: JudicialProcessRecord["status"];
  responsible_lawyer: string;
  monitoring_mode: JudicialProcessRecord["monitoringMode"];
  latest_timeline: JudicialTimelineItem[] | null;
  banking_case_snapshot: BankingCaseRecord | null;
  client: ClientRow | ClientRow[] | null;
};

function mapClientRow(row: ClientRow): ClientRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    documentId: row.document_id ?? "",
    email: row.email ?? "",
    phone: row.phone,
    whatsapp: row.whatsapp ?? "",
    address: row.address,
    leadSource: row.lead_source ?? "",
    bankName: row.bank_name ?? "",
    serviceStatus: row.service_status,
    signedContract: row.signed_contract,
    legalViabilityScore: row.legal_viability_score,
    feesLabel: row.fees_label ?? "",
    documentsSent: row.documents_sent,
    notes: row.notes,
    iaContext: row.ia_context,
    linkedCases: row.linked_cases ?? [],
    linkedDocuments: row.linked_documents ?? [],
    timeline: row.timeline ?? []
  };
}

function mapProcessRow(row: ProcessRow): JudicialProcessWithRelations | null {
  const clientRow = Array.isArray(row.client) ? row.client[0] : row.client;

  if (!clientRow || !row.banking_case_snapshot) {
    return null;
  }

  return {
    id: row.id,
    caseId: row.case_id,
    clientId: row.client_id,
    processNumber: row.process_number,
    tribunal: row.tribunal,
    courtDistrict: row.court_district,
    courtName: row.court_name,
    proceduralPhase: row.procedural_phase,
    status: row.status,
    responsibleLawyer: row.responsible_lawyer,
    monitoringMode: row.monitoring_mode,
    latestTimeline: row.latest_timeline ?? [],
    client: mapClientRow(clientRow),
    bankingCase: row.banking_case_snapshot
  };
}

const PROCESS_SELECT = `
  id,
  case_id,
  client_id,
  process_number,
  tribunal,
  court_district,
  court_name,
  procedural_phase,
  status,
  responsible_lawyer,
  monitoring_mode,
  latest_timeline,
  banking_case_snapshot,
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

export async function getProcesses(): Promise<JudicialProcessWithRelations[]> {
  const session = await getWorkspaceSession();

  if (!session) {
    return [];
  }

  if (
    session.workspace.tenant.slug === "clara-bancaria-demo" ||
    process.env.NEXT_PUBLIC_SUPABASE_URL == null ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY == null
  ) {
    return [
      {
        ...DEMO_PROCESS_RECORD,
        client: DEMO_CLIENT_RECORD,
        bankingCase: DEMO_CASE_RECORD
      }
    ];
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("processes")
    .select(PROCESS_SELECT)
    .eq("tenant_id", session.workspace.tenant.id)
    .order("process_number", { ascending: true });

  if (error) {
    console.warn(`Failed to load processes for tenant ${session.workspace.tenant.id}.`);
    return [];
  }

  return (data ?? [])
    .map((row) => mapProcessRow(row as ProcessRow))
    .filter((row): row is JudicialProcessWithRelations => row !== null);
}

export async function getProcessById(
  processId: string
): Promise<JudicialProcessWithRelations | null> {
  const session = await getWorkspaceSession();

  if (!session) {
    return null;
  }

  if (
    processId === DEMO_PROCESS_RECORD.id &&
    (session.workspace.tenant.slug === "clara-bancaria-demo" ||
      process.env.NEXT_PUBLIC_SUPABASE_URL == null ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY == null)
  ) {
    return {
      ...DEMO_PROCESS_RECORD,
      client: DEMO_CLIENT_RECORD,
      bankingCase: DEMO_CASE_RECORD
    };
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("processes")
    .select(PROCESS_SELECT)
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("id", processId)
    .maybeSingle();

  if (error) {
    console.warn(`Failed to load process ${processId} for tenant ${session.workspace.tenant.id}.`);
    return null;
  }

  return data ? mapProcessRow(data as ProcessRow) : null;
}

export async function getProcessByCaseId(
  caseId: string
): Promise<JudicialProcessWithRelations | null> {
  const processes = await getProcesses();
  return processes.find((processItem) => processItem.caseId === caseId) ?? null;
}
