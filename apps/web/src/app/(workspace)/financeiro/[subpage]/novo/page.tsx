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
              placeholder="0,00"
              type="text"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Data</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.dueDate ?? ""}
              name="dueDate"
              placeholder="2026-05-04"
              type="text"
            />
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
        <div className="flex justify-end">
          <button className="mj-model-button-green" type="submit">
            Criar lancamento
          </button>
        </div>
      </form>
    </div>
  );
}
