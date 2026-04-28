import { WorkspaceStatePanel } from "@lexia/ui";

import { WorkspacePage } from "@/components/layout/workspace-page";
import { requireWorkspaceSession } from "@/lib/auth/session";

export default async function ConfiguracoesPage() {
  const session = await requireWorkspaceSession();

  return (
    <WorkspacePage
      description="Area de governanca do tenant para identidade, plano, papeis e preferencias futuras."
      eyebrow="Configuracoes"
      metrics={[
        { label: "Tenant", value: session.workspace.tenant.name },
        { label: "Slug", value: session.workspace.tenant.slug },
        { label: "Plano", value: session.workspace.tenant.plan },
        { label: "Papel", value: session.role }
      ]}
      title="Governanca e preferencias do tenant"
    >
      <WorkspaceStatePanel
        description="As configuracoes editaveis ainda precisam de contrato de persistencia, auditoria e aplicacao por tenant. Por enquanto, esta tela exibe somente o contexto real da sessao e bloqueia formularios que nao salvariam alteracoes."
        title="Preferencias editaveis indisponiveis"
        tone="warning"
      />
    </WorkspacePage>
  );
}
