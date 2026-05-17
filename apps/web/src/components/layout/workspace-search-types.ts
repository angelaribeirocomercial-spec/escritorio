export type WorkspaceSearchEntryKind = "Cliente" | "Caso" | "Processo" | "Documento" | "Tese";

export type WorkspaceSearchEntryRouteContext = {
  clientId?: string;
  caseId?: string;
  processId?: string;
  documentId?: string;
};

export type WorkspaceSearchEntryClaraContext = {
  clientName?: string;
  caseTitle?: string;
  processNumber?: string;
  mainThesis?: string;
  distributionStatusLabel?: string;
  distributionDateLabel?: string;
  missingDocuments?: readonly string[];
  availableDocuments?: readonly string[];
};

export type WorkspaceSearchEntry = {
  id: string;
  kind: WorkspaceSearchEntryKind;
  title: string;
  preview: string;
  href: string;
  keywords: string[];
  routeContext?: WorkspaceSearchEntryRouteContext;
  claraContext?: WorkspaceSearchEntryClaraContext;
};
