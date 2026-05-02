import Link from "next/link";
import { WorkspaceStatePanel } from "@lexia/ui";

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
        <span className="text-[13px] text-slate-400 transition hover:text-white">Ver todos</span>
      </div>
      <div className="px-4 py-4">
        <p className="mj-model-empty">{body}</p>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  let dashboard = null;

  try {
    dashboard = await getDashboardSummary();
  } catch {
    return (
      <div className="mj-model-page space-y-4">
        <WorkspaceStatePanel
          description="Nao foi possivel consolidar o painel operacional com a base real. Valide a configuracao do Supabase e as migracoes das verticais ativas do tenant."
          title="Painel executivo indisponivel no momento"
          tone="danger"
        />
      </div>
    );
  }

  return (
    <div className="mj-model-page space-y-4">
      <section className="mj-model-toolbar px-4 py-4">
        <input
          className="mj-model-input w-full px-4 outline-none"
          placeholder="Numero do processo..."
          type="text"
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.2fr_1.2fr_1.2fr_1.6fr]">
        <MetricCard
          label="Receitas recebidas este mes"
          sublabel="Potencial estimado da carteira ativa"
          value={formatCurrency(dashboard.metrics.totalPotential)}
        />
        <MetricCard
          label="Eventos"
          sublabel="Prazos imediatos no radar operacional"
          value={String(dashboard.deadlines.length)}
        />
        <MetricCard
          label="Processos"
          sublabel="Casos ativos na base real"
          value={String(dashboard.metrics.activeCases)}
        />

        <article className="mj-model-panel px-4 py-4">
          <p className="text-[13px] text-slate-400">Operacao consolidada</p>
          <p className="mt-1 text-[18px] font-semibold text-white">Volumes atuais do tenant</p>
          <div className="mt-5 grid h-[6.2rem] grid-cols-6 items-end gap-2">
            {dashboard.monthlyEvolution.map((entry) => (
              <div key={entry.label} className="flex flex-col items-center gap-2">
                <div
                  className="w-full min-w-[1.8rem] rounded-t-[2px] bg-slate-300/55"
                  style={{ height: `${Math.max(18, entry.value * 8)}px` }}
                />
                <span className="text-[11px] text-slate-400">{entry.label}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <MiniCard
          href="/agenda/compromissos"
          title="Compromissos"
          body={
            dashboard.activities[3]?.detail ??
            "Nenhum compromisso operacional relevante foi consolidado na base real."
          }
        />
        <MiniCard
          href="/agenda/tarefas"
          title="Tarefas"
          body={
            dashboard.urgentTaskList[0]
              ? `${dashboard.urgentTaskList[0].title} | ${dashboard.urgentTaskList[0].clientName}`
              : "Nenhuma tarefa urgente encontrada na base real."
          }
        />
        <MiniCard
          href="/agenda/prazos"
          title="Prazos"
          body={
            dashboard.deadlines[0]
              ? `${dashboard.deadlines[0].title} | ${dashboard.deadlines[0].dateLabel}`
              : "Nenhum prazo imediato encontrado na base real."
          }
        />
      </section>
    </div>
  );
}
