"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CrmContractRecord = {
  id: string;
  clientId: string;
  clientName: string;
  caseId: string | null;
  contractNumber: string;
  bankName: string;
  statusLabel: string;
  detail: string;
  nextAction: string;
};

type CrmContractsFrameProps = {
  contracts: ReadonlyArray<CrmContractRecord>;
};

type PanelKey = "summary" | "records";

function panelTone(active: boolean) {
  return active
    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
    : "border-white/10 bg-white/[0.04] text-slate-200";
}

export function CrmContractsFrame({ contracts }: CrmContractsFrameProps) {
  const [activePanel, setActivePanel] = useState<PanelKey | null>("summary");

  const withCase = contracts.filter((contract) => contract.caseId).length;
  const uniqueClients = new Set(contracts.map((contract) => contract.clientId)).size;
  const topContract = contracts[0];

  const cards = useMemo(
    () => [
      {
        key: "summary" as const,
        title: "Transicao",
        summary: "Handoff juridico",
        detail: `${withCase} contrato(s) com caso`
      },
      {
        key: "records" as const,
        title: "Contratos",
        summary: `${contracts.length} registro(s)`,
        detail: `${uniqueClients} cliente(s) acompanhados`
      }
    ],
    [contracts.length, uniqueClients, withCase]
  );

  return (
    <section className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="workspace-kicker">CRM</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Contratos do escritorio
            </h2>
            <p className="text-sm leading-7 text-slate-300">
              A visao inicial mostra o essencial da transicao. O detalhe de cada contrato abre por card.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/crm/conversao">
              Ver conversao
            </Link>
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/crm/pipeline">
              Ver pipeline
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Contratos: <span className="font-semibold text-white">{contracts.length}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Clientes: <span className="font-semibold text-white">{uniqueClients}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Casos: <span className="font-semibold text-white">{withCase}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Foco atual: <span className="font-semibold text-white">Contrato e transicao</span>
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
          {activePanel === "summary" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Transicao juridica</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Handoff entre comercial e juridico</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {withCase} contrato(s) com caso
                </div>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Descricao</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  O CRM mostra quais clientes ja formalizaram contrato e quais ainda precisam de vinculo completo com
                  o caso. Isso fecha a parte comercial da fase 4 sem depender de dados ficticios.
                </p>
              </div>
            </div>
          ) : null}

          {activePanel === "records" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Contratos</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Registros reais de contrato</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {contracts.length} registro(s)
                </div>
              </div>
              <div className="grid gap-3">
                {contracts.map((contract) => (
                  <article key={contract.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{contract.clientName}</p>
                        <p className="mt-1 text-slate-400">{contract.bankName}</p>
                      </div>
                      <span className="rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                        {contract.statusLabel}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="detail-subpanel p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Contrato</p>
                        <p className="mt-2 text-sm text-slate-200">{contract.contractNumber}</p>
                      </div>
                      <div className="detail-subpanel p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Caso</p>
                        <p className="mt-2 text-sm text-slate-200">{contract.caseId ?? "Ainda nao vinculado"}</p>
                      </div>
                    </div>
                    <p className="mt-3 leading-6">{contract.detail}</p>
                    <p className="mt-2 leading-6 text-slate-400">{contract.nextAction}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                        href={`/pessoas/clientes/${contract.clientId}`}
                      >
                        Abrir cliente
                      </Link>
                      {contract.caseId ? (
                        <Link
                          className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                          href={`/casos/${contract.caseId}`}
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
