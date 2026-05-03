import { WorkspaceStatePanel } from "@lexia/ui";

import { CrmContractsFrame } from "@/components/layout/crm-contracts-frame";
import { getCrmContracts } from "@/server/services/crm/get-crm-contracts";

export default async function CrmContractsPage() {
  let contracts: Awaited<ReturnType<typeof getCrmContracts>> = [];

  try {
    contracts = await getCrmContracts();
  } catch {
    return (
      <WorkspaceStatePanel
        actionHref="/crm"
        actionLabel="Voltar ao CRM"
        description="Nao foi possivel carregar contratos reais a partir da carteira ativa."
        title="Contratos do CRM indisponiveis"
        tone="danger"
      />
    );
  }

  return (
    <>
      {/* Contrato e transicao */}
      <CrmContractsFrame contracts={contracts} />
    </>
  );
}
