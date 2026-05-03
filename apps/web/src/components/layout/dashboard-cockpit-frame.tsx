"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DashboardMetric = {
  label: string;
  value: string;
  sublabel: string;
};

type DashboardActivity = {
  id: string;
  label: string;
  detail: string;
};

type DashboardTask = {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  clientName: string;
  bankingCaseTitle: string;
};

type DashboardDeadline = {
  id: string;
  title: string;
  bankingCaseTitle: string;
  bankName: string;
  dateLabel: string;
  sortKey: string;
};

type DashboardSummary = {
  metrics: {
    activeClients: number;
    activeCases: number;
    pendingTasks: number;
    urgentTasks: number;
    analyzedContracts: number;
    teamProductivity: number;
    totalPotential: number;
    stalledClients: number;
  };
  monthlyEvolution: ReadonlyArray<{ label: string; value: number }>;
  casesByType: ReadonlyArray<{ label: string; value: number }>;
  casesByBank: ReadonlyArray<{ label: string; value: number }>;
  deadlines: ReadonlyArray<DashboardDeadline>;
  urgentTaskList: ReadonlyArray<DashboardTask>;
  activities: ReadonlyArray<DashboardActivity>;
  lexiaInsights: ReadonlyArray<string>;
};

type PanelKey = "metrics" | "tasks" | "deadlines" | "activity" | "insights" | "distribution";

type DashboardCockpitFrameProps = {
  dashboard: DashboardSummary;
};

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function panelTone(active: boolean) {
  return active ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50" : "border-white/10 bg-white/[0.04] text-slate-200";
}

export function DashboardCockpitFrame({ dashboard }: DashboardCockpitFrameProps) {
  const [activePanel, setActivePanel] = useState<PanelKey | null>("metrics");

  const cards = useMemo(
    () => [
      {
        key: "metrics" as const,
        title: "Operacao",
        summary: formatCurrency(dashboard.metrics.totalPotential),
        detail: `${dashboard.metrics.activeCases} processos ativos | ${dashboard.metrics.activeClients} clientes ativos`
      },
      {
        key: "tasks" as const,
        title: "Tarefas",
        summary: `${dashboard.metrics.pendingTasks} pendentes`,
        detail: `${dashboard.metrics.urgentTasks} urgentes | produtividade ${dashboard.metrics.teamProductivity}%`
      },
      {
        key: "deadlines" as const,
        title: "Prazos",
        summary: `${dashboard.deadlines.length} no radar`,
        detail: dashboard.deadlines[0]
          ? `${dashboard.deadlines[0].title} | ${dashboard.deadlines[0].dateLabel}`
          : "Nenhum prazo imediato encontrado"
      },
      {
        key: "activity" as const,
        title: "Agenda",
        summary: `${dashboard.activities.length} eventos`,
        detail: dashboard.activities[0]?.detail ?? "Nenhuma atividade recente consolidada"
      },
      {
        key: "insights" as const,
        title: "Clara",
        summary: `${dashboard.lexiaInsights.length} insights`,
        detail: dashboard.lexiaInsights[0] ?? "Sem insight operacional adicional"
      },
      {
        key: "distribution" as const,
        title: "Distribuicao",
        summary: `${dashboard.casesByType.length} tipos`,
        detail: `${dashboard.casesByBank.length} bancos acompanhados`
      }
    ],
    [dashboard]
  );

  return (
    <section className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="workspace-kicker">Painel</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Cockpit operacional do tenant
            </h2>
            <p className="text-sm leading-7 text-slate-300">
              O resumo inicial mostra apenas o essencial. Cada card abre o detalhamento do bloco correspondente.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/agenda/compromissos">
              Compromissos
            </Link>
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/agenda/tarefas">
              Tarefas
            </Link>
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/agenda/prazos">
              Prazos
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const active = activePanel === card.key;

          return (
            <button
              key={card.key}
              className={`workspace-soft-card rounded-[4px] border p-4 text-left transition hover:bg-white/[0.06] ${panelTone(active)}`}
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
          {activePanel === "metrics" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Operacao</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Volumes atuais do tenant</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  Potencial {formatCurrency(dashboard.metrics.totalPotential)}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Clientes ativos: <span className="font-semibold text-white">{dashboard.metrics.activeClients}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Casos ativos: <span className="font-semibold text-white">{dashboard.metrics.activeCases}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Contratos lidos: <span className="font-semibold text-white">{dashboard.metrics.analyzedContracts}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Clientes parados: <span className="font-semibold text-white">{dashboard.metrics.stalledClients}</span>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {dashboard.monthlyEvolution.map((entry) => (
                  <div key={entry.label} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    {entry.label}: <span className="font-semibold text-white">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activePanel === "tasks" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Tarefas</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Fila operacional imediata</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {dashboard.metrics.pendingTasks} pendentes
                </div>
              </div>
              <div className="grid gap-3">
                {dashboard.urgentTaskList.length ? (
                  dashboard.urgentTaskList.map((task) => (
                    <Link
                      key={task.id}
                      className="detail-soft-row block px-4 py-4 text-sm text-slate-300"
                      href="/agenda/tarefas"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-white">{task.title}</p>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{task.priority}</span>
                      </div>
                      <p className="mt-2 text-slate-400">{task.clientName} | {task.bankingCaseTitle}</p>
                      <p className="mt-2 text-slate-400">Prazo {task.dueDate}</p>
                    </Link>
                  ))
                ) : (
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">Nenhuma tarefa urgente encontrada na base real.</div>
                )}
              </div>
            </div>
          ) : null}

          {activePanel === "deadlines" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Prazos</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Radar de vencimentos</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">{dashboard.deadlines.length} prazo(s)</div>
              </div>
              <div className="grid gap-3">
                {dashboard.deadlines.length ? (
                  dashboard.deadlines.map((deadline) => (
                    <Link key={deadline.id} className="detail-soft-row block px-4 py-4 text-sm text-slate-300" href="/agenda/prazos">
                      <p className="font-semibold text-white">{deadline.title}</p>
                      <p className="mt-2 text-slate-400">{deadline.bankingCaseTitle} | {deadline.bankName}</p>
                      <p className="mt-2 text-slate-400">Data {deadline.dateLabel}</p>
                    </Link>
                  ))
                ) : (
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">Nenhum prazo imediato encontrado na base real.</div>
                )}
              </div>
            </div>
          ) : null}

          {activePanel === "activity" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Agenda</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Atividades recentes</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">{dashboard.activities.length} evento(s)</div>
              </div>
              <div className="grid gap-3">
                {dashboard.activities.length ? (
                  dashboard.activities.map((activity) => (
                    <div key={activity.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      <p className="font-semibold text-white">{activity.label}</p>
                      <p className="mt-2 leading-6 text-slate-400">{activity.detail}</p>
                    </div>
                  ))
                ) : (
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">Nenhuma atividade recente consolidada.</div>
                )}
              </div>
            </div>
          ) : null}

          {activePanel === "insights" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Clara</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Insights operacionais</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {dashboard.lexiaInsights.length} insight(s)
                </div>
              </div>
              <div className="grid gap-3">
                {dashboard.lexiaInsights.map((insight) => (
                  <div key={insight} className="detail-soft-row px-4 py-4 text-sm leading-6 text-slate-300">
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activePanel === "distribution" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Distribuicao</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Casos por tipo e banco</h3>
                </div>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">Por tipo</p>
                  {dashboard.casesByType.map((item) => (
                    <div key={item.label} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      {item.label}: <span className="font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">Por banco</p>
                  {dashboard.casesByBank.map((item) => (
                    <div key={item.label} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      {item.label}: <span className="font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
