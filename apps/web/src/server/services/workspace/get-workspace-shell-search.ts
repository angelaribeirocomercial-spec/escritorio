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

export async function getWorkspaceShellSearchEntries(): Promise<WorkspaceSearchEntry[]> {
  const [clients, processes, documents] = await Promise.all([
    getClients(),
    getProcesses(),
    getDocuments()
  ]);

  const entries: WorkspaceSearchEntry[] = [];

  for (const client of clients) {
    entries.push({
      id: `cliente-${client.id}`,
      kind: "Cliente",
      title: client.fullName,
      preview: compactText(`${client.bankName} | ${client.serviceStatus} | ${client.feesLabel}`, 90),
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
        client.iaContext
      ]
    });
  }

  for (const processItem of processes) {
    entries.push({
      id: `processo-${processItem.id}`,
      kind: "Processo",
      title: processItem.processNumber,
      preview: compactText(
        `${processItem.client.fullName} | ${processItem.bankingCase.title} | ${processItem.tribunal}`,
        100
      ),
      href: `/processos/${processItem.id}`,
      keywords: [
        processItem.processNumber,
        processItem.tribunal,
        processItem.courtDistrict,
        processItem.courtName,
        processItem.proceduralPhase,
        processItem.responsibleLawyer,
        processItem.client.fullName,
        processItem.bankingCase.title,
        processItem.bankingCase.mainThesis,
        processItem.bankingCase.suggestedStrategy
      ]
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
        processItem.tribunal
      ]
    });
  }

  for (const document of documents) {
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
        document.tags.join(" ")
      ]
    });
  }

  const seen = new Set<string>();

  return entries.filter((entry) => {
    const key = normalizeText(`${entry.kind}::${entry.title}::${entry.href}`);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
