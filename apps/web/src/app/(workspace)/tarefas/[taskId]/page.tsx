import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceStatePanel } from "@lexia/ui";

import { ClaraContextActions } from "@/components/layout/clara-context-actions";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { getTaskById } from "@/server/services/tasks/get-tasks";

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

export default async function TaskDetailPage({
  params
}: {
  params: { taskId: string };
}) {
  let task = null;

  try {
    task = await getTaskById(params.taskId);
  } catch {
    return (
      <WorkspacePage
        description="Nao foi possivel abrir o detalhe da tarefa na base real."
        eyebrow="Tarefa"
        metrics={[
          { label: "Estado", value: "Indisponivel" },
          { label: "Fonte", value: "Supabase" },
          { label: "Tenant", value: "Nao resolvido" },
          { label: "Acao", value: "Validar vertical" }
        ]}
        title="Detalhe indisponivel"
      >
        <WorkspaceStatePanel
          actionHref="/agenda/tarefas"
          actionLabel="Voltar para tarefas"
          description="Valide a configuracao do Supabase, as migrations da vertical de tarefas e a seed do tenant ativo."
          title="Falha ao carregar tarefa"
          tone="danger"
        />
      </WorkspacePage>
    );
  }

  if (!task) {
    notFound();
  }

  const metrics = [
    { label: "Status", value: statusLabel(task.status) },
    { label: "Prioridade", value: priorityLabel(task.priority) },
    { label: "Checklist", value: `${task.completedChecklistCount}/${task.checklist.length}` },
    {
      label: "Prazo",
      value: new Date(task.dueDate).toLocaleDateString("pt-BR")
    }
  ];

  return (
    <WorkspacePage
      description="Workspace operacional da tarefa com checklist, caso vinculado e proxima melhor acao sugerida pela Clara."
      eyebrow="Tarefa"
      metrics={metrics}
      title={task.title}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-slate-400">
          {task.client.fullName} | {task.bankingCase.title} | {task.assigneeLabel}
        </p>
        <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href="/agenda/tarefas">
          Voltar para tarefas
        </Link>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.92fr]">
        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Resumo operacional</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <p>{task.description}</p>
            <p>{task.notes}</p>
            <div className="detail-subpanel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Checklist de origem
              </p>
              <p className="mt-3 text-sm text-slate-300">{task.suggestedByClaimType}</p>
            </div>
          </div>
        </article>

        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Checklist detalhado</p>
          <div className="mt-5 space-y-3">
            {task.checklist.map((item) => (
              <div key={item.id} className="detail-soft-row flex items-start gap-3 px-4 py-4">
                <div
                  className={`mt-0.5 h-5 w-5 rounded-full border ${
                    item.done ? "border-cyan-400 bg-cyan-400" : "border-white/20 bg-transparent"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.done ? "Concluido" : "Pendente"}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Contexto vinculado</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Cliente</dt>
              <dd className="mt-1 text-slate-200">{task.client.fullName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Caso</dt>
              <dd className="mt-1 text-slate-200">{task.bankingCase.title}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Banco reu</dt>
              <dd className="mt-1 text-slate-200">{task.bankingCase.bankName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Tese principal</dt>
              <dd className="mt-1 text-slate-200">{task.bankingCase.mainThesis}</dd>
            </div>
          </dl>
        </article>

        <article className="detail-panel-accent p-6">
          <p className="text-sm font-semibold text-white">Orientacao Clara</p>
          <div className="detail-subpanel mt-5 p-6 text-slate-100 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">
              Modo operacional
            </p>
            <p className="mt-4 text-lg font-semibold">Proxima melhor acao</p>
            <p className="mt-3 text-sm leading-7 text-slate-200">{task.lexiaNextStep}</p>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Estrategia atual do caso: {task.bankingCase.suggestedStrategy}
            </p>
          </div>
        </article>
      </section>

      <ClaraContextActions
        actionHref={`/clara?tab=checklist&task=${task.id}&case=${task.caseId}&client=${task.clientId}#clara-workbench`}
        basis={[
          statusLabel(task.status),
          priorityLabel(task.priority),
          `${task.completedChecklistCount}/${task.checklist.length} checklist`,
          task.bankingCase.title
        ]}
        cautionLabel="A priorizacao sugerida pela Clara deve respeitar a revisao do responsavel da carteira."
        conclusion="A tarefa ja possui contexto suficiente para a Clara orientar a ordem de execucao, indicar o item que desbloqueia o caso e transformar andamento em proxima entrega objetiva."
        eyebrow="Fluxo Clara"
        nextActions={[
          "Reordenar prioridades",
          "Gerar checklist complementar",
          "Montar atualizacao ao cliente"
        ]}
        title="Continuar esta tarefa dentro da Clara"
      />
    </WorkspacePage>
  );
}
