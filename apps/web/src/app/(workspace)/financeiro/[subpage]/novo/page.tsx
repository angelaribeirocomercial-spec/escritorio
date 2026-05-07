import { notFound } from "next/navigation";

import type { FinancialEntryKind } from "@lexia/domain";

import { createFinancialEntryAction } from "./actions";

const kindBySubpage: Record<string, FinancialEntryKind> = {
  despesas: "expense",
  receitas: "income",
  transferencias: "transfer"
};

const titleByKind: Record<FinancialEntryKind, string> = {
  expense: "Nova despesa",
  income: "Nova receita",
  transfer: "Nova transferencia"
};

const descriptionByKind: Record<FinancialEntryKind, string> = {
  expense: "Registrar despesa real no tenant ativo",
  income: "Registrar receita real no tenant ativo",
  transfer: "Registrar transferencia real no tenant ativo"
};

const targetPathByKind: Record<FinancialEntryKind, string> = {
  expense: "/financeiro/despesas",
  income: "/financeiro/receitas",
  transfer: "/financeiro/transferencias"
};

export default function NovoFinanceiroPage({
  params,
  searchParams
}: {
  params: { subpage: string };
  searchParams?: {
    error?: string;
    clientId?: string;
    caseId?: string;
    title?: string;
    description?: string;
    accountLabel?: string;
    counterpartyLabel?: string;
    amount?: string;
    dueDate?: string;
    status?: string;
    categoryLabel?: string;
  };
}) {
  const kind = kindBySubpage[params.subpage];
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  if (!kind) {
    notFound();
  }

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mj-model-title">{titleByKind[kind]}</p>
          <p className="mj-model-subtitle">{descriptionByKind[kind]}</p>
        </div>
        <a
          className="mj-model-button-gray inline-flex items-center justify-center"
          href={targetPathByKind[kind]}
        >
          Voltar
        </a>
      </div>

      {errorMessage ? (
        <div className="mj-model-panel border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm text-amber-100">
          <p className="font-semibold">Nao foi possivel criar o lancamento.</p>
          <p className="mt-2 leading-6">{errorMessage}</p>
        </div>
      ) : null}

      <form action={createFinancialEntryAction as any} className="mj-model-panel space-y-4 px-4 py-4">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="clientId" value={searchParams?.clientId ?? ""} />
        <input type="hidden" name="caseId" value={searchParams?.caseId ?? ""} />
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Titulo</label>
          <input
            className="mj-model-input w-full px-3 outline-none"
            defaultValue={searchParams?.title ?? ""}
            name="title"
            placeholder="Honorarios iniciais"
            type="text"
          />
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Descricao</label>
          <textarea
            className="mj-model-input min-h-[8rem] w-full px-3 py-2 outline-none"
            defaultValue={searchParams?.description ?? ""}
            name="description"
            placeholder="Detalhe operacional do lancamento"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Conta</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.accountLabel ?? "Conta Principal"}
              name="accountLabel"
              placeholder="Conta Principal"
              type="text"
            />
            <p className="mt-2 text-[12px] leading-5 text-slate-500">
              `Conta Principal` ainda funciona como rotulo operacional. Este slice nao modela caixa nem contas reais.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Contraparte</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.counterpartyLabel ?? ""}
              name="counterpartyLabel"
              placeholder="Cliente, fornecedor ou conta"
              type="text"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Valor</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.amount ?? ""}
              name="amount"
              placeholder="1500,45"
              type="text"
            />
            <p className="mt-2 text-[12px] leading-5 text-slate-500">
              Aceita `1500`, `1500,45` e `1.500,45`.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Data</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.dueDate ?? ""}
              name="dueDate"
              placeholder="07/05/2026 ou 2026-05-07"
              type="text"
            />
            <p className="mt-2 text-[12px] leading-5 text-slate-500">
              A data e convertida para ISO antes de gravar.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Status</label>
            <select className="mj-model-input w-full px-3 outline-none" defaultValue={searchParams?.status ?? "open"} name="status">
              <option value="open">Em aberto</option>
              <option value="settled">Realizada</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Categoria</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.categoryLabel ?? ""}
              name="categoryLabel"
              placeholder="Honorarios"
              type="text"
            />
          </div>
        </div>
        <div className="rounded-[4px] border border-white/10 bg-white/[0.03] px-4 py-4 text-[12px] leading-6 text-slate-400">
          Este fluxo ainda nao faz conciliacao, saldo entre contas reais nem modelagem de caixa. Transferencias continuam como registro operacional simples.
        </div>
        <div className="flex justify-end">
          <button className="mj-model-button-green" type="submit">
            Criar lancamento
          </button>
        </div>
      </form>
    </div>
  );
}
