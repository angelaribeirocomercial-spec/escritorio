import { WorkspaceStatePanel } from "@lexia/ui";

import {
  formatFinancialAmount,
  getFinancialBalance,
  getFinancialEntries
} from "@/server/services/finance/get-financial-entries";

function statusLabel(status: string) {
  return status === "settled" ? "Realizada" : "Em aberto";
}

function BalancePanel({ balance }: { balance: number }) {
  return (
    <div className="mj-model-panel overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[1fr_14rem]">
        <div className="border-b px-4 py-4 md:border-b-0 md:border-r mj-model-gridline">
          <p className="text-[15px] font-semibold text-slate-300">Saldo das contas</p>
          <p className="mt-1 text-[13px] text-slate-400">* Lancamentos reais do tenant ativo</p>
          <div className="mt-4 flex items-center justify-between text-[14px]">
            <span className="text-slate-400">Conta Principal</span>
            <span>{formatFinancialAmount(balance)}</span>
          </div>
        </div>
        <div className="px-4 py-4">
          <p className="text-[15px] font-semibold text-slate-300">Exibir</p>
          <select className="mj-model-input mt-3 w-full px-3 outline-none">
            <option>Saldo</option>
            <option>Lancamentos realizados</option>
            <option>Lancamentos em aberto</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default async function FinanceiroReceitasPage({
  searchParams
}: {
  searchParams?: { cliente?: string };
}) {
  let entries: Awaited<ReturnType<typeof getFinancialEntries>> = [];
  let state: { title: string; description: string; tone?: "neutral" | "warning" | "danger" } | null = null;

  try {
    entries = await getFinancialEntries("income");
  } catch {
    state = {
      title: "Receitas indisponiveis no momento",
      description: "Nao foi possivel carregar os lancamentos financeiros reais do tenant ativo.",
      tone: "danger"
    };
  }

  const query = searchParams?.cliente?.toLowerCase().trim() ?? "";
  const filteredEntries = entries.filter((entry) =>
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
          <p className="mj-model-title">Receitas</p>
          <p className="mj-model-subtitle">Exibindo {filteredEntries.length} resultado(s)</p>
        </div>
        <div className="flex gap-2">
          <button className="mj-model-button-gray" type="button">Transferencia entre contas</button>
          <button className="mj-model-button-green" type="button">Adicionar</button>
        </div>
      </div>

      <BalancePanel balance={getFinancialBalance(entries)} />

      <form className="mj-model-toolbar grid gap-3 px-4 py-4 xl:grid-cols-[7rem_1fr_1.2fr_1fr_auto]" method="get">
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Mes</label>
          <select className="mj-model-input w-full px-3 outline-none">
            <option>04/2026</option>
            <option>Todos os meses</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Contas</label>
          <select className="mj-model-input w-full px-3 outline-none">
            <option>Todas as contas</option>
            <option>Conta Principal</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Situacao</label>
          <select className="mj-model-input w-full px-3 outline-none">
            <option>Todas</option>
            <option>Somente realizadas</option>
            <option>Somente em aberto</option>
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
      ) : filteredEntries.length ? (
        <div className="mj-model-panel overflow-hidden">
          {filteredEntries.map((entry, index) => (
            <div key={entry.id} className="grid grid-cols-[1fr_9rem_8rem] px-4 py-3 text-[13px]" style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}>
              <div>
                <p className="font-semibold text-slate-200">{entry.title}</p>
                <p className="mt-1 text-slate-400">{entry.counterpartyLabel} | {entry.categoryLabel}</p>
              </div>
              <span>{formatFinancialAmount(entry.amount)}</span>
              <span>{statusLabel(entry.status)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">Voce ainda nao cadastrou nenhuma receita.</p>
        </div>
      )}
    </div>
  );
}
