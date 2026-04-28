import { WorkspaceStatePanel } from "@lexia/ui";

export default function ProcessosLoading() {
  return (
    <WorkspaceStatePanel
      description="Carregando a carteira real de processos do tenant ativo."
      title="Buscando processos"
      tone="neutral"
    />
  );
}
