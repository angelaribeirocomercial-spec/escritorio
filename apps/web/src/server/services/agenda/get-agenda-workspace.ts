import {
  AgendaCommitmentRecord,
  AgendaViewMode,
  BankingCaseRecord,
  ClientRecord,
  ProceduralDeadlineRecord,
  TaskRecord
} from "@lexia/domain";
import {
  mockAgendaCommitments,
  mockCases,
  mockClients,
  mockProceduralDeadlines,
  mockTasks
} from "@lexia/mocks";

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

function resolveClient(clientId?: string) {
  return clientId ? mockClients.find((entry) => entry.id === clientId) ?? null : null;
}

function resolveCase(caseId?: string) {
  return caseId ? mockCases.find((entry) => entry.id === caseId) ?? null : null;
}

function buildTaskEntry(task: TaskRecord): AgendaEntry | null {
  const client = resolveClient(task.clientId);
  const bankingCase = resolveCase(task.caseId);

  if (!client || !bankingCase) {
    return null;
  }

  return {
    id: task.id,
    type: "task",
    title: task.title,
    summary: task.description,
    occursAt: `${task.dueDate}T09:00:00-03:00`,
    responsibleLabel: task.assigneeLabel,
    sourceLabel: "Tarefa",
    href: `/tarefas/${task.id}`,
    client,
    bankingCase,
    task
  };
}

function buildCommitmentEntry(commitment: AgendaCommitmentRecord): AgendaEntry | null {
  const client = resolveClient(commitment.clientId);
  const bankingCase = resolveCase(commitment.caseId);

  return {
    id: commitment.id,
    type: "commitment",
    title: commitment.title,
    summary: commitment.description,
    occursAt: commitment.scheduledFor,
    responsibleLabel: commitment.responsibleLabel,
    sourceLabel: commitment.locationLabel,
    client: client ?? undefined,
    bankingCase: bankingCase ?? undefined,
    commitment
  };
}

function buildDeadlineEntry(deadline: ProceduralDeadlineRecord): AgendaEntry | null {
  const client = resolveClient(deadline.clientId);
  const bankingCase = resolveCase(deadline.caseId);

  if (!client || !bankingCase) {
    return null;
  }

  return {
    id: deadline.id,
    type: "deadline",
    title: deadline.title,
    summary: deadline.description,
    occursAt: `${deadline.dueDate}T18:00:00-03:00`,
    responsibleLabel: deadline.responsibleLabel,
    sourceLabel: deadline.sourceLabel,
    client,
    bankingCase,
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

  return (
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth()
  );
}

export async function getAgendaWorkspace({
  view = "week",
  responsible = ""
}: {
  view?: AgendaViewMode;
  responsible?: string;
}) {
  const now = new Date();
  const entries = [
    ...mockTasks.map(buildTaskEntry),
    ...mockAgendaCommitments.map(buildCommitmentEntry),
    ...mockProceduralDeadlines.map(buildDeadlineEntry)
  ]
    .filter((entry): entry is AgendaEntry => Boolean(entry))
    .filter((entry) => withinView(entry.occursAt, view, now))
    .filter((entry) =>
      responsible ? entry.responsibleLabel === responsible : true
    )
    .sort((left, right) => left.occursAt.localeCompare(right.occursAt));

  const responsibles = [
    ...new Set(
      [
        ...mockTasks.map((entry) => entry.assigneeLabel),
        ...mockAgendaCommitments.map((entry) => entry.responsibleLabel),
        ...mockProceduralDeadlines.map((entry) => entry.responsibleLabel)
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
