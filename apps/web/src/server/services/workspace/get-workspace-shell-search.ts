import { getBankingCaseWorkflow } from "@/server/services/cases/get-banking-case-workflow";
import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";
import { getDocuments } from "@/server/services/documents/get-documents";
import { getProcesses } from "@/server/services/processes/get-processes";

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
    const [clientsResult, casesResult, processesResult, documentsResult] = await Promise.allSettled([
      getClients(),
      getCases(),
      getProcesses(),
      getDocuments()
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

    const clients = clientsResult.status === "fulfilled" ? clientsResult.value : [];
    const cases = casesResult.status === "fulfilled" ? casesResult.value : [];
    const processes = processesResult.status === "fulfilled" ? processesResult.value : [];
    const documents = documentsResult.status === "fulfilled" ? documentsResult.value : [];

    const processByCaseId = new Map(processes.map((processItem) => [processItem.caseId, processItem]));
    const documentsByCaseId = documents.reduce<Map<string, typeof documents>>((accumulator, document) => {
      const items = accumulator.get(document.caseId);

      if (items) {
        items.push(document);
      } else {
        accumulator.set(document.caseId, [document]);
      }

      return accumulator;
    }, new Map());

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
      const caseHref = `/pessoas/clientes/${caseItem.clientId}?case=${caseItem.id}`;

      entries.push({
        id: `caso-${caseItem.id}`,
        kind: "Caso",
        title: caseItem.title,
        preview: compactText(
          `${caseItem.client.fullName} | ${caseItem.mainThesis} | ${distributionStatusLabel}`,
          100
        ),
        href: caseHref,
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
