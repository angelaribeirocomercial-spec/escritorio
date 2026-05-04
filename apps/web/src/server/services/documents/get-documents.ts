import {
  BankingCaseRecord,
  ClientRecord,
  DocumentRecord
} from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type DocumentWithContext = DocumentRecord & {
  client: ClientRecord;
  bankingCase: BankingCaseRecord;
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
};

type DocumentRow = {
  id: string;
  client_id: string;
  case_id: string;
  file_name: string;
  original_file_name: string | null;
  document_type: string;
  category: string;
  tags: string[] | null;
  ai_status: DocumentRecord["aiStatus"];
  summary: string;
  page_count: number;
  uploaded_at: string;
  preview_label: string;
  storage_bucket: string;
  storage_path: string;
  storage_mime_type: string;
  storage_size_bytes: number;
  actions: string[] | null;
  client: ClientRow | ClientRow[] | null;
  banking_case: CaseRow | CaseRow[] | null;
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

function mapCaseRow(row: CaseRow): BankingCaseRecord {
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
    }
  };
}

function mapDocumentRow(row: DocumentRow): DocumentWithContext | null {
  const clientRow = Array.isArray(row.client) ? row.client[0] : row.client;
  const caseRow = Array.isArray(row.banking_case) ? row.banking_case[0] : row.banking_case;

  if (!clientRow || !caseRow) {
    return null;
  }

  return {
    id: row.id,
    clientId: row.client_id,
    caseId: row.case_id,
    fileName: row.file_name,
    originalFileName: row.original_file_name ?? undefined,
    documentType: row.document_type,
    category: row.category,
    tags: row.tags ?? [],
    aiStatus: row.ai_status,
    summary: row.summary,
    pageCount: row.page_count,
    uploadedAt: row.uploaded_at,
    previewLabel: row.preview_label,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    storageMimeType: row.storage_mime_type,
    storageSizeBytes: row.storage_size_bytes,
    actions: row.actions ?? [],
    client: mapClientRow(clientRow),
    bankingCase: mapCaseRow(caseRow)
  };
}

const DOCUMENT_SELECT = `
  id,
  client_id,
  case_id,
  file_name,
  original_file_name,
  document_type,
  category,
  tags,
  ai_status,
  summary,
  page_count,
  uploaded_at,
  preview_label,
  storage_bucket,
  storage_path,
  storage_mime_type,
  storage_size_bytes,
  actions,
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
`;

export async function getDocuments(): Promise<DocumentWithContext[]> {
  const session = await getWorkspaceSession();

  if (!session) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("tenant_id", session.workspace.tenant.id)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.warn(`Failed to load documents for tenant ${session.workspace.tenant.id}.`);
    return [];
  }

  return (data ?? [])
    .map((row) => mapDocumentRow(row as DocumentRow))
    .filter((row): row is DocumentWithContext => row !== null);
}

export async function getDocumentById(
  documentId: string
): Promise<DocumentWithContext | null> {
  const session = await getWorkspaceSession();

  if (!session) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    console.warn(
      `Failed to load document ${documentId} for tenant ${session.workspace.tenant.id}.`
    );
    return null;
  }

  return data ? mapDocumentRow(data as DocumentRow) : null;
}

export async function getDocumentsByCaseId(caseId: string): Promise<DocumentWithContext[]> {
  const documents = await getDocuments();

  return documents.filter((document) => document.caseId === caseId);
}
