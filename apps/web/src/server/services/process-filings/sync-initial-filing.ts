import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

type InitialFilingStatus = "approved" | "filed";

type SyncInitialFilingParams = {
  supabase: SupabaseClient;
  tenantId: string;
  caseId: string;
  sourceMinutaId?: string;
  title: string;
  summary: string;
  nextAction: string;
  status: InitialFilingStatus;
};

type ProcessRow = {
  id: string;
  client_id: string;
};

type FilingRow = {
  id: string;
  status: "draft" | "in_review" | "approved" | "filed" | "fulfilled";
  source_minuta_id: string | null;
};

export async function syncInitialProcessFiling(params: SyncInitialFilingParams) {
  const { data: processRow, error: processError } = await params.supabase
    .from("processes")
    .select("id, client_id")
    .eq("tenant_id", params.tenantId)
    .eq("case_id", params.caseId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (processError) {
    throw new Error(`Falha ao localizar processo do caso para sincronizar a inicial: ${processError.message}`);
  }

  if (!processRow) {
    return null;
  }

  const process = processRow as ProcessRow;
  const { data: existingFiling, error: filingError } = await params.supabase
    .from("process_filings")
    .select("id, status, source_minuta_id")
    .eq("tenant_id", params.tenantId)
    .eq("process_id", process.id)
    .eq("kind", "peticao_inicial")
    .limit(1)
    .maybeSingle();

  if (filingError) {
    throw new Error(`Falha ao localizar peticao inicial do processo: ${filingError.message}`);
  }

  const nextStatus =
    params.status === "filed" || (existingFiling?.status ?? "") === "filed"
      ? "filed"
      : "approved";

  const payload = {
    tenant_id: params.tenantId,
    process_id: process.id,
    case_id: params.caseId,
    client_id: process.client_id,
    kind: "peticao_inicial",
    title: params.title,
    status: nextStatus,
    source_minuta_id: params.sourceMinutaId ?? (existingFiling as FilingRow | null)?.source_minuta_id ?? null,
    summary: params.summary,
    next_action: params.nextAction
  };

  if (existingFiling) {
    const { error: updateError } = await params.supabase
      .from("process_filings")
      .update(payload)
      .eq("tenant_id", params.tenantId)
      .eq("id", (existingFiling as FilingRow).id);

    if (updateError) {
      throw new Error(`Falha ao atualizar peticao inicial sincronizada: ${updateError.message}`);
    }

    return {
      processId: process.id,
      filingId: (existingFiling as FilingRow).id,
      status: nextStatus
    };
  }

  const filingId = `fil-${randomUUID()}`;
  const { error: insertError } = await params.supabase.from("process_filings").insert({
    id: filingId,
    ...payload
  });

  if (insertError) {
    throw new Error(`Falha ao criar peticao inicial sincronizada: ${insertError.message}`);
  }

  return {
    processId: process.id,
    filingId,
    status: nextStatus
  };
}
