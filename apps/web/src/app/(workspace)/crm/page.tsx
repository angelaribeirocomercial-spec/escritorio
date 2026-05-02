import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import { WorkspacePage } from "@/components/layout/workspace-page";
import { getCrmLeads } from "@/server/services/crm/get-crm-leads";

export default async function CrmPage() {
  let leads: Awaited<ReturnType<typeof getCrmLeads>> = [];
  let state: { title: string; description: string; tone?: "neutral" | "warning" | "danger" } | null = null;

  try {
    leads = await getCrmLeads();
  } catch {
    state = {
      title: "CRM indisponivel no momento",
      description:
        "Nao foi possivel carregar a carteira real para montar a visao de leads e pipeline do workspace.",
      tone: "danger"
    };
  }

  if (state) {
    return (
      <WorkspaceStatePanel
        actionHref="/pessoas/clientes"
        actionLabel="Abrir clientes"
        description={state.description}
        title={state.title}
        tone={state.tone ?? "neutral"}
      />
    );
  }

  const activeLeads = leads.filter((lead) => lead.pipelineLabel !== "Contrato fechado");
  const convertedLeads = leads.filter((lead) => lead.pipelineLabel === "Contrato fechado");

  return (
    <WorkspacePage
      description="O CRM agora organiza a carteira real de leads, o status de conversao e o proximo passo comercial antes do caso entrar de vez no cockpit juridico."
      eyebrow="CRM"
      metrics={[
        { label: "Leads ativos", value: String(activeLeads.length) },
        { label: "Convertidos", value: String(convertedLeads.length) },
        { label: "Fonte real", value: "Clientes do workspace" },
        { label: "Foco atual", value: "Leads e conversao" }
      ]}
      title="Leads e conversao do escritorio"
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Direcao do CRM</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            O CRM agora deixa de ser apenas uma pagina neutra e passa a refletir a conversao real da carteira. A base
            vem dos clientes e dos casos ja cadastrados no workspace, preparando a entrada futura para pipeline,
            follow-ups, contratos e conversas.
          </p>
        </div>

        <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Proximos blocos</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Leads, pipeline, follow-ups, contratos e conversas entram depois desta consolidacao inicial. Por enquanto o
            CRM organiza a carteira viva e mostra o proximo passo de conversao.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {leads.map((lead) => (
          <article
            key={lead.id}
            className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{lead.client.fullName}</p>
                <p className="mt-1 text-sm text-slate-400">{lead.client.bankName}</p>
              </div>
              <span className="rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                {lead.pipelineLabel}
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
                <p className="mt-2">{lead.stageLabel}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Casos</p>
                <p className="mt-2">{lead.caseCount} caso(s) vinculado(s)</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Viabilidade</p>
                <p className="mt-2">{lead.client.legalViabilityScore}%</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Risco</p>
                <p className="mt-2">{lead.riskLabel}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">{lead.nextAction}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                href={`/pessoas/clientes/${lead.client.id}`}
              >
                Abrir cliente
              </Link>
              {lead.client.linkedCases[0]?.id ? (
                <Link
                  className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                  href={`/casos/${lead.client.linkedCases[0].id}`}
                >
                  Abrir caso
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </WorkspacePage>
  );
}
