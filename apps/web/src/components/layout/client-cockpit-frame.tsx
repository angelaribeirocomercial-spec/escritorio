"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DeleteClientButton } from "@/components/layout/delete-client-button";

type ClientCockpitCase = {
  id: string;
  title: string;
  nicheLabel: string;
  status: string;
  stage: string;
  legalRiskLabel: string;
  mainThesis: string;
  suggestedStrategy: string;
};

type ClientCockpitWorkflowStep = {
  id: string;
  title: string;
  detail: string;
  state: "done" | "current" | "pending";
};

type ClientCockpitReadinessItem = {
  id: string;
  label: string;
  detail: string;
  state: "ready" | "blocked";
  blockers: ReadonlyArray<string>;
};

type ClientCockpitDocument = {
  id: string;
  documentType: string;
  fileName: string;
  summary: string;
};

type ClientCockpitGeneratedDocument = {
  kind: "peticao-inicial" | "procuracao" | "contrato-honorarios";
  label: string;
  detail: string;
  href: string;
  statusLabel: string;
};

type ClientCockpitProcessTimelineItem = {
  id: string;
  occurredAt: string;
  title: string;
  description: string;
  source: string;
};

type ClientCockpitProcessUpdate = {
  id: string;
  movementType: string;
  sourceLabel: string;
  occurredAt: string;
  operationalSummary: string;
  criticality: "low" | "medium" | "high";
};

type ClientCockpitRelatedProcess = {
  processNumber: string;
  tribunal: string;
  courtDistrict: string;
  courtName: string;
  statusLabel: string;
  proceduralPhase: string;
  monitoringModeLabel: string;
  processClassLabel: string;
  suggestedCnjSubjectLabel: string;
  urgencyLabel: string;
  actionTypeLabel: string;
  valueInCauseLabel: string;
  distributionDateLabel: string;
  protocolReceiptLabel: string;
  integrationStatusLabel: string;
  officialTimeline: ReadonlyArray<ClientCockpitProcessTimelineItem>;
  linkedUpdates: ReadonlyArray<ClientCockpitProcessUpdate>;
};

type ClientCockpitFrameProps = {
  client: {
    id: string;
    fullName: string;
    documentId: string;
    bankName: string;
    leadSource: string;
    serviceStatusLabel: string;
    address: string;
    notes: string;
    email: string;
    phone: string;
    whatsapp: string;
  };
  activeCase: ClientCockpitCase | null;
  workflow: {
    phaseLabel: string;
    completionLabel: string;
    requiredDocuments: ReadonlyArray<string>;
    missingDocuments: ReadonlyArray<string>;
    blockers: ReadonlyArray<string>;
    steps: ReadonlyArray<ClientCockpitWorkflowStep>;
    readiness: ReadonlyArray<ClientCockpitReadinessItem>;
  } | null;
  caseDocuments: ReadonlyArray<ClientCockpitDocument>;
  generatedDocuments: ReadonlyArray<ClientCockpitGeneratedDocument>;
  nextStepLabel: string;
  nextTaskTitle: string | null;
  relatedClaraRecordsCount: number;
  relatedProcess: ClientCockpitRelatedProcess | null;
  normalizedCaseInsights: ReadonlyArray<string>;
  normalizedClientIaContext: string;
  normalizedTimeline: ReadonlyArray<string>;
  clientCaseCount: number;
  dossierTabs: ReadonlyArray<{
    label: string;
    href: string;
  }>;
  actionLinks: {
    attachDocuments?: string;
    continueClara: string;
    backToClients: string;
    openEditor: string;
    openDistributionHandoff?: string;
    hubClara: string;
    prepareContext: string;
  };
};

type PanelKey = "documents" | "case" | "pieces" | "clara" | "workflow" | "timeline";

const panelLabels: Record<PanelKey, string> = {
  documents: "Documentos",
  case: "Visao Geral",
  pieces: "Pecas",
  clara: "Clara IA",
  workflow: "Workflow",
  timeline: "Timeline"
};

function panelTone(active: boolean) {
  return active
    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
    : "border-white/10 bg-white/[0.04] text-slate-200";
}

function statusTone(state: "ready" | "blocked" | "done" | "current" | "pending" | "received" | "missing") {
  switch (state) {
    case "ready":
    case "done":
    case "received":
      return "text-emerald-200";
    case "current":
      return "text-cyan-100";
    case "blocked":
    case "missing":
      return "text-amber-200";
    default:
      return "text-slate-300";
  }
}

