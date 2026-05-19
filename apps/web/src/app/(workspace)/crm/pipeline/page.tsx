import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import { CrmPipelineFrame } from "@/components/layout/crm-pipeline-frame";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { getCrmPipeline } from "@/server/services/crm/get-crm-pipeline";

export default async function CrmPipelinePage() {
  let pipeline: Awaited<ReturnType<typeof getCrmPipeline>> | null = null;

  try {
    pipeline = await getCrmPipeline();
  } catch {
    return (
      <WorkspaceStatePanel
        actionHref="/crm"
        actionLabel="Voltar ao CRM"
        description="Nao foi possivel montar pipeline e follow-ups reais a partir da carteira ativa."
        title="Pipeline do CRM indisponivel"
        tone="danger"
      />
    );
  }

  return (
    // Follow-ups ativos
    <CrmPipelineFrame
      followUps={pipeline.followUps}
      stages={pipeline.stages}
      totals={pipeline.totals}
    />
  );
}
