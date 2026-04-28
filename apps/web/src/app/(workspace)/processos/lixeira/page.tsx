import { WorkspaceStatePanel } from "@lexia/ui";

import { ReferenceListPage } from "@/components/layout/reference-list-page";
import { getProcesses } from "@/server/services/processes/get-processes";

export default async function ProcessosLixeiraPage() {
  let processes: Awaited<ReturnType<typeof getProcesses>> = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    processes = await getProcesses();
  } catch {
    state = {
      title: "Lixeira indisponivel no momento",
      description:
        "Nao foi possivel carregar processos reais para montar a lixeira do tenant ativo.",
      tone: "danger"
    };
  }

  const archivedProcesses = processes.filter((processItem) => processItem.status === "closed");

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
      count={archivedProcesses.length}
      emptyState="Voce ainda nao moveu nenhum processo para a lixeira."
      rows={archivedProcesses.map((processItem) => ({
        id: processItem.id,
        title: processItem.processNumber,
        detail: `${processItem.client.fullName} | ${processItem.bankingCase.title}`,
        href: `/processos/${processItem.id}`
      }))}
      title="Lixeira"
    />
  );
}
