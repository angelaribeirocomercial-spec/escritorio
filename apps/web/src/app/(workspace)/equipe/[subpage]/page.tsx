import { notFound } from "next/navigation";
import { WorkspaceStatePanel } from "@lexia/ui";

import { ReferenceListPage } from "@/components/layout/reference-list-page";
import { getProcesses } from "@/server/services/processes/get-processes";
import { getTasks } from "@/server/services/tasks/get-tasks";

function uniqueByLabel(rows: Array<{ id: string; title: string; detail: string }>) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = row.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default async function EquipeSubpage({
  params
}: {
  params: { subpage: string };
}) {
  if (!["advogados-equipe", "grupo-de-advogados"].includes(params.subpage)) {
    notFound();
  }

  let rows: Array<{ id: string; title: string; detail: string }> = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    const [processes, tasks] = await Promise.all([getProcesses(), getTasks()]);

    if (params.subpage === "advogados-equipe") {
      rows = uniqueByLabel([
        ...processes.map((processItem) => ({
          id: `process-${processItem.id}`,
          title: processItem.responsibleLawyer,
          detail: `${processItem.tribunal} | ${processItem.bankingCase.title}`
        })),
        ...tasks.map((task) => ({
          id: `task-${task.id}`,
          title: task.assigneeLabel,
          detail: `Tarefa ${task.priority} | ${task.bankingCase.title}`
        }))
      ]);
    } else {
      const groups = new Map<string, number>();
      processes.forEach((processItem) => {
        const key = processItem.bankingCase.niche;
        groups.set(key, (groups.get(key) ?? 0) + 1);
      });
      rows = [...groups.entries()].map(([niche, count]) => ({
        id: niche,
        title: `Grupo ${niche}`,
        detail: `${count} processo(s) vinculado(s) a esta frente`
      }));
    }
  } catch {
    state = {
      title: "Equipe indisponivel no momento",
      description:
        "Nao foi possivel derivar a equipe a partir dos processos e tarefas reais do tenant ativo.",
      tone: "danger"
    };
  }

  const page =
    params.subpage === "advogados-equipe"
      ? {
          title: "Advogados / Equipe",
          emptyState: "Nenhum responsavel foi encontrado em processos ou tarefas."
        }
      : {
          title: "Grupo de advogados",
          emptyState: "Nenhum grupo foi derivado dos processos reais."
        };

  if (state) {
    return (
      <WorkspaceStatePanel
        description={state.description}
        title={state.title}
        tone={state.tone ?? "neutral"}
      />
    );
  }

  return (
    <ReferenceListPage
      actions={[{ label: "Adicionar", tone: "primary" }]}
      count={rows.length}
      emptyState={page.emptyState}
      rows={rows}
      title={page.title}
    />
  );
}
