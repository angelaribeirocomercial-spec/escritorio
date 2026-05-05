import Link from "next/link";
import { WorkspaceStatePanel } from "@lexia/ui";

import {
  JudicialProcessWithRelations,
  getProcesses
} from "@/server/services/processes/get-processes";

type FilterType = "cliente" | "advogado" | "processo" | "adverso" | "pasta";
type StatusFilter = "all" | "ativo" | "baixado" | "suspenso";

const filterOptions: Array<{ label: string; value: FilterType; placeholder: string }> = [
  { label: "Cliente", value: "cliente", placeholder: "Nome do cliente" },
  { label: "Advogado", value: "advogado", placeholder: "Nome do advogado" },
  { label: "Processo", value: "processo", placeholder: "Numero do processo" },
  { label: "Adverso", value: "adverso", placeholder: "Nome do adverso" },
  { label: "Pasta", value: "pasta", placeholder: "Nome da pasta" }
];

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "Ver todos os processos", value: "all" },
  { label: "Ver apenas os ativos", value: "ativo" },
  { label: "Ver apenas os baixados", value: "baixado" },
  { label: "Ver apenas os suspensos", value: "suspenso" }
];

function statusLabel(status: string) {
  switch (status) {
    case "monitoring":
    case "awaiting-filing":
    case "active":
      return "ativo";
    case "stayed":
      return "suspenso";
    default:
      return "baixado";
  }
}

export default async function ProcessosPage({
  searchParams
}: {
  searchParams?: {
    filtro?: string;
    tipo?: FilterType;
    status?: StatusFilter;
    localizar?: string;
  };
}) {
  let processes: JudicialProcessWithRelations[] = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    processes = await getProcesses();
  } catch {
    state = {
      title: "Processos indisponiveis no momento",
      description:
        "Nao foi possivel carregar a base real de processos. Valide a configuracao do Supabase, a migration da vertical e o seed do tenant ativo.",
      tone: "danger"
    };
  }

  const statusFilter = searchParams?.status ?? "all";
  const filterType = searchParams?.tipo ?? "cliente";
  const fieldFilter = searchParams?.filtro?.toLowerCase().trim() ?? "";
  const quickSearch = searchParams?.localizar?.toLowerCase().trim() ?? "";
  const activeField =
    filterOptions.find((option) => option.value === filterType) ?? filterOptions[0];

  const filteredProcesses = processes.filter((processItem) => {
    const normalizedStatus = statusLabel(processItem.status);
    const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;

    const filterSourceMap: Record<FilterType, string> = {
      cliente: processItem.client.fullName,
      advogado: processItem.responsibleLawyer,
      processo: processItem.processNumber,
      adverso: processItem.bankingCase.bankName,
      pasta: processItem.bankingCase.title
    };

    const matchesSelectedField =
      !fieldFilter || filterSourceMap[filterType].toLowerCase().includes(fieldFilter);

    const matchesQuickSearch =
      !quickSearch ||
      [
        processItem.processNumber,
        processItem.client.fullName,
        processItem.bankingCase.title,
        processItem.bankingCase.bankName,
        processItem.responsibleLawyer
      ]
        .join(" ")
        .toLowerCase()
        .includes(quickSearch);

    return matchesStatus && matchesSelectedField && matchesQuickSearch;
  });

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mj-model-title">Processos</p>
          <p className="mj-model-subtitle">Exibindo {filteredProcesses.length} resultado(s)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="mj-model-button-green inline-flex items-center justify-center" href="/novo-atendimento-bancario">
            Iniciar caso
          </Link>
          <Link className="mj-model-button-gray inline-flex items-center justify-center" href="/processos/importar-oab">
            Monitoramento OAB
          </Link>
        </div>
      </div>

      <div className="mj-model-panel px-4 py-3">
        <div className="flex flex-wrap items-center gap-4 text-[13px]">
          <span className="text-slate-400">Status:</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">ativo</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span className="text-slate-300">suspenso</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-300">baixado</span>
          </span>
        </div>
      </div>

      <div className="mj-model-toolbar px-4 py-4">
        <div className="text-right text-[13px] text-slate-400">
          Filtros simples /{" "}
          <button
            aria-disabled="true"
            className="font-medium text-slate-200 underline underline-offset-2 opacity-70"
            title="Filtros personalizados ainda nao estao liberados nesta lista."
            type="button"
            disabled
          >
            Filtros personalizados
          </button>
        </div>

        <form className="mt-4 grid gap-4 md:grid-cols-2" method="get">
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Status</label>
            <select
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={statusFilter}
              name="status"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Filtrar</label>
            <div className="grid gap-3 xl:grid-cols-[1fr_11rem]">
              <input
                className="mj-model-input w-full px-3 outline-none"
                defaultValue={searchParams?.filtro ?? ""}
                name="filtro"
                placeholder={activeField.placeholder}
                type="text"
              />
              <select
                className="mj-model-input w-full px-3 outline-none"
                defaultValue={filterType}
                name="tipo"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-[13px] text-slate-400">Busca</label>
            <div className="grid gap-3 xl:grid-cols-[1fr_9rem]">
              <input
                className="mj-model-input w-full px-3 outline-none"
                defaultValue={searchParams?.localizar ?? ""}
                name="localizar"
                placeholder="Buscar em todos os campos"
                type="text"
              />
              <button className="mj-model-button-gray w-full" type="submit">
                Buscar
              </button>
            </div>
          </div>
        </form>
      </div>

      {state ? (
        <WorkspaceStatePanel
          description={state.description}
          title={state.title}
          tone={state.tone ?? "neutral"}
        />
      ) : null}

      {!state && filteredProcesses.length === 0 ? (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">Nenhum processo encontrado para o filtro atual.</p>
        </div>
      ) : !state ? (
        <div className="mj-model-panel overflow-hidden">
          <div className="divide-y mj-model-gridline">
            {filteredProcesses.map((processItem) => (
              <Link
                key={processItem.id}
                className="block px-4 py-4 transition hover:bg-white/[0.03]"
                href={`/processos/${processItem.id}`}
              >
                <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-slate-200">
                      {processItem.processNumber}
                    </p>
                    <p className="mt-1 truncate text-[13px] text-slate-400">
                      {processItem.client.fullName} | {processItem.bankingCase.bankName} |{" "}
                      {processItem.responsibleLawyer}
                    </p>
                  </div>
                  <p className="text-[13px] text-slate-400">{statusLabel(processItem.status)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
