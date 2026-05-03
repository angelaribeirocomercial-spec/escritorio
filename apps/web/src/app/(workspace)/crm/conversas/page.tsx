import { WorkspaceStatePanel } from "@lexia/ui";

import { CrmConversationsFrame } from "@/components/layout/crm-conversations-frame";
import { getCrmConversations } from "@/server/services/crm/get-crm-conversations";

export default async function CrmConversationsPage() {
  let conversations: Awaited<ReturnType<typeof getCrmConversations>> = [];

  try {
    conversations = await getCrmConversations();
  } catch {
    return (
      <WorkspaceStatePanel
        actionHref="/crm"
        actionLabel="Voltar ao CRM"
        description="Nao foi possivel carregar conversas reais a partir da carteira ativa."
        title="Conversas do CRM indisponiveis"
        tone="danger"
      />
    );
  }

  return (
    <>
      {/* Historico de contato */}
      <CrmConversationsFrame conversations={conversations} />
    </>
  );
}
