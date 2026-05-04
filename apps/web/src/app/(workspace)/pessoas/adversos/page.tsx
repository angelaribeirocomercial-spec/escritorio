import Link from "next/link";

import { AdversaryRecord } from "@lexia/domain";
import { WorkspaceStatePanel } from "@lexia/ui";

import { getAdversaries } from "@/server/services/adversaries/get-adversaries";

export default async function PessoasAdversosPage({
  searchParams
}: {
  searchParams?: { pesquisa?: string };
}) {
  let adversaries: AdversaryRecord[] = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    adversaries = await getAdversaries();
  } catch {
    state = {
      title: "Adversos indisponiveis no momento",
      description:
        "Nao foi possivel carregar a base real de adversos. Valide Supabase, migration e seed do tenant ativo.",
      tone: "danger"
    };
  }

  const search = searchParams?.pesquisa?.toLowerCase().trim() ?? "";
  const filteredItems = adversaries.filter((item) =>
    !search
      ? true
      : [item.name, item.documentId, item.bankName, item.caseSummary, item.attorneyLabel]
          .join(" ")
          .toLowerCase()
          .includes(search)
  );

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="mj-model-title">Adversos</p>
        <div className="flex gap-2">
          <Link
            className="mj-model-button-gray inline-flex items-center justify-center"
            href="/processos/importar-lote"
            title="Abrir o estado controlado de importacao em lote."
          >
            Importar lote
          </Link>
          <Link className="mj-model-button-green inline-flex items-center justify-center" href="/pessoas/adversos/novo">
            Novo adverso
          </Link>
        </div>
      </div>

      <p className="mj-model-subtitle">Exibindo {filteredItems.length} resultado(s)</p>

      <section className="mj-model-toolbar px-4 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-[6rem] text-[13px] font-semibold text-slate-400">Busca</div>
          <form className="flex w-full gap-3" method="get">
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.pesquisa ?? ""}
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
      ) : filteredItems.length === 0 ? (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">Voce ainda nao cadastrou nenhum adverso.</p>
        </div>
      ) : (
        <div className="mj-model-panel overflow-hidden">
          <div className="divide-y divide-white/10">
            {filteredItems.map((item) => (
              <div key={item.id} className="px-5 py-4">
                <p className="text-[15px] font-semibold text-slate-100">{item.name}</p>
                <p className="mt-1 text-[13px] text-slate-400">
                  {item.caseSummary} | {item.attorneyLabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
