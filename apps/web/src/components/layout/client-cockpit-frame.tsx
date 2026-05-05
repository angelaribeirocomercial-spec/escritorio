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
  normalizedCaseInsights: ReadonlyArray<string>;
  normalizedClientIaContext: string;
  normalizedTimeline: ReadonlyArray<string>;
  clientCaseCount: number;
  actionLinks: {
    attachDocuments?: string;
    continueClara: string;
    backToClients: string;
    openEditor: string;
    hubClara: string;
    prepareContext: string;
  };
};

type PanelKey = "documents" | "workflow" | "clara" | "case" | "pieces" | "timeline";

function panelTone(active: boolean) {
  return active ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50" : "border-white/10 bg-white/[0.04] text-slate-200";
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
  normalizedCaseInsights,
  normalizedClientIaContext,
  normalizedTimeline,
  clientCaseCount,
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
    workflow?.steps.find((step) => step.state === "current")?.title ?? "Sem workflow";
  const claraStatus =
    relatedClaraRecordsCount > 0 ? "Pronta" : activeCase ? "Pendente" : "Bloqueada";
  const claraAction =
    relatedClaraRecordsCount > 0
      ? nextStepLabel
      : "Preparar contexto para a proxima tarefa juridica";
  const piecesStatus =
    workflow?.readiness.some((item) => item.state === "blocked") ? "Bloqueada" : "Pronta";
  const lastTimelineEvent = normalizedTimeline[normalizedTimeline.length - 1] ?? "Sem eventos registrados";
  const hasGeneratedDocuments = generatedDocuments.length > 0;

  const cards = useMemo(
    () => [
      {
        key: "documents" as const,
        title: "Documentos",
        summary: `${documentsReceived}/${documentsRequired || "?"} base`,
        detail: `${documentsMissing} pendente(s)`,
        tone: documentsMissing ? "text-amber-100" : "text-emerald-100"
      },
      {
        key: "workflow" as const,
        title: "Workflow",
        summary: workflowCurrentStep,
        detail: `Progresso ${workflowProgress}`,
        tone: "text-cyan-100"
      },
      {
        key: "clara" as const,
        title: "Clara",
        summary: `${relatedClaraRecordsCount} insight(s)`,
        detail: claraAction,
        tone: claraStatus === "Bloqueada" ? "text-amber-100" : "text-cyan-100"
      },
      {
        key: "case" as const,
        title: "Caso",
        summary: activeCase?.nicheLabel ?? "Sem caso ativo",
        detail: activeCase ? `Risco ${activeCase.legalRiskLabel}` : "Abrir novo atendimento",
        tone: activeCase ? "text-white" : "text-slate-300"
      },
      {
        key: "pieces" as const,
        title: "Pecas",
        summary: piecesStatus,
        detail: nextTaskTitle ? `Proxima: ${nextTaskTitle}` : "Minuta em espera",
        tone: piecesStatus === "Bloqueada" ? "text-amber-100" : "text-emerald-100"
      },
      {
        key: "timeline" as const,
        title: "Timeline",
        summary: `${normalizedTimeline.length} evento(s)`,
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
      workflowCurrentStep,
      workflowProgress,
      relatedClaraRecordsCount
    ]
  );

  const generatedDocumentsContent = hasGeneratedDocuments ? (
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

  return (
    <section className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl space-y-2">
                <p className="workspace-kicker">Clientes</p>
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {client.fullName}
                </h2>
                <p className="text-sm text-slate-400">
                  {activeCase?.nicheLabel ?? "Sem caso ativo"} | Status: {activeCase?.status ?? "Pendente"} | Fase:{" "}
                  {activeCase?.stage ?? "A definir"} | Docs: {documentsReceived}/{documentsRequired || "?"} | Risco:{" "}
                  {activeCase?.legalRiskLabel ?? "A definir"}
                </p>
                <p className="text-sm leading-7 text-slate-300">
                  {activeCase ? nextStepLabel : "Abra um novo atendimento para iniciar o cockpit do cliente."}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                {actionLinks.attachDocuments ? (
                  <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.attachDocuments}>
                    Anexar documentos
                  </Link>
                ) : null}
                <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.continueClara}>
                  Continuar na Clara
                </Link>
                <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.backToClients}>
                  Voltar para clientes
                </Link>
                <DeleteClientButton clientId={client.id} clientName={client.fullName} caseCount={clientCaseCount} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => {
                const active = activePanel === card.key;

                return (
                  <button
                    key={card.key}
                    className={`workspace-soft-card rounded-[4px] border p-4 text-left transition hover:bg-white/[0.06] ${panelTone(
                      active
                    )}`}
                    onClick={() => setActivePanel(active ? null : card.key)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${card.tone}`}>{card.title}</p>
                        <p className="mt-2 text-sm font-semibold text-white">{card.summary}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{card.detail}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                        {active ? "Aberto" : "Abrir"}
                      </span>
                    </div>
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
                              <span className={missing ? "text-amber-200" : "text-emerald-200"}>{missing ? "Pendente" : "Recebido"}</span>
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
                        {workflow?.phaseLabel ?? "Sem workflow"}
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
                          Hub Clara
                        </Link>
                        <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.continueClara}>
                          Continuar na Clara
                        </Link>
                        <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.prepareContext}>
                          Preparar contexto
                        </Link>
                      </div>
                    </div>
                    <div className="detail-soft-row border border-cyan-300/15 bg-cyan-300/5 px-4 py-4 text-sm text-slate-300">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                        Pacote documental do cliente
                      </p>
                      <p className="mt-2 leading-6 text-slate-200">
                        Aqui ficam os PDFs prontos para revisao humana: peticao inicial, procuracao e contrato de honorarios.
                      </p>
                      {generatedDocumentsContent}
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
                      <p className="mt-3 text-sm leading-7 text-slate-200">{activeCase?.mainThesis ?? "A Area do Cliente ativa quando houver um caso vinculado."}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{activeCase?.suggestedStrategy ?? "Abra um novo atendimento para iniciar o fluxo bancario."}</p>
                    </div>
                  </div>
                ) : null}

                {activePanel === "pieces" ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="workspace-kicker">Peças</p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">Minuta e revisão humana</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.openEditor}>
                          Gerar minuta da peça
                        </Link>
                        <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.openEditor}>
                          Enviar para revisão humana
                        </Link>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Status: <span className="font-semibold text-white">{piecesStatus}</span>
                      </div>
                      <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        Motivo: <span className="font-semibold text-white">{nextTaskTitle ?? "Dependente do workflow atual"}</span>
                      </div>
                    </div>
                    <div className="detail-subpanel p-5">
                      <p className="text-sm leading-7 text-slate-200">
                        A peça fica acessível no editor formal quando o workflow do caso e a base documental forem suficientes para sair da leitura operacional.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Documentos gerados em PDF
                        </p>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                          Pacote documental do cliente
                        </span>
                      </div>
                      {generatedDocuments.length ? (
                        <div className="grid gap-3">
                          {generatedDocuments.map((document) => (
                            <div key={document.kind} className="detail-soft-row flex items-center justify-between gap-3 px-4 py-4 text-sm text-slate-300">
                              <div className="min-w-0">
                                <p className="font-semibold text-white">{document.label}</p>
                                <p className="mt-1 text-sm leading-6 text-slate-400">{document.detail}</p>
                              </div>
                              <Link className="detail-link-button shrink-0 px-4 py-3 text-sm font-semibold" href={document.href}>
                                {document.statusLabel}
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">
                          Nenhum PDF gerado ainda para este caso.
                        </div>
                      )}
                    </div>
                    {workflow?.readiness.length ? (
                      <div className="grid gap-3">
                        {workflow.readiness.map((item) => (
                          <div key={item.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-white">{item.label}</p>
                              <span className={item.state === "ready" ? "text-emerald-200" : "text-amber-200"}>
                                {item.state === "ready" ? "Pronta" : "Bloqueada"}
                              </span>
                            </div>
                            <p className="mt-2 leading-6">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {activePanel === "timeline" ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="workspace-kicker">Timeline</p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">Histórico operacional do cliente</h3>
                      </div>
                      <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                        {normalizedTimeline.length} evento(s)
                      </div>
                    </div>
                    <ol className="space-y-3">
                      {normalizedTimeline.length ? (
                        normalizedTimeline.map((entry, index) => (
                          <li key={entry} className="detail-soft-row flex gap-4 px-4 py-4 text-sm text-slate-300">
                            <span className="detail-step-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                              {index + 1}
                            </span>
                            <span>{entry}</span>
                          </li>
                        ))
                      ) : (
                        <li className="detail-soft-row px-4 py-4 text-sm text-slate-400">Nenhum evento registrado ainda.</li>
                      )}
                    </ol>
                  </div>
                ) : null}
              </section>
            ) : null}
      </section>
    </section>
  );
}
