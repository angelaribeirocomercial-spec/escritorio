import {
  getClaraSourceAdapters,
  type ClaraSourceAdapterId,
  type ClaraSourceAdapterResult
} from "@/server/services/clara/clara-source-adapters";

export type ClaraIntegrationItem = {
  sourceId: ClaraSourceAdapterId;
  sourceLabel: string;
  scope: string;
  status: ClaraSourceAdapterResult["status"];
  consulted: boolean;
  queryHint: string;
  summary: string;
  failureReason?: string;
};

export async function getClaraIntegrations() {
  const adapters = await getClaraSourceAdapters();

  return adapters.map((adapter): ClaraIntegrationItem => ({
    sourceId: adapter.sourceId,
    sourceLabel: adapter.sourceLabel,
    scope: adapter.scope,
    status: adapter.status,
    consulted: adapter.consulted,
    queryHint: adapter.queryHint,
    summary:
      adapter.status === "consulted"
        ? "Adapter consultado e pronto para trilha de auditoria."
        : adapter.status === "unavailable"
          ? "Adapter indisponivel na execucao simulada."
          : adapter.status === "failed"
            ? "Consulta falhou e o motivo foi registrado."
            : "Adapter preparado, mas ainda nao consultado.",
    failureReason: adapter.failureReason
  }));
}
