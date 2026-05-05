"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ProcessCockpitFrameProps = {
  process: {
    id: string;
    processNumber: string;
    clientName: string;
    clientDocumentId: string;
    tribunal: string;
    courtDistrict: string;
    courtName: string;
    proceduralPhase: string;
    statusLabel: string;
    monitoringModeLabel: string;
    responsibleLawyer: string;
  };
  bankingCase: {
    title: string;
    bankName: string;
    claimType: string;
    nicheLabel: string;
    status: string;
    stage: string;
    legalRiskLabel: string;
    amountInDispute: number;
    estimatedValue: number;
    mainThesis: string;
    suggestedStrategy: string;
    ownerLabel: string;
    workflowPhaseLabel: string;
    workflowCompletionLabel: string;
    workflowCurrentStep: string;
    workflowSteps: ReadonlyArray<{
      id: string;
      title: string;
      detail: string;
      state: "done" | "current" | "pending";
    }>;
    workflowReadiness: ReadonlyArray<{
      id: string;
      label: string;
      state: "ready" | "blocked";
      detail: string;
      blockers: ReadonlyArray<string>;
    }>;
    checklistCompletionLabel: string;
    requiredDocuments: ReadonlyArray<string>;
    missingDocuments: ReadonlyArray<string>;
    checklistItems: ReadonlyArray<{
      id: string;
      label: string;
      state: "received" | "missing";
      required: boolean;
    }>;
    linkedDocuments: ReadonlyArray<string>;
    linkedTasks: ReadonlyArray<string>;
    linkedDeadlines: ReadonlyArray<string>;
    lexiaInsights: ReadonlyArray<string>;
  };
  latestTimeline: ReadonlyArray<{
    id: string;
    occurredAt: string;
    title: string;
    description: string;
    source: string;
    criticality: "low" | "medium" | "high";
  }>;
  relatedClaraRecordsCount: number;
  claraSummary: {
    title: string;
    detail: string;
    footer?: string;
  } | null;
  claraHistoryItems: ReadonlyArray<{
    id: string;
    title: string;
    detail: string;
    workflowStatusLabel: string;
  }>;
  linkedUpdates: ReadonlyArray<{
    id: string;
    movementType: string;
    sourceLabel: string;
    occurredAt: string;
    operationalSummary: string;
    criticality: "low" | "medium" | "high";
  }>;
  actionLinks: {
    continueClara: string;
    backToProcesses: string;
    openDataJud: string;
    openClaraHistory: string;
    openOabMonitoring: string;
    openOfficialSystem?: string;
  };
  dataJudLabel: string;
  distributionSummary: {
    adversePartyLabel: string;
    processClassLabel: string;
    suggestedCnjSubjectLabel: string;
    competenceLabel: string;
    valueInCauseLabel: string;
    actionTypeLabel: string;
    urgencyLabel: string;
    distributedProcessNumber: string;
    distributionDateLabel: string;
    protocolReceiptLabel: string;
    distributionStatusLabel: string;
    integrationStatusLabel: string;
    officialSystemLabel: string | null;
  };
};

type PanelKey = "case" | "workflow" | "documents" | "clara" | "timeline" | "updates";

function panelTone(active: boolean) {
  return active
    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
    : "border-white/10 bg-white/[0.04] text-slate-200";
}

function statusTone(state: string) {
  switch (state) {
    case "done":
    case "ready":
      return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
    case "current":
      return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
    case "blocked":
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
    default:
      return "border-white/10 bg-white/[0.04] text-slate-200";
  }
}

function criticalityTone(criticality: string) {
  switch (criticality) {
    case "high":
      return "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100";
    case "medium":
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
    default:
      return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  }
}

