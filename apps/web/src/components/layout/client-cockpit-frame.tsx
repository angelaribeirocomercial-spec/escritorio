"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
  nextStepLabel: string;
  nextTaskTitle: string | null;
  relatedClaraRecordsCount: number;
  normalizedCaseInsights: ReadonlyArray<string>;
  normalizedClientIaContext: string;
  normalizedTimeline: ReadonlyArray<string>;
  actionLinks: {
    attachDocuments?: string;
    continueClara: string;
    backToClients: string;
    openEditor: string;
    hubClara: string;
    prepareContext: string;
  };
  children: React.ReactNode;
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
  nextStepLabel,
  nextTaskTitle,
  relatedClaraRecordsCount,
  normalizedCaseInsights,
  normalizedClientIaContext,
  normalizedTimeline,
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
      </section>
    </section>
  );
}
