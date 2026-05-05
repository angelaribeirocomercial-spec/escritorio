import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import {
  formatFinancialAmount,
  getFinancialEntries
} from "@/server/services/finance/get-financial-entries";

export default async function FinanceiroVencimentosPage({
  searchParams
}: {
  searchParams?: { cliente?: string; mes?: string; conta?: string };
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
  const selectedMonth = searchParams?.mes?.trim() ?? "all";
  const selectedAccount = searchParams?.conta?.trim() ?? "all";
  const openEntries = entries
    .filter((entry) => entry.status === "open")
    .filter((entry) => {
      const matchesSearch = query
        ? [entry.title, entry.counterpartyLabel, entry.description, entry.categoryLabel]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;
      const matchesAccount = selectedAccount === "all" ? true : entry.accountLabel === selectedAccount;
      const matchesMonth =
        selectedMonth === "all"
          ? true
          : selectedMonth === "recent"
            ? new Date(entry.dueDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            : selectedMonth === "today"
              ? new Date(entry.dueDate).toDateString() === new Date().toDateString()
              : new Date(entry.dueDate).toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" }) ===
                new Date().toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });

      return matchesSearch && matchesAccount && matchesMonth;
    });

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mj-model-title">Resumo dos vencimentos</p>
          <p className="mj-model-subtitle">Exibindo {openEntries.length} resultado(s)</p>
        </div>
        <Link
          className="mj-model-button-green inline-flex items-center justify-center"
          href="/agenda/prazos/novo?title=Lembrete%20de%20vencimento&description=Vencimento%20financeiro%20a%20acompanhar&sourceLabel=Financeiro&severity=medium"
        >
          Lembrar por e-mail
        </Link>
      </div>

      <form className="mj-model-toolbar grid gap-3 px-4 py-4 xl:grid-cols-[10rem_1fr_1fr_auto]" method="get">
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Periodo</label>
          <select className="mj-model-input w-full px-3 outline-none" defaultValue={selectedMonth} name="mes">
            <option value="all">Todos os periodos</option>
            <option value="recent">Proximos 30 dias</option>
            <option value="today">Hoje</option>
            <option value="this-month">Este mes</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Conta</label>
          <select className="mj-model-input w-full px-3 outline-none" defaultValue={selectedAccount} name="conta">
            <option value="all">Todas as contas</option>
            <option value="Conta Principal">Conta Principal</option>
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
