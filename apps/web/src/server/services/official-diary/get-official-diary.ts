import {
  BankingCaseRecord,
  ClientRecord,
  JudicialProcessRecord,
  OfficialDiaryPublicationRecord,
  TaskPriority
} from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";
import {
  DEMO_CASE_ID,
  DEMO_CASE_RECORD,
  DEMO_CLIENT_ID,
  DEMO_CLIENT_RECORD,
  DEMO_PROCESS_ID,
  DEMO_PROCESS_RECORD
} from "@/server/services/demo/demo-workspace-data";
import { getProcesses } from "@/server/services/processes/get-processes";

export type OfficialDiaryPublicationWithRelations = OfficialDiaryPublicationRecord & {
  client: ClientRecord;
  bankingCase: BankingCaseRecord;
  judicialProcess: JudicialProcessRecord;
};

export type OfficialDiaryTaskDraft = {
  publicationId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  clientName: string;
  caseTitle: string;
  processNumber: string;
  sourceLabel: string;
  publishedAt: string;
};

type OfficialDiaryPublicationRow = {
  id: string;
  process_id: string;
  case_id: string;
  client_id: string;
  published_at: string;
  source_court: string;
  source_label: string;
  title: string;
  raw_context: string;
  banking_summary: string;
  required_action: string;
  urgency: OfficialDiaryPublicationRecord["urgency"];
  responsible_lawyer: string;
  suggested_task_title: string;
  suggested_task_description: string;
  archived_at: string | null;
};

const OFFICIAL_DIARY_PUBLICATION_SELECT = `
  id,
  process_id,
  case_id,
  client_id,
  published_at,
  source_court,
  source_label,
  title,
  raw_context,
  banking_summary,
  required_action,
  urgency,
  responsible_lawyer,
  suggested_task_title,
  suggested_task_description,
  archived_at
`;

const DEMO_OFFICIAL_DIARY_PUBLICATIONS: OfficialDiaryPublicationWithRelations[] = [
  {
    id: "official-diary-demo-1",
    processId: DEMO_PROCESS_ID,
    caseId: DEMO_CASE_ID,
    clientId: DEMO_CLIENT_ID,
    publishedAt: "2026-05-06T08:30:00.000Z",
    sourceCourt: "TJRJ",
    sourceLabel: "DJERJ - Caderno Judicial",
    title: "Intimacao para manifestacao sobre documentos bancarios complementares",
    rawContext:
      "Fica a parte autora intimada a se manifestar, no prazo legal, sobre os documentos bancarios juntados aos autos e eventual interesse em audiencia de conciliacao.",
    bankingSummary:
      "A publicacao exige leitura processual e cruzamento com os comprovantes PIX e protocolos bancarios ja reunidos no caso.",
    requiredAction: "Preparar manifestacao e revisar anexos bancarios",
    urgency: "high",
    responsibleLawyer: DEMO_PROCESS_RECORD.responsibleLawyer,
    suggestedTaskTitle: "Montar manifestacao sobre documentos bancarios do caso Carlos Henrique Duarte",
    suggestedTaskDescription:
      "Revisar a publicacao do DJERJ, validar os anexos bancarios e preparar a minuta de manifestacao para conferencia humana.",
    client: DEMO_CLIENT_RECORD,
    bankingCase: DEMO_CASE_RECORD,
    judicialProcess: DEMO_PROCESS_RECORD
  },
  {
    id: "official-diary-demo-archived-1",
    processId: DEMO_PROCESS_ID,
    caseId: DEMO_CASE_ID,
    clientId: DEMO_CLIENT_ID,
    publishedAt: "2026-05-03T11:20:00.000Z",
    sourceCourt: "TJRJ",
    sourceLabel: "DJERJ - Caderno Judicial",
    title: "Publicacao arquivada apos triagem operacional inicial",
    rawContext:
      "Registro arquivado para manter o historico do acompanhamento e demonstrar a lixeira operacional do Diario Oficial.",
    bankingSummary:
      "A publicacao foi mantida apenas para historico e nao demanda acao operacional adicional.",
    requiredAction: "Historico arquivado",
    urgency: "low",
    responsibleLawyer: DEMO_PROCESS_RECORD.responsibleLawyer,
    suggestedTaskTitle: "Sem tarefa adicional para publicacao arquivada",
    suggestedTaskDescription:
      "Item arquivado apenas para historico de triagem do Diario Oficial no tenant demo.",
    archivedAt: "2026-05-04T09:15:00.000Z",
    client: DEMO_CLIENT_RECORD,
    bankingCase: DEMO_CASE_RECORD,
    judicialProcess: DEMO_PROCESS_RECORD
  }
];

function isDemoTenant(tenantSlug: string): boolean {
  return tenantSlug === "clara-bancaria-demo";
}

function isSupabasePublicConfigAvailable(): boolean {
  return (
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL) != null &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY) != null
  );
}

function getDemoOfficialDiaryPublications(includeArchived: boolean) {
  return DEMO_OFFICIAL_DIARY_PUBLICATIONS.filter((publication) =>
    includeArchived ? publication.archivedAt != null : publication.archivedAt == null
  );
}

function mapUrgencyToPriority(urgency: OfficialDiaryPublicationRecord["urgency"]): TaskPriority {
  switch (urgency) {
    case "high":
      return "urgent";
    case "medium":
      return "high";
    default:
      return "medium";
  }
}

