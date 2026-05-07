import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import { WorkspacePage } from "@/components/layout/workspace-page";
import { getClaraIntegrations, type ClaraIntegrationItem } from "@/server/services/clara/get-clara-integrations";

export default async function ConfiguracoesIntegracoesPage() {
  let integrations: ClaraIntegrationItem[] = [];

  try {
    integrations = await getClaraIntegrations();
  } catch {
    return (
      <WorkspaceStatePanel
        actionHref="/configuracoes"
        actionLabel="Voltar"
        description="Nao foi possivel carregar o estado das integracoes da Clara."
        title="Integracoes indisponiveis"
        tone="danger"
      />
    );
  }

  return (
    <WorkspacePage
      description="Catalogo operacional das integracoes oficiais e fontes publicas hoje expostas pela Clara. Esta tela nao representa conectores de calendarios externos do workspace."
      eyebrow="Configuracoes"
      metrics={[
        { label: "Fontes", value: String(integrations.length) },
        { label: "Consultadas", value: String(integrations.filter((item: any) => item.consulted).length) },
        { label: "Preparadas", value: String(integrations.filter((item: any) => item.status === "not_consulted").length) },
        { label: "Foco atual", value: "Integracoes oficiais" }
      ]}
      title="Integracoes oficiais da Clara"
    >
      <section className="workspace-soft-card rounded-[4px] border border-amber-200/20 bg-amber-300/[0.08] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-100">
          Calendarios externos
        </p>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-200">
          Google Agenda e outros calendarios do workspace ainda nao possuem contrato real de autorizacao e sincronizacao nesta base. O acesso dedicado existe apenas para explicitar esse estado sem confundir com as fontes oficiais da Clara.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <Link className="detail-link-button px-3 py-2" href="/configuracoes/integracoes/google-agenda">
            Abrir status do Google Agenda
          </Link>
        </div>
      </section>

      {integrations.some((item) => item.sourceId === "bcb") ? (
        <section className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/80">
            Banco Central
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
            O boundary do Banco Central cobre tarifas, series economicas e PTAX. A consulta publica pode
            ser acompanhada pelos endpoints internos abaixo.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <Link className="detail-link-button px-3 py-2" href="/api/bcb/tarifas?instituicao=Banco%20do%20Brasil">
              Tarifas
            </Link>
            <Link className="detail-link-button px-3 py-2" href="/api/bcb/sgs?serie=433">
              SGS
            </Link>
            <Link className="detail-link-button px-3 py-2" href="/api/bcb/ptax?moeda=USD">
              PTAX
            </Link>
          </div>
        </section>
      ) : null}

      <section className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/80">
          Jurisprudencia e sinais publicos
        </p>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
          As consultas oficiais e preparadas para STJ, STF e Consumidor.gov.br ficam expostas por contrato interno
          para manter a Clara rastreavel sem misturar resultado real com boundary preparado.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <Link className="detail-link-button px-3 py-2" href="/api/jurisprudencia/stj?consulta=fraude%20bancaria">
            STJ
          </Link>
          <Link className="detail-link-button px-3 py-2" href="/api/jurisprudencia/stf?consulta=devido%20processo%20legal">
            STF
          </Link>
          <Link className="detail-link-button px-3 py-2" href="/api/consumidor/reclamacoes?empresa=Banco%20do%20Brasil">
            Consumidor.gov.br
          </Link>
        </div>
      </section>

      <section className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Boundary tecnico</p>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
          As integracoes oficiais ficam abaixo da Clara, com trilha de auditoria e status explicito por fonte. A UI
          apenas observa os contratos server-side.
        </p>
        <div className="mt-4">
          <Link
            className="inline-flex rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
            href="/api/clara/fontes"
          >
            Ver JSON das fontes
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {integrations.map((item) => (
          <article key={item.sourceId} className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{item.sourceLabel}</p>
                <p className="mt-1 text-sm text-slate-400">{item.scope}</p>
              </div>
              <span className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-200">
                {item.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{item.summary}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.queryHint}</p>
            {item.failureReason ? <p className="mt-2 text-sm text-rose-200">{item.failureReason}</p> : null}
          </article>
        ))}
      </section>
    </WorkspacePage>
  );
}
