import { WorkspaceStatePanel } from "@lexia/ui";

import { getProcesses } from "@/server/services/processes/get-processes";

function uniqueLabels(labels: string[]) {
  return [...new Set(labels.filter(Boolean))].sort();
}

export default async function DiarioOficialAdvogadosPage() {
  let lawyers: string[] = [];
  let state: { title: string; description: string; tone?: "neutral" | "warning" | "danger" } | null = null;

  try {
    const processes = await getProcesses();
    lawyers = uniqueLabels(processes.map((processItem) => processItem.responsibleLawyer));
  } catch {
    state = {
      title: "Advogados indisponiveis no momento",
      description: "Nao foi possivel carregar responsaveis reais a partir dos processos do tenant ativo.",
      tone: "danger"
    };
  }

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mj-model-title">Advogados monitorados</p>
          <p className="mj-model-subtitle">Exibindo {lawyers.length} resultado(s)</p>
        </div>
        <button className="mj-model-button-green" type="button">
          Adicionar
        </button>
      </div>

      <div className="mj-model-soft-panel px-4 py-4 text-[13px] leading-6 text-slate-400">
        Responsaveis derivados dos processos reais. A configuracao formal de busca por OAB ainda depende da integracao do Diario Oficial.
      </div>

      {state ? (
        <WorkspaceStatePanel description={state.description} title={state.title} tone={state.tone ?? "neutral"} />
      ) : lawyers.length ? (
        <section className="mj-model-panel overflow-hidden">
          {lawyers.map((lawyer, index) => (
            <div key={lawyer} className="px-4 py-3 text-[13px]" style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}>
              <p className="font-semibold text-slate-100">{lawyer}</p>
              <p className="mt-1 text-slate-400">Responsavel vinculado a processo monitorado</p>
            </div>
          ))}
        </section>
      ) : (
        <div className="mj-model-panel px-4 py-4 text-[13px] text-slate-300">
          Nenhum advogado foi encontrado nos processos reais.
        </div>
      )}
    </div>
  );
}
