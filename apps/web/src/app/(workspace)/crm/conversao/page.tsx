import { WorkspaceStatePanel } from "@lexia/ui";

import { CrmConversionFrame } from "@/components/layout/crm-conversion-frame";
import { getCrmConversions } from "@/server/services/crm/get-crm-conversion";

export default async function CrmConversionPage() {
  let conversions: Awaited<ReturnType<typeof getCrmConversions>> = [];

  try {
    conversions = await getCrmConversions();
  } catch {
    return (
      <WorkspaceStatePanel
        actionHref="/crm"
        actionLabel="Voltar ao CRM"
        description="Nao foi possivel montar a visao de conversao real a partir da carteira ativa."
        title="Conversao do CRM indisponivel"
        tone="danger"
      />
    );
  }

  return (
    <>
      {/* Intake do chatbot */}
      <CrmConversionFrame conversions={conversions} />
    </>
  );
}
