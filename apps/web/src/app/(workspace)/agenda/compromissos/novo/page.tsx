import Link from "next/link";

import { createAgendaCommitmentAction } from "./actions";

export default function NovoCompromissoPage({
  searchParams
}: {
  searchParams?: {
    clientId?: string;
    caseId?: string;
    processId?: string;
    title?: string;
    description?: string;
    scheduledFor?: string;
    responsibleLabel?: string;
    locationLabel?: string;
    category?: string;
  };
}) {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mj-model-title">Novo compromisso</p>
          <p className="mj-model-subtitle">Criacao real de agenda no tenant ativo</p>
        </div>
        <Link className="mj-model-button-gray inline-flex items-center justify-center" href="/agenda/compromissos">
          Voltar
        </Link>
      </div>

      <form action={createAgendaCommitmentAction as any} className="mj-model-panel space-y-4 px-4 py-4">
        <input type="hidden" name="clientId" value={searchParams?.clientId ?? ""} />
        <input type="hidden" name="caseId" value={searchParams?.caseId ?? ""} />
        <input type="hidden" name="processId" value={searchParams?.processId ?? ""} />
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Titulo</label>
          <input
            className="mj-model-input w-full px-3 outline-none"
            defaultValue={searchParams?.title ?? ""}
            name="title"
            placeholder="Reuniao com o cliente"
            type="text"
          />
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Descricao</label>
          <textarea
            className="mj-model-input min-h-[8rem] w-full px-3 py-2 outline-none"
            defaultValue={searchParams?.description ?? ""}
            name="description"
            placeholder="Detalhe operacional do compromisso"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Data e hora</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.scheduledFor ?? ""}
              name="scheduledFor"
              placeholder="2026-05-04T09:00:00-03:00"
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
            <label className="mb-2 block text-[13px] text-slate-400">Local</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.locationLabel ?? ""}
              name="locationLabel"
              placeholder="Google Meet"
              type="text"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Categoria</label>
            <select
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.category ?? "meeting"}
              name="category"
            >
              <option value="meeting">Reuniao</option>
              <option value="client-follow-up">Retorno ao cliente</option>
              <option value="internal-review">Revisao interna</option>
              <option value="hearing">Audiencia</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="mj-model-button-green" type="submit">
            Criar compromisso
          </button>
        </div>
      </form>
    </div>
  );
}
