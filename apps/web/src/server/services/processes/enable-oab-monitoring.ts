import { randomUUID } from "node:crypto";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getProcessById } from "@/server/services/processes/get-processes";

type EnableOabMonitoringInput = {
  processId: string;
};

export async function enableOabMonitoring({ processId }: EnableOabMonitoringInput) {
  const session = await getWorkspaceSession();

  if (!session) {
    throw new Error("Workspace session is required.");
  }

  const processItem = await getProcessById(processId);

  if (!processItem) {
    throw new Error("Processo nao encontrado no tenant ativo.");
  }

  const supabase = getSupabaseAdminClient();
  const occurredAt = new Date().toISOString();
  const timelineItem = {
    id: `timeline-${randomUUID()}`,
    occurredAt,
    title: "Monitoramento por OAB ativado",
    description: `O processo ${processItem.processNumber} passou a receber monitoramento por OAB.`,
    source: "OAB",
    criticality: "medium" as const
  };

  const nextTimeline = [...processItem.latestTimeline, timelineItem];

  const { error: processUpdateError } = await supabase
    .from("processes")
    .update({
      monitoring_mode: "oab",
      latest_timeline: nextTimeline
    })
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("id", processId);

  if (processUpdateError) {
    throw new Error(`Falha ao ativar monitoramento por OAB: ${processUpdateError.message}`);
  }

  const { error: updateError } = await supabase.from("procedural_updates").insert({
    id: `update-${randomUUID()}`,
    tenant_id: session.workspace.tenant.id,
    process_id: processItem.id,
    case_id: processItem.caseId,
    client_id: processItem.clientId,
    occurred_at: occurredAt,
    movement_type: "monitoring-oab-enabled",
    source_court: processItem.tribunal,
    source_label: "OAB",
    raw_movement: `Monitoramento por OAB ativado para o processo ${processItem.processNumber}.`,
    operational_summary: "O processo passou a ser acompanhado por OAB com trilha processual registrada.",
    criticality: "medium",
    clara_impact_summary: "A Clara passa a considerar monitoramento por OAB neste processo.",
    clara_caution: "A leitura automatica complementa, mas nao substitui a revisao humana do advogado.",
    clara_next_actions: [
      "Acompanhar novas publicacoes vinculadas",
      "Validar movimentacoes recentes",
      "Revisar impacto juridico das proximas ocorrencias"
    ]
  });

  if (updateError) {
    await supabase
      .from("processes")
      .update({
        monitoring_mode: processItem.monitoringMode,
        latest_timeline: processItem.latestTimeline
      })
      .eq("tenant_id", session.workspace.tenant.id)
      .eq("id", processId);

    throw new Error(`Falha ao registrar trilha da OAB: ${updateError.message}`);
  }

  return {
    occurredAt,
    processNumber: processItem.processNumber
  };
}
