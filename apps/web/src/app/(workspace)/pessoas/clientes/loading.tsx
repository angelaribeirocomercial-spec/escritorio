import { WorkspaceStatePanel } from "@lexia/ui";

export default function PessoasClientesLoading() {
  return (
    <WorkspaceStatePanel
      description="Carregando a carteira real de clientes para o tenant ativo."
      title="Buscando clientes"
      tone="neutral"
    />
  );
}
