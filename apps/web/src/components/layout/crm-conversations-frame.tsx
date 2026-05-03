"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CrmConversationRecord = {
  id: string;
  clientId: string;
  clientName: string;
  caseId: string | null;
  lastMessage: string;
  summary: string;
  statusLabel: string;
  nextAction: string;
};

type CrmConversationsFrameProps = {
  conversations: ReadonlyArray<CrmConversationRecord>;
};

type PanelKey = "summary" | "records";

function panelTone(active: boolean) {
  return active
    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
    : "border-white/10 bg-white/[0.04] text-slate-200";
}

export function CrmConversationsFrame({ conversations }: CrmConversationsFrameProps) {
  const [activePanel, setActivePanel] = useState<PanelKey | null>("records");

  const withCase = conversations.filter((conversation) => conversation.caseId).length;
  const withoutCase = conversations.filter((conversation) => !conversation.caseId).length;
  const topConversation = conversations[0];

  const cards = useMemo(
    () => [
      {
        key: "summary" as const,
        title: "Historico",
        summary: "Contato comercial",
        detail: `${withCase} conversa(s) conectada(s) ao caso`
      },
      {
        key: "records" as const,
        title: "Conversas",
        summary: `${conversations.length} registro(s)`,
        detail: `${withoutCase} ainda antes da conversao juridica`
      }
    ],
    [conversations.length, withCase, withoutCase]
  );

  return (
    <section className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="workspace-kicker">CRM</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Conversas do escritorio
            </h2>
            <p className="text-sm leading-7 text-slate-300">
              A visão inicial mostra apenas o essencial. O detalhe abre por card quando a conversa precisa de mais
              contexto.
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
            Conversas: <span className="font-semibold text-white">{conversations.length}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Com caso: <span className="font-semibold text-white">{withCase}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Sem caso: <span className="font-semibold text-white">{withoutCase}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Foco atual: <span className="font-semibold text-white">Historico e follow-up</span>
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
                  <p className="workspace-kicker">Historico de contato</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Trilha operacional de conversa</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {withCase} conversa(s) com caso
                </div>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Descricao</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  O CRM expõe o histórico de conversa como trilha operacional, conectando contato comercial, contrato
                  e caso quando isso já existe na carteira real.
                </p>
              </div>
            </div>
          ) : null}

          {activePanel === "records" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Conversas</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Registros reais de contato</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {conversations.length} registro(s)
                </div>
              </div>
              <div className="grid gap-3">
                {conversations.map((conversation) => (
                  <article key={conversation.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{conversation.clientName}</p>
                        <p className="mt-1 text-slate-400">{conversation.summary}</p>
                      </div>
                      <span className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-200">
                        {conversation.statusLabel}
                      </span>
                    </div>

                    <p className="mt-3 leading-6">{conversation.lastMessage}</p>
                    <p className="mt-2 leading-6 text-slate-400">{conversation.nextAction}</p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                        href={`/pessoas/clientes/${conversation.clientId}`}
                      >
                        Abrir cliente
                      </Link>
                      {conversation.caseId ? (
                        <Link
                          className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                          href={`/casos/${conversation.caseId}`}
                        >
                          Abrir caso
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))}
                {topConversation ? (
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">
                    Topo da fila: {topConversation.clientName}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