function mapOfficialDiaryPublicationRow(
  row: OfficialDiaryPublicationRow,
  context: {
    clients: readonly ClientRecord[];
    cases: readonly BankingCaseRecord[];
    processes: readonly JudicialProcessRecord[];
  }
): OfficialDiaryPublicationWithRelations | null {
  const client = context.clients.find((entry) => entry.id === row.client_id);
  const bankingCase = context.cases.find((entry) => entry.id === row.case_id);
  const judicialProcess = context.processes.find((entry) => entry.id === row.process_id);

  if (!client || !bankingCase || !judicialProcess) {
    return null;
  }

  return {
    id: row.id,
    processId: row.process_id,
    caseId: row.case_id,
    clientId: row.client_id,
    publishedAt: row.published_at,
    sourceCourt: row.source_court,
    sourceLabel: row.source_label,
    title: row.title,
    rawContext: row.raw_context,
    bankingSummary: row.banking_summary,
    requiredAction: row.required_action,
    urgency: row.urgency,
    responsibleLawyer: row.responsible_lawyer,
    suggestedTaskTitle: row.suggested_task_title,
    suggestedTaskDescription: row.suggested_task_description,
    archivedAt: row.archived_at ?? undefined,
    client,
    bankingCase,
    judicialProcess
  };
}

export async function getOfficialDiaryPublications(): Promise<
  OfficialDiaryPublicationWithRelations[]
> {
  const session = await getWorkspaceSession();

  if (!session) {
    throw new Error("Workspace session is required to load official diary publications.");
  }

  const demoTenant = isDemoTenant(session.workspace.tenant.slug);

  if (!isSupabasePublicConfigAvailable()) {
    if (demoTenant) {
      return getDemoOfficialDiaryPublications(false);
    }

    throw new Error("Supabase public configuration is required to load official diary publications.");
  }

  const supabase = getSupabaseServerClient();
  const [{ data, error }, clients, cases, processes] = await Promise.all([
    supabase
      .from("official_diary_publications")
      .select(OFFICIAL_DIARY_PUBLICATION_SELECT)
      .eq("tenant_id", session.workspace.tenant.id)
      .is("archived_at", null)
      .order("published_at", { ascending: false }),
    getClients(),
    getCases(),
    getProcesses()
  ]);

  if (error) {
    if (demoTenant) {
      return getDemoOfficialDiaryPublications(false);
    }

    throw new Error(
      `Failed to load official diary publications for tenant ${session.workspace.tenant.id}.`
    );
  }

  const publications = (data ?? [])
    .map((row) =>
      mapOfficialDiaryPublicationRow(row as OfficialDiaryPublicationRow, {
        cases,
        clients,
        processes
      })
    )
    .filter((row): row is OfficialDiaryPublicationWithRelations => row !== null);

  if (demoTenant && publications.length === 0) {
    return getDemoOfficialDiaryPublications(false);
  }

  return publications;
}

export async function getArchivedOfficialDiaryPublications(): Promise<
  OfficialDiaryPublicationWithRelations[]
> {
  const session = await getWorkspaceSession();

  if (!session) {
    throw new Error("Workspace session is required to load archived official diary publications.");
  }

  const demoTenant = isDemoTenant(session.workspace.tenant.slug);

  if (!isSupabasePublicConfigAvailable()) {
    if (demoTenant) {
      return getDemoOfficialDiaryPublications(true);
    }

    throw new Error(
      "Supabase public configuration is required to load archived official diary publications."
    );
  }

  const supabase = getSupabaseServerClient();
  const [{ data, error }, clients, cases, processes] = await Promise.all([
    supabase
      .from("official_diary_publications")
      .select(OFFICIAL_DIARY_PUBLICATION_SELECT)
      .eq("tenant_id", session.workspace.tenant.id)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false }),
    getClients(),
    getCases(),
    getProcesses()
  ]);

  if (error) {
    if (demoTenant) {
      return getDemoOfficialDiaryPublications(true);
    }

    throw new Error(
      `Failed to load archived official diary publications for tenant ${session.workspace.tenant.id}.`
    );
  }

  const publications = (data ?? [])
    .map((row) =>
      mapOfficialDiaryPublicationRow(row as OfficialDiaryPublicationRow, {
        cases,
        clients,
        processes
      })
    )
    .filter((row): row is OfficialDiaryPublicationWithRelations => row !== null);

  if (demoTenant && publications.length === 0) {
    return getDemoOfficialDiaryPublications(true);
  }

  return publications;
}

export async function getOfficialDiaryPublicationById(
  publicationId: string
): Promise<OfficialDiaryPublicationWithRelations | null> {
  const publications = await getOfficialDiaryPublications();
  return publications.find((entry) => entry.id === publicationId) ?? null;
}

export async function getOfficialDiaryTaskDraft(
  publicationId: string
): Promise<OfficialDiaryTaskDraft | null> {
  const publication = await getOfficialDiaryPublicationById(publicationId);

  if (!publication) {
    return null;
  }

  return {
    publicationId: publication.id,
    title: publication.suggestedTaskTitle,
    description: publication.suggestedTaskDescription,
    priority: mapUrgencyToPriority(publication.urgency),
    clientName: publication.client.fullName,
    caseTitle: publication.bankingCase.title,
    processNumber: publication.judicialProcess.processNumber,
    sourceLabel: publication.sourceLabel,
    publishedAt: publication.publishedAt
  };
}