export function ProcessCockpitFrame({
  process,
  bankingCase,
  latestTimeline,
  relatedClaraRecordsCount,
  claraSummary,
  claraHistoryItems,
  linkedUpdates,
  actionLinks,
  dataJudLabel,
  distributionSummary
}: ProcessCockpitFrameProps) {
  const [activePanel, setActivePanel] = useState<PanelKey | null>("case");

  const workflowProgress = `${bankingCase.workflowSteps.filter((step) => step.state === "done").length}/${bankingCase.workflowSteps.length || 0}`;
  const workflowCurrentStep =
    bankingCase.workflowSteps.find((step) => step.state === "current")?.title ?? bankingCase.workflowCurrentStep;
  const lastTimelineEvent =
    latestTimeline[latestTimeline.length - 1]?.title ?? "Sem eventos processuais recentes";
  const latestUpdate = linkedUpdates[0]?.operationalSummary ?? "Nenhum andamento recente consolidado";
  const documentsReceived = bankingCase.linkedDocuments.length;
  const documentsPending = bankingCase.missingDocuments.length;
  const claraStatus =
    relatedClaraRecordsCount > 0 ? "Pronta" : bankingCase.status === "active" ? "Pendente" : "Bloqueada";
  const canonicalFlowCards = [
    {
      id: "case",
      title: "Caso",
      detail: `${bankingCase.title} | origem do processo`
    },
    {
      id: "handoff",
      title: "Handoff de distribuicao",
      detail: "A superficie oficial concentra os acessos do ato humano de distribuicao."
    },
    {
      id: "process",
      title: "Processo",
      detail: `${process.processNumber} | ${process.proceduralPhase}`
    }
  ] as const;

  const cards = useMemo(
    () => [
      {
        key: "case" as const,
        title: "Caso",
        summary: bankingCase.nicheLabel,
        detail: `${bankingCase.bankName} | Risco ${bankingCase.legalRiskLabel}`
      },
      {
        key: "workflow" as const,
        title: "Workflow",
        summary: workflowCurrentStep,
        detail: `Progresso ${workflowProgress}`
      },
      {
        key: "documents" as const,
        title: "Documentos",
        summary: `${documentsReceived}/${bankingCase.requiredDocuments.length || 0}`,
        detail: `${documentsPending} pendente(s) | ${bankingCase.checklistCompletionLabel}`
      },
      {
        key: "clara" as const,
        title: "Clara",
        summary: `${relatedClaraRecordsCount} insight(s)`,
        detail: claraStatus
      },
      {
        key: "timeline" as const,
        title: "Timeline",
        summary: `${latestTimeline.length} evento(s)`,
        detail: lastTimelineEvent
      },
      {
        key: "updates" as const,
        title: "Andamentos",
        summary: `${linkedUpdates.length} registro(s)`,
        detail: latestUpdate
      }
    ],
    [
      bankingCase.bankName,
      bankingCase.checklistCompletionLabel,
      bankingCase.legalRiskLabel,
      bankingCase.nicheLabel,
      bankingCase.requiredDocuments.length,
      claraStatus,
      documentsPending,
      documentsReceived,
      lastTimelineEvent,
      latestTimeline.length,
      latestUpdate,
      linkedUpdates.length,
      relatedClaraRecordsCount,
      workflowCurrentStep,
      workflowProgress
    ]
  );

  return (
    <section className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="workspace-kicker">Processo Judicial</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {process.processNumber}
            </h2>
            <p className="text-sm text-slate-400">
              {process.clientName} | {process.tribunal} | {process.courtDistrict}
            </p>
            <p className="text-sm leading-7 text-slate-300">
              Status: {process.statusLabel} | Fase: {process.proceduralPhase} | Monitoramento:{" "}
              {process.monitoringModeLabel} | Docs: {documentsReceived}/{bankingCase.requiredDocuments.length || 0} |
              Prazos: {bankingCase.linkedDeadlines.length}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.continueClara}>
              Continuar na Clara
            </Link>
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.openDataJud}>
              {dataJudLabel}
            </Link>
            {actionLinks.openOfficialSystem ? (
              <a
                className="detail-link-button px-4 py-3 text-sm font-semibold"
                href={actionLinks.openOfficialSystem}
                rel="noreferrer"
                target="_blank"
              >
                {distributionSummary.officialSystemLabel ?? "Abrir portal oficial"}
              </a>
            ) : null}
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.openOabMonitoring}>
              Boundary OAB
            </Link>
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.backToProcesses}>
              Voltar para processos
            </Link>
          </div>
        </div>
      </section>

      <section className="workspace-panel space-y-4 p-6">
        <div className="max-w-3xl space-y-2">
          <p className="workspace-kicker">Fluxo canonico</p>
          <h3 className="text-2xl font-semibold text-white">
            Caso {"->"} handoff {"->"} processo
          </h3>
          <p className="text-sm leading-7 text-slate-300">
            O cockpit deixa claro o registro pos-distribuicao. Esta superficie organiza a leitura oficial do processo e
            nao executa protocolo nem simula automacao externa.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {canonicalFlowCards.map((card, index) => (
            <div key={card.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">
                  {index + 1}. {card.title}
                </p>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                  Etapa
                </span>
              </div>
              <p className="mt-3 leading-6 text-slate-300">{card.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-panel p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="workspace-kicker">Registro pos-distribuicao</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Dados oficiais do processo</h3>
          </div>
          <div className="max-w-xl text-sm leading-7 text-slate-300">
            Quadro operacional montado com base oficial do processo. As sugestoes abaixo nao substituem revisao juridica
            nem representam integracao automatica com tribunal.
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Cliente: <span className="font-semibold text-white">{process.clientName}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            CPF/CNPJ: <span className="font-semibold text-white">{process.clientDocumentId}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Parte contraria: <span className="font-semibold text-white">{distributionSummary.adversePartyLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Classe judicial sugerida:{" "}
            <span className="font-semibold text-white">{distributionSummary.processClassLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Assunto CNJ sugerido:{" "}
            <span className="font-semibold text-white">{distributionSummary.suggestedCnjSubjectLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Comarca: <span className="font-semibold text-white">{process.courtDistrict}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Competencia: <span className="font-semibold text-white">{distributionSummary.competenceLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Valor da causa: <span className="font-semibold text-white">{distributionSummary.valueInCauseLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Tipo de acao: <span className="font-semibold text-white">{distributionSummary.actionTypeLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Urgencia sugerida: <span className="font-semibold text-white">{distributionSummary.urgencyLabel}</span>
          </div>
        </div>

        <div className="mt-5 detail-subpanel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Registro oficial do processo
            </p>
            <span className="text-xs text-slate-400">{distributionSummary.integrationStatusLabel}</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Numero do processo:{" "}
              <span className="font-semibold text-white">{distributionSummary.distributedProcessNumber}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Data da distribuicao:{" "}
              <span className="font-semibold text-white">{distributionSummary.distributionDateLabel}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Comprovante oficial:{" "}
              <span className="font-semibold text-white">{distributionSummary.protocolReceiptLabel}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Status do registro:{" "}
              <span className="font-semibold text-white">{distributionSummary.distributionStatusLabel}</span>
            </div>
          </div>
        </div>
      </section>

      {claraSummary ? (
        <section className="detail-panel-accent workspace-panel p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="workspace-kicker">Clara ativa</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{claraSummary.title}</h3>
            </div>
            <div className="flex gap-2">
              <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.openClaraHistory}>
                Historico
              </Link>
              <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.continueClara}>
                Continuar
              </Link>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-cyan-50">{claraSummary.detail}</p>
          {claraSummary.footer ? <p className="mt-3 text-sm text-slate-300">{claraSummary.footer}</p> : null}
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">{card.title}</p>
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
      </section>

      {activePanel ? (
        <section className="detail-panel p-6">
          {activePanel === "case" ? (
            <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="workspace-kicker">Caso</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{bankingCase.title}</h3>
              </div>
              <div className={`rounded-[4px] border px-3 py-1 text-xs font-semibold ${criticalityTone(bankingCase.legalRiskLabel === "Baixa" ? "low" : bankingCase.legalRiskLabel === "Media" ? "medium" : "high")}`}>
                Risco {bankingCase.legalRiskLabel}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Nicho: <span className="font-semibold text-white">{bankingCase.nicheLabel}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Banco: <span className="font-semibold text-white">{bankingCase.bankName}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Status: <span className="font-semibold text-white">{bankingCase.status}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Fase: <span className="font-semibold text-white">{bankingCase.stage}</span>
              </div>
            </div>
            <div className="detail-subpanel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Resumo juridico</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">{bankingCase.mainThesis}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{bankingCase.suggestedStrategy}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Valor em disputa:{" "}
                <span className="font-semibold text-white">
                  R$ {bankingCase.amountInDispute.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Valor estimado:{" "}
                <span className="font-semibold text-white">
                  R$ {bankingCase.estimatedValue.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Responsavel: <span className="font-semibold text-white">{bankingCase.ownerLabel}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Etapa Clara: <span className="font-semibold text-white">{bankingCase.workflowPhaseLabel}</span>
              </div>
            </div>
            {bankingCase.linkedTasks.length ? (
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Tarefas vinculadas</p>
                <div className="mt-4 space-y-3">
                  {bankingCase.linkedTasks.map((task) => (
                    <div key={task} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {bankingCase.linkedDeadlines.length ? (
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Prazos</p>
                <div className="mt-4 space-y-3">
                  {bankingCase.linkedDeadlines.map((deadline) => (
                    <div key={deadline} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                      {deadline}
                    </div>
                  ))}
                </div>
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
                {bankingCase.workflowCompletionLabel}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Fase atual: <span className="font-semibold text-white">{bankingCase.workflowPhaseLabel}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Proxima etapa: <span className="font-semibold text-white">{workflowCurrentStep}</span>
              </div>
            </div>
            <div className="grid gap-3">
              {bankingCase.workflowSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`rounded-[4px] border px-4 py-4 text-sm ${statusTone(step.state)}`}
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
            {bankingCase.workflowReadiness.length ? (
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Prontidão</p>
                <div className="mt-4 space-y-3">
                  {bankingCase.workflowReadiness.map((item) => (
                    <div key={item.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">{item.label}</p>
                        <span className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.16em] ${statusTone(item.state)}`}>
                          {item.state === "ready" ? "Pronto" : "Bloqueado"}
                        </span>
                      </div>
                      <p className="mt-2 leading-6">{item.detail}</p>
                      {item.blockers.length ? (
                        <p className="mt-2 text-slate-400">Bloqueios: {item.blockers.join(" | ")}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          ) : null}

          {activePanel === "documents" ? (
            <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="workspace-kicker">Documentos</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Checklist documental do caso</h3>
              </div>
              <div className="flex gap-2">
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
                Pendentes: <span className="font-semibold text-white">{documentsPending}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Base exigida: <span className="font-semibold text-white">{bankingCase.requiredDocuments.length}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Faltantes: <span className="font-semibold text-white">{bankingCase.missingDocuments.length}</span>
              </div>
            </div>
            <div className="detail-subpanel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Checklist</p>
              <p className="mt-3 text-sm text-slate-300">{bankingCase.checklistCompletionLabel}</p>
            </div>
            <div className="grid gap-3">
              {bankingCase.checklistItems.map((item) => (
                <div key={item.id} className="detail-soft-row flex items-center justify-between gap-3 px-4 py-4 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-slate-400">{item.required ? "Obrigatorio" : "Opcional"}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.16em] ${statusTone(item.state)}`}>
                    {item.state === "received" ? "Recebido" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid gap-3">
              {bankingCase.linkedDocuments.map((document) => (
                <div key={document} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {document}
                </div>
              ))}
            </div>
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
                <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.continueClara}>
                  Continuar na Clara
                </Link>
                <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.openClaraHistory}>
                  Historico completo
                </Link>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Registros: <span className="font-semibold text-white">{relatedClaraRecordsCount}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Insights: <span className="font-semibold text-white">{bankingCase.lexiaInsights.length}</span>
              </div>
            </div>
            {claraSummary ? (
              <div className="detail-subpanel p-5">
                <p className="text-sm font-semibold text-white">{claraSummary.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{claraSummary.detail}</p>
                {claraSummary.footer ? <p className="mt-3 text-sm text-slate-400">{claraSummary.footer}</p> : null}
              </div>
            ) : null}
            <div className="grid gap-3">
              {bankingCase.lexiaInsights.slice(0, 3).map((insight) => (
                <div key={insight} className="detail-soft-row px-4 py-4 text-sm leading-6 text-slate-200">
                  {insight}
                </div>
              ))}
            </div>
            <div className="grid gap-3">
              {claraHistoryItems.length ? (
                claraHistoryItems.slice(0, 5).map((record) => (
                  <div key={record.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="rounded-[4px] border border-white/10 px-2 py-1 text-slate-300">
                        {record.workflowStatusLabel}
                      </span>
                      <span>{record.id}</span>
                    </div>
                    <p className="mt-3 font-semibold text-white">{record.title}</p>
                    <p className="mt-2 leading-6 text-slate-300">{record.detail}</p>
                  </div>
                ))
              ) : (
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">
                  Nenhum registro da Clara foi persistido neste processo ainda.
                </div>
              )}
            </div>
          </div>
          ) : null}

          {activePanel === "timeline" ? (
            <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="workspace-kicker">Timeline</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Linha processual recente</h3>
              </div>
              <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                {latestTimeline.length} evento(s)
              </div>
            </div>
            <div className="grid gap-3">
              {latestTimeline.map((timelineItem, index) => (
                <div key={timelineItem.id} className="detail-soft-row px-4 py-4 text-sm">
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
                        <p className="mt-3 leading-6 text-slate-300">{timelineItem.description}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-[4px] border px-3 py-1 text-xs font-semibold ${criticalityTone(timelineItem.criticality)}`}
                    >
                      Criticidade {timelineItem.criticality}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          ) : null}

          {activePanel === "updates" ? (
            <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="workspace-kicker">Andamentos</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Leitura recente do monitoramento processual</h3>
              </div>
              <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                {linkedUpdates.length} registro(s)
              </div>
            </div>
            <div className="grid gap-3">
              {linkedUpdates.length ? (
                linkedUpdates.slice(0, 3).map((update) => (
                  <div key={update.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{update.movementType}</p>
                        <p className="mt-1 text-slate-400">
                          {new Date(update.occurredAt).toLocaleDateString("pt-BR")} | {update.sourceLabel}
                        </p>
                        <p className="mt-3 leading-6 text-slate-300">{update.operationalSummary}</p>
                      </div>
                      <span
                        className={`rounded-[4px] border px-3 py-1 text-xs font-semibold ${criticalityTone(update.criticality)}`}
                      >
                        Clara
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">
                  Nenhum andamento recente consolidado para este processo.
                </div>
              )}
            </div>
          </div>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
