import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import { enableProcessOabAction } from "./actions";
import { getProcesses } from "@/server/services/processes/get-processes";

export default async function ProcessosImportarOabPage({
  searchParams
}: {
  searchParams?: {
    enabled?: string;
    error?: string;
    process?: string;
  };
}) {
  let processes: Awaited<ReturnType<typeof getProcesses>> = [];
  let state: { title: string; description: string; tone?: "neutral" | "warning" | "danger" } | null = null;

  try {
    processes = await getProcesses();
  } catch {
    state = {
      title: "Monitoramento por OAB indisponivel",
      description: "Nao foi possivel carregar os processos reais do tenant ativo para habilitar OAB.",
      tone: "danger"
    };
  }

  const oabProcesses = processes.filter((processItem) => processItem.monitoringMode === "oab");
  const availableProcesses = processes.filter((processItem) => processItem.monitoringMode !== "oab");
  const selectedProcess = searchParams?.process?.trim() ?? "";

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mj-model-title">Monitoramento por OAB</p>
          <p className="mj-model-subtitle">
            {oabProcesses.length} processo(s) monitorado(s) por OAB | {availableProcesses.length} disponivel(eis)
          </p>
        </div>
        <Link className="mj-model-button-gray inline-flex items-center justify-center" href="/processos">
          Voltar para processos
        </Link>
      </div>

      <div className="mj-model-soft-panel px-4 py-4 text-[13px] leading-6 text-slate-400">
        Selecione um processo real do tenant para ativar monitoramento por OAB. A ativacao registra a trilha
        processual e deixa o processo visivel em monitoramentos e andamentos sem simulacao falsa.
      </div>

      {searchParams?.enabled === "1" && selectedProcess ? (
        <WorkspaceStatePanel
          actionHref="/processos"
          actionLabel="Voltar para processos"
          description={`Monitoramento por OAB ativado para o processo ${selectedProcess}. A trilha processual foi registrada.`}
          title="Monitoramento por OAB ativado"
          tone="neutral"
        />
      ) : null}

      {searchParams?.error ? (
        <WorkspaceStatePanel
          actionHref="/processos"
          actionLabel="Voltar para processos"
          description={searchParams.error}
          title="Nao foi possivel ativar OAB"
          tone="warning"
        />
      ) : null}

      <section className="mj-model-panel overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_11rem_10rem] border-b bg-black/10 px-3 py-3 text-[13px] font-semibold text-slate-300 mj-model-gridline">
          <span>Processo</span>
          <span>Cliente / Caso</span>
          <span>Monitoramento atual</span>
          <span className="text-right">Acao</span>
        </div>

        {processes.length ? (
          processes.map((processItem, index) => {
            const alreadyOab = processItem.monitoringMode === "oab";

            return (
              <div
                key={processItem.id}
                className="grid grid-cols-[1fr_1fr_11rem_10rem] items-center px-3 py-3 text-[13px]"
                style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-200">{processItem.processNumber}</p>
                  <p className="mt-1 truncate text-[12px] text-slate-400">{processItem.tribunal}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-slate-200">{processItem.client.fullName}</p>
                  <p className="mt-1 truncate text-[12px] text-slate-400">{processItem.bankingCase.title}</p>
                </div>
                <span className="text-slate-300">
                  {alreadyOab ? "OAB ativa" : processItem.monitoringMode === "court" ? "Tribunal" : "Manual"}
                </span>
                <div className="flex justify-end">
                  {alreadyOab ? (
                    <Link className="mj-model-button-gray inline-flex items-center justify-center" href={`/processos/${processItem.id}`}>
                      Abrir processo
                    </Link>
                  ) : (
                    <form action={enableProcessOabAction as any}>
                      <input type="hidden" name="processId" value={processItem.id} />
                      <button className="mj-model-button-green" type="submit">
                        Ativar OAB
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-4 text-[13px] text-slate-300">Nenhum processo disponivel no tenant ativo.</div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="mj-model-panel px-4 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-400">Monitorados por OAB</p>
          <div className="mt-3 space-y-2 text-[13px] text-slate-300">
            {oabProcesses.length ? (
              oabProcesses.map((processItem) => (
                <div key={processItem.id} className="mj-model-gridline rounded-[4px] border px-3 py-2">
                  <p className="font-semibold text-slate-100">{processItem.processNumber}</p>
                  <p className="mt-1 text-slate-400">{processItem.client.fullName}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400">Nenhum processo com monitoramento por OAB ainda.</p>
            )}
          </div>
        </div>

        <div className="mj-model-panel px-4 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-400">Proxima leitura</p>
          <p className="mt-3 text-[13px] leading-6 text-slate-300">
            A ativacao por OAB atualiza o monitoramento do processo e passa a alimentar a visao de andamentos e
            publicacoes vinculadas.
          </p>
        </div>
      </section>
    </div>
  );
}
