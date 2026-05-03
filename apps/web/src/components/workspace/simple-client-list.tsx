"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ClientRecord } from "@lexia/domain";
import { WorkspaceStatePanel } from "@lexia/ui";

type SimpleClientListProps = {
  clients: ClientRecord[];
  searchValue?: string;
  state?: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null;
};

function statusLabel(status: ClientRecord["serviceStatus"]) {
  switch (status) {
    case "active":
      return "Ativo";
    case "waiting-docs":
      return "Aguardando docs";
    case "closed":
      return "Encerrado";
    default:
      return "Triagem";
  }
}

function statusTone(status: ClientRecord["serviceStatus"]) {
  switch (status) {
    case "active":
      return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
    case "waiting-docs":
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
    case "closed":
      return "border-slate-300/20 bg-slate-300/10 text-slate-100";
    default:
      return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  }
}

export function SimpleClientList({
  clients,
  searchValue = "",
  state = null
}: SimpleClientListProps) {
  const [activeClientId, setActiveClientId] = useState<string | null>(clients[0]?.id ?? null);

  useEffect(() => {
    if (!clients.length) {
      setActiveClientId(null);
      return;
    }

    if (!activeClientId || !clients.some((client) => client.id === activeClientId)) {
      setActiveClientId(clients[0].id);
    }
  }, [activeClientId, clients]);

  const activeClient = useMemo(
    () => clients.find((client) => client.id === activeClientId) ?? clients[0] ?? null,
    [activeClientId, clients]
  );

  const summary = useMemo(() => {
    const active = clients.filter((client) => client.serviceStatus === "active").length;
    const waitingDocs = clients.filter((client) => client.serviceStatus === "waiting-docs").length;
    const signed = clients.filter((client) => client.signedContract).length;
    const averageScore = clients.length
      ? Math.round(
          clients.reduce((total, client) => total + client.legalViabilityScore, 0) / clients.length
        )
      : 0;

    return { active, waitingDocs, signed, averageScore };
  }, [clients]);

  return (
    <div className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="workspace-kicker">Clientes</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Cockpit compacto da carteira
            </h2>
            <p className="text-sm leading-7 text-slate-300">
              A visão inicial mostra apenas o essencial. Cada card abre os dados do cliente em um painel detalhado.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              aria-disabled="true"
              className="detail-link-button cursor-not-allowed px-4 py-3 text-sm font-semibold opacity-70"
              type="button"
            >
              Importar lote
            </button>
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/novo-atendimento-bancario">
              Novo atendimento bancario
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Total na carteira: <span className="font-semibold text-white">{clients.length}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Ativos: <span className="font-semibold text-white">{summary.active}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Aguardando docs: <span className="font-semibold text-white">{summary.waitingDocs}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Viabilidade media: <span className="font-semibold text-white">{summary.averageScore}%</span>
          </div>
        </div>
      </section>

      <section className="workspace-panel px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="workspace-kicker">Busca</p>
            <p className="mt-2 text-sm text-slate-300">Filtre a carteira sem abrir toda a tela ao mesmo tempo.</p>
          </div>
          <p className="text-sm text-slate-400">Exibindo {clients.length} resultado(s)</p>
        </div>

        <form className="mt-4 flex flex-col gap-3 lg:flex-row" method="get">
          <input
            className="detail-soft-row min-w-0 flex-1 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            defaultValue={searchValue}
            name="pesquisa"
            placeholder="Buscar por nome, documento, banco ou status"
            type="text"
          />
          <button className="detail-link-button px-5 py-3 text-sm font-semibold" type="submit">
            Buscar
          </button>
        </form>
      </section>

      {state ? (
        <WorkspaceStatePanel
          description={state.description}
          title={state.title}
          tone={state.tone ?? "neutral"}
        />
      ) : null}

      {clients.length === 0 ? (
        <div className="workspace-panel px-4 py-4">
          <p className="text-sm text-slate-400">Voce ainda nao cadastrou nenhum cliente.</p>
        </div>
      ) : (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => {
              const active = activeClient?.id === client.id;

              return (
                <button
                  key={client.id}
                  className={`workspace-soft-card rounded-[4px] border p-4 text-left transition hover:bg-white/[0.06] ${
                    active
                      ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
                      : "border-white/10 bg-white/[0.04] text-slate-200"
                  }`}
                  onClick={() => setActiveClientId(active ? null : client.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{client.fullName}</p>
                      <p className="mt-2 truncate text-xs text-slate-400">
                        {client.documentId} | {client.bankName}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.16em] ${statusTone(client.serviceStatus)}`}
                    >
                      {active ? "Aberto" : "Abrir"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.16em] ${statusTone(client.serviceStatus)}`}
                    >
                      {statusLabel(client.serviceStatus)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                      Score {client.legalViabilityScore}%
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                      Docs {client.documentsSent}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-300">
                    {client.linkedCases[0]
                      ? client.linkedCases[0].title
                      : "Sem caso vinculado no momento"}
                  </p>
                </button>
              );
            })}
          </section>

          {activeClient ? (
            <section className="detail-panel p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="workspace-kicker">Detalhe do cliente</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{activeClient.fullName}</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {activeClient.bankName} | {activeClient.documentId}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    className="detail-link-button px-4 py-3 text-sm font-semibold"
                    href={`/pessoas/clientes/${activeClient.id}`}
                  >
                    Abrir cockpit
                  </Link>
                  <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/novo-atendimento-bancario">
                    Novo atendimento
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Status: <span className="font-semibold text-white">{statusLabel(activeClient.serviceStatus)}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Viabilidade: <span className="font-semibold text-white">{activeClient.legalViabilityScore}%</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Contrato:{" "}
                  <span className="font-semibold text-white">
                    {activeClient.signedContract ? "Assinado" : "Pendente"}
                  </span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Docs enviados: <span className="font-semibold text-white">{activeClient.documentsSent}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Dados principais</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <p>
                      Email: <span className="text-white">{activeClient.email}</span>
                    </p>
                    <p>
                      Telefone: <span className="text-white">{activeClient.phone}</span>
                    </p>
                    <p>
                      WhatsApp: <span className="text-white">{activeClient.whatsapp}</span>
                    </p>
                    <p>
                      Origem: <span className="text-white">{activeClient.leadSource}</span>
                    </p>
                  </div>
                </div>

                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Contexto operacional
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    {activeClient.iaContext || "Sem contexto operacional registrado."}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Caso vinculado:{" "}
                  <span className="font-semibold text-white">
                    {activeClient.linkedCases[0]?.title ?? "Nenhum"}
                  </span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Documentos: <span className="font-semibold text-white">{activeClient.linkedDocuments.length}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Historico: <span className="font-semibold text-white">{activeClient.timeline.length}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Casos vinculados</p>
                  <div className="mt-4 space-y-3">
                    {activeClient.linkedCases.length ? (
                      activeClient.linkedCases.map((caseItem) => (
                        <div key={caseItem.id} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                          <p className="font-semibold text-white">{caseItem.title}</p>
                          <p className="mt-1 text-slate-400">
                            {caseItem.status} | {caseItem.thesis}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">Nenhum caso vinculado.</p>
                    )}
                  </div>
                </div>

                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Linha do tempo</p>
                  <div className="mt-4 space-y-3">
                    {activeClient.timeline.length ? (
                      activeClient.timeline.slice(0, 4).map((item) => (
                        <div key={item} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                          {item}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">Nenhum evento registrado.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
                <div className="detail-soft-row px-4 py-4 text-sm leading-7 text-slate-300">
                  <span className="font-semibold text-white">Observacoes:</span>{" "}
                  {activeClient.notes || "Sem observacoes adicionais."}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="detail-link-button px-4 py-3 text-sm font-semibold" type="button">
                    Anexar documentos
                  </button>
                  <button className="detail-link-button px-4 py-3 text-sm font-semibold" type="button">
                    Atualizar checklist
                  </button>
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
