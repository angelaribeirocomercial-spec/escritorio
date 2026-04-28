import { WorkspaceStatePanel } from "@lexia/ui";

export default function ProcessosImportarOabPage() {
  return (
    <WorkspaceStatePanel
      actionHref="/processos"
      actionLabel="Voltar para processos"
      description="A importacao automatizada por OAB depende de integracao externa especifica. Use a lista real de processos enquanto esse conector nao estiver implementado."
      title="Importacao via OAB indisponivel"
      tone="warning"
    />
  );
}
