import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import {
  formatFinancialAmount,
  getFinancialBalance,
  getFinancialEntries
} from "@/server/services/finance/get-financial-entries";

export default async function FinanceiroTransferenciasPage({
  searchParams
}: {
  searchParams?: { cliente?: string; mes?: string; conta?: string; situacao?: string; display?: string };
}) {
  let allEntries: Awaited<ReturnType<typeof getFinancialEntries>> = [];
  let transfers: Awaited<ReturnType<typeof getFinancialEntries>> = [];
  let state: { title: string; description: string; tone?: "neutral" | "warning" | "danger" } | null = null;

  try {
    [allEntries, transfers] = await Promise.all([
      getFinancialEntries(),
      getFinancialEntries("transfer")
    ]);
  } catch {
    state = {
      title: "Transferencias indisponiveis no momento",
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

  const filteredTransfers = transfers.filter((entry) => {
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
          <p className="mj-model-title">Transferencias</p>
          <p className="mj-model-subtitle">Exibindo {filteredTransfers.length} resultado(s)</p>
        </div>
        <Link className="mj-model-button-green inline-flex items-center justify-center" href="/financeiro/transferencias/novo">
          Adicionar
        </Link>
      </div>

      <div className="mj-model-panel px-4 py-4">
        <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-slate-400">Saldo consolidado</span>
            <span>
              {selectedDisplay === "open"
                ? String(transfers.filter((entry) => entry.status === "open").length)
                : selectedDisplay === "settled"
                  ? String(transfers.filter((entry) => entry.status === "settled").length)
                  : formatFinancialAmount(getFinancialBalance(allEntries))}
            </span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-slate-300">Exibir</p>
            <select
              className="mj-model-input mt-3 w-full px-3 outline-none"
              defaultValue={selectedDisplay}
              form="finance-filters-transferencias"
              name="display"
            >
              <option value="balance">Saldo</option>
              <option value="settled">Lancamentos realizados</option>
              <option value="open">Lancamentos em aberto</option>
            </select>
          </div>
        </div>
      </div>

      <form id="finance-filters-transferencias" className="mj-model-toolbar grid gap-3 px-4 py-4 xl:grid-cols-[7rem_1fr_1.2fr_1fr_auto]" method="get">
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Mes</label>
          <select className="mj-model-input w-full px-3 outline-none" defaultValue={selectedMonth} name="mes">
            <option value="all">Todos os meses</option>
            <option value="recent">Ultimos lancamentos</option>
            <option value="04/2026">04/2026</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Conta operacional</label>
          <select className="mj-model-input w-full px-3 outline-none" defaultValue={selectedAccount} name="conta">
            <option value="all">Todas as contas</option>
            <option value="Conta Principal">Conta Principal</option>
            <option value="Caixa">Caixa</option>
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
          <label className="mb-2 block text-[13px] text-slate-400">Busca</label>
          <input className="mj-model-input w-full px-3 outline-none" defaultValue={searchParams?.cliente ?? ""} name="cliente" type="text" />
        </div>
        <div className="flex items-end">
          <button className="mj-model-button-gray w-full" type="submit">Buscar</button>
        </div>
      </form>

      {state ? (
        <WorkspaceStatePanel description={state.description} title={state.title} tone={state.tone ?? "neutral"} />
      ) : filteredTransfers.length ? (
        <div className="mj-model-panel overflow-hidden">
          {filteredTransfers.map((entry, index) => (
            <div key={entry.id} className="grid grid-cols-[1fr_9rem_8rem] px-4 py-3 text-[13px]" style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}>
              <div>
                <p className="font-semibold text-slate-200">{entry.title}</p>
                <p className="mt-1 text-slate-400">{entry.accountLabel} para {entry.counterpartyLabel}</p>
              </div>
              <span>{formatFinancialAmount(entry.amount)}</span>
              <span>{entry.status === "settled" ? "Realizada" : "Em aberto"}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">Voce ainda nao cadastrou nenhuma transferencia.</p>
        </div>
      )}
    </div>
  );
}
