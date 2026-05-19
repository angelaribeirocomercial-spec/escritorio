import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import { getDataJudProcessConsultation } from "@/server/services/datajud/get-datajud-process";
import { getProcessById } from "@/server/services/processes/get-processes";

function statusLabel(status: string) {
  switch (status) {
    case "consulted":
      return "Consulta realizada";
    case "failed":
      return "Consulta falhou";
    default:
      return "Consulta indisponivel";
  }
}

function statusTone(status: string) {
  switch (status) {
    case "consulted":
      return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
    case "failed":
      return "border-rose-300/20 bg-rose-300/10 text-rose-100";
    default:
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  }
}

export default async function ProcessDataJudPage({
  params
}: {
  params: { processId: string };
}) {
  const processItem = await getProcessById(params.processId).catch(() => null);

  if (!processItem) {
    return (
      <WorkspaceStatePanel
        actionHref="/processos"
        actionLabel="Voltar para processos"
        description="Nao foi possivel localizar o processo para consultar o DataJud."
        title="Processo indisponivel"
        tone="danger"
      />
    );
  }

  const consultation = await getDataJudProcessConsultation(processItem.processNumber).catch((error) => ({
    status: "failed" as const,
    tribunalAlias: "alias-desconhecido",
    tribunalLabel: processItem.tribunal,
    processNumber: processItem.processNumber,
    processNumberDigits: processItem.processNumber.replace(/\D/g, ""),
    endpoint: "nao-disponivel",
    summary: "Nao foi possivel concluir a consulta DataJud.",
    query: {
      size: 1,
      query: {
        bool: {
          must: [{ term: { numeroProcesso: processItem.processNumber.replace(/\D/g, "") } }]
        }
      }
    },
    sourceTrace: {
      origem_interna: [`Processo ${processItem.processNumber}`],
      origem_documental: [],
      origem_api: [],
      inferencia_controlada: [error instanceof Error ? error.message : "Falha desconhecida."]
    },
    hits: [],
    failureReason: error instanceof Error ? error.message : "Falha desconhecida."
  }));

  const hasHits = consultation.hits.length > 0;
  const configured = Boolean(globalThis.process.env.DATAJUD_API_KEY);
  const consultedAt = consultation.status === "consulted" ? consultation.consultedAt : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mj-model-title">Consulta DataJud</p>
          <p className="mj-model-subtitle">
            {processItem.processNumber} | {consultation.tribunalLabel}
          </p>
        </div>
        <Link className="mj-model-button-gray inline-flex items-center justify-center" href={`/processos/${processItem.id}`}>
          Voltar ao processo
        </Link>
      </div>

      <section className="mj-model-panel px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(consultation.status)}`}>
              {statusLabel(consultation.status)}
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white">{processItem.processNumber}</h1>
            <p className="mt-2 text-sm text-slate-400">{consultation.summary}</p>
          </div>
          <div className="text-sm text-slate-400">
            <p>Tribunal: <span className="text-slate-200">{consultation.tribunalLabel}</span></p>
            <p className="mt-1">Alias: <span className="text-slate-200">{consultation.tribunalAlias}</span></p>
            <p className="mt-1">Endpoint: <span className="text-slate-200">{consultation.endpoint}</span></p>
          </div>
        </div>
      </section>

      {!configured ? (
        <WorkspaceStatePanel
          actionHref="/processos"
          actionLabel="Voltar para processos"
          description="Configure DATAJUD_API_KEY no ambiente para habilitar a consulta real."
          title="Consulta controlada"
          tone="warning"
        />
      ) : null}

      {consultation.failureReason ? (
        <WorkspaceStatePanel
          actionHref="/processos"
          actionLabel="Voltar para processos"
          description={consultation.failureReason}
          title="Consulta indisponivel"
          tone="warning"
        />
      ) : null}

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="mj-model-panel px-4 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-400">Trilha de origem</p>
          <div className="mt-3 grid gap-3 text-[13px] text-slate-300">
            <div className="mj-model-gridline rounded-[4px] border px-3 py-3">
              <p className="font-semibold text-slate-100">Origem interna</p>
              <p className="mt-2 text-slate-400">
                {consultation.sourceTrace.origem_interna.length ? consultation.sourceTrace.origem_interna.join(" | ") : "Sem itens"}
              </p>
            </div>
            <div className="mj-model-gridline rounded-[4px] border px-3 py-3">
              <p className="font-semibold text-slate-100">Origem documental</p>
              <p className="mt-2 text-slate-400">
                {consultation.sourceTrace.origem_documental.length
                  ? consultation.sourceTrace.origem_documental.join(" | ")
                  : "Sem itens"}
              </p>
            </div>
            <div className="mj-model-gridline rounded-[4px] border px-3 py-3">
              <p className="font-semibold text-slate-100">Origem API</p>
              <p className="mt-2 text-slate-400">
                {consultation.sourceTrace.origem_api.length ? consultation.sourceTrace.origem_api.join(" | ") : "Sem itens"}
              </p>
            </div>
            <div className="mj-model-gridline rounded-[4px] border px-3 py-3">
              <p className="font-semibold text-slate-100">Inferencia controlada</p>
              <p className="mt-2 text-slate-400">
                {consultation.sourceTrace.inferencia_controlada.length
                  ? consultation.sourceTrace.inferencia_controlada.join(" | ")
                  : "Sem itens"}
              </p>
            </div>
          </div>
        </div>

        <div className="mj-model-panel px-4 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-400">Parametros da consulta</p>
          <div className="mt-3 grid gap-3 text-[13px] text-slate-300">
            <p>Numero normalizado: {consultation.processNumberDigits}</p>
            <p>Consulta em: {consultedAt ?? "Nao consultado no ambiente"}</p>
            <p>Query size: {consultation.query.size}</p>
            <p>HITS: {consultation.hits.length}</p>
          </div>
        </div>
      </section>

      <section className="mj-model-panel px-4 py-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-400">Resultados</p>
        <div className="mt-3 grid gap-3">
          {hasHits ? (
            consultation.hits.map((hit) => (
              <div key={hit.id} className="mj-model-gridline rounded-[4px] border px-3 py-3 text-[13px] text-slate-300">
                <p className="font-semibold text-slate-100">{hit.numeroProcesso}</p>
                <p className="mt-1 text-slate-400">
                  {hit.tribunal} | {hit.grau ?? "Grau nao informado"}
                </p>
                <p className="mt-2 text-slate-300">ID: {hit.id}</p>
                {hit.dataAjuizamento ? <p className="mt-1 text-slate-400">Data de ajuizamento: {hit.dataAjuizamento}</p> : null}
              </div>
            ))
          ) : (
            <p className="text-[13px] text-slate-400">Nenhum resultado retornado pela consulta controlada.</p>
          )}
        </div>
      </section>
    </div>
  );
}
