import Link from "next/link";
import { WorkspaceStatePanel } from "@lexia/ui";

import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";
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
  let clients: Awaited<ReturnType<typeof getClients>> = [];
  let cases: Awaited<ReturnType<typeof getCases>> = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    [processes, clients, cases] = await Promise.all([getProcesses(), getClients(), getCases()]);
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
  const modelClient = clients[0] ?? null;
  const modelCase = cases[0] ?? null;
  const modelProcess = processes[0] ?? null;

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

  const hasNoRealProcesses = !state && filteredProcesses.length === 0;
  const modelCard = modelClient || modelCase || modelProcess
    ? {
        title:
          modelProcess?.processNumber ??
          modelCase?.processNumber ??
          "0000000-00.2026.8.13.0000",
        clientName:
          modelProcess?.client.fullName ?? modelCase?.client.fullName ?? modelClient?.fullName ?? "Cliente modelo",
        clientDocumentId:
          modelProcess?.client.documentId ?? modelCase?.client.documentId ?? modelClient?.documentId ?? "000.000.000-00",
        bankName: modelProcess?.bankingCase.bankName ?? modelCase?.bankName ?? modelClient?.bankName ?? "Banco modelo",
        tribunal: modelProcess?.tribunal ?? "TJMG",
        courtDistrict: modelProcess?.courtDistrict ?? "Belo Horizonte/MG",
        courtName: modelProcess?.courtName ?? "4a Vara Civel de Belo Horizonte",
        processId: modelProcess?.id ?? modelCase?.id ?? modelClient?.id ?? "modelo-processo",
        statusLabel: modelProcess
          ? statusLabel(modelProcess.status)
          : modelCase
            ? "ativo"
            : "pronto para distribuir"
      }
    : null;
  const flowCards = [
    {
      id: "case",
      title: "Caso",
      detail: "A entrada do atendimento concentra cliente, docs e tese antes da prontidao para distribuir."
    },
    {
      id: "ready",
      title: "Pronto para distribuir",
      detail: "O caso fecha a triagem e fica preparado para virar processo sem automacao externa."
    },
    {
      id: "process",
      title: "Processo",
      detail: "A listagem e o detalhe mostram o processo resultante e seus filtros operacionais."
    }
  ] as const;

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
            Boundary OAB
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

      <div className="mj-model-panel border border-cyan-300/20 bg-cyan-300/10 px-4 py-4">
        <div className="max-w-3xl">
          <p className="mj-model-title">Fluxo canonico</p>
          <p className="mt-1 text-[13px] leading-6 text-slate-200">
            Caso {"->"} pronto para distribuir {"->"} processo. A pagina deixa visivel quando o caso ja pode seguir para o
            processo e deixa claro que a distribuicao aqui e apenas uma prontidao operacional.
          </p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {flowCards.map((card, index) => (
            <div key={card.id} className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {index + 1}. {card.title}
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{card.title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{card.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {state ? (
        <WorkspaceStatePanel
          description={state.description}
          title={state.title}
          tone={state.tone ?? "neutral"}
        />
      ) : null}

      {hasNoRealProcesses && modelCard ? (
        <div className="mj-model-panel border border-cyan-300/20 bg-cyan-300/10 px-4 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="mj-model-title">Exemplo canonico de caso pronto para distribuir</p>
              <p className="mt-1 text-[13px] text-slate-300">
                Use este card para visualizar a transicao do caso para o processo, partindo de um cliente real do tenant.
              </p>
            </div>
            <Link className="mj-model-button-gray inline-flex items-center justify-center" href="/processos/modelo">
              Ver fluxo canonico
            </Link>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Cliente</p>
              <p className="mt-2 text-sm font-semibold text-white">{modelCard.clientName}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{modelCard.clientDocumentId}</p>
            </div>
            <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Banco / Tribunal</p>
              <p className="mt-2 text-sm font-semibold text-white">{modelCard.bankName}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{modelCard.tribunal}</p>
            </div>
            <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Comarca</p>
              <p className="mt-2 text-sm font-semibold text-white">{modelCard.courtDistrict}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{modelCard.courtName}</p>
            </div>
            <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Pronto para distribuir</p>
              <p className="mt-2 text-sm font-semibold text-white">Caso fechado para o processo</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                O quadro do detalhe mostra classe, assunto, urgencia e prontidao interna antes do processo.
              </p>
            </div>
            <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Processo</p>
              <p className="mt-2 text-sm font-semibold text-white">{modelCard.title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{modelCard.statusLabel}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Clique para abrir o modelo e ver o detalhe completo do processo.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!state && filteredProcesses.length === 0 && !modelCard ? (
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
