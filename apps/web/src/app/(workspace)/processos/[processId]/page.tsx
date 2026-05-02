import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceStatePanel } from "@lexia/ui";

import { ClaraContextActions } from "@/components/layout/clara-context-actions";
import { WorkspacePage } from "@/components/layout/workspace-page";
import {
  getClaraRecord,
  getClaraRecordDisplay,
  listClaraRecords
} from "@/server/services/clara/clara-record-store";
import { getClaraProcessArtifact } from "@/server/services/clara/get-clara-artifacts";
import { getProcessById } from "@/server/services/processes/get-processes";
import { getProceduralUpdatesByProcessId } from "@/server/services/procedural-updates/get-procedural-updates";

function statusLabel(status: string) {
  switch (status) {
    case "monitoring":
      return "Em monitoramento";
    case "awaiting-filing":
      return "Aguardando protocolo";
    case "active":
      return "Ativo";
    case "stayed":
      return "Suspenso";
    default:
      return "Encerrado";
  }
}

function criticalityLabel(criticality: string) {
  switch (criticality) {
    case "low":
      return "Baixa";
    case "medium":
      return "Media";
    default:
      return "Alta";
  }
}

function criticalityTone(criticality: string) {
  switch (criticality) {
    case "low":
      return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
    case "medium":
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
    default:
      return "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100";
  }
}

function monitoringModeLabel(mode: string) {
  switch (mode) {
    case "oab":
      return "Monitoramento por OAB";
    case "court":
      return "Monitoramento por tribunal";
    default:
      return "Monitoramento manual";
  }
}

function workflowStatusLabel(status: "created" | "reviewed" | "completed") {
  switch (status) {
    case "reviewed":
      return "Revisado";
    case "completed":
      return "Concluido";
    default:
      return "Criado";
  }
}

