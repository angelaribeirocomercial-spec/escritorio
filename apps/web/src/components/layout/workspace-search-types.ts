export type WorkspaceSearchEntryKind = "Cliente" | "Processo" | "Documento" | "Tese";

export type WorkspaceSearchEntry = {
  id: string;
  kind: WorkspaceSearchEntryKind;
  title: string;
  preview: string;
  href: string;
  keywords: string[];
};
