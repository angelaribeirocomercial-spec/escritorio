import { notFound } from "next/navigation";

const lightSurfaceStyle = {
  background: "var(--surface-1)",
  borderColor: "var(--surface-border)",
  color: "hsl(var(--foreground))"
} as const;

const content = {
  transferencias: {
    title: "Transferências",
    primaryAction: "Adicionar",
    emptyState: "Você ainda não cadastrou nenhuma transferência."
  },
  vencimentos: {
    title: "Vencimentos",
    primaryAction: "Adicionar",
    emptyState: "Você ainda não cadastrou nenhum vencimento."
  },
  graficos: {
    title: "Gráficos",
    primaryAction: "Atualizar",
    emptyState: "Nenhum gráfico disponível para o período selecionado."
  }
} as const;

export default function FinanceiroSubpage({
  params
}: {
  params: { subpage: keyof typeof content };
}) {
  const page = content[params.subpage];

  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="text-[2rem] font-semibold" style={{ color: "hsl(var(--foreground))" }}>
          {page.title}
        </p>
        <button className="rounded-[10px] bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-4 py-2 text-sm font-semibold text-slate-950 shadow-soft" type="button">
          {page.primaryAction}
        </button>
      </div>

      <div className="workspace-muted text-sm">Exibindo 0 resultado(s)</div>

      <form className="grid gap-3 xl:grid-cols-4" method="get">
        <select className="rounded-[10px] border px-4 py-2.5 text-sm outline-none" style={lightSurfaceStyle}>
          <option value="">Todos os meses</option>
          <option value="04/2026">04/2026</option>
        </select>
        <select className="rounded-[10px] border px-4 py-2.5 text-sm outline-none" style={lightSurfaceStyle}>
          <option value="">Todas as contas</option>
          <option value="principal">Conta Principal</option>
        </select>
        <select className="rounded-[10px] border px-4 py-2.5 text-sm outline-none" style={lightSurfaceStyle}>
          <option value="">Todas</option>
          <option value="aberto">Somente em aberto</option>
          <option value="realizadas">Somente realizadas</option>
        </select>
        <button className="rounded-[10px] bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-soft" type="submit">
          Buscar
        </button>
      </form>

      <div className="text-sm" style={{ color: "var(--text-muted)" }}>
        {page.emptyState}
      </div>
    </div>
  );
}