export default async function ProcessDetailPage({
  params,
  searchParams
}: {
  params: { processId: string };
  searchParams?: {
    clara?: string;
    record?: string;
    action?: string;
    document?: string;
    client?: string;
    case_context?: string;
  };
}) {
  let processItem = null;

  try {
    processItem = await getProcessById(params.processId);
  } catch {
    return (
      <WorkspacePage
        description="Nao foi possivel abrir o detalhe do processo na base real."
        eyebrow="Processo Judicial"
        metrics={[
          { label: "Estado", value: "Indisponivel" },
          { label: "Fonte", value: "Supabase" },
          { label: "Tenant", value: "Nao resolvido" },
          { label: "Acao", value: "Validar vertical" }
        ]}
        title="Detalhe indisponivel"
      >
        <WorkspaceStatePanel
          actionHref="/processos"
          actionLabel="Voltar para processos"
          description="Valide a configuracao do Supabase, as migrations da vertical de processos e a seed do tenant ativo."
          title="Falha ao carregar processo"
          tone="danger"
        />
      </WorkspacePage>
    );
  }

  if (!processItem) {
    notFound();
  }

  const linkedUpdates = await getProceduralUpdatesByProcessId(params.processId);
  const claraRecord = await getClaraRecord(searchParams?.record);
  const relatedClaraRecords = (await listClaraRecords(80)).filter((record) => {
    if (record.kind !== "process") {
      return false;
    }

    const payload = record.payload as Awaited<ReturnType<typeof getClaraProcessArtifact>>;
    return payload.processLabel === processItem.processNumber;
  });
  const claraArtifact =
    claraRecord?.kind === "process"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraProcessArtifact>>)
      : searchParams?.clara
        ? await getClaraProcessArtifact(
            params.processId,
            searchParams.client,
            searchParams.document,
            false
          )
        : null;
  const claraDisplay = claraArtifact
    ? getClaraRecordDisplay(claraRecord, "Analise carregada nesta tela", claraArtifact.summary)
    : null;

  const metrics = [
    { label: "Status", value: statusLabel(processItem.status) },
    { label: "Fase", value: processItem.proceduralPhase },
    { label: "Documentos", value: `${processItem.bankingCase.linkedDocuments.length}` },
    { label: "Prazos", value: `${processItem.bankingCase.linkedDeadlines.length}` }
  ];

  return (
    <WorkspacePage
      description="Workspace processual para leitura juridica do numero, tribunal, timeline e impacto bancario do caso em curso."
      eyebrow="Processo Judicial"
      metrics={metrics}
      title={processItem.processNumber}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-slate-400">
          {processItem.client.fullName} | {processItem.tribunal} | {processItem.courtDistrict}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href={`/clara?tab=analise&process=${params.processId}&client=${processItem.client.id}#clara-workbench`}
          >
            Continuar na Clara
          </Link>
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href={`/processos/${params.processId}#caso-bancario`}
          >
            Ver contexto do caso
          </Link>
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href="/processos"
          >
            Voltar para processos
          </Link>
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href={`/api/processos/${encodeURIComponent(processItem.processNumber)}/datajud`}
          >
            Consultar DataJud
          </Link>
        </div>
      </div>

      {claraArtifact ? (
        <WorkspaceStatePanel
          actionHref={`/clara?tab=analise&process=${params.processId}&client=${processItem.client.id}#clara-history`}
          actionLabel="Ver historico completo na Clara"
          description={`${claraDisplay?.title}: ${claraDisplay?.detail}`}
          footer={`Status ${claraArtifact.statusLabel} | Etapa ${claraArtifact.stageLabel} | Registro ${claraArtifact.recordId}`}
          title="Resumo ativo da Clara para este processo"
          tone="warning"
        />
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]" id="caso-bancario">
        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Dados processuais</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Tribunal</dt>
              <dd className="mt-1 text-slate-200">{processItem.tribunal}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Comarca</dt>
              <dd className="mt-1 text-slate-200">{processItem.courtDistrict}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Vara</dt>
              <dd className="mt-1 text-slate-200">{processItem.courtName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Responsavel</dt>
              <dd className="mt-1 text-slate-200">{processItem.responsibleLawyer}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Monitoramento</dt>
              <dd className="mt-1 text-slate-200">
                {monitoringModeLabel(processItem.monitoringMode)}
              </dd>
            </div>
          </dl>
        </article>

        <article className="detail-panel-accent p-6">
          <p className="text-sm font-semibold text-white">Contexto bancario do caso</p>
          <div className="detail-subpanel mt-5 p-5">
            <p className="text-lg font-semibold text-white">{processItem.bankingCase.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {processItem.bankingCase.suggestedStrategy}
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Banco reu:{" "}
              <span className="font-semibold text-white">
                {processItem.bankingCase.bankName}
              </span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Tese:{" "}
              <span className="font-semibold text-white">
                {processItem.bankingCase.mainThesis}
              </span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Tipo: <span className="font-semibold text-white">{processItem.bankingCase.claimType}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Responsavel:{" "}
              <span className="font-semibold text-white">{processItem.bankingCase.ownerLabel}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Valor estimado:{" "}
              <span className="font-semibold text-white">
                R$ {processItem.bankingCase.estimatedValue.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Status do caso: <span className="font-semibold text-white">{processItem.bankingCase.status}</span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Documentos do caso</p>
          <ul className="mt-5 space-y-3">
            {processItem.bankingCase.linkedDocuments.map((document) => (
              <li key={document} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                {document}
              </li>
            ))}
          </ul>
        </article>

        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Tarefas do caso</p>
          <ul className="mt-5 space-y-3">
            {processItem.bankingCase.linkedTasks.map((task) => (
              <li key={task} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                {task}
              </li>
            ))}
          </ul>
        </article>

        <article className="detail-panel-accent p-6">
          <p className="text-sm font-semibold text-white">Insights da Clara no caso</p>
          <div className="mt-5 space-y-3">
            {processItem.bankingCase.lexiaInsights.map((insight) => (
              <div key={insight} className="detail-soft-row px-4 py-4 text-sm leading-6 text-slate-200">
                {insight}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Timeline processual</p>
          <ol className="mt-5 space-y-3">
            {processItem.latestTimeline.map((timelineItem, index) => (
              <li key={timelineItem.id} className="detail-soft-row px-4 py-4 text-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <span className="detail-step-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{timelineItem.title}</p>
                      <p className="mt-1 text-slate-400">
                        {timelineItem.occurredAt} | {timelineItem.source}
                      </p>
                      <p className="mt-3 leading-6 text-slate-300">
                        {timelineItem.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-[4px] border px-3 py-1 text-xs font-semibold ${criticalityTone(timelineItem.criticality)}`}
                  >
                    Criticidade {criticalityLabel(timelineItem.criticality)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <div className="grid gap-4">
          <article className="detail-panel p-6">
            <p className="text-sm font-semibold text-white">Historico da Clara neste processo</p>
            <div className="mt-5 space-y-3">
              {relatedClaraRecords.length ? (
                relatedClaraRecords.slice(0, 5).map((record) => {
                  const display = getClaraRecordDisplay(
                    record,
                    "Analise registrada pela Clara",
                    "Sem resumo adicional."
                  );

                  return (
                    <Link
                      key={record.id}
                      className="detail-soft-row block px-4 py-4 text-sm text-slate-300"
                      href={`/processos/${params.processId}?record=${record.id}`}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span className="rounded-[4px] border border-white/10 px-2 py-1 text-slate-300">
                          {workflowStatusLabel(record.workflowStatus)}
                        </span>
                        <span>{record.id}</span>
                      </div>
                      <p className="mt-3 font-semibold text-white">{display.title}</p>
                      <p className="mt-2 leading-6 text-slate-300">{display.detail}</p>
                    </Link>
                  );
                })
              ) : (
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">
                  Nenhum registro da Clara foi persistido neste processo ainda.
                </div>
              )}
            </div>
          </article>

          <article className="detail-panel p-6">
            <p className="text-sm font-semibold text-white">Prazos e marcos</p>
            <ul className="mt-5 space-y-3">
              {processItem.bankingCase.linkedDeadlines.map((deadline) => (
                <li key={deadline} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {deadline}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="detail-panel p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Ultimos andamentos</p>
            <p className="mt-1 text-sm text-slate-400">
              Leitura recente do monitoramento processual vinculada a este numero.
            </p>
          </div>
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href="/andamentos"
          >
            Ver todos
          </Link>
        </div>
        <div className="mt-5 grid gap-3">
          {linkedUpdates.slice(0, 3).map((update) => (
            <Link
              key={update.id}
              className="detail-soft-row px-4 py-4 text-sm transition hover:bg-white/[0.07]"
              href={`/andamentos/${update.id}`}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{update.movementType}</p>
                  <p className="mt-1 text-slate-400">
                    {new Date(update.occurredAt).toLocaleDateString("pt-BR")} |{" "}
                    {update.sourceLabel}
                  </p>
                  <p className="mt-3 leading-6 text-slate-300">
                    {update.operationalSummary}
                  </p>
                </div>
                <span className="rounded-[4px] border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  Clara
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ClaraContextActions
        actionHref={`/clara?tab=analise&process=${params.processId}&client=${processItem.client.id}#clara-workbench`}
        basis={[
          processItem.tribunal,
          processItem.proceduralPhase,
          processItem.bankingCase.mainThesis,
          `${processItem.latestTimeline.length} eventos recentes`,
          monitoringModeLabel(processItem.monitoringMode)
        ]}
        cautionLabel="A leitura da Clara organiza impacto e proxima medida, mas a decisao processual continua sob revisao do advogado responsavel."
        conclusion="Este processo ja tem dados suficientes para leitura contextual da Clara sobre risco imediato, proxima medida e pontos que precisam ser reforcados na conducao juridica."
        eyebrow="Fluxo Clara"
        nextActions={[
          "Resumir impacto do ultimo andamento",
          "Priorizar proxima medida juridica",
          "Cruzar processo com estrategia do caso"
        ]}
        title="Continuar este processo dentro da Clara"
      />
    </WorkspacePage>
  );
}
