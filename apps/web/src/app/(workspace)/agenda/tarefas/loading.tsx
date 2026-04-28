import { WorkspaceStatePanel } from "@lexia/ui";

export default function AgendaTarefasLoading() {
  return (
    <WorkspaceStatePanel
      description="Carregando a agenda operacional de tarefas do tenant ativo."
      title="Buscando tarefas"
      tone="neutral"
    />
  );
}
