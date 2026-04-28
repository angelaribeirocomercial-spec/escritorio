import { WorkspaceStatePanel } from "@lexia/ui";

export default function ProcessosImportarLotePage() {
  return (
    <WorkspaceStatePanel
      actionHref="/processos"
      actionLabel="Voltar para processos"
      description="A lista real de processos ja esta disponivel. A importacao em lote precisa de backend proprio antes de ser liberada para uso operacional."
      title="Importacao em lote indisponivel"
      tone="warning"
    />
  );
}
