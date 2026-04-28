import {
  BankingCaseRecord,
  ClientRecord,
  TaskChecklistItem,
  TaskRecord
} from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type TaskWithContext = TaskRecord & {
  client: ClientRecord;
  bankingCase: BankingCaseRecord;
  completedChecklistCount: number;
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

type ChecklistRow = {
  id: string;
  label: string;
  done: boolean;
};

type TaskRow = {
  id: string;
  client_id: string;
  case_id: string;
  title: string;
  description: string;
  assignee_label: string;
  due_date: string;
  priority: TaskRecord["priority"];
  status: TaskRecord["status"];
  notes: string;
  checklist: ChecklistRow[] | null;
  suggested_by_claim_type: string;
  lexia_next_step: string;
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

function mapChecklistRow(row: ChecklistRow): TaskChecklistItem {
  return {
    id: row.id,
    label: row.label,
    done: row.done
  };
}

function mapTaskRow(row: TaskRow): TaskWithContext | null {
  const clientRow = Array.isArray(row.client) ? row.client[0] : row.client;
  const caseRow = Array.isArray(row.banking_case) ? row.banking_case[0] : row.banking_case;

  if (!clientRow || !caseRow) {
    return null;
  }

  const checklist = (row.checklist ?? []).map(mapChecklistRow);

  return {
    id: row.id,
    clientId: row.client_id,
    caseId: row.case_id,
    title: row.title,
    description: row.description,
    assigneeLabel: row.assignee_label,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    notes: row.notes,
    checklist,
    suggestedByClaimType: row.suggested_by_claim_type,
    lexiaNextStep: row.lexia_next_step,
    client: mapClientRow(clientRow),
    bankingCase: mapCaseRow(caseRow),
    completedChecklistCount: checklist.filter((item) => item.done).length
  };
}

const TASK_SELECT = `
  id,
  client_id,
  case_id,
  title,
  description,
  assignee_label,
  due_date,
  priority,
  status,
  notes,
  checklist,
  suggested_by_claim_type,
  lexia_next_step,
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

export async function getTasks(filters?: {
  clientId?: string;
  caseId?: string;
}): Promise<TaskWithContext[]> {
  const session = await getWorkspaceSession();

  if (!session) {
    throw new Error("Workspace session is required to load tasks.");
  }

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("tenant_id", session.workspace.tenant.id);

  if (filters?.clientId) {
    query = query.eq("client_id", filters.clientId);
  }

  if (filters?.caseId) {
    query = query.eq("case_id", filters.caseId);
  }

  const { data, error } = await query.order("due_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to load tasks for tenant ${session.workspace.tenant.id}.`);
  }

  return (data ?? [])
    .map((row) => mapTaskRow(row as TaskRow))
    .filter((row): row is TaskWithContext => row !== null);
}

export async function getTaskById(taskId: string): Promise<TaskWithContext | null> {
  const session = await getWorkspaceSession();

  if (!session) {
    throw new Error("Workspace session is required to load task details.");
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("id", taskId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load task ${taskId} for tenant ${session.workspace.tenant.id}.`);
  }

  return data ? mapTaskRow(data as TaskRow) : null;
}
