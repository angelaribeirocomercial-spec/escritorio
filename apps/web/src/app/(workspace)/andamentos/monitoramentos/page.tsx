import Link from "next/link";
import { WorkspaceStatePanel } from "@lexia/ui";

import { getProcesses } from "@/server/services/processes/get-processes";

function monitoringModeLabel(mode: string) {
  switch (mode) {
    case "oab":
      return "OAB";
    case "court":
      return "Tribunal";
    default:
      return "Manual";
  }
}

export default async function AndamentosMonitoramentosPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    modo?: string;
  };
}) {
  let processes: Awaited<ReturnType<typeof getProcesses>> = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    processes = await getProcesses();
  } catch {
    state = {
      title: "Monitoramentos indisponiveis no momento",
      description:
        "Nao foi possivel carregar os processos reais para monitoramento. Valide Supabase, migration e seed do tenant ativo.",
      tone: "danger"
    };
  }

  const query = searchParams?.q?.toLowerCase().trim() ?? "";
  const modeFilter = searchParams?.modo ?? "all";
  const monitoredProcesses = processes.filter((processItem) =>
    modeFilter === "all" ? true : processItem.monitoringMode === modeFilter
  );
  const filteredProcesses = monitoredProcesses.filter((processItem) => {
    if (!query) return true;

    return [
      processItem.processNumber,
      processItem.client.fullName,
      processItem.bankingCase.title,
      processItem.tribunal,
      processItem.responsibleLawyer,
      processItem.monitoringMode
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const courtMonitoredCount = processes.filter((processItem) => processItem.monitoringMode === "court").length;
  const oabMonitoredCount = processes.filter((processItem) => processItem.monitoringMode === "oab").length;

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mj-model-title">Monitorar processos</p>
          <p className="mj-model-subtitle">Exibindo {filteredProcesses.length} resultado(s)</p>
          <p className="mt-1 text-[13px] text-slate-400">
            monitoramento manual, por OAB ou por tribunal conforme cadastro do processo
          </p>
        </div>
        <Link
          className="mj-model-button-gray inline-flex items-center justify-center"
          href="/andamentos/automaticos"
        >
          Ver andamentos
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_12rem]">
        <div className="mj-model-panel overflow-hidden">
          <div className="border-b px-4 py-3 text-center text-[13px] font-semibold text-slate-400 mj-model-gridline">
            QUOTAS DE MONITORAMENTO
          </div>
          {[
            ["Processos", `${processes.length}`],
            ["Por tribunal", `${courtMonitoredCount}`],
            ["Por OAB", `${oabMonitoredCount}`],
            ["Manual", `${processes.length - courtMonitoredCount - oabMonitoredCount}`]
          ].map(([label, value], index) => (
            <div
              key={label}
              className="grid grid-cols-[1fr_3rem] px-4 py-3 text-[13px]"
              style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}
            >
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>

        <div className="mj-model-soft-panel px-4 py-4 text-[13px] leading-6 text-slate-400">
          <p className="text-[15px] font-semibold text-white">Atencao:</p>
          <p className="mt-2">Apenas processos no padrao CNJ, preenchidos com a pontuacao correta, podem ser monitorados.</p>
          <p className="mt-2">A utilizacao dos andamentos automaticos nao desobriga o advogado a consultar o site dos tribunais.</p>
        </div>
      </div>

      <section className="mj-model-toolbar px-3 py-3">
        <form className="grid gap-3 xl:grid-cols-[1fr_1fr_auto]" method="get">
          <div>
            <label className="mb-1 block text-[13px] text-slate-400">Modo</label>
            <select
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={modeFilter}
              name="modo"
            >
              <option value="all">Todos</option>
              <option value="manual">Manual</option>
              <option value="oab">OAB</option>
              <option value="court">Tribunal</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-slate-400">Busca</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.q ?? ""}
              name="q"
              placeholder="Filtrar por processo, cliente ou tribunal"
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
      ) : filteredProcesses.length ? (
        <section className="mj-model-panel overflow-hidden">
          <div className="grid grid-cols-[10rem_1fr_1fr_8rem_7rem] border-b bg-black/10 px-3 py-3 text-[13px] font-semibold text-slate-300 mj-model-gridline">
            <span>Modo</span>
            <span>Processo</span>
            <span>Cliente / Caso</span>
            <span>Tribunal</span>
            <span className="text-right">Abrir</span>
          </div>

          {filteredProcesses.map((processItem, index) => (
            <div
              key={processItem.id}
              className="grid grid-cols-[10rem_1fr_1fr_8rem_7rem] items-center px-3 py-3 text-[13px]"
              style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}
            >
              <span className="text-slate-300">{monitoringModeLabel(processItem.monitoringMode)}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-200">{processItem.processNumber}</p>
                <p className="mt-1 truncate text-[12px] text-slate-400">{processItem.responsibleLawyer}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-slate-200">{processItem.client.fullName}</p>
                <p className="mt-1 truncate text-[12px] text-slate-400">{processItem.bankingCase.title}</p>
              </div>
              <span className="text-slate-300">{processItem.tribunal}</span>
              <div className="text-right">
                <Link
                  className="text-slate-300 transition hover:text-white"
                  href={`/processos/${processItem.id}`}
                >
                  abrir
                </Link>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="mj-model-panel px-3 py-3">
          <p className="mj-model-empty">Nenhum processo encontrado para o filtro atual.</p>
        </div>
      )}
    </div>
  );
}
