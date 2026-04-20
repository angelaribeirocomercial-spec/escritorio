import { mockCases, mockClients, mockDocuments, mockTasks } from "@lexia/mocks";

function formatClaimType(claimType: string) {
  return claimType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getDashboardSummary() {
  const activeClients = mockClients.filter(
    (client) => client.serviceStatus === "active"
  ).length;
  const activeCases = mockCases.filter((bankingCase) => bankingCase.status === "active").length;
  const pendingTasks = mockTasks.filter((task) => task.status !== "done").length;
  const urgentTasks = mockTasks.filter((task) => task.priority === "urgent").length;
  const analyzedContracts = mockDocuments.filter((document) =>
    ["Contrato bancario", "CCB"].includes(document.documentType)
  ).length;
  const totalPotential = mockCases.reduce(
    (sum, bankingCase) => sum + bankingCase.estimatedValue,
    0
  );
  const stalledClients = mockClients.filter(
    (client) => client.serviceStatus === "waiting-docs"
  ).length;
  const teamProductivity = Math.round(
    (mockTasks.filter((task) => task.status === "done").length / mockTasks.length) * 100
  );

  const deadlines = mockCases
    .flatMap((bankingCase) =>
      bankingCase.linkedDeadlines.map((deadline, index) => {
        const dateMatch = deadline.match(/(\d{2}\/\d{2}\/\d{4})/);
        return {
          id: `${bankingCase.id}-deadline-${index}`,
          title: deadline.replace(/\s+ate\s+\d{2}\/\d{2}\/\d{4}/, ""),
          bankingCaseTitle: bankingCase.title,
          bankName: bankingCase.bankName,
          dateLabel: dateMatch?.[1] ?? "Sem data",
          sortKey: dateMatch
            ? dateMatch[1].split("/").reverse().join("-")
            : "9999-12-31"
        };
      })
    )
    .sort((left, right) => left.sortKey.localeCompare(right.sortKey))
    .slice(0, 4);

  const urgentTaskList = mockTasks
    .filter((task) => task.priority === "urgent" || task.priority === "high")
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    .slice(0, 4)
    .map((task) => {
      const bankingCase = mockCases.find((caseItem) => caseItem.id === task.caseId);
      const client = mockClients.find((clientItem) => clientItem.id === task.clientId);

      return {
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        clientName: client?.fullName ?? "Cliente indisponivel",
        bankingCaseTitle: bankingCase?.title ?? "Caso indisponivel"
      };
    });

  const activities = [
    {
      id: "activity-1",
      label: "Novo contrato bancario analisado",
      detail: "CCB de Patricia Gomes Araujo marcada com capitalizacao mensal e CET sensivel."
    },
    {
      id: "activity-2",
      label: "Fluxo operacional atualizado",
      detail: "Checklist revisional de Mariana Torres Lima avancou para definicao de tese."
    },
    {
      id: "activity-3",
      label: "Pendencia documental detectada",
      detail: "Caso de fraude PIX segue aguardando boletim de ocorrencia para robustecer a prova."
    },
    {
      id: "activity-4",
      label: "Tutela priorizada pela operacao",
      detail: "Negativacao indevida de Patricia foi movida para a fila urgente."
    }
  ];

  const lexiaInsights = [
    `Voce possui ${urgentTasks} tarefas de alta urgencia impactando a execucao da carteira.`,
    `${stalledClients} cliente(s) seguem aguardando documentacao complementar e exigem acompanhamento.`,
    `${analyzedContracts} contratos bancarios ja foram classificados para leitura juridica especializada.`,
    "Ha repeticao de tese revisional com foco em CET e capitalizacao entre os contratos mais sensiveis."
  ];

  const casesByType = Object.entries(
    mockCases.reduce<Record<string, number>>((accumulator, bankingCase) => {
      const key = formatClaimType(bankingCase.claimType);
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  const casesByBank = Object.entries(
    mockCases.reduce<Record<string, number>>((accumulator, bankingCase) => {
      accumulator[bankingCase.bankName] = (accumulator[bankingCase.bankName] ?? 0) + 1;
      return accumulator;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  const monthlyEvolution = [
    { label: "Nov", value: 42 },
    { label: "Dez", value: 54 },
    { label: "Jan", value: 61 },
    { label: "Fev", value: 67 },
    { label: "Mar", value: 79 },
    { label: "Abr", value: 88 }
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
    deadlines,
    urgentTaskList,
    activities,
    lexiaInsights
  };
}
