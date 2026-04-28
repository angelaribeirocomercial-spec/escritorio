import { WorkspaceStatePanel } from "@lexia/ui";

import { ReferenceListPage } from "@/components/layout/reference-list-page";
import { getProceduralUpdates } from "@/server/services/procedural-updates/get-procedural-updates";

export default async function ProcessosUltimosAndamentosPage({
  searchParams
}: {
  searchParams?: {
    termo?: string;
  };
}) {
  let updates: Awaited<ReturnType<typeof getProceduralUpdates>> = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    updates = await getProceduralUpdates();
  } catch {
    state = {
      title: "Ultimos andamentos indisponiveis",
      description:
        "Nao foi possivel carregar os andamentos processuais reais. Valide Supabase, migration e seed do tenant ativo.",
      tone: "danger"
    };
  }

  const query = searchParams?.termo?.toLowerCase().trim() ?? "";
  const filteredUpdates = updates.filter((update) => {
    if (!query) return true;

    return [
      update.movementType,
      update.operationalSummary,
      update.client.fullName,
      update.bankingCase.title,
      update.judicialProcess.processNumber,
      update.sourceLabel
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

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
      count={filteredUpdates.length}
      emptyState="Nenhum andamento recente disponivel para o filtro atual."
      rows={filteredUpdates.map((update) => ({
        id: update.id,
        title: `${update.movementType} | ${update.judicialProcess.processNumber}`,
        detail: `${new Date(update.occurredAt).toLocaleDateString("pt-BR")} | ${update.client.fullName} | ${update.operationalSummary}`,
        href: `/andamentos/${update.id}`
      }))}
      searchValue={searchParams?.termo ?? ""}
      searchPlaceholder="Buscar por processo, cliente, movimento ou resumo"
      title="Ultimos andamentos"
    />
  );
}
