import Link from "next/link";

import { getDashboardSummary } from "@/server/services/dashboard/get-dashboard-summary";

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function MetricCard({
  label,
  value,
  sublabel
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <article className="mj-model-panel grid grid-cols-[2.4rem_1fr] gap-3 px-4 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-[2px] border text-sky-400 mj-model-gridline">
        <span className="block h-4 w-4 rounded-[2px] border border-current" />
      </div>
      <div className="min-w-0">
        <p className="text-[18px] font-semibold text-white">{value}</p>
        <p className="mt-1 text-[13px] text-slate-300">{label}</p>
        <p className="mt-1 text-[13px] text-slate-400">{sublabel}</p>
      </div>
    </article>
  );
}

function MiniCard({
  title,
  href,
  body
}: {
  title: string;
  href: string;
  body: string;
}) {
  return (
    <Link className="mj-model-panel block overflow-hidden transition hover:bg-white/[0.03]" href={href}>
      <div className="flex items-center justify-between border-b px-4 py-3 mj-model-gridline">
        <span className="text-[15px] font-semibold text-white">{title}</span>
        <span className="text-[13px] text-slate-400 transition hover:text-white">
          Ver todos
        </span>
      </div>
      <div className="px-4 py-4">
        <p className="mj-model-empty">{body}</p>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const dashboard = await getDashboardSummary();

  return (
    <div className="mj-model-page space-y-4">
      <section className="mj-model-toolbar px-4 py-4">
        <input className="mj-model-input w-full px-4 outline-none" placeholder="Numero do processo..." type="text" />
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.2fr_1.2fr_1.2fr_1.6fr]">
        <MetricCard
          label="Receitas recebidas este mes"
          sublabel="Receitas recebidas este mes"
          value={formatCurrency(dashboard.metrics.totalPotential)}
        />
        <MetricCard
          label="Eventos"
          sublabel="Agendado(s) para este mes"
          value={String(dashboard.deadlines.length)}
        />
        <MetricCard
          label="Processos"
          sublabel="Adicionado(s) este mes"
          value={String(dashboard.metrics.activeCases)}
        />

        <article className="mj-model-panel px-4 py-4">
          <p className="text-[13px] text-slate-400">Financeiro - receitas</p>
          <p className="mt-1 text-[18px] font-semibold text-white">Ultimos 12 meses</p>
          <div className="mt-5 grid h-[6.2rem] grid-cols-12 items-end gap-1">
            {[10, 18, 22, 15, 28, 36, 20, 42, 32, 48, 40, 52].map((height, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div className="w-full rounded-t-[2px] bg-slate-300/55" style={{ height }} />
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <MiniCard href="/agenda/compromissos" title="Compromissos" body="Nenhum compromisso entre hoje e amanha" />
        <MiniCard href="/agenda/tarefas" title="Tarefas" body="Nenhuma tarefa entre hoje e amanha" />
        <MiniCard href="/agenda/prazos" title="Prazos" body="Nenhum prazo entre hoje e amanha" />
      </section>
    </div>
  );
}
