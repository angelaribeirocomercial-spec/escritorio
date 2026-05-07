import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import { getClaraRecord, getClaraRecordDisplay } from "@/server/services/clara/clara-record-store";
import {
  getClaraAgendaArtifact,
  getClaraRevisionalAgendaArtifact
} from "@/server/services/clara/get-clara-artifacts";
import { getAgendaCommitments } from "@/server/services/agenda/get-agenda-workspace";

function categoryLabel(category: string) {
  switch (category) {
    case "hearing":
      return "Audiencia";
    case "client-follow-up":
      return "Retorno ao cliente";
    case "internal-review":
      return "Revisao interna";
    default:
      return "Reuniao";
  }
}

type ResponsibleOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

function buildResponsibleOptions(
  items: Awaited<ReturnType<typeof getAgendaCommitments>>
): ResponsibleOption[] {
  const responsibles = [...new Set(items.map((item) => item.responsibleLabel).filter(Boolean))];

  return responsibles.length > 0
    ? [
        { label: "Todos os advogados", value: "" },
        ...responsibles.map((responsible) => ({ label: responsible, value: responsible }))
      ]
    : [{ label: "Nenhum advogado disponivel", value: "", disabled: true }];
}

export default async function AgendaCompromissosPage({
  searchParams
}: {
  searchParams?: {
    clara?: string;
    created?: string;
    record?: string;
    client?: string;
    case?: string;
    process?: string;
    document?: string;
    focus?: string;
    objetivo?: string;
    responsible?: string;
  };
}) {
  let commitments: Awaited<ReturnType<typeof getAgendaCommitments>> = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    commitments = await getAgendaCommitments();
  } catch {
    state = {
      title: "Compromissos indisponiveis no momento",
      description:
        "Nao foi possivel carregar a agenda real de compromissos. Valide a configuracao do Supabase, a migration da vertical e o seed do tenant ativo.",
      tone: "danger"
    };
  }

  const claraRecord = await getClaraRecord(searchParams?.record);
  const claraArtifact =
    claraRecord?.kind === "agenda"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraAgendaArtifact>>)
      : searchParams?.clara
        ? searchParams.focus === "revisional"
          ? await getClaraRevisionalAgendaArtifact({
              caseId: searchParams.case,
              clientId: searchParams.client,
              committed: searchParams.created === "1",
              documentId: searchParams.document,
              objective: searchParams.objetivo,
              processId: searchParams.process
            })
          : await getClaraAgendaArtifact(
              searchParams.client,
              searchParams.case,
              searchParams.created === "1"
            )
        : null;
  const claraDisplay = claraArtifact
    ? getClaraRecordDisplay(claraRecord, "Compromisso preparado pela Clara", claraArtifact.message)
    : null;
  const responsibleOptions = buildResponsibleOptions(commitments);
  const selectedResponsible = searchParams?.responsible?.trim() ?? "";
  const filteredCommitments = commitments.filter((commitment) =>
    selectedResponsible ? commitment.responsibleLabel === selectedResponsible : true
  );

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mj-model-title">Compromissos</p>
          <p className="mj-model-subtitle">Exibindo {filteredCommitments.length} resultado(s)</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            className="mj-model-button-gray inline-flex items-center justify-center"
            href="/agenda/google-agenda"
          >
            Integrar com o Google Agenda
          </Link>
          <Link className="mj-model-button-green inline-flex items-center justify-center" href="/agenda/compromissos/novo">
            Adicionar
          </Link>
        </div>
      </div>

      <form className="mj-model-panel px-4 py-4" method="get">
        <label className="mb-2 block text-[13px] font-semibold text-slate-300">Advogados</label>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <select
            className="mj-model-input w-full px-3 outline-none md:flex-1"
            defaultValue={selectedResponsible}
            disabled={responsibleOptions.length === 1 && responsibleOptions[0].disabled === true}
            name="responsible"
          >
            {responsibleOptions.map((option) => (
              <option key={option.label} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="mj-model-button-gray md:w-40" type="submit">
            Filtrar
          </button>
        </div>
      </form>

      {claraArtifact ? (
        <section className="mj-model-panel px-4 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
            Compromisso preparado pela Clara
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-slate-300">
            <span className="rounded-[2px] border px-2 py-1 mj-model-gridline">
              {claraArtifact.statusLabel}
            </span>
            <span className="rounded-[2px] border px-2 py-1 mj-model-gridline">
              {claraArtifact.stageLabel}
            </span>
            <span className="rounded-[2px] border px-2 py-1 mj-model-gridline">
              {claraArtifact.recordId}
            </span>
          </div>
          <p className="mt-3 text-[15px] font-semibold text-white">{claraArtifact.clientLabel}</p>
          <p className="mt-2 text-[13px] leading-6 text-slate-300">{claraDisplay?.detail}</p>
          <p className="mt-3 text-[13px] text-slate-400">Caso: {claraArtifact.caseLabel}</p>
          <div className="mt-3 space-y-2">
            {claraArtifact.talkingPoints.map((item) => (
              <p key={item} className="text-[13px] leading-6 text-slate-300">
                - {item}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {state ? (
        <WorkspaceStatePanel
          description={state.description}
          title={state.title}
          tone={state.tone ?? "neutral"}
        />
      ) : commitments.length === 0 ? (
        <WorkspaceStatePanel
          description="Nenhum compromisso foi encontrado para o tenant ativo."
          title="Agenda sem compromissos"
          tone="neutral"
        />
      ) : (
        <section className="mj-model-panel overflow-hidden">
          <div className="grid grid-cols-[10rem_1.2fr_1fr_10rem_9rem] border-b bg-black/10 px-3 py-3 text-[13px] font-semibold text-slate-300 mj-model-gridline">
            <span>Horario</span>
            <span>Compromisso</span>
            <span>Cliente / Caso</span>
            <span>Responsavel</span>
            <span>Categoria</span>
          </div>

          {filteredCommitments.map((commitment, index) => (
            <div
              key={commitment.id}
              className="grid grid-cols-[10rem_1.2fr_1fr_10rem_9rem] items-center px-3 py-3 text-[13px]"
              style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}
            >
              <div className="text-slate-300">
                <p>{new Date(commitment.scheduledFor).toLocaleDateString("pt-BR")}</p>
                <p className="text-[12px] text-slate-400">
                  {new Date(commitment.scheduledFor).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-slate-200">{commitment.title}</p>
                <p className="truncate text-[12px] text-slate-400">{commitment.locationLabel}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-slate-200">
                  {commitment.client?.fullName ?? "Sem cliente vinculado"}
                </p>
                <p className="truncate text-[12px] text-slate-400">
                  {commitment.bankingCase?.title ?? "Sem caso vinculado"}
                </p>
              </div>
              <span className="truncate text-slate-300">{commitment.responsibleLabel}</span>
              <span className="text-slate-300">{categoryLabel(commitment.category)}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
