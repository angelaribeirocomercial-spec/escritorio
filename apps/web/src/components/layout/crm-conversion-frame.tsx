"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CrmConversionRecord = {
  id: string;
  clientId: string;
  clientName: string;
  caseId: string | null;
  sourceLabel: string;
  stageLabel: string;
  summary: string;
  nextAction: string;
};

type CrmConversionFrameProps = {
  conversions: ReadonlyArray<CrmConversionRecord>;
};

type PanelKey = "intake" | "flow" | "records";

function panelTone(active: boolean) {
  return active
    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
    : "border-white/10 bg-white/[0.04] text-slate-200";
}

export function CrmConversionFrame({ conversions }: CrmConversionFrameProps) {
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null);

  const convertedCount = conversions.filter((conversion) => conversion.caseId).length;
  const contractCount = conversions.filter((conversion) => conversion.stageLabel === "Contrato fechado").length;
  const topConversion = conversions[0];

  const cards = useMemo(
    () => [
      {
        key: "intake" as const,
        title: "Intake",
        summary: "Chatbot externo",
        detail: "Contrato de handoff e normalizacao do lead"
      },
      {
        key: "flow" as const,
        title: "Fluxo",
        summary: `${convertedCount} convertido(s)`,
        detail: `${contractCount} com contrato fechado`
      },
      {
        key: "records" as const,
        title: "Leads",
        summary: `${conversions.length} registro(s)`,
        detail: topConversion ? topConversion.clientName : "Nenhum lead consolidado"
      }
    ],
    [contractCount, convertedCount, conversions.length, topConversion]
  );

  return (
    <section className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="workspace-kicker">CRM</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Conversao do escritorio
            </h2>
            <p className="text-sm leading-7 text-slate-300">
              A visao inicial mostra o essencial. O detalhe do intake, do fluxo e dos leads abre por card.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/crm/pipeline">
              Abrir pipeline
            </Link>
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/crm/contratos">
              Abrir contratos
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Leads: <span className="font-semibold text-white">{conversions.length}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Convertidos: <span className="font-semibold text-white">{convertedCount}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Contrato fechado: <span className="font-semibold text-white">{contractCount}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Foco atual: <span className="font-semibold text-white">Conversao assistida</span>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
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
          {activePanel === "intake" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Intake do chatbot</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Contrato de handoff e normalizacao</h3>
                </div>
                <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/api/crm/chatbot-intake">
                  POST /api/crm/chatbot-intake
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Campos minimos: <span className="font-semibold text-white">6</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Saida: <span className="font-semibold text-white">lead captado</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Proximo uso: <span className="font-semibold text-white">novo atendimento</span>
                </div>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Descricao</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  O CRM ja aceita o contrato de handoff do chatbot externo. Esse endpoint normaliza o lead captado,
                  preserva a origem e devolve o proximo passo para a fila de conversao.
                </p>
              </div>
            </div>
          ) : null}

          {activePanel === "flow" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Fluxo de conversao</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Handoff comercial e juridico</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {convertedCount} lead(s) convertidos
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Contrato fechado: <span className="font-semibold text-white">{contractCount}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Caso aberto: <span className="font-semibold text-white">{convertedCount}</span>
                </div>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Direcao</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Esta tela representa o handoff entre o lead captado e o caso juridico. O chatbot externo entra
                  depois, mas a estrutura ja mostra origem, classificacao e proximo passo.
                </p>
              </div>
            </div>
          ) : null}

          {activePanel === "records" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Leads</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Registros reais de conversao</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {conversions.length} registro(s)
                </div>
              </div>
              <div className="grid gap-3">
                {conversions.map((conversion) => (
                  <article key={conversion.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{conversion.clientName}</p>
                        <p className="mt-1 text-slate-400">{conversion.sourceLabel}</p>
                      </div>
                      <span className="rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                        {conversion.stageLabel}
                      </span>
                    </div>
                    <p className="mt-3 leading-6">{conversion.summary}</p>
                    <p className="mt-2 leading-6 text-slate-400">{conversion.nextAction}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                        href={`/pessoas/clientes/${conversion.clientId}`}
                      >
                        Abrir cliente
                      </Link>
                      {conversion.caseId ? (
                        <Link
                          className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                          href={`/casos/${conversion.caseId}`}
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
