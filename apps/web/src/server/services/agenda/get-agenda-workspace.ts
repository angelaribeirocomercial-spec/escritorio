import {
  AgendaCommitmentRecord,
  AgendaViewMode,
  BankingCaseRecord,
  ClientRecord,
  ProceduralDeadlineRecord,
  TaskRecord
} from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTasks, type TaskWithContext } from "@/server/services/tasks/get-tasks";

export type AgendaEntryType = "task" | "commitment" | "deadline";

export type AgendaEntry = {
  id: string;
  type: AgendaEntryType;
  title: string;
  summary: string;
  occursAt: string;
  responsibleLabel: string;
  sourceLabel: string;
  href?: string;
  client?: ClientRecord;
  bankingCase?: BankingCaseRecord;
  task?: TaskRecord;
  commitment?: AgendaCommitmentRecord;
  deadline?: ProceduralDeadlineRecord;
};

export type CommitmentWithContext = AgendaCommitmentRecord & {
  client?: ClientRecord;
  bankingCase?: BankingCaseRecord;
};

export type DeadlineWithContext = ProceduralDeadlineRecord & {
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

type CommitmentRow = {
  id: string;
  client_id: string | null;
  case_id: string | null;
  process_id: string | null;
  title: string;
  description: string;
  scheduled_for: string;
  responsible_label: string;
  location_label: string;
  category: AgendaCommitmentRecord["category"];
  client: ClientRow | ClientRow[] | null;
  banking_case: CaseRow | CaseRow[] | null;
};

type DeadlineRow = {
  id: string;
  client_id: string;
  case_id: string;
  process_id: string | null;
  title: string;
  description: string;
  due_date: string;
  responsible_label: string;
  source_label: string;
  severity: ProceduralDeadlineRecord["severity"];
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

function buildTaskEntry(task: TaskWithContext): AgendaEntry {
  return {
    id: task.id,
    type: "task",
    title: task.title,
    summary: task.description,
    occursAt: `${task.dueDate}T09:00:00-03:00`,
    responsibleLabel: task.assigneeLabel,
    sourceLabel: "Tarefa",
    href: `/tarefas/${task.id}`,
    client: task.client,
    bankingCase: task.bankingCase,
    task
  };
}

function mapCommitmentRow(row: CommitmentRow): CommitmentWithContext {
  const clientRow = Array.isArray(row.client) ? row.client[0] : row.client;
  const caseRow = Array.isArray(row.banking_case) ? row.banking_case[0] : row.banking_case;

  return {
    id: row.id,
    clientId: row.client_id ?? undefined,
    caseId: row.case_id ?? undefined,
    processId: row.process_id ?? undefined,
    title: row.title,
    description: row.description,
    scheduledFor: row.scheduled_for,
    responsibleLabel: row.responsible_label,
    locationLabel: row.location_label,
    category: row.category,
    client: clientRow ? mapClientRow(clientRow) : undefined,
    bankingCase: caseRow ? mapCaseRow(caseRow) : undefined
  };
}

function mapDeadlineRow(row: DeadlineRow): DeadlineWithContext | null {
  const clientRow = Array.isArray(row.client) ? row.client[0] : row.client;
  const caseRow = Array.isArray(row.banking_case) ? row.banking_case[0] : row.banking_case;

  if (!clientRow || !caseRow) {
    return null;
  }

  return {
    id: row.id,
    clientId: row.client_id,
    caseId: row.case_id,
    processId: row.process_id ?? undefined,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    responsibleLabel: row.responsible_label,
    sourceLabel: row.source_label,
    severity: row.severity,
    client: mapClientRow(clientRow),
    bankingCase: mapCaseRow(caseRow)
  };
}

function buildCommitmentEntry(commitment: CommitmentWithContext): AgendaEntry {
  return {
    id: commitment.id,
    type: "commitment",
    title: commitment.title,
    summary: commitment.description,
    occursAt: commitment.scheduledFor,
    responsibleLabel: commitment.responsibleLabel,
    sourceLabel: commitment.locationLabel,
    client: commitment.client,
    bankingCase: commitment.bankingCase,
    commitment
  };
}

function buildDeadlineEntry(deadline: DeadlineWithContext): AgendaEntry {
  return {
    id: deadline.id,
    type: "deadline",
    title: deadline.title,
    summary: deadline.description,
    occursAt: `${deadline.dueDate}T18:00:00-03:00`,
    responsibleLabel: deadline.responsibleLabel,
    sourceLabel: deadline.sourceLabel,
    client: deadline.client,
    bankingCase: deadline.bankingCase,
    deadline
  };
}

function withinView(dateIso: string, view: AgendaViewMode, now: Date) {
  const target = new Date(dateIso);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  if (view === "day") {
    return target >= todayStart && target < tomorrowStart;
  }

  if (view === "week") {
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(todayStart.getDate() + 7);
    return target >= todayStart && target < weekEnd;
  }

  return target.getFullYear() === now.getFullYear() && target.getMonth() === now.getMonth();
}

const CONTEXT_SELECT = `
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

export async function getAgendaCommitments(): Promise<CommitmentWithContext[]> {
  const session = await getWorkspaceSession();

  if (!session) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agenda_commitments")
    .select(`
      id,
      client_id,
      case_id,
      process_id,
      title,
      description,
      scheduled_for,
      responsible_label,
      location_label,
      category,
      ${CONTEXT_SELECT}
    `)
    .eq("tenant_id", session.workspace.tenant.id)
    .order("scheduled_for", { ascending: true });

  if (error) {
    console.warn(
      `Failed to load agenda commitments for tenant ${session.workspace.tenant.id}.`
    );
    return [];
  }

  return (data ?? []).map((row) => mapCommitmentRow(row as CommitmentRow));
}

export async function getProceduralDeadlines(): Promise<DeadlineWithContext[]> {
  const session = await getWorkspaceSession();

  if (!session) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("procedural_deadlines")
    .select(`
      id,
      client_id,
      case_id,
      process_id,
      title,
      description,
      due_date,
      responsible_label,
      source_label,
      severity,
      ${CONTEXT_SELECT}
    `)
    .eq("tenant_id", session.workspace.tenant.id)
    .order("due_date", { ascending: true });

  if (error) {
    console.warn(
      `Failed to load procedural deadlines for tenant ${session.workspace.tenant.id}.`
    );
    return [];
  }

  return (data ?? [])
    .map((row) => mapDeadlineRow(row as DeadlineRow))
    .filter((row): row is DeadlineWithContext => row !== null);
}

export async function getAgendaWorkspace({
  view = "week",
  responsible = ""
}: {
  view?: AgendaViewMode;
  responsible?: string;
}) {
  const now = new Date();
  const [tasks, commitments, deadlines] = await Promise.all([
    getTasks(),
    getAgendaCommitments(),
    getProceduralDeadlines()
  ]);

  const entries = [
    ...tasks.map(buildTaskEntry),
    ...commitments.map(buildCommitmentEntry),
    ...deadlines.map(buildDeadlineEntry)
  ]
    .filter((entry) => withinView(entry.occursAt, view, now))
    .filter((entry) => (responsible ? entry.responsibleLabel === responsible : true))
    .sort((left, right) => left.occursAt.localeCompare(right.occursAt));

  const responsibles = [
    ...new Set(
      [
        ...tasks.map((entry) => entry.assigneeLabel),
        ...commitments.map((entry) => entry.responsibleLabel),
        ...deadlines.map((entry) => entry.responsibleLabel)
      ].sort()
    )
  ];

  return {
    view,
    responsible,
    entries,
    responsibles
  };
}
