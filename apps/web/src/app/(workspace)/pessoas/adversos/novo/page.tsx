import Link from "next/link";

import { createAdversaryAction } from "./actions";

import { WorkspacePage } from "@/components/layout/workspace-page";

const action = createAdversaryAction as unknown as string;

export default function NovoAdversoPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <WorkspacePage
      description="Cadastro real de adverso para alimentar o diretório, os filtros do Diario Oficial e a busca do workspace."
      eyebrow="Pessoas"
      metrics={[
        { label: "Destino", value: "Adversos" },
        { label: "Fonte", value: "Supabase" },
        { label: "Papel", value: "Cadastro real" },
        { label: "Saida", value: "Lista de adversos" }
      ]}
      title="Novo adverso"
    >
      <form action={action} className="workspace-panel space-y-5 p-6">
        {errorMessage ? (
          <div className="rounded-[4px] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Nome
            </label>
            <input
              className="reference-search-input w-full px-3 py-2 text-sm outline-none"
              name="name"
              placeholder="Nome do adverso"
              required
              type="text"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Documento
            </label>
            <input
              className="reference-search-input w-full px-3 py-2 text-sm outline-none"
              name="documentId"
              placeholder="CPF ou CNPJ"
              required
              type="text"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Banco
            </label>
            <input
              className="reference-search-input w-full px-3 py-2 text-sm outline-none"
              name="bankName"
              placeholder="Banco relacionado"
              required
              type="text"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Status
            </label>
            <select className="reference-search-input w-full px-3 py-2 text-sm outline-none" defaultValue="active" name="status">
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Advogado
            </label>
            <input
              className="reference-search-input w-full px-3 py-2 text-sm outline-none"
              name="attorneyLabel"
              placeholder="Label do escritorio adverso"
              type="text"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Contato
            </label>
            <input
              className="reference-search-input w-full px-3 py-2 text-sm outline-none"
              name="contactLabel"
              placeholder="Telefone, e-mail ou contato"
              type="text"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Resumo do caso
            </label>
            <textarea
              className="reference-search-input min-h-[8rem] w-full px-3 py-2 text-sm outline-none"
              name="caseSummary"
              placeholder="Contexto resumido para alimentar filtros e buscas."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="mj-model-button-green" type="submit">
            Salvar adverso
          </button>
          <Link className="mj-model-button-gray inline-flex items-center justify-center" href="/pessoas/adversos">
            Voltar
          </Link>
        </div>
      </form>
    </WorkspacePage>
  );
}
