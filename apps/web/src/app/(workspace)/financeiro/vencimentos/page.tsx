import { WorkspaceStatePanel } from "@lexia/ui";

import {
  formatFinancialAmount,
  getFinancialEntries
} from "@/server/services/finance/get-financial-entries";

export default async function FinanceiroVencimentosPage({
  searchParams
}: {
  searchParams?: { cliente?: string };
}) {
  let entries: Awaited<ReturnType<typeof getFinancialEntries>> = [];
  let state: { title: string; description: string; tone?: "neutral" | "warning" | "danger" } | null = null;

  try {
    entries = await getFinancialEntries();
  } catch {
    state = {
      title: "Vencimentos indisponiveis no momento",
      description: "Nao foi possivel carregar os vencimentos financeiros reais do tenant ativo.",
      tone: "danger"
    };
  }

  const query = searchParams?.cliente?.toLowerCase().trim() ?? "";
  const openEntries = entries
    .filter((entry) => entry.status === "open")
    .filter((entry) =>
      query
        ? [entry.title, entry.counterpartyLabel, entry.description, entry.categoryLabel]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true
    );

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mj-model-title">Resumo dos vencimentos</p>
          <p className="mj-model-subtitle">Exibindo {openEntries.length} resultado(s)</p>
        </div>
        <button className="mj-model-button-green" type="button">Lembrar por e-mail</button>
      </div>

      <form className="mj-model-toolbar grid gap-3 px-4 py-4 xl:grid-cols-[10rem_1fr_1fr_auto]" method="get">
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Periodo</label>
          <select className="mj-model-input w-full px-3 outline-none">
            <option>Proximos 30 dias</option>
            <option>Hoje</option>
            <option>Este mes</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Conta</label>
          <select className="mj-model-input w-full px-3 outline-none">
            <option>Todas as contas</option>
            <option>Conta Principal</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Cliente</label>
          <input className="mj-model-input w-full px-3 outline-none" defaultValue={searchParams?.cliente ?? ""} name="cliente" type="text" />
        </div>
        <div className="flex items-end">
          <button className="mj-model-button-gray w-full" type="submit">Buscar</button>
        </div>
      </form>

      {state ? (
        <WorkspaceStatePanel description={state.description} title={state.title} tone={state.tone ?? "neutral"} />
      ) : openEntries.length ? (
        <div className="mj-model-panel overflow-hidden">
          {openEntries.map((entry, index) => (
            <div key={entry.id} className="grid grid-cols-[8rem_1fr_9rem] px-4 py-3 text-[13px]" style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}>
              <span>{new Date(entry.dueDate).toLocaleDateString("pt-BR")}</span>
              <div>
                <p className="font-semibold text-slate-200">{entry.title}</p>
                <p className="mt-1 text-slate-400">{entry.counterpartyLabel} | {entry.kind}</p>
              </div>
              <span>{formatFinancialAmount(entry.amount)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">Nao existem contas a pagar ou a receber em aberto para o filtro atual.</p>
        </div>
      )}
    </div>
  );
}
