import Link from "next/link";

import { WorkspacePage } from "@/components/layout/workspace-page";

const crmActions = [
  {
    label: "Clientes",
    href: "/pessoas/clientes",
    detail: "Abrir a carteira ativa com contexto juridico e comercial do escritorio."
  }
] as const;

export default function CrmPage() {
  return (
    <WorkspacePage
      description="O CRM fica dedicado ao relacionamento e a conversao para cliente/caso. Nesta fase, a ancora visivel e a carteira de clientes, enquanto pipeline, follow-ups e contratos entram nas proximas entregas."
      eyebrow="CRM"
      metrics={[
        { label: "Foco", value: "Relacionamento" },
        { label: "Ancora atual", value: "Clientes" },
        { label: "Proximos blocos", value: "Pipeline e follow-ups" },
        { label: "Estado", value: "Em consolidacao" }
      ]}
      title="Relacionamento e conversao do escritorio"
    >
      <section className="grid gap-6">
        <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Direcao do CRM</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            O CRM deixa de espelhar a antiga area de pessoas. Nesta fase ele fica focado na carteira de clientes,
            preparando o terreno para leads, pipeline, follow-ups, contratos e conversas sem misturar entidades herdadas
            que nao representam o modelo final do produto.
          </p>
        </div>

        <section className="grid gap-4 lg:grid-cols-1">
        {crmActions.map((item) => (
          <Link
            key={item.href}
            className="workspace-soft-card flex h-full flex-col justify-between rounded-[4px] border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.07]"
            href={item.href}
          >
            <div>
              <p className="text-lg font-semibold text-white">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
            </div>
            <span className="mt-4 inline-flex w-fit rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              Abrir area
            </span>
          </Link>
        ))}
        </section>
      </section>
    </WorkspacePage>
  );
}
