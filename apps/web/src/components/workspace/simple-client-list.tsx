import Link from "next/link";

import { ClientRecord } from "@lexia/domain";
import { WorkspaceStatePanel } from "@lexia/ui";

type SimpleClientListProps = {
  clients: ClientRecord[];
  searchValue?: string;
  state?: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null;
};

export function SimpleClientList({
  clients,
  searchValue = "",
  state = null
}: SimpleClientListProps) {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="mj-model-title">Clientes</p>

        <div className="flex gap-2">
          <Link
            className="mj-model-button-green inline-flex items-center justify-center"
            href="/novo-atendimento-bancario"
          >
            Novo atendimento bancario
          </Link>
        </div>
      </div>

      <p className="mj-model-subtitle">Exibindo {clients.length} resultado(s)</p>

      <section className="mj-model-toolbar px-4 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-[6rem] text-[13px] font-semibold text-slate-400">Busca</div>
          <form className="flex w-full gap-3" method="get">
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchValue}
              name="pesquisa"
              type="text"
            />
            <button className="mj-model-button-gray" type="submit">
              Buscar
            </button>
          </form>
        </div>
      </section>

      {state ? (
        <WorkspaceStatePanel
          description={state.description}
          title={state.title}
          tone={state.tone ?? "neutral"}
        />
      ) : null}

      {clients.length === 0 ? (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">Voce ainda nao cadastrou nenhum cliente.</p>
        </div>
      ) : (
        <div className="mj-model-panel overflow-hidden">
          <div className="divide-y divide-white/10">
            {clients.map((client) => (
              <Link
                key={client.id}
                className="block px-5 py-4 transition hover:bg-white/[0.03]"
                href={`/pessoas/clientes/${client.id}`}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-slate-100">{client.fullName}</p>
                    <p className="mt-1 truncate text-[13px] text-slate-400">
                      {client.documentId} · {client.bankName}
                    </p>
                  </div>
                  <div className="text-[13px] text-slate-400">{client.serviceStatus}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
