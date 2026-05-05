"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CrmPipelineFrameProps = {
  totals: {
    clients: number;
    cases: number;
    stages: number;
    followUps: number;
  };
  stages: ReadonlyArray<{
    id: string;
    label: string;
    count: number;
    summary: string;
  }>;
  followUps: ReadonlyArray<{
    id: string;
    clientId: string;
    clientName: string;
    caseId: string | null;
    title: string;
    detail: string;
    priority: "low" | "medium" | "high";
    nextAction: string;
  }>;
};

type PanelKey = "stages" | "followups";

function panelTone(active: boolean) {
  return active
    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
    : "border-white/10 bg-white/[0.04] text-slate-200";
}

function priorityTone(priority: "low" | "medium" | "high") {
  switch (priority) {
    case "high":
      return "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100";
    case "medium":
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
    default:
      return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  }
}

export function CrmPipelineFrame({ totals, stages, followUps }: CrmPipelineFrameProps) {
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null);

  const cards = useMemo(
    () => [
      {
        key: "stages" as const,
        title: "Estagios",
        summary: `${totals.stages} resumo(s)`,
        detail: `${totals.clients} clientes na trilha`
      },
      {
        key: "followups" as const,
        title: "Follow-ups",
        summary: `${totals.followUps} pendencia(s)`,
        detail: `${totals.cases} casos conectados`
      }
    ],
    [totals.cases, totals.clients, totals.followUps, totals.stages]
  );

  const topStage = stages[0];
  const topFollowUp = followUps[0];

  return (
    <section className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="workspace-kicker">CRM</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Pipeline e follow-ups
            </h2>
            <p className="text-sm leading-7 text-slate-300">
              A visão inicial mostra apenas o essencial. O detalhe abre abaixo do card clicado.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/crm/conversao">
              Ver conversao
            </Link>
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/crm/contratos">
              Ver contratos
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Clientes: <span className="font-semibold text-white">{totals.clients}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Casos: <span className="font-semibold text-white">{totals.cases}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Estagios: <span className="font-semibold text-white">{totals.stages}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Follow-ups: <span className="font-semibold text-white">{totals.followUps}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
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
          {activePanel === "stages" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Estagios</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Visao do pipeline</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {topStage ? `${topStage.label} | ${topStage.count}` : "Sem estagios"}
                </div>
              </div>
              <div className="grid gap-3">
                {stages.map((stage) => (
                  <div key={stage.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{stage.label}</p>
                        <p className="mt-1 text-slate-400">{stage.summary}</p>
                      </div>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                        {stage.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activePanel === "followups" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Follow-ups ativos</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Fila operacional imediata</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {topFollowUp ? `${topFollowUp.clientName}` : "Sem pendencias"}
                </div>
              </div>
              <div className="grid gap-3">
                {followUps.map((item) => (
                  <article key={item.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-slate-400">{item.clientName}</p>
                      </div>
                      <span className={`rounded-[4px] border px-3 py-1 text-xs font-semibold ${priorityTone(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-3 leading-6">{item.detail}</p>
                    <p className="mt-2 leading-6 text-slate-400">{item.nextAction}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                        href={`/pessoas/clientes/${item.clientId}`}
                      >
                        Abrir cliente
                      </Link>
                      {item.caseId ? (
                        <Link
                          className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                          href={`/casos/${item.caseId}`}
                        >
                          Abrir caso
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
