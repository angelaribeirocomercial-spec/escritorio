import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import {
  formatFinancialAmount,
  getFinancialBalance,
  getFinancialEntries
} from "@/server/services/finance/get-financial-entries";

function statusLabel(status: string) {
  return status === "settled" ? "Realizada" : "Em aberto";
}

function BalancePanel({
  balance,
  displayMode,
  entries
}: {
  balance: number;
  displayMode: string;
  entries: Awaited<ReturnType<typeof getFinancialEntries>>;
}) {
  const settledCount = entries.filter((entry) => entry.status === "settled").length;
  const openCount = entries.filter((entry) => entry.status === "open").length;
  const balanceLabel =
    displayMode === "settled" ? "Lancamentos realizados" : displayMode === "open" ? "Lancamentos em aberto" : "Saldo";
  const balanceValue =
    displayMode === "settled" ? String(settledCount) : displayMode === "open" ? String(openCount) : formatFinancialAmount(balance);

  return (
    <div className="mj-model-panel overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[1fr_14rem]">
        <div className="border-b px-4 py-4 md:border-b-0 md:border-r mj-model-gridline">
          <p className="text-[15px] font-semibold text-slate-300">Saldo das contas</p>
          <p className="mt-1 text-[13px] text-slate-400">* Lancamentos reais do tenant ativo</p>
          <div className="mt-4 flex items-center justify-between text-[14px]">
            <span className="text-slate-400">Conta Principal</span>
            <span>{balanceValue}</span>
          </div>
        </div>
        <div className="px-4 py-4">
          <p className="text-[15px] font-semibold text-slate-300">Exibir</p>
          <select
            className="mj-model-input mt-3 w-full px-3 outline-none"
            defaultValue={displayMode}
            form="finance-filters-despesas"
            name="display"
          >
            <option value="balance">Saldo</option>
            <option value="settled">Lancamentos realizados</option>
            <option value="open">Lancamentos em aberto</option>
          </select>
          <p className="mt-3 text-[12px] text-slate-500">Modo atual: {balanceLabel}</p>
        </div>
      </div>
    </div>
  );
}

export default async function FinanceiroDespesasPage({
  searchParams
}: {
  searchParams?: { cliente?: string; mes?: string; conta?: string; situacao?: string; display?: string };
}) {
  let allEntries: Awaited<ReturnType<typeof getFinancialEntries>> = [];
  let expenses: Awaited<ReturnType<typeof getFinancialEntries>> = [];
  let state: { title: string; description: string; tone?: "neutral" | "warning" | "danger" } | null = null;

  try {
    [allEntries, expenses] = await Promise.all([
      getFinancialEntries(),
      getFinancialEntries("expense")
    ]);
  } catch {
    state = {
      title: "Despesas indisponiveis no momento",
      description: "Nao foi possivel carregar os lancamentos financeiros reais do tenant ativo.",
      tone: "danger"
    };
  }

  const query = searchParams?.cliente?.toLowerCase().trim() ?? "";
  const selectedMonth = searchParams?.mes?.trim() ?? "all";
  const selectedAccount = searchParams?.conta?.trim() ?? "all";
  const selectedSituation = searchParams?.situacao?.trim() ?? "all";
  const selectedDisplay = searchParams?.display?.trim() ?? "balance";

  function matchesMonth(dueDate: string) {
    if (selectedMonth === "all") {
      return true;
    }

    const current = new Date(dueDate);

    if (selectedMonth === "recent") {
      const recent = new Date();
      recent.setDate(recent.getDate() - 30);
      return current >= recent;
    }

    return current.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" }) === selectedMonth;
  }

  const filteredExpenses = expenses.filter((entry) => {
    const matchesSearch = query
      ? [entry.title, entry.counterpartyLabel, entry.description, entry.categoryLabel]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;
    const matchesAccount = selectedAccount === "all" ? true : entry.accountLabel === selectedAccount;
    const matchesSituation =
      selectedSituation === "all"
        ? true
        : selectedSituation === "settled"
          ? entry.status === "settled"
          : entry.status === "open";
    return matchesSearch && matchesAccount && matchesSituation && matchesMonth(entry.dueDate);
  });

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mj-model-title">Despesas</p>
          <p className="mj-model-subtitle">Exibindo {filteredExpenses.length} resultado(s)</p>
        </div>
        <div className="flex gap-2">
          <Link className="mj-model-button-gray inline-flex items-center justify-center" href="/financeiro/transferencias/novo">
            Transferencia entre contas
          </Link>
          <Link className="mj-model-button-green inline-flex items-center justify-center" href="/financeiro/despesas/novo">
            Adicionar
          </Link>
        </div>
      </div>

      <BalancePanel balance={getFinancialBalance(allEntries)} displayMode={selectedDisplay} entries={expenses} />

      <form id="finance-filters-despesas" className="mj-model-toolbar grid gap-3 px-4 py-4 xl:grid-cols-[7rem_1fr_1.2fr_1fr_auto]" method="get">
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Mes</label>
          <select className="mj-model-input w-full px-3 outline-none" defaultValue={selectedMonth} name="mes">
            <option value="all">Todos os meses</option>
            <option value="recent">Ultimos lancamentos</option>
            <option value="04/2026">04/2026</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Contas</label>
          <select className="mj-model-input w-full px-3 outline-none" defaultValue={selectedAccount} name="conta">
            <option value="all">Todas as contas</option>
            <option value="Conta Principal">Conta Principal</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Situacao</label>
          <select className="mj-model-input w-full px-3 outline-none" defaultValue={selectedSituation} name="situacao">
            <option value="all">Todas</option>
            <option value="settled">Somente realizadas</option>
            <option value="open">Somente em aberto</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Fornecedor/Cliente</label>
          <input className="mj-model-input w-full px-3 outline-none" defaultValue={searchParams?.cliente ?? ""} name="cliente" type="text" />
        </div>
        <div className="flex items-end">
          <button className="mj-model-button-gray w-full" type="submit">Buscar</button>
        </div>
      </form>

      {state ? (
        <WorkspaceStatePanel description={state.description} title={state.title} tone={state.tone ?? "neutral"} />
      ) : filteredExpenses.length ? (
        <div className="mj-model-panel overflow-hidden">
          {filteredExpenses.map((entry, index) => (
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
          <p className="mj-model-empty">Voce ainda nao cadastrou nenhuma despesa.</p>
        </div>
      )}
    </div>
  );
}
