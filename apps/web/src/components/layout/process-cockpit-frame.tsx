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

type PanelKey = "updates";

function panelTone(active: boolean) {
  return active
    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
    : "border-white/10 bg-white/[0.04] text-slate-200";
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
  linkedUpdates,
  actionLinks,
  dataJudLabel,
  distributionSummary
}: ProcessCockpitFrameProps) {
  const [activePanel, setActivePanel] = useState<PanelKey | null>("updates");
  const latestUpdate = linkedUpdates[0]?.operationalSummary ?? "Nenhum andamento recente consolidado";

  const cards = useMemo(
    () => [
      {
        key: "updates" as const,
        title: "Andamentos",
        summary: `${linkedUpdates.length} registro(s)`,
        detail: latestUpdate
      }
    ],
    [latestUpdate, linkedUpdates.length]
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
              {process.monitoringModeLabel}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.continueClara}>
              Abrir na Clara
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

      <section className="detail-panel p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="workspace-kicker">Registro pos-distribuicao</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Dados oficiais do processo</h3>
          </div>
          <div className="max-w-xl text-sm leading-7 text-slate-300">
            Quadro operacional montado com base oficial do processo. Esta superficie registra o processo ja nascido e
            concentra apenas seu acompanhamento posterior.
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
            Classe judicial: <span className="font-semibold text-white">{distributionSummary.processClassLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Assunto CNJ: <span className="font-semibold text-white">{distributionSummary.suggestedCnjSubjectLabel}</span>
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
            Urgencia: <span className="font-semibold text-white">{distributionSummary.urgencyLabel}</span>
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

      {activePanel === "updates" ? (
        <section className="detail-panel p-6">
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
                linkedUpdates.map((update) => (
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
                        Andamento
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
        </section>
      ) : null}
    </section>
  );
}
