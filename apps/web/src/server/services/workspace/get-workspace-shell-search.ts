import { getAdversaries } from "@/server/services/adversaries/get-adversaries";
import {
  getAgendaCommitments,
  getProceduralDeadlines
} from "@/server/services/agenda/get-agenda-workspace";
import { getBankingCaseWorkflow } from "@/server/services/cases/get-banking-case-workflow";
import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";
import { getClaraIntegrations } from "@/server/services/clara/get-clara-integrations";
import { getCrmContracts } from "@/server/services/crm/get-crm-contracts";
import { getCrmPipeline } from "@/server/services/crm/get-crm-pipeline";
import { getDocuments } from "@/server/services/documents/get-documents";
import {
  formatFinancialAmount,
  getFinancialEntries
} from "@/server/services/finance/get-financial-entries";
import {
  getArchivedOfficialDiaryPublications,
  getOfficialDiaryPublications
} from "@/server/services/official-diary/get-official-diary";
import { getProceduralUpdates } from "@/server/services/procedural-updates/get-procedural-updates";
import { getProcesses } from "@/server/services/processes/get-processes";
import { getTasks } from "@/server/services/tasks/get-tasks";
import { getWorkspaceSession } from "@/lib/auth/session";

import type { WorkspaceSearchEntry } from "@/components/layout/workspace-search-types";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function compactText(value: string, maxLength: number) {
  const trimmed = value.replace(/\s+/g, " ").trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function uniq(values: ReadonlyArray<string>) {
  return [...new Set(values.filter(Boolean))];
}

function financeRouteForKind(kind: "income" | "expense" | "transfer") {
  switch (kind) {
    case "income":
      return "/financeiro/receitas";
    case "expense":
      return "/financeiro/despesas";
    default:
      return "/financeiro/transferencias";
  }
}

function financeKindLabel(kind: "income" | "expense" | "transfer") {
  switch (kind) {
    case "income":
      return "Receita";
    case "expense":
      return "Despesa";
    default:
      return "Transferencia";
  }
}

function financeStatusLabel(status: string) {
  switch (status) {
    case "paid":
      return "Pago";
    case "overdue":
      return "Vencido";
    case "scheduled":
      return "Agendado";
    default:
      return "Pendente";
  }
}

function officialDistributionStatusLabel(status: string) {
  switch (status) {
    case "official_confirmed":
      return "Distribuicao oficial confirmada";
    case "attempt_failed":
      return "Tentativa de distribuicao frustrada";
    default:
      return "Distribuicao em preparacao";
  }
}

function resolveDistributionDateLabel(input: {
  officialDistributionDate?: string;
  latestTimeline: ReadonlyArray<{
    occurredAt: string;
    title: string;
    description: string;
  }>;
}) {
  if (input.officialDistributionDate) {
    return input.officialDistributionDate;
  }

  const distributionEvent = input.latestTimeline.find((item) =>
    /distribu/i.test(`${item.title} ${item.description}`)
  );

  return distributionEvent?.occurredAt ?? "Nao registrada";
}

export async function getWorkspaceShellSearchEntries(): Promise<WorkspaceSearchEntry[]> {
  try {
    const [
      clientsResult,
      casesResult,
      processesResult,
      documentsResult,
      tasksResult,
      commitmentsResult,
      deadlinesResult,
      updatesResult,
      adversariesResult,
      contractsResult,
      pipelineResult,
      officialDiaryResult,
      archivedOfficialDiaryResult,
      financialEntriesResult,
      claraIntegrationsResult,
      sessionResult
    ] = await Promise.allSettled([
      getClients(),
      getCases(),
      getProcesses(),
      getDocuments(),
      getTasks(),
      getAgendaCommitments(),
      getProceduralDeadlines(),
      getProceduralUpdates(),
      getAdversaries(),
      getCrmContracts(),
      getCrmPipeline(),
      getOfficialDiaryPublications(),
      getArchivedOfficialDiaryPublications(),
      getFinancialEntries(),
      getClaraIntegrations(),
      getWorkspaceSession()
    ]);

    if (clientsResult.status === "rejected") {
      console.warn("Failed to load workspace shell clients.", clientsResult.reason);
    }

    if (casesResult.status === "rejected") {
      console.warn("Failed to load workspace shell cases.", casesResult.reason);
    }

    if (processesResult.status === "rejected") {
      console.warn("Failed to load workspace shell processes.", processesResult.reason);
    }

    if (documentsResult.status === "rejected") {
      console.warn("Failed to load workspace shell documents.", documentsResult.reason);
    }

    if (tasksResult.status === "rejected") {
      console.warn("Failed to load workspace shell tasks.", tasksResult.reason);
    }

    if (commitmentsResult.status === "rejected") {
      console.warn("Failed to load workspace shell commitments.", commitmentsResult.reason);
    }

    if (deadlinesResult.status === "rejected") {
      console.warn("Failed to load workspace shell deadlines.", deadlinesResult.reason);
    }

    if (updatesResult.status === "rejected") {
      console.warn("Failed to load workspace shell procedural updates.", updatesResult.reason);
    }

    if (adversariesResult.status === "rejected") {
      console.warn("Failed to load workspace shell adversaries.", adversariesResult.reason);
    }

    if (contractsResult.status === "rejected") {
      console.warn("Failed to load workspace shell contracts.", contractsResult.reason);
    }

    if (pipelineResult.status === "rejected") {
      console.warn("Failed to load workspace shell CRM pipeline.", pipelineResult.reason);
    }

    if (officialDiaryResult.status === "rejected") {
      console.warn(
        "Failed to load workspace shell official diary publications.",
        officialDiaryResult.reason
      );
    }

    if (archivedOfficialDiaryResult.status === "rejected") {
      console.warn(
        "Failed to load workspace shell archived official diary publications.",
        archivedOfficialDiaryResult.reason
      );
    }

    if (financialEntriesResult.status === "rejected") {
      console.warn("Failed to load workspace shell financial entries.", financialEntriesResult.reason);
    }

    if (claraIntegrationsResult.status === "rejected") {
      console.warn(
        "Failed to load workspace shell Clara integrations.",
        claraIntegrationsResult.reason
      );
    }

    if (sessionResult.status === "rejected") {
      console.warn("Failed to load workspace shell tenant configuration.", sessionResult.reason);
    }

    const clients = clientsResult.status === "fulfilled" ? clientsResult.value : [];
    const cases = casesResult.status === "fulfilled" ? casesResult.value : [];
    const processes = processesResult.status === "fulfilled" ? processesResult.value : [];
    const documents = documentsResult.status === "fulfilled" ? documentsResult.value : [];
    const tasks = tasksResult.status === "fulfilled" ? tasksResult.value : [];
    const commitments = commitmentsResult.status === "fulfilled" ? commitmentsResult.value : [];
    const deadlines = deadlinesResult.status === "fulfilled" ? deadlinesResult.value : [];
    const updates = updatesResult.status === "fulfilled" ? updatesResult.value : [];
    const adversaries = adversariesResult.status === "fulfilled" ? adversariesResult.value : [];
    const contracts = contractsResult.status === "fulfilled" ? contractsResult.value : [];
    const crmPipeline = pipelineResult.status === "fulfilled" ? pipelineResult.value : null;
    const officialDiaryPublications =
      officialDiaryResult.status === "fulfilled" ? officialDiaryResult.value : [];
    const archivedOfficialDiaryPublications =
      archivedOfficialDiaryResult.status === "fulfilled" ? archivedOfficialDiaryResult.value : [];
    const financialEntries =
      financialEntriesResult.status === "fulfilled" ? financialEntriesResult.value : [];
    const claraIntegrations =
      claraIntegrationsResult.status === "fulfilled" ? claraIntegrationsResult.value : [];
    const workspaceSession = sessionResult.status === "fulfilled" ? sessionResult.value : null;

    const processByCaseId = new Map(processes.map((processItem) => [processItem.caseId, processItem]));
    const clientById = new Map(clients.map((client) => [client.id, client]));
    const caseById = new Map(cases.map((caseItem) => [caseItem.id, caseItem]));
    const documentsByCaseId = documents.reduce<Map<string, typeof documents>>((accumulator, document) => {
      const items = accumulator.get(document.caseId);

      if (items) {
        items.push(document);
      } else {
        accumulator.set(document.caseId, [document]);
      }

      return accumulator;
    }, new Map());
    const diaryKeywords = uniq(
      [
        ...adversaries.flatMap((adversary) => [adversary.name, adversary.bankName]),
        ...officialDiaryPublications.flatMap((publication) => [
          publication.client.fullName,
          publication.bankingCase.bankName,
          publication.judicialProcess.processNumber
        ])
      ].sort()
    );
    const monitoredLawyerGroups = [...new Set(processes.map((processItem) => processItem.responsibleLawyer))]
      .filter(Boolean)
      .sort()
      .map((lawyer) => ({
        lawyer,
        processes: processes.filter((processItem) => processItem.responsibleLawyer === lawyer)
      }));

    const entries: WorkspaceSearchEntry[] = [];

    for (const client of clients) {
      const linkedCaseLabels = client.linkedCases.map((item) => item.title).join(" | ");

      entries.push({
        id: `cliente-${client.id}`,
        kind: "Cliente",
        title: client.fullName,
        preview: compactText(
          `${client.bankName} | ${client.serviceStatus} | ${client.feesLabel || "Honorarios pendentes"}`,
          90
        ),
        href: `/pessoas/clientes/${client.id}`,
        keywords: [
          client.fullName,
          client.documentId,
          client.email,
          client.phone,
          client.whatsapp,
          client.bankName,
          client.leadSource,
          client.notes,
          client.iaContext,
          linkedCaseLabels,
          ...client.linkedDocuments
        ],
        routeContext: {
          clientId: client.id
        },
        claraContext: {
          clientName: client.fullName,
          availableDocuments: client.linkedDocuments
        }
      });
    }

    for (const caseItem of cases) {
      const caseDocuments = documentsByCaseId.get(caseItem.id) ?? [];
      const documentTypes = caseDocuments.map((document) => document.documentType);
      const workflow = getBankingCaseWorkflow(caseItem, {
        documentLabels: documentTypes
      });
      const linkedProcess = processByCaseId.get(caseItem.id);
      const distributionStatusLabel = linkedProcess
        ? officialDistributionStatusLabel(linkedProcess.officialDistributionStatus)
        : workflow.currentStepId === "distribuicao" || workflow.currentStepId === "acompanhamento"
          ? "Caso pronto para distribuicao"
          : "Processo ainda nao vinculado";
      const distributionDateLabel = linkedProcess
        ? resolveDistributionDateLabel({
            officialDistributionDate: linkedProcess.officialDistributionDate,
            latestTimeline: linkedProcess.latestTimeline
          })
        : "Nao registrada";

      entries.push({
        id: `caso-${caseItem.id}`,
        kind: "Caso",
        title: caseItem.title,
        preview: compactText(
          `${caseItem.client.fullName} | ${caseItem.mainThesis} | ${distributionStatusLabel}`,
          100
        ),
        href: `/pessoas/clientes/${caseItem.clientId}?case=${caseItem.id}`,
        keywords: [
          caseItem.title,
          caseItem.claimType,
          caseItem.mainThesis,
          caseItem.suggestedStrategy,
          caseItem.bankName,
          caseItem.stage,
          caseItem.client.fullName,
          caseItem.processNumber,
          distributionStatusLabel,
          distributionDateLabel,
          ...workflow.missingDocuments,
          ...workflow.requiredDocuments,
          ...documentTypes
        ],
        routeContext: {
          clientId: caseItem.clientId,
          caseId: caseItem.id,
          processId: linkedProcess?.id
        },
        claraContext: {
          clientName: caseItem.client.fullName,
          caseTitle: caseItem.title,
          processNumber: linkedProcess?.processNumber ?? caseItem.processNumber,
          mainThesis: caseItem.mainThesis,
          distributionStatusLabel,
          distributionDateLabel,
          missingDocuments: [...workflow.missingDocuments],
          availableDocuments: documentTypes
        }
      });
    }

    for (const processItem of processes) {
      const caseDocuments = documentsByCaseId.get(processItem.caseId) ?? [];
      const documentTypes = caseDocuments.map((document) => document.documentType);
      const workflow = getBankingCaseWorkflow(processItem.bankingCase, {
        documentLabels: documentTypes
      });
      const distributionStatusLabel = officialDistributionStatusLabel(
        processItem.officialDistributionStatus
      );
      const distributionDateLabel = resolveDistributionDateLabel({
        officialDistributionDate: processItem.officialDistributionDate,
        latestTimeline: processItem.latestTimeline
      });

      entries.push({
        id: `processo-${processItem.id}`,
        kind: "Processo",
        title: processItem.processNumber,
        preview: compactText(
          `${processItem.client.fullName} | ${processItem.bankingCase.title} | ${distributionStatusLabel}`,
          100
        ),
        href: `/processos/${processItem.id}`,
        keywords: [
          processItem.processNumber,
          processItem.officialProcessNumber ?? "",
          processItem.tribunal,
          processItem.courtDistrict,
          processItem.courtName,
          processItem.proceduralPhase,
          processItem.responsibleLawyer,
          processItem.client.fullName,
          processItem.bankingCase.title,
          processItem.bankingCase.mainThesis,
          processItem.bankingCase.suggestedStrategy,
          distributionStatusLabel,
          distributionDateLabel,
          ...workflow.missingDocuments,
          ...documentTypes
        ],
        routeContext: {
          clientId: processItem.clientId,
          caseId: processItem.caseId,
          processId: processItem.id
        },
        claraContext: {
          clientName: processItem.client.fullName,
          caseTitle: processItem.bankingCase.title,
          processNumber: processItem.processNumber,
          mainThesis: processItem.bankingCase.mainThesis,
          distributionStatusLabel,
          distributionDateLabel,
          missingDocuments: [...workflow.missingDocuments],
          availableDocuments: documentTypes
        }
      });

      entries.push({
        id: `tese-${processItem.id}`,
        kind: "Tese",
        title: processItem.bankingCase.mainThesis,
        preview: compactText(
          `${processItem.bankingCase.title} | ${processItem.client.fullName} | ${processItem.processNumber}`,
          100
        ),
        href: `/processos/${processItem.id}`,
        keywords: [
          processItem.bankingCase.mainThesis,
          processItem.bankingCase.title,
          processItem.bankingCase.claimType,
          processItem.bankingCase.suggestedStrategy,
          processItem.client.fullName,
          processItem.processNumber,
          processItem.tribunal,
          distributionStatusLabel
        ],
        routeContext: {
          clientId: processItem.clientId,
          caseId: processItem.caseId,
          processId: processItem.id
        },
        claraContext: {
          clientName: processItem.client.fullName,
          caseTitle: processItem.bankingCase.title,
          processNumber: processItem.processNumber,
          mainThesis: processItem.bankingCase.mainThesis,
          distributionStatusLabel,
          distributionDateLabel
        }
      });
    }

    for (const document of documents) {
      const caseDocuments = documentsByCaseId.get(document.caseId) ?? [];
      const workflow = getBankingCaseWorkflow(document.bankingCase, {
        documentLabels: caseDocuments.map((item) => item.documentType)
      });
      const linkedProcess = processByCaseId.get(document.caseId);

      entries.push({
        id: `documento-${document.id}`,
        kind: "Documento",
        title: document.fileName,
        preview: compactText(
          `${document.documentType} | ${document.client.fullName} | ${document.summary}`,
          100
        ),
        href: `/documentos/${document.id}`,
        keywords: [
          document.fileName,
          document.originalFileName ?? "",
          document.documentType,
          document.category,
          document.summary,
          document.client.fullName,
          document.bankingCase.title,
          document.bankingCase.mainThesis,
          document.tags.join(" "),
          ...workflow.missingDocuments
        ],
        routeContext: {
          clientId: document.clientId,
          caseId: document.caseId,
          processId: linkedProcess?.id,
          documentId: document.id
        },
        claraContext: {
          clientName: document.client.fullName,
          caseTitle: document.bankingCase.title,
          processNumber: linkedProcess?.processNumber ?? document.bankingCase.processNumber,
          mainThesis: document.bankingCase.mainThesis,
          distributionStatusLabel: linkedProcess
            ? officialDistributionStatusLabel(linkedProcess.officialDistributionStatus)
            : "Processo ainda nao vinculado",
          distributionDateLabel: linkedProcess
            ? resolveDistributionDateLabel({
                officialDistributionDate: linkedProcess.officialDistributionDate,
                latestTimeline: linkedProcess.latestTimeline
              })
            : "Nao registrada",
          missingDocuments: [...workflow.missingDocuments],
          availableDocuments: caseDocuments.map((item) => item.documentType)
        }
      });
    }

    for (const task of tasks) {
      const linkedProcess = processByCaseId.get(task.caseId);

      entries.push({
        id: `tarefa-${task.id}`,
        kind: "Tarefa",
        title: task.title,
        preview: compactText(
          `${task.client.fullName} | ${task.bankingCase.title} | ${task.assigneeLabel}`,
          100
        ),
        href: `/tarefas/${task.id}`,
        keywords: [
          task.title,
          task.description,
          task.assigneeLabel,
          task.priority,
          task.status,
          task.notes,
          task.suggestedByClaimType,
          task.lexiaNextStep,
          task.client.fullName,
          task.bankingCase.title,
          task.bankingCase.mainThesis,
          ...task.checklist.map((item) => item.label)
        ],
        routeContext: {
          clientId: task.clientId,
          caseId: task.caseId,
          processId: linkedProcess?.id
        },
        claraContext: {
          clientName: task.client.fullName,
          caseTitle: task.bankingCase.title,
          processNumber: linkedProcess?.processNumber ?? task.bankingCase.processNumber,
          mainThesis: task.bankingCase.mainThesis
        }
      });
    }

    for (const commitment of commitments) {
      const linkedProcess = commitment.caseId ? processByCaseId.get(commitment.caseId) : undefined;

      entries.push({
        id: `compromisso-${commitment.id}`,
        kind: "Compromisso",
        title: commitment.title,
        preview: compactText(
          `${commitment.client?.fullName ?? "Cliente nao vinculado"} | ${commitment.bankingCase?.title ?? commitment.locationLabel} | ${commitment.responsibleLabel}`,
          100
        ),
        href: "/agenda/compromissos",
        keywords: [
          commitment.title,
          commitment.description,
          commitment.locationLabel,
          commitment.category,
          commitment.responsibleLabel,
          commitment.client?.fullName ?? "",
          commitment.bankingCase?.title ?? "",
          commitment.bankingCase?.mainThesis ?? ""
        ],
        routeContext: {
          clientId: commitment.clientId,
          caseId: commitment.caseId,
          processId: linkedProcess?.id
        },
        claraContext: {
          clientName: commitment.client?.fullName,
          caseTitle: commitment.bankingCase?.title,
          processNumber: linkedProcess?.processNumber ?? commitment.bankingCase?.processNumber,
          mainThesis: commitment.bankingCase?.mainThesis
        }
      });
    }

    for (const deadline of deadlines) {
      const linkedProcess = deadline.processId ? processes.find((item) => item.id === deadline.processId) : processByCaseId.get(deadline.caseId);

      entries.push({
        id: `prazo-${deadline.id}`,
        kind: "Prazo",
        title: deadline.title,
        preview: compactText(
          `${deadline.client.fullName} | ${deadline.bankingCase.title} | ${deadline.responsibleLabel}`,
          100
        ),
        href: "/agenda/prazos",
        keywords: [
          deadline.title,
          deadline.description,
          deadline.sourceLabel,
          deadline.severity,
          deadline.responsibleLabel,
          deadline.client.fullName,
          deadline.bankingCase.title,
          deadline.bankingCase.mainThesis
        ],
        routeContext: {
          clientId: deadline.clientId,
          caseId: deadline.caseId,
          processId: linkedProcess?.id
        },
        claraContext: {
          clientName: deadline.client.fullName,
          caseTitle: deadline.bankingCase.title,
          processNumber: linkedProcess?.processNumber ?? deadline.bankingCase.processNumber,
          mainThesis: deadline.bankingCase.mainThesis
        }
      });
    }

    for (const update of updates) {
      entries.push({
        id: `andamento-${update.id}`,
        kind: "Andamento",
        title: update.movementType,
        preview: compactText(
          `${update.client.fullName} | ${update.bankingCase.title} | ${update.operationalSummary}`,
          110
        ),
        href: `/andamentos/${update.id}`,
        keywords: [
          update.movementType,
          update.sourceCourt,
          update.sourceLabel,
          update.rawMovement,
          update.operationalSummary,
          update.claraImpactSummary,
          update.claraCaution,
          ...update.claraNextActions,
          update.client.fullName,
          update.bankingCase.title,
          update.judicialProcess.processNumber
        ],
        routeContext: {
          clientId: update.clientId,
          caseId: update.caseId,
          processId: update.processId
        },
        claraContext: {
          clientName: update.client.fullName,
          caseTitle: update.bankingCase.title,
          processNumber: update.judicialProcess.processNumber,
          mainThesis: update.bankingCase.mainThesis
        }
      });
    }

    for (const adversary of adversaries) {
      entries.push({
        id: `adverso-${adversary.id}`,
        kind: "Adverso",
        title: adversary.name,
        preview: compactText(
          `${adversary.bankName} | ${adversary.caseSummary} | ${adversary.attorneyLabel}`,
          100
        ),
        href: "/pessoas/adversos",
        keywords: [
          adversary.name,
          adversary.documentId,
          adversary.bankName,
          adversary.caseSummary,
          adversary.attorneyLabel,
          adversary.contactLabel,
          adversary.status
        ]
      });
    }

    for (const contract of contracts) {
      entries.push({
        id: `contrato-${contract.id}`,
        kind: "Contrato",
        title: contract.contractNumber,
        preview: compactText(
          `${contract.clientName} | ${contract.bankName} | ${contract.statusLabel}`,
          100
        ),
        href: "/crm/contratos",
        keywords: [
          contract.contractNumber,
          contract.clientName,
          contract.bankName,
          contract.statusLabel,
          contract.detail,
          contract.nextAction
        ],
        routeContext: {
          clientId: contract.clientId,
          caseId: contract.caseId ?? undefined
        },
        claraContext: {
          clientName: contract.clientName
        }
      });
    }

    for (const followUp of crmPipeline?.followUps ?? []) {
      entries.push({
        id: `followup-${followUp.id}`,
        kind: "Follow-up",
        title: followUp.title,
        preview: compactText(
          `${followUp.clientName} | ${followUp.detail} | ${followUp.priority}`,
          100
        ),
        href: "/crm/conversao",
        keywords: [
          followUp.title,
          followUp.clientName,
          followUp.detail,
          followUp.priority,
          followUp.nextAction
        ],
        routeContext: {
          clientId: followUp.clientId,
          caseId: followUp.caseId ?? undefined
        },
        claraContext: {
          clientName: followUp.clientName
        }
      });
    }

    for (const publication of officialDiaryPublications) {
      entries.push({
        id: `publicacao-${publication.id}`,
        kind: "Publicacao",
        title: publication.title,
        preview: compactText(
          `${publication.client.fullName} | ${publication.sourceLabel} | ${publication.requiredAction}`,
          110
        ),
        href: "/diario-oficial/publicacoes",
        keywords: [
          publication.title,
          publication.client.fullName,
          publication.bankingCase.title,
          publication.bankingCase.bankName,
          publication.bankingCase.mainThesis,
          publication.judicialProcess.processNumber,
          publication.sourceCourt,
          publication.sourceLabel,
          publication.rawContext,
          publication.bankingSummary,
          publication.requiredAction,
          publication.responsibleLawyer,
          publication.suggestedTaskTitle,
          publication.suggestedTaskDescription,
          publication.publishedAt
        ],
        routeContext: {
          clientId: publication.clientId,
          caseId: publication.caseId,
          processId: publication.processId
        },
        claraContext: {
          clientName: publication.client.fullName,
          caseTitle: publication.bankingCase.title,
          processNumber: publication.judicialProcess.processNumber,
          mainThesis: publication.bankingCase.mainThesis
        }
      });
    }

    for (const archivedPublication of archivedOfficialDiaryPublications) {
      entries.push({
        id: `publicacao-arquivada-${archivedPublication.id}`,
        kind: "Publicacao",
        title: archivedPublication.title,
        preview: compactText(
          `${archivedPublication.client.fullName} | ${archivedPublication.sourceLabel} | Arquivada`,
          110
        ),
        href: "/diario-oficial/lixeira",
        keywords: [
          archivedPublication.title,
          archivedPublication.client.fullName,
          archivedPublication.bankingCase.title,
          archivedPublication.bankingCase.bankName,
          archivedPublication.judicialProcess.processNumber,
          archivedPublication.sourceLabel,
          archivedPublication.requiredAction,
          archivedPublication.archivedAt ?? ""
        ],
        routeContext: {
          clientId: archivedPublication.clientId,
          caseId: archivedPublication.caseId,
          processId: archivedPublication.processId
        },
        claraContext: {
          clientName: archivedPublication.client.fullName,
          caseTitle: archivedPublication.bankingCase.title,
          processNumber: archivedPublication.judicialProcess.processNumber,
          mainThesis: archivedPublication.bankingCase.mainThesis
        }
      });
    }

    for (const keyword of diaryKeywords) {
      entries.push({
        id: `palavra-chave-${normalizeText(keyword)}`,
        kind: "Palavra-chave",
        title: keyword,
        preview: "Palavra-chave derivada de publicacoes reais e monitoramentos internos.",
        href: "/diario-oficial/palavras-chave",
        keywords: [keyword, "diario oficial", "monitoramento", "publicacao", "palavra-chave"]
      });
    }

    for (const lawyerGroup of monitoredLawyerGroups) {
      entries.push({
        id: `advogado-monitorado-${normalizeText(lawyerGroup.lawyer)}`,
        kind: "Advogado",
        title: lawyerGroup.lawyer,
        preview: compactText(
          `${lawyerGroup.processes.length} processo(s) monitorado(s) no Diario Oficial.`,
          100
        ),
        href: "/diario-oficial/advogados",
        keywords: uniq([
          lawyerGroup.lawyer,
          "advogado monitorado",
          "oab",
          ...lawyerGroup.processes.map((processItem) => processItem.processNumber),
          ...lawyerGroup.processes.map((processItem) => processItem.client.fullName),
          ...lawyerGroup.processes.map((processItem) => processItem.bankingCase.title)
        ])
      });
    }

    for (const financialEntry of financialEntries) {
      const linkedClient = financialEntry.clientId ? clientById.get(financialEntry.clientId) : undefined;
      const linkedCase = financialEntry.caseId ? caseById.get(financialEntry.caseId) : undefined;
      const linkedProcess = linkedCase ? processByCaseId.get(linkedCase.id) : undefined;
      const kindLabel = financeKindLabel(financialEntry.kind);
      const statusLabel = financeStatusLabel(financialEntry.status);

      entries.push({
        id: `financeiro-${financialEntry.id}`,
        kind: "Financeiro",
        title: financialEntry.title,
        preview: compactText(
          `${kindLabel} | ${formatFinancialAmount(financialEntry.amount)} | ${statusLabel}`,
          100
        ),
        href: financeRouteForKind(financialEntry.kind),
        keywords: [
          financialEntry.title,
          financialEntry.description,
          financialEntry.accountLabel,
          financialEntry.counterpartyLabel,
          financialEntry.categoryLabel,
          financialEntry.dueDate,
          financialEntry.settledAt ?? "",
          kindLabel,
          statusLabel,
          linkedClient?.fullName ?? "",
          linkedCase?.title ?? ""
        ],
        routeContext: {
          clientId: financialEntry.clientId,
          caseId: financialEntry.caseId,
          processId: linkedProcess?.id
        },
        claraContext: {
          clientName: linkedClient?.fullName,
          caseTitle: linkedCase?.title,
          processNumber: linkedProcess?.processNumber,
          mainThesis: linkedCase?.mainThesis
        }
      });
    }

    if (workspaceSession) {
      entries.push({
        id: `configuracao-tenant-${workspaceSession.workspace.tenant.id}`,
        kind: "Configuracao",
        title: workspaceSession.workspace.tenant.name,
        preview: compactText(
          `${workspaceSession.workspace.tenant.slug} | Plano ${workspaceSession.workspace.tenant.plan} | Papel ${workspaceSession.role}`,
          100
        ),
        href: "/configuracoes",
        keywords: [
          workspaceSession.workspace.tenant.name,
          workspaceSession.workspace.tenant.slug,
          workspaceSession.workspace.tenant.plan,
          workspaceSession.role,
          "tenant",
          "configuracoes",
          "governanca",
          "preferencias"
        ]
      });
    }

    entries.push({
      id: "configuracao-google-agenda",
      kind: "Integracao",
      title: "Google Agenda",
      preview: "Nao conectado | OAuth nao implementado | Sincronizacao indisponivel",
      href: "/configuracoes/integracoes/google-agenda",
      keywords: [
        "google agenda",
        "calendar",
        "oauth",
        "sincronizacao",
        "nao conectado",
        "integracao",
        "configuracoes",
        "agenda"
      ]
    });

    for (const integration of claraIntegrations) {
      entries.push({
        id: `integracao-${integration.sourceId}`,
        kind: "Integracao",
        title: integration.sourceLabel,
        preview: compactText(
          `${integration.scope} | ${integration.status} | ${integration.summary}`,
          110
        ),
        href: "/configuracoes/integracoes",
        keywords: [
          integration.sourceId,
          integration.sourceLabel,
          integration.scope,
          integration.status,
          integration.queryHint,
          integration.summary,
          integration.failureReason ?? "",
          "integracao",
          "clara"
        ]
      });
    }

    entries.push({
      id: "processo-modelo-distribuicao",
      kind: "Processo",
      title: "Modelo de distribuicao processual",
      preview:
        "Exemplo canonico com quadro de distribuicao, acesso ao PJe/TJMG e resumo operacional.",
      href: "/processos/modelo",
      keywords: [
        "processo modelo",
        "distribuicao",
        "pje",
        "tjmg",
        "quadro de distribuicao",
        "estado local da distribuicao"
      ],
      claraContext: {
        distributionStatusLabel: "Distribuicao oficial confirmada",
        distributionDateLabel: "Modelo canonico"
      }
    });

    const seen = new Set<string>();

    return entries.filter((entry) => {
      const key = normalizeText(`${entry.kind}::${entry.title}::${entry.href}`);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  } catch {
    return [];
  }
}
