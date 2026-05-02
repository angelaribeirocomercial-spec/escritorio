import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import { WorkspacePage } from "@/components/layout/workspace-page";
import { getCrmPipeline } from "@/server/services/crm/get-crm-pipeline";

export default async function CrmPipelinePage() {
  let pipeline: Awaited<ReturnType<typeof getCrmPipeline>> | null = null;

  try {
    pipeline = await getCrmPipeline();
  } catch {
    return (
      <WorkspaceStatePanel
        actionHref="/crm"
        actionLabel="Voltar ao CRM"
        description="Nao foi possivel montar pipeline e follow-ups reais a partir da carteira ativa."
        title="Pipeline do CRM indisponivel"
        tone="danger"
      />
    );
  }

  return (
    <WorkspacePage
      description="Pipeline e follow-ups derivados dos clientes e casos reais do workspace."
      eyebrow="CRM"
      metrics={[
        { label: "Clientes", value: String(pipeline.totals.clients) },
        { label: "Casos", value: String(pipeline.totals.cases) },
        { label: "Estagios", value: String(pipeline.totals.stages) },
        { label: "Follow-ups", value: String(pipeline.totals.followUps) }
      ]}
      title="Pipeline e follow-ups"
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Visao do pipeline</p>
          <div className="mt-4 space-y-3">
            {pipeline.stages.map((stage) => (
              <div key={stage.id} className="rounded-[4px] border border-white/10 bg-black/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white">{stage.label}</p>
                  <span className="rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                    {stage.count}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{stage.summary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Follow-ups ativos</p>
          <div className="mt-4 space-y-3">
            {pipeline.followUps.map((item) => (
              <article key={item.id} className="rounded-[4px] border border-white/10 bg-black/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.clientName}</p>
                  </div>
                  <span className="rounded-[4px] border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                    {item.priority}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.nextAction}</p>
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
      </section>
    </WorkspacePage>
  );
}
