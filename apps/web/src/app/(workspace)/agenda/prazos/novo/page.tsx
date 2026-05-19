import Link from "next/link";

import { createProceduralDeadlineAction } from "./actions";

export default function NovoPrazoPage({
  searchParams
}: {
  searchParams?: {
    clientId?: string;
    caseId?: string;
    processId?: string;
    title?: string;
    description?: string;
    dueDate?: string;
    responsibleLabel?: string;
    sourceLabel?: string;
    severity?: string;
  };
}) {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mj-model-title">Novo prazo</p>
          <p className="mj-model-subtitle">Criacao real de prazo processual no tenant ativo</p>
        </div>
        <Link className="mj-model-button-gray inline-flex items-center justify-center" href="/agenda/prazos">
          Voltar
        </Link>
      </div>

      <form action={createProceduralDeadlineAction as any} className="mj-model-panel space-y-4 px-4 py-4">
        <input type="hidden" name="clientId" value={searchParams?.clientId ?? ""} />
        <input type="hidden" name="caseId" value={searchParams?.caseId ?? ""} />
        <input type="hidden" name="processId" value={searchParams?.processId ?? ""} />
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Titulo</label>
          <input
            className="mj-model-input w-full px-3 outline-none"
            defaultValue={searchParams?.title ?? ""}
            name="title"
            placeholder="Responder intimacao"
            type="text"
          />
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Descricao</label>
          <textarea
            className="mj-model-input min-h-[8rem] w-full px-3 py-2 outline-none"
            defaultValue={searchParams?.description ?? ""}
            name="description"
            placeholder="Detalhe do prazo e dos anexos necessarios"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Data limite</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.dueDate ?? ""}
              name="dueDate"
              placeholder="2026-05-04"
              type="text"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Responsavel</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.responsibleLabel ?? ""}
              name="responsibleLabel"
              placeholder="Dra. Helena Siqueira"
              type="text"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Origem</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.sourceLabel ?? ""}
              name="sourceLabel"
              placeholder="Diario Oficial"
              type="text"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Severidade</label>
            <select
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.severity ?? "medium"}
              name="severity"
            >
              <option value="low">Baixa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="mj-model-button-green" type="submit">
            Criar prazo
          </button>
        </div>
      </form>
    </div>
  );
}
