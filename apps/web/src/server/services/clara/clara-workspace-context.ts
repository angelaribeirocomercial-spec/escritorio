import { type ContractAnalysisRecord } from "@lexia/domain";

import { getCaseById, getCases } from "@/server/services/cases/get-cases";
import { getClientById, getClients } from "@/server/services/clients/get-clients";
import { getContractAnalysisByDocumentId } from "@/server/services/contract-analysis/get-contract-analysis";
import { getDocumentById, getDocuments } from "@/server/services/documents/get-documents";
import { getProcessById, getProcesses } from "@/server/services/processes/get-processes";

type WorkspaceContextParams = {
  clientId?: string;
  caseId?: string;
  processId?: string;
  documentId?: string;
  strict?: boolean;
};

export type ClaraWorkspaceClient = Awaited<ReturnType<typeof getClients>>[number];
export type ClaraWorkspaceCase = Awaited<ReturnType<typeof getCases>>[number];
export type ClaraWorkspaceProcess = Awaited<ReturnType<typeof getProcesses>>[number];
export type ClaraWorkspaceDocument = Awaited<ReturnType<typeof getDocuments>>[number];

export type ClaraWorkspaceContext = {
  client: ClaraWorkspaceClient;
  bankingCase: ClaraWorkspaceCase;
  process: ClaraWorkspaceProcess | null;
  selectedDocument: ClaraWorkspaceDocument | null;
  caseDocuments: ClaraWorkspaceDocument[];
  primaryAnalysis: ContractAnalysisRecord | null;
};

export async function resolveClaraWorkspaceContext(
  params?: WorkspaceContextParams
): Promise<ClaraWorkspaceContext> {
  const [allCases, allClients, allDocuments, allProcesses, requestedCase, requestedProcess, requestedDocument] =
    await Promise.all([
      getCases(),
      getClients(),
      getDocuments(),
      getProcesses(),
      params?.caseId ? getCaseById(params.caseId) : Promise.resolve(null),
      params?.processId ? getProcessById(params.processId) : Promise.resolve(null),
      params?.documentId ? getDocumentById(params.documentId) : Promise.resolve(null)
    ]);

  const processCase =
    requestedProcess ? allCases.find((item) => item.id === requestedProcess.caseId) ?? null : null;
  const documentCase =
    requestedDocument ? allCases.find((item) => item.id === requestedDocument.caseId) ?? null : null;
  const requestedClient =
    params?.clientId ? await getClientById(params.clientId) : null;

  if (params?.strict && (!params.clientId || !requestedClient)) {
    throw new Error("Clara exige clientId valido para montar contexto contextual minimo.");
  }

  const bankingCase =
    requestedCase ??
    processCase ??
    documentCase ??
    allCases[0];

  if (!bankingCase) {
    throw new Error("No case is available to build Clara workspace context.");
  }

  if (params?.strict && (!params.caseId || bankingCase.id !== params.caseId)) {
    throw new Error("Clara exige caseId valido e coerente com o contexto selecionado.");
  }

  if (params?.strict && requestedClient && requestedClient.id !== bankingCase.clientId) {
    throw new Error("Clara exige clientId e caseId do mesmo contexto real do escritorio.");
  }

  const caseDocuments = allDocuments.filter((document) => document.caseId === bankingCase.id);
  const selectedDocument =
    (requestedDocument?.caseId === bankingCase.id ? requestedDocument : null) ??
    caseDocuments[0] ??
    null;

  const client =
    (requestedClient?.id === bankingCase.clientId ? requestedClient : null) ??
    selectedDocument.client ??
    requestedProcess?.client ??
    allClients.find((item) => item.id === bankingCase.clientId) ??
    allClients[0];

  if (!client) {
    throw new Error("No client is available to build Clara workspace context.");
  }

  const process =
    (requestedProcess?.caseId === bankingCase.id ? requestedProcess : null) ??
    allProcesses.find((item) => item.caseId === bankingCase.id) ??
    null;

  const primaryAnalysis =
    (selectedDocument ? await getContractAnalysisByDocumentId(selectedDocument.id) : null) ??
    (
      await Promise.all(
        caseDocuments
          .filter((document) => document.id !== selectedDocument?.id)
          .map((document) => getContractAnalysisByDocumentId(document.id))
      )
    ).find((analysis) => analysis !== null) ??
    null;

  return {
    client,
    bankingCase,
    process,
    selectedDocument,
    caseDocuments,
    primaryAnalysis
  };
}
