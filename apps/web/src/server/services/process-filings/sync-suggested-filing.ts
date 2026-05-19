import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProcessFilingRecord } from "@lexia/domain";

import type { ProceduralUpdateWithRelations } from "@/server/services/procedural-updates/get-procedural-updates";

type ExistingFiling = Pick<
  ProcessFilingRecord,
  "id" | "kind" | "status" | "linkedUpdateId" | "processId"
>;

type SuggestedFiling = {
  kind: ProcessFilingRecord["kind"];
  title: string;
  status: ProcessFilingRecord["status"];
  summary: string;
  nextAction: string;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getSuggestedFiling(update: ProceduralUpdateWithRelations): SuggestedFiling | null {
  const evidence = normalizeText(
    [
      update.movementType,
      update.rawMovement,
      update.operationalSummary,
      update.claraImpactSummary,
      ...update.claraNextActions
    ].join(" ")
  );

  if (/contestacao|defesa|resposta do reu|resposta do banco/.test(evidence)) {
    return {
      kind: "replica",
      title: "Replica a contestacao do banco",
      status: "draft",
      summary:
        "Peca superveniente sugerida automaticamente a partir de andamento de contestacao/defesa no processo.",
      nextAction:
        "Conferir os pontos da defesa do banco e preparar a replica com base no dossie e no ultimo andamento."
    };
  }

  if (/intimacao|despacho|prazo para manifestacao|vista/.test(evidence)) {
    return {
      kind: "manifestacao",
      title: "Manifestacao sobre andamento recente",
      status: "draft",
      summary:
        "Peca superveniente sugerida automaticamente a partir de intimacao, despacho ou abertura de prazo processual.",
      nextAction:
        "Conferir o teor do ato intimado e estruturar a manifestacao cabivel antes do vencimento do prazo."
    };
  }

  if (/sentenca|acordao|decisao final|improcedente|procedente/.test(evidence)) {
    return {
      kind: "recurso",
      title: "Recurso cabivel contra decisao recente",
      status: "in_review",
      summary:
        "Peca recursal sugerida automaticamente a partir de decisao/sentenca identificada no acompanhamento do processo.",
      nextAction:
        "Revisar a decisao, validar prazo recursal e definir a estrategia de impugnacao cabivel."
    };
  }

  if (/cumprimento de sentenca|execucao|penhora|bloqueio/.test(evidence)) {
    return {
      kind: "cumprimento_sentenca",
      title: "Frente de cumprimento de sentenca",
      status: "in_review",
      summary:
        "Peca de cumprimento sugerida automaticamente a partir de andamento executivo identificado no processo.",
      nextAction:
        "Conferir a fase executiva e estruturar a medida de cumprimento/impugnacao adequada."
    };
  }

  return null;
}

export async function syncSuggestedProcessFiling(params: {
  supabase: SupabaseClient;
  tenantId: string;
  processId: string;
  updates: ProceduralUpdateWithRelations[];
  existingFilings: ExistingFiling[];
}) {
  const relevantUpdate = [...params.updates]
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
    )
    .find((update) => getSuggestedFiling(update) !== null);

  if (!relevantUpdate) {
    return null;
  }

  const suggestion = getSuggestedFiling(relevantUpdate);

  if (!suggestion) {
    return null;
  }

  const alreadyLinked = params.existingFilings.some(
    (filing) => filing.linkedUpdateId === relevantUpdate.id
  );

  if (alreadyLinked) {
    return null;
  }

  const openSameKind = params.existingFilings.some(
    (filing) =>
      filing.kind === suggestion.kind &&
      filing.processId === params.processId &&
      filing.status !== "fulfilled"
  );

  if (openSameKind) {
    return null;
  }

  const { error } = await params.supabase.from("process_filings").insert({
    id: `fil-${randomUUID()}`,
    tenant_id: params.tenantId,
    process_id: params.processId,
    case_id: relevantUpdate.caseId,
    client_id: relevantUpdate.clientId,
    kind: suggestion.kind,
    title: suggestion.title,
    status: suggestion.status,
    linked_update_id: relevantUpdate.id,
    summary: `${suggestion.summary} Andamento gatilho: ${relevantUpdate.movementType}.`,
    next_action: suggestion.nextAction
  });

  if (error) {
    throw new Error(
      `Falha ao sincronizar peca superveniente sugerida para o processo ${params.processId}: ${error.message}`
    );
  }

  return {
    linkedUpdateId: relevantUpdate.id,
    kind: suggestion.kind
  };
}
