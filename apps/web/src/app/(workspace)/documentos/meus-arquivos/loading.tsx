import { WorkspaceStatePanel } from "@lexia/ui";

export default function MeusArquivosLoading() {
  return (
    <WorkspaceStatePanel
      description="Carregando a base real de documentos do tenant ativo."
      title="Buscando documentos"
      tone="neutral"
    />
  );
}
