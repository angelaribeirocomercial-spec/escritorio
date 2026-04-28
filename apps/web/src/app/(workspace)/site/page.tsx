import { WorkspaceStatePanel } from "@lexia/ui";

export default function SitePage() {
  return (
    <WorkspaceStatePanel
      actionHref="/configuracoes"
      actionLabel="Abrir configuracoes gerais"
      description="A vertical de site continua congelada fora do nucleo operacional. O fluxo canonico do escritorio segue por Clara, clientes, processos e configuracoes gerais, sem reativar uma superficie herdada sem backend proprio."
      title="Vertical de site congelada"
      tone="warning"
    />
  );
}
