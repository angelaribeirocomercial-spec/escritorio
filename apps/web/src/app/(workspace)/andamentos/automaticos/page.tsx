import Link from "next/link";
import { WorkspaceStatePanel } from "@lexia/ui";

import { getProceduralUpdates } from "@/server/services/procedural-updates/get-procedural-updates";

function criticalityLabel(criticality: string) {
  switch (criticality) {
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    default:
      return "Baixa";
  }
}

export default async function AndamentosAutomaticosPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
  };
}) {
  let updates: Awaited<ReturnType<typeof getProceduralUpdates>> = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    updates = await getProceduralUpdates();
  } catch {
    state = {
      title: "Andamentos indisponiveis no momento",
      description:
        "Nao foi possivel carregar a base real de andamentos. Valide a configuracao do Supabase, a migration da vertical e o seed do tenant ativo.",
      tone: "danger"
    };
  }

  const query = searchParams?.q?.toLowerCase().trim() ?? "";
  const filteredUpdates = updates.filter((update) => {
    if (!query) return true;

    return [
      update.movementType,
      update.client.fullName,
      update.bankingCase.title,
      update.judicialProcess.processNumber,
      update.sourceLabel,
      update.operationalSummary
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mj-model-title">Andamentos automaticos</p>
          <p className="mj-model-subtitle">Exibindo {filteredUpdates.length} resultado(s)</p>
        </div>
        <Link
          className="mj-model-button-gray inline-flex items-center justify-center"
          href="/andamentos/monitoramentos"
        >
          Monitorar processos
        </Link>
      </div>

      <div className="mj-model-soft-panel px-4 py-4 text-[13px] leading-6 text-slate-400">
        <p>Andamentos capturados e persistidos para o tenant ativo.</p>
        <p>A utilizacao do monitoramento nao desobriga o advogado a consultar o site dos tribunais.</p>
      </div>

      <section className="mj-model-toolbar px-4 py-4">
        <form className="grid gap-3 xl:grid-cols-[1fr_auto]" method="get">
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Busca</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.q ?? ""}
              name="q"
              placeholder="Cliente, processo, fonte ou movimento"
              type="search"
            />
          </div>
          <div className="flex items-end">
            <button className="mj-model-button-gray" type="submit">
              Buscar
            </button>
          </div>
        </form>
      </section>

      {state ? (
        <WorkspaceStatePanel
          description={state.description}
          title={state.title}
          tone={state.tone ?? "neutral"}
        />
      ) : filteredUpdates.length ? (
        <section className="mj-model-panel overflow-hidden">
          <div className="grid grid-cols-[8rem_1.2fr_1fr_8rem_7rem] border-b bg-black/10 px-3 py-3 text-[13px] font-semibold text-slate-300 mj-model-gridline">
            <span>Data</span>
            <span>Movimento</span>
            <span>Cliente / Processo</span>
            <span>Criticidade</span>
            <span className="text-right">Abrir</span>
          </div>

          {filteredUpdates.map((update, index) => (
            <div
              key={update.id}
              className="grid grid-cols-[8rem_1.2fr_1fr_8rem_7rem] items-center px-3 py-3 text-[13px]"
              style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}
            >
              <span className="text-slate-300">
                {new Date(update.occurredAt).toLocaleDateString("pt-BR")}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-200">{update.movementType}</p>
                <p className="mt-1 truncate text-[12px] text-slate-400">
                  {update.sourceLabel} | {update.operationalSummary}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-slate-200">{update.client.fullName}</p>
                <p className="mt-1 truncate text-[12px] text-slate-400">
                  {update.judicialProcess.processNumber}
                </p>
              </div>
              <span className="text-slate-300">{criticalityLabel(update.criticality)}</span>
              <div className="text-right">
                <Link
                  className="text-slate-300 transition hover:text-white"
                  href={`/andamentos/${update.id}`}
                >
                  abrir
                </Link>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">Nenhum andamento encontrado para o filtro atual.</p>
        </div>
      )}
    </div>
  );
}
