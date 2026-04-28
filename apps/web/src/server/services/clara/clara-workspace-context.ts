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
};

export type ClaraWorkspaceClient = Awaited<ReturnType<typeof getClients>>[number];
export type ClaraWorkspaceCase = Awaited<ReturnType<typeof getCases>>[number];
export type ClaraWorkspaceProcess = Awaited<ReturnType<typeof getProcesses>>[number];
export type ClaraWorkspaceDocument = Awaited<ReturnType<typeof getDocuments>>[number];

export type ClaraWorkspaceContext = {
  client: ClaraWorkspaceClient;
  bankingCase: ClaraWorkspaceCase;
  process: ClaraWorkspaceProcess;
  selectedDocument: ClaraWorkspaceDocument;
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
  const bankingCase =
    requestedCase ??
    processCase ??
    documentCase ??
    allCases[0];

  if (!bankingCase) {
    throw new Error("No case is available to build Clara workspace context.");
  }

  const caseDocuments = allDocuments.filter((document) => document.caseId === bankingCase.id);
  const selectedDocument =
    (requestedDocument?.caseId === bankingCase.id ? requestedDocument : null) ??
    caseDocuments[0];

  if (!selectedDocument) {
    throw new Error(`No documents linked to case ${bankingCase.id} are available to build Clara workspace context.`);
  }

  const requestedClient =
    params?.clientId && params.clientId === bankingCase.clientId
      ? await getClientById(params.clientId)
      : null;
  const client =
    requestedClient ??
    selectedDocument.client ??
    requestedProcess?.client ??
    allClients.find((item) => item.id === bankingCase.clientId) ??
    allClients[0];

  if (!client) {
    throw new Error("No client is available to build Clara workspace context.");
  }

  const process =
    (requestedProcess?.caseId === bankingCase.id ? requestedProcess : null) ??
    allProcesses.find((item) => item.caseId === bankingCase.id);

  if (!process) {
    throw new Error(`No process linked to case ${bankingCase.id} is available to build Clara workspace context.`);
  }

  const primaryAnalysis =
    (await getContractAnalysisByDocumentId(selectedDocument.id)) ??
    (
      await Promise.all(
        caseDocuments
          .filter((document) => document.id !== selectedDocument.id)
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
