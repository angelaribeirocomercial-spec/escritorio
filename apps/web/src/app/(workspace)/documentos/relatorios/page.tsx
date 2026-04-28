import { WorkspaceStatePanel } from "@lexia/ui";

export default function DocumentosRelatoriosPage() {
  return (
    <WorkspaceStatePanel
      actionHref="/documentos/meus-arquivos"
      actionLabel="Abrir meus arquivos"
      description="Relatorios de armazenamento dependem de metricas reais do storage por tenant. Como ainda nao existe contrato de consumo, cota e exportacao, a tela permanece em estado controlado em vez de exibir capacidade fixa."
      title="Relatorios de arquivos indisponiveis"
      tone="warning"
    />
  );
}
