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
        { label: "Carteira ativa", value: String(activeLeads.length) },
        { label: "Convertidos", value: String(convertedLeads.length) },
        { label: "Foco atual", value: "Leads e conversao" }
      ]}
      title="Leads e conversao do escritorio"
    >
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Direcao do CRM</p>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">
            A home do CRM mostra a carteira viva e aponta para os submenus. Conversas, follow-up e historico ficam
            concentrados em CRM &gt; Conversas.
          </p>
          <p className="mt-3 text-[11px] leading-5 text-slate-500">
            Fonte real: clientes do workspace. Conversas completas ficam em CRM &gt; Conversas.
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
              className="inline-flex rounded-[4px] border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition-colors hover:border-emerald-300/50 hover:bg-emerald-300/20"
              href="/crm/conversas"
            >
              Abrir conversas
            </Link>
          </div>
        </div>
      </section>

      <section className="workspace-panel p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Foco atual</p>
            <p className="text-sm leading-6 text-slate-300">
              Conversas, follow-up e historico ficam concentrados em CRM &gt; Conversas para evitar duplicacao.
            </p>
          </div>
          <Link
            className="inline-flex rounded-[4px] border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition-colors hover:border-emerald-300/50 hover:bg-emerald-300/20"
            href="/crm/conversas"
          >
            Abrir conversas
          </Link>
        </div>
      </section>
    </WorkspacePage>
  );
}