function criticalityTone(criticality: "low" | "medium" | "high") {
  switch (criticality) {
    case "high":
      return "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100";
    case "medium":
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
    default:
      return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  }
}

export function ClientCockpitFrame({
  client,
  activeCase,
  workflow,
  caseDocuments,
  generatedDocuments,
  nextStepLabel,
  nextTaskTitle,
  relatedClaraRecordsCount,
  relatedProcess,
  normalizedCaseInsights,
  normalizedClientIaContext,
  normalizedTimeline,
  clientCaseCount,
  dossierTabs,
  actionLinks
}: ClientCockpitFrameProps) {
  const [activePanel, setActivePanel] = useState<PanelKey | null>(activeCase ? "case" : null);

  const documentsRequired = workflow?.requiredDocuments.length ?? 0;
  const documentsReceived = caseDocuments.length;
  const documentsMissing = workflow?.missingDocuments.length ?? 0;
  const workflowProgress = workflow
    ? `${workflow.steps.filter((step) => step.state === "done").length}/${workflow.steps.length}`
    : "0/0";
  const workflowCurrentStep =
    workflow?.steps.find((step) => step.state === "current")?.title ?? workflow?.phaseLabel ?? "Sem workflow";
  const claraStatus =
    relatedClaraRecordsCount > 0 ? "Pronta" : activeCase ? "Pendente" : "Bloqueada";
  const claraAction =
    relatedClaraRecordsCount > 0
      ? nextStepLabel
      : relatedProcess
        ? `Processo ${relatedProcess.processNumber} pronto para leitura contextual`
        : "Preparar contexto para a proxima tarefa juridica";
  const piecesReady =
    Boolean(workflow) &&
    (workflow?.readiness.length ?? 0) > 0 &&
    workflow?.readiness.every((item) => item.state === "ready");
  const piecesStatus = piecesReady ? "Pronta" : "Bloqueada";
  const piecesActionLabel = piecesReady
    ? "A peca esta liberada para o handoff de distribuicao"
    : "A peca fica retida ate o caso fechar";
  const lastTimelineEvent =
    relatedProcess?.officialTimeline[0]?.title ??
    normalizedTimeline[normalizedTimeline.length - 1] ??
    "Sem eventos registrados";
  const latestProcessUpdate =
    relatedProcess?.linkedUpdates[0]?.operationalSummary ?? "Nenhum andamento oficial consolidado";
  const generatedDocumentsContent = generatedDocuments.length ? (
    <div className="mt-4 flex flex-wrap gap-3">
      {generatedDocuments.map((document) => (
        <Link key={document.kind} className="detail-link-button px-4 py-3 text-sm font-semibold" href={document.href}>
          {document.label}
        </Link>
      ))}
    </div>
  ) : (
    <div className="mt-4 detail-soft-row px-4 py-4 text-sm text-slate-300">
      Nenhum PDF do pacote documental foi gerado para este cliente ainda.
    </div>
  );

  const cards = useMemo(
    () => [
      {
        key: "documents" as const,
        title: "Documentos",
        summary: `${documentsReceived}/${documentsRequired || "?"} base`,
        detail: documentsMissing ? `${documentsMissing} pendente(s)` : "Base documental fechada",
        tone: documentsMissing ? "text-amber-100" : "text-emerald-100"
      },
      {
        key: "case" as const,
        title: "Caso",
        summary: activeCase?.nicheLabel ?? "Sem caso ativo",
        detail: relatedProcess ? `Processo ${relatedProcess.processNumber} vinculado` : `Risco ${activeCase?.legalRiskLabel ?? "A definir"}`,
        tone: activeCase ? "text-white" : "text-slate-300"
      },
      {
        key: "pieces" as const,
        title: "Pecas",
        summary: piecesStatus,
        detail: nextTaskTitle ? `Proxima: ${nextTaskTitle}` : piecesActionLabel,
        tone: piecesStatus === "Bloqueada" ? "text-amber-100" : "text-emerald-100"
      },
      {
        key: "clara" as const,
        title: "Clara",
        summary: `${relatedClaraRecordsCount} insight(s)`,
        detail: claraAction,
        tone: claraStatus === "Bloqueada" ? "text-amber-100" : "text-cyan-100"
      },
      {
        key: "workflow" as const,
        title: "Workflow",
        summary: workflowCurrentStep,
        detail: `Progresso ${workflowProgress}`,
        tone: "text-cyan-100"
      },
      {
        key: "timeline" as const,
        title: "Timeline",
        summary: `${normalizedTimeline.length + (relatedProcess?.officialTimeline.length ?? 0)} evento(s)`,
        detail: lastTimelineEvent,
        tone: "text-slate-100"
      }
    ],
    [
      activeCase,
      claraAction,
      claraStatus,
      documentsMissing,
      documentsReceived,
      documentsRequired,
      lastTimelineEvent,
      nextTaskTitle,
      normalizedTimeline.length,
      piecesStatus,
      piecesActionLabel,
      relatedClaraRecordsCount,
      relatedProcess,
      workflowCurrentStep,
      workflowProgress
    ]
  );

  return (
    <section className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="workspace-kicker">Dossie do caso</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{client.fullName}</h2>
            <p className="text-sm text-slate-400">
              {activeCase?.nicheLabel ?? "Sem caso ativo"} | Status: {activeCase?.status ?? "Pendente"} | Fase:{" "}
              {activeCase?.stage ?? "A definir"} | Docs: {documentsReceived}/{documentsRequired || "?"} | Risco:{" "}
              {activeCase?.legalRiskLabel ?? "A definir"}
            </p>
            <p className="text-sm leading-7 text-slate-300">
              {activeCase ? nextStepLabel : "Abra um novo atendimento para iniciar o dossie central do cliente."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.continueClara}>
              Abrir na Clara
            </Link>
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.backToClients}>
              Voltar para clientes
            </Link>
            <DeleteClientButton clientId={client.id} clientName={client.fullName} caseCount={clientCaseCount} />
          </div>
        </div>

        {dossierTabs.length ? (
          <div className="rounded-[4px] border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="workspace-kicker">Atalhos do dossie</p>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Cliente · caso · contrato · Clara</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {dossierTabs.map((tab) => (
                <Link
                  key={tab.label}
                  className="rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-50"
                  href={tab.href}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        <div
          className="flex flex-wrap gap-2 rounded-[4px] border border-white/10 bg-white/[0.03] p-2"
          role="tablist"
          aria-label="Abas do dossie do caso"
        >
          {cards.map((card) => {
            const active = activePanel === card.key;

            return (
              <button
                key={`tab-${card.key}`}
                aria-selected={active}
                className={`rounded-[4px] border px-4 py-2 text-sm font-semibold transition ${panelTone(active)}`}
                onClick={() => setActivePanel(active ? null : card.key)}
                role="tab"
                type="button"
              >
                {panelLabels[card.key]}
              </button>
            );
          })}
        </div>
        {activePanel ? (
          <section className="detail-panel p-6">
            {activePanel === "documents" ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="workspace-kicker">Documentos</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Checklist documental do caso</h3>
                  </div>
                  <div className="flex gap-2">
                    {actionLinks.attachDocuments ? (
                      <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.attachDocuments}>
                        Anexar documentos
                      </Link>
                    ) : null}
                    <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.continueClara}>
                      Atualizar checklist
                    </Link>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Recebidos: <span className="font-semibold text-white">{documentsReceived}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Pendentes: <span className="font-semibold text-white">{documentsMissing}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Base exigida: <span className="font-semibold text-white">{documentsRequired}</span>
                  </div>
                </div>
                {workflow ? (
                  <div className="grid gap-3">
                    {workflow.requiredDocuments.map((label) => {
                      const missing = workflow.missingDocuments.includes(label);
                      return (
                        <div key={label} className="detail-soft-row flex items-center justify-between gap-3 px-4 py-4 text-sm text-slate-300">
                          <span>{label}</span>
                          <span className={missing ? "text-amber-200" : "text-emerald-200"}>
                            {missing ? "Pendente" : "Recebido"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {caseDocuments.length ? (
                  <div className="grid gap-3">
                    {caseDocuments.map((document) => (
                      <div key={document.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        <p className="font-semibold text-white">{document.documentType}</p>
                        <p className="mt-1 text-slate-400">{document.fileName}</p>
                        <p className="mt-2">{document.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">
                    Nenhum documento foi vinculado ao caso ativo ainda.
                  </div>
                )}
                <div className="detail-subpanel p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                        Pacote documental do cliente
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        Gere e abra os PDFs de peticao inicial, procuracao e contrato de honorarios sob demanda para
                        revisao humana.
                      </p>
                    </div>
                  </div>
                  {generatedDocumentsContent}
                </div>
                {relatedProcess ? (
                  <div className="detail-subpanel p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Vínculo pós-distribuição
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Processo oficial: <span className="font-semibold text-white">{relatedProcess.processNumber}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Comprovante: <span className="font-semibold text-white">{relatedProcess.protocolReceiptLabel}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activePanel === "case" ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="workspace-kicker">Caso</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{activeCase?.title ?? "Sem caso ativo"}</h3>
                  </div>
                  <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                    {activeCase ? `Risco ${activeCase.legalRiskLabel}` : "Crie um caso para ativar o cockpit"}
                  </div>
                </div>
                {activeCase ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Nicho: <span className="font-semibold text-white">{activeCase.nicheLabel}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Status: <span className="font-semibold text-white">{activeCase.status}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Fase atual: <span className="font-semibold text-white">{activeCase.stage}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Proximo passo: <span className="font-semibold text-white">{nextStepLabel}</span>
                    </div>
                  </div>
                ) : null}
                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Resumo do caso</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    {activeCase?.mainThesis ?? "A Area do Cliente ativa quando houver um caso vinculado."}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {activeCase?.suggestedStrategy ?? "Abra um novo atendimento para iniciar o fluxo bancario."}
                  </p>
                </div>
                {relatedProcess ? (
                  <div className="detail-subpanel p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Processo oficial vinculado
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Numero: <span className="font-semibold text-white">{relatedProcess.processNumber}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Tribunal: <span className="font-semibold text-white">{relatedProcess.tribunal}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Comarca: <span className="font-semibold text-white">{relatedProcess.courtDistrict}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Classe judicial: <span className="font-semibold text-white">{relatedProcess.processClassLabel}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Assunto CNJ: <span className="font-semibold text-white">{relatedProcess.suggestedCnjSubjectLabel}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Valor da causa: <span className="font-semibold text-white">{relatedProcess.valueInCauseLabel}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Tipo de acao: <span className="font-semibold text-white">{relatedProcess.actionTypeLabel}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Urgencia: <span className="font-semibold text-white">{relatedProcess.urgencyLabel}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Distribuicao: <span className="font-semibold text-white">{relatedProcess.distributionDateLabel}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activePanel === "pieces" ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="workspace-kicker">Pecas</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Minuta e revisao humana</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.openEditor}>
                      Gerar minuta da peca
                    </Link>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Status: <span className="font-semibold text-white">{piecesStatus}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Motivo: <span className="font-semibold text-white">{nextTaskTitle ?? piecesActionLabel}</span>
                  </div>
                </div>
                <div className="detail-subpanel p-5">
                  <p className="text-sm leading-7 text-slate-200">
                    A peca permanece no cockpit do cliente ate a revisao humana. Quando a base estiver pronta, ela sai
                    daqui para o handoff de distribuicao e o processo passa a existir como registro posterior.
                  </p>
                </div>
                {relatedProcess ? (
                  <div className="detail-subpanel p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Resultado da distribuicao
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Fase processual: <span className="font-semibold text-white">{relatedProcess.proceduralPhase}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Comprovante oficial: <span className="font-semibold text-white">{relatedProcess.protocolReceiptLabel}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
                {workflow?.readiness.length ? (
                  <div className="grid gap-3">
                    {workflow.readiness.map((item) => (
                      <div key={item.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-white">{item.label}</p>
                          <span className={statusTone(item.state)}>{item.state === "ready" ? "Pronta" : "Bloqueada"}</span>
                        </div>
                        <p className="mt-2 leading-6">{item.detail}</p>
                        {item.blockers.length ? (
                          <p className="mt-2 text-slate-400">Bloqueios: {item.blockers.join(" | ")}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {activePanel === "clara" ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="workspace-kicker">Clara</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Contexto e historico da agente</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.hubClara}>
                      Abrir na Clara
                    </Link>
                    <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.continueClara}>
                      Atualizar na Clara
                    </Link>
                    <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.prepareContext}>
                      Preparar contexto
                    </Link>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Registros da Clara: <span className="font-semibold text-white">{relatedClaraRecordsCount}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Insights do caso: <span className="font-semibold text-white">{normalizedCaseInsights.length}</span>
                  </div>
                </div>
                <div className="detail-subpanel p-5">
                  <p className="text-sm leading-7 text-slate-200">{normalizedClientIaContext}</p>
                </div>
                {relatedProcess ? (
                  <div className="detail-subpanel p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Processo em contexto
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Processo: <span className="font-semibold text-white">{relatedProcess.processNumber}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Monitoramento: <span className="font-semibold text-white">{relatedProcess.monitoringModeLabel}</span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">{latestProcessUpdate}</p>
                  </div>
                ) : null}
                {normalizedCaseInsights.length ? (
                  <div className="grid gap-3">
                    {normalizedCaseInsights.slice(0, 3).map((insight) => (
                      <div key={insight} className="detail-soft-row px-4 py-4 text-sm leading-6 text-slate-200">
                        {insight}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {activePanel === "workflow" ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="workspace-kicker">Workflow</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Trilha operacional do caso</h3>
                  </div>
                  <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                    {workflow?.completionLabel ?? "Sem workflow"}
                  </div>
                </div>
                {workflow ? (
                  <div className="grid gap-3">
                    {workflow.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`rounded-[4px] border px-4 py-4 text-sm ${
                          step.state === "done"
                            ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-50"
                            : step.state === "current"
                              ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-50"
                              : "border-white/10 bg-white/[0.03] text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current/20 text-xs font-semibold">
                              {index + 1}
                            </span>
                            <p className="font-semibold">{step.title}</p>
                          </div>
                          <span className="text-[11px] uppercase tracking-[0.16em] opacity-80">
                            {step.state === "done" ? "Concluida" : step.state === "current" ? "Atual" : "Pendente"}
                          </span>
                        </div>
                        <p className="mt-3 leading-6">{step.detail}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {relatedProcess ? (
                  <div className="detail-subpanel p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Pos-distribuicao
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Status do processo: <span className="font-semibold text-white">{relatedProcess.statusLabel}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Andamentos oficiais: <span className="font-semibold text-white">{relatedProcess.linkedUpdates.length}</span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">{relatedProcess.integrationStatusLabel}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activePanel === "timeline" ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="workspace-kicker">Timeline</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Historico operacional do cliente</h3>
                  </div>
                  <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                    {normalizedTimeline.length + (relatedProcess?.officialTimeline.length ?? 0)} evento(s)
                  </div>
                </div>
                <ol className="space-y-3">
                  {normalizedTimeline.map((entry, index) => (
                    <li key={`${entry}-${index}`} className="detail-soft-row flex gap-4 px-4 py-4 text-sm text-slate-300">
                      <span className="detail-step-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span>{entry}</span>
                    </li>
                  ))}
                  {relatedProcess?.officialTimeline.map((entry, index) => (
                    <li key={entry.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-4">
                          <span className="detail-step-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                            {normalizedTimeline.length + index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-white">{entry.title}</p>
                            <p className="mt-1 text-slate-400">
                              {entry.occurredAt} | {entry.source}
                            </p>
                            <p className="mt-3 leading-6 text-slate-300">{entry.description}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                  {relatedProcess?.linkedUpdates.map((update) => (
                    <li key={update.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-white">{update.movementType}</p>
                          <p className="mt-1 text-slate-400">
                            {new Date(update.occurredAt).toLocaleDateString("pt-BR")} | {update.sourceLabel}
                          </p>
                          <p className="mt-3 leading-6 text-slate-300">{update.operationalSummary}</p>
                        </div>
                        <span className={`rounded-[4px] border px-3 py-1 text-xs font-semibold ${criticalityTone(update.criticality)}`}>
                          Andamento
                        </span>
                      </div>
                    </li>
                  ))}
                  {normalizedTimeline.length === 0 &&
                  (relatedProcess?.officialTimeline.length ?? 0) === 0 &&
                  (relatedProcess?.linkedUpdates.length ?? 0) === 0 ? (
                    <li className="detail-soft-row px-4 py-4 text-sm text-slate-400">Nenhum evento registrado ainda.</li>
                  ) : null}
                </ol>
              </div>
            ) : null}
          </section>
        ) : null}
      </section>
    </section>
  );
}

