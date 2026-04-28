import Link from "next/link";
import { WorkspaceStatePanel } from "@lexia/ui";

import { getClaraRecord, getClaraRecordDisplay } from "@/server/services/clara/clara-record-store";
import {
  getClaraRevisionalTaskArtifact,
  getClaraTaskArtifact
} from "@/server/services/clara/get-clara-artifacts";
import { getOfficialDiaryTaskDraft } from "@/server/services/official-diary/get-official-diary";
import { getTasks } from "@/server/services/tasks/get-tasks";

const warningStyle = {
  background: "rgba(250, 204, 21, 0.14)",
  borderColor: "rgba(250, 204, 21, 0.3)",
  color: "rgba(254, 240, 138, 0.96)"
} as const;

function priorityLabel(priority: string) {
  switch (priority) {
    case "urgent":
      return "Urgente";
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    default:
      return "Baixa";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "in_progress":
      return "Em execucao";
    case "done":
      return "Concluida";
    default:
      return "Pendente";
  }
}

export default async function AgendaTarefasPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    publication?: string;
    clara?: string;
    created?: string;
    record?: string;
    task?: string;
    case?: string;
    client?: string;
    process?: string;
    document?: string;
    focus?: string;
    objetivo?: string;
  };
}) {
  let tasks: Awaited<ReturnType<typeof getTasks>> = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    tasks = await getTasks();
  } catch {
    state = {
      title: "Tarefas indisponiveis no momento",
      description:
        "Nao foi possivel carregar a base real da agenda operacional. Valide a configuracao do Supabase, a migration da vertical e o seed do tenant ativo.",
      tone: "danger"
    };
  }

  const preparedTask = searchParams?.publication
    ? await getOfficialDiaryTaskDraft(searchParams.publication)
    : null;
  const claraRecord = await getClaraRecord(searchParams?.record);
  const claraArtifact =
    claraRecord?.kind === "task"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraTaskArtifact>>)
      : searchParams?.clara
        ? searchParams.focus === "revisional"
          ? await getClaraRevisionalTaskArtifact({
              caseId: searchParams.case,
              clientId: searchParams.client,
              committed: searchParams.created === "1",
              documentId: searchParams.document,
              objective: searchParams.objetivo,
              processId: searchParams.process
            })
          : await getClaraTaskArtifact(
              searchParams.task,
              searchParams.case,
              searchParams.created === "1"
            )
        : null;
  const claraDisplay = claraArtifact
    ? getClaraRecordDisplay(claraRecord, claraArtifact.title, claraArtifact.summary)
    : null;
  const relatedTask =
    claraArtifact && searchParams?.task ? tasks.find((task) => task.id === searchParams.task) ?? null : null;
  const query = searchParams?.q?.toLowerCase().trim() ?? "";
  const filteredTasks = tasks.filter((task) => {
    if (!query) return true;

    return [
      task.title,
      task.description,
      task.client.fullName,
      task.bankingCase.title,
      task.assigneeLabel,
      task.priority
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mj-model-title">Tarefas</p>
          <p className="mj-model-subtitle">Exibindo {filteredTasks.length} resultado(s)</p>
        </div>
        <button className="mj-model-button-green" type="button">
          Adicionar
        </button>
      </div>

      <p className="text-[13px] text-slate-400">
        tarefa em dia prazo da tarefa expirando prazo da tarefa expirado tarefa baixada
      </p>

      <div className="mj-model-panel px-4 py-4 text-[13px] leading-6" style={warningStyle}>
        NOVIDADE: Em breve lancaremos a nova versao desta ferramenta de gestao de tarefas, chamada Workflow. Muito mais moderna, com fluxos de trabalho mais visuais no estilo arrastar e soltar. Aguarde!!
      </div>

      <div className="mj-model-panel px-4 py-4 text-[13px] leading-6" style={warningStyle}>
        Atencao! voce nao possui mais credito para enviar torpedos pelo site. Adquira mais.
      </div>

      {preparedTask ? (
        <section className="mj-model-panel px-4 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-amber-200">
            Tarefa preparada a partir do Diario Oficial
          </p>
          <p className="mt-3 text-[15px] font-semibold text-white">{preparedTask.title}</p>
          <p className="mt-2 text-[13px] leading-6 text-slate-300">{preparedTask.description}</p>
          <p className="mt-3 text-[13px] text-slate-400">
            {preparedTask.clientName} | {preparedTask.caseTitle} | Processo {preparedTask.processNumber}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-slate-300">
            <span className="rounded-[2px] border px-2 py-1 mj-model-gridline">
              Prioridade {priorityLabel(preparedTask.priority)}
            </span>
            <span className="rounded-[2px] border px-2 py-1 mj-model-gridline">
              {preparedTask.sourceLabel}
            </span>
          </div>
        </section>
      ) : null}

      {claraArtifact ? (
        <section className="mj-model-panel px-4 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
            Tarefa preparada pela Clara
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
          <p className="mt-3 text-[15px] font-semibold text-white">{claraDisplay?.title}</p>
          <p className="mt-2 text-[13px] leading-6 text-slate-300">{claraDisplay?.detail}</p>
          <p className="mt-3 text-[13px] text-slate-400">
            Responsavel: {claraArtifact.ownerLabel} | Prioridade{" "}
            {priorityLabel(claraArtifact.priorityLabel)}
          </p>
          <p className="mt-2 text-[13px] text-slate-300">Proxima medida: {claraArtifact.nextStep}</p>
          {relatedTask ? (
            <div className="mt-3">
              <Link
                className="text-[13px] text-slate-300 transition hover:text-white"
                href={`/tarefas/${relatedTask.id}`}
              >
                Abrir detalhe da tarefa
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="mj-model-toolbar px-4 py-4">
        <form className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]" method="get">
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Exibir</label>
            <select className="mj-model-input w-full px-3 outline-none">
              <option>Todas</option>
              <option>Somente pendentes</option>
              <option>Somente finalizadas</option>
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
            <label className="mb-2 block text-[13px] text-slate-400">Busca</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.q ?? ""}
              name="q"
              placeholder="Cliente, tarefa ou responsavel"
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
      ) : (
        <section className="mj-model-panel overflow-hidden">
          <div className="grid grid-cols-[8rem_1.1fr_1fr_9rem_8rem_7rem] border-b bg-black/10 px-3 py-3 text-[13px] font-semibold text-slate-300 mj-model-gridline">
            <span>Prazo</span>
            <span>Tarefa</span>
            <span>Cliente / Caso</span>
            <span>Responsavel</span>
            <span>Status</span>
            <span className="text-right">Abrir</span>
          </div>

          {filteredTasks.length ? (
            filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="grid grid-cols-[8rem_1.1fr_1fr_9rem_8rem_7rem] items-center px-3 py-3 text-[13px]"
                style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}
              >
                <span className="text-slate-300">
                  {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-slate-200">{task.title}</p>
                  <p className="truncate text-[12px] text-slate-400">
                    Prioridade {priorityLabel(task.priority)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-slate-200">{task.client.fullName}</p>
                  <p className="truncate text-[12px] text-slate-400">{task.bankingCase.title}</p>
                </div>
                <span className="truncate text-slate-300">{task.assigneeLabel}</span>
                <span className="text-slate-300">{statusLabel(task.status)}</span>
                <div className="text-right">
                  <Link className="text-slate-300 transition hover:text-white" href={`/tarefas/${task.id}`}>
                    abrir
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-3">
              <p className="mj-model-empty">Nenhuma tarefa encontrada para o tenant ativo.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
