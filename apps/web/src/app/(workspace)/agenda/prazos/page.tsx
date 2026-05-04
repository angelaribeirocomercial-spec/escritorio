import { WorkspaceStatePanel } from "@lexia/ui";

import { getClaraDeadlineArtifact } from "@/server/services/clara/get-clara-artifacts";
import { getClaraRecord, getClaraRecordDisplay } from "@/server/services/clara/clara-record-store";
import { getProceduralDeadlines } from "@/server/services/agenda/get-agenda-workspace";

function severityLabel(severity: string) {
  switch (severity) {
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    default:
      return "Baixa";
  }
}

type ResponsibleOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

function buildResponsibleOptions(
  items: Awaited<ReturnType<typeof getProceduralDeadlines>>
): ResponsibleOption[] {
  const responsibles = [...new Set(items.map((item) => item.responsibleLabel).filter(Boolean))];

  return responsibles.length > 0
    ? [
        { label: "Todos os advogados", value: "" },
        ...responsibles.map((responsible) => ({ label: responsible, value: responsible }))
      ]
    : [{ label: "Nenhum advogado disponivel", value: "", disabled: true }];
}

export default async function AgendaPrazosPage({
  searchParams
}: {
  searchParams?: { clara?: string; created?: string; record?: string; action?: string };
}) {
  let deadlines: Awaited<ReturnType<typeof getProceduralDeadlines>> = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    deadlines = await getProceduralDeadlines();
  } catch {
    state = {
      title: "Prazos indisponiveis no momento",
      description:
        "Nao foi possivel carregar a base real de prazos. Valide a configuracao do Supabase, a migration da vertical e o seed do tenant ativo.",
      tone: "danger"
    };
  }

  const claraRecord = await getClaraRecord(searchParams?.record);
  const claraArtifact =
    claraRecord?.kind === "deadline"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraDeadlineArtifact>>)
      : searchParams?.clara
        ? await getClaraDeadlineArtifact(searchParams.action, searchParams.created === "1")
        : null;
  const claraDisplay = claraArtifact
    ? getClaraRecordDisplay(claraRecord, "Prazo preparado pela Clara", claraArtifact.summary)
    : null;
  const responsibleOptions = buildResponsibleOptions(deadlines);

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mj-model-title">Prazos</p>
          <p className="mj-model-subtitle">Exibindo {deadlines.length} resultado(s)</p>
        </div>
        <div className="flex gap-2">
          <button className="mj-model-button-gray" type="button">
            Importar lote
          </button>
          <button className="mj-model-button-green" type="button">
            Adicionar
          </button>
        </div>
      </div>

      <p className="text-[13px] text-slate-400">
        prazo em dia prazo expirando prazo expirado prazo baixado
      </p>

      <section className="mj-model-toolbar px-4 py-4">
        <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto]">
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Prazo atendido (baixado)</label>
            <select className="mj-model-input w-full px-3 outline-none">
              <option>Nao</option>
              <option>Todos</option>
              <option>Sim</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Inicio</label>
            <input className="mj-model-input w-full px-3 outline-none" placeholder="__/__/____" type="text" />
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Fim</label>
            <input className="mj-model-input w-full px-3 outline-none" placeholder="__/__/____" type="text" />
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">
              Filtrar pela data do prazo / Filtrar pela data interna
            </label>
            <div className="px-1 py-3 text-[13px] text-slate-400">Advogados</div>
          </div>
          <div>
            <label className="mb-2 block text-[13px]" style={{ color: "transparent" }}>
              Advogados
            </label>
            <select
              className="mj-model-input w-full px-3 outline-none"
              defaultValue=""
              disabled={responsibleOptions.length === 1 && responsibleOptions[0].disabled === true}
            >
              {responsibleOptions.map((option) => (
                <option key={option.label} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button className="mj-model-button-gray" type="button">
              Buscar
            </button>
          </div>
        </div>
      </section>

      {state ? (
        <WorkspaceStatePanel
          description={state.description}
          title={state.title}
          tone={state.tone ?? "neutral"}
        />
      ) : deadlines.length === 0 ? (
        <WorkspaceStatePanel
          description="Nenhum prazo foi encontrado para o tenant ativo."
          title="Agenda sem prazos"
          tone="neutral"
        />
      ) : (
        <section className="mj-model-panel overflow-hidden">
          <div className="grid grid-cols-[8rem_1.2fr_1fr_10rem_9rem] border-b bg-black/10 px-3 py-3 text-[13px] font-semibold text-slate-300 mj-model-gridline">
            <span>Prazo</span>
            <span>Titulo</span>
            <span>Cliente / Caso</span>
            <span>Origem</span>
            <span>Severidade</span>
          </div>

          {deadlines.map((deadline, index) => (
            <div
              key={deadline.id}
              className="grid grid-cols-[8rem_1.2fr_1fr_10rem_9rem] items-center px-3 py-3 text-[13px]"
              style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}
            >
              <span className="text-slate-300">
                {new Date(deadline.dueDate).toLocaleDateString("pt-BR")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-slate-200">{deadline.title}</p>
                <p className="truncate text-[12px] text-slate-400">{deadline.description}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-slate-200">{deadline.client.fullName}</p>
                <p className="truncate text-[12px] text-slate-400">{deadline.bankingCase.title}</p>
              </div>
              <span className="truncate text-slate-300">{deadline.sourceLabel}</span>
              <span className="text-slate-300">{severityLabel(deadline.severity)}</span>
            </div>
          ))}
        </section>
      )}

      {claraArtifact ? (
        <section className="mj-model-panel px-4 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {claraDisplay?.title}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
            <span className="rounded-full border px-2 py-1 mj-model-gridline">{claraArtifact.statusLabel}</span>
            <span className="rounded-full border px-2 py-1 mj-model-gridline">{claraArtifact.stageLabel}</span>
            <span className="rounded-full border px-2 py-1 mj-model-gridline">{claraArtifact.recordId}</span>
          </div>
          <p className="mt-3 text-[15px] text-slate-200">{claraDisplay?.detail}</p>
          <p className="mt-2 text-[13px] text-slate-400">Acao de origem: {claraArtifact.actionLabel}</p>
          <ul className="mt-3 space-y-1 text-[13px] text-slate-400">
            {claraArtifact.steps.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
          {claraDisplay?.reviewNote ? (
            <p className="mt-3 text-[13px] text-slate-400">Revisao humana: {claraDisplay.reviewNote}</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
