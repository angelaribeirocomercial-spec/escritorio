import type { ClaraSourceAdapterResult } from "@/server/services/clara/clara-source-adapters";
import type { JurisprudenceConsultationResult } from "@/server/services/jurisprudence/get-jurisprudence-consultation";

export type ClaraConsultationLogEntry = {
  id: string;
  sourceLabel: string;
  status: "consulted" | "not_consulted" | "failed" | "unavailable";
  loggedAt: string;
  scope: string;
  queryHint: string;
  confidenceLabel: "Alta" | "Media" | "Baixa";
};

export function buildClaraConsultationLog(params: {
  sourceAdapters: ClaraSourceAdapterResult[];
  jurisprudence?: JurisprudenceConsultationResult | null;
}) {
  const adapterEntries: ClaraConsultationLogEntry[] = params.sourceAdapters.map((adapter) => ({
    id: adapter.sourceId,
    sourceLabel: adapter.sourceLabel,
    status: adapter.status,
    loggedAt: adapter.consultedAt ?? new Date().toISOString(),
    scope: adapter.scope,
    queryHint: adapter.queryHint,
    confidenceLabel:
      adapter.status === "consulted"
        ? "Alta"
        : adapter.status === "failed"
          ? "Baixa"
          : "Media"
  }));

  const jurisprudenceEntry: ClaraConsultationLogEntry[] = params.jurisprudence
    ? [
        {
          id: `${params.jurisprudence.sourceId}-${params.jurisprudence.normalizedQuery}`,
          sourceLabel: params.jurisprudence.sourceLabel,
          status: params.jurisprudence.status,
          loggedAt: params.jurisprudence.loggedAt,
          scope: params.jurisprudence.scope,
          queryHint: params.jurisprudence.queryHint,
          confidenceLabel: params.jurisprudence.consulted ? "Alta" : "Baixa"
        }
      ]
    : [];

  return [...adapterEntries, ...jurisprudenceEntry];
}
