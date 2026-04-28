import { getAgendaCommitments, getProceduralDeadlines } from "@/server/services/agenda/get-agenda-workspace";
import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";
import { getDocuments } from "@/server/services/documents/get-documents";
import { getTasks } from "@/server/services/tasks/get-tasks";

function formatClaimType(claimType: string) {
  return claimType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getDashboardSummary() {
  const [clients, cases, documents, tasks, commitments, deadlines] = await Promise.all([
    getClients(),
    getCases(),
    getDocuments(),
    getTasks(),
    getAgendaCommitments(),
    getProceduralDeadlines()
  ]);

  const activeClients = clients.filter((client) => client.serviceStatus === "active").length;
  const activeCases = cases.filter((bankingCase) => bankingCase.status === "active").length;
  const pendingTasks = tasks.filter((task) => task.status !== "done").length;
  const urgentTasks = tasks.filter((task) => task.priority === "urgent").length;
  const analyzedContracts = documents.filter((document) =>
    ["Contrato bancario", "CCB"].includes(document.documentType)
  ).length;
  const totalPotential = cases.reduce((sum, bankingCase) => sum + bankingCase.estimatedValue, 0);
  const stalledClients = clients.filter((client) => client.serviceStatus === "waiting-docs").length;
  const teamProductivity = tasks.length
    ? Math.round((tasks.filter((task) => task.status === "done").length / tasks.length) * 100)
    : 0;

  const urgentTaskList = tasks
    .filter((task) => task.priority === "urgent" || task.priority === "high")
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    .slice(0, 4)
    .map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      clientName: task.client.fullName,
      bankingCaseTitle: task.bankingCase.title
    }));

  const nextDeadlines = deadlines
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    .slice(0, 4)
    .map((deadline) => ({
      id: deadline.id,
      title: deadline.title,
      bankingCaseTitle: deadline.bankingCase.title,
      bankName: deadline.bankingCase.bankName,
      dateLabel: new Date(deadline.dueDate).toLocaleDateString("pt-BR"),
      sortKey: deadline.dueDate
    }));

  const latestActivities = [
    ...documents.slice(0, 2).map((document) => ({
      id: `document-${document.id}`,
      label: `Documento ${document.documentType.toLowerCase()} carregado`,
      detail: `${document.fileName} vinculado a ${document.client.fullName}.`
    })),
    ...tasks.slice(0, 1).map((task) => ({
      id: `task-${task.id}`,
      label: "Fluxo operacional atualizado",
      detail: `${task.title} esta com status ${task.status} para ${task.client.fullName}.`
    })),
    ...commitments.slice(0, 1).map((commitment) => ({
      id: `commitment-${commitment.id}`,
      label: "Compromisso agendado",
      detail: `${commitment.title} com ${commitment.client?.fullName ?? "contexto operacional"} foi consolidado na agenda.`
    }))
  ].slice(0, 4);

  const lexiaInsights = [
    `Voce possui ${urgentTasks} tarefa(s) de alta urgencia impactando a execucao da carteira.`,
    `${stalledClients} cliente(s) seguem aguardando documentacao complementar e exigem acompanhamento.`,
    `${analyzedContracts} contratos bancarios ja foram classificados para leitura juridica especializada.`,
    `${nextDeadlines.length} prazo(s) imediato(s) entraram no radar operacional do tenant.`
  ];

  const casesByType = Object.entries(
    cases.reduce<Record<string, number>>((accumulator, bankingCase) => {
      const key = formatClaimType(bankingCase.claimType);
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  const casesByBank = Object.entries(
    cases.reduce<Record<string, number>>((accumulator, bankingCase) => {
      accumulator[bankingCase.bankName] = (accumulator[bankingCase.bankName] ?? 0) + 1;
      return accumulator;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  const monthlyEvolution = [
    { label: "Clientes", value: clients.length },
    { label: "Casos", value: cases.length },
    { label: "Docs", value: documents.length },
    { label: "Tarefas", value: tasks.length },
    { label: "Agenda", value: commitments.length },
    { label: "Prazos", value: deadlines.length }
  ];

  return {
    metrics: {
      activeClients,
      activeCases,
      pendingTasks,
      urgentTasks,
      analyzedContracts,
      teamProductivity,
      totalPotential,
      stalledClients
    },
    monthlyEvolution,
    casesByType,
    casesByBank,
    deadlines: nextDeadlines,
    urgentTaskList,
    activities: latestActivities,
    lexiaInsights
  };
}
