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
      description="O CRM organiza a carteira real de leads, o status de conversao e o proximo passo comercial antes do caso entrar no cockpit juridico."
      eyebrow="CRM"
      metrics={[
        { label: "Leads ativos", value: String(activeLeads.length) },
        { label: "Convertidos", value: String(convertedLeads.length) },
        { label: "Fonte real", value: "Clientes do workspace" },
        { label: "Foco atual", value: "Leads e conversao" }
      ]}
      title="Leads e conversao do escritorio"
    >
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Direcao do CRM</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            A home do CRM mostra a carteira viva, a conversao real e o proximo passo comercial. O detalhe segue nos
            blocos de pipeline, follow-ups, contratos, conversas e conversao.
          </p>
        </div>

        <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Acesso rapido</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              className="inline-flex rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-emerald-300/30 hover:bg-emerald-300/10"
              href="/crm/pipeline"
            >
              Abrir pipeline e follow-ups
            </Link>
            <Link
              className="inline-flex rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-emerald-300/30 hover:bg-emerald-300/10"
              href="/crm/contratos"
            >
              Abrir contratos
            </Link>
            <Link
              className="inline-flex rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-emerald-300/30 hover:bg-emerald-300/10"
              href="/crm/conversas"
            >
              Abrir conversas
            </Link>
            <Link
              className="inline-flex rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-emerald-300/30 hover:bg-emerald-300/10"
              href="/crm/conversao"
            >
              Abrir conversao
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {leads.map((lead, index) => (
          <article
            key={lead.id}
            className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-emerald-300/20 hover:bg-white/[0.06]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
              <div className="flex items-start gap-3 lg:min-w-[230px] lg:flex-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-sm font-semibold text-slate-100">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-white">{lead.client.fullName}</p>
                  <p className="mt-1 text-sm text-slate-400">{lead.client.bankName}</p>
                </div>
              </div>

              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
                  <p className="mt-2 text-sm text-slate-300">{lead.stageLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Casos</p>
                  <p className="mt-2 text-sm text-slate-300">{lead.caseCount} caso(s) vinculado(s)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Viabilidade</p>
                  <p className="mt-2 text-sm text-slate-300">{lead.client.legalViabilityScore}%</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Risco</p>
                  <p className="mt-2 text-sm text-slate-300">{lead.riskLabel}</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                <span className="rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  {lead.pipelineLabel}
                </span>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-emerald-300/30 hover:bg-emerald-300/10"
                    href={`/pessoas/clientes/${lead.client.id}`}
                  >
                    Abrir cliente
                  </Link>
                  {lead.client.linkedCases[0]?.id ? (
                    <Link
                      className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-emerald-300/30 hover:bg-emerald-300/10"
                      href={`/casos/${lead.client.linkedCases[0].id}`}
                    >
                      Abrir caso
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-300">{lead.nextAction}</p>
          </article>
        ))}
      </section>
    </WorkspacePage>
  );
}
