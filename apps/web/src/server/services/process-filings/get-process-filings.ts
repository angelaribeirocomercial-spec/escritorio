import type { ProcessFilingRecord } from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DEMO_PROCESS_FILING_RECORDS } from "@/server/services/demo/demo-workspace-data";
import { getProceduralUpdatesByProcessId } from "@/server/services/procedural-updates/get-procedural-updates";
import { syncSuggestedProcessFiling } from "@/server/services/process-filings/sync-suggested-filing";

type ProcessFilingRow = {
  id: string;
  process_id: string;
  case_id: string;
  client_id: string;
  kind: ProcessFilingRecord["kind"];
  title: string;
  status: ProcessFilingRecord["status"];
  source_minuta_id: string | null;
  linked_update_id: string | null;
  summary: string;
  next_action: string;
  created_at: string;
  updated_at: string;
};

const PROCESS_FILING_SELECT = `
  id,
  process_id,
  case_id,
  client_id,
  kind,
  title,
  status,
  source_minuta_id,
  linked_update_id,
  summary,
  next_action,
  created_at,
  updated_at
`;

function mapProcessFilingRow(row: ProcessFilingRow): ProcessFilingRecord {
  return {
    id: row.id,
    processId: row.process_id,
    caseId: row.case_id,
    clientId: row.client_id,
    kind: row.kind,
    title: row.title,
    status: row.status,
    sourceMinutaId: row.source_minuta_id ?? undefined,
    linkedUpdateId: row.linked_update_id ?? undefined,
    summary: row.summary,
    nextAction: row.next_action,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getProcessFilingsByProcessId(processId: string): Promise<ProcessFilingRecord[]> {
  const session = await getWorkspaceSession();

  if (!session) {
    return [];
  }

  if (
    session.workspace.tenant.slug === "clara-bancaria-demo" ||
    process.env.NEXT_PUBLIC_SUPABASE_URL == null ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY == null
  ) {
    return DEMO_PROCESS_FILING_RECORDS.filter((record) => record.processId === processId);
  }

  const supabase = getSupabaseServerClient();
  let { data, error } = await supabase
    .from("process_filings")
    .select(PROCESS_FILING_SELECT)
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("process_id", processId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn(`Failed to load process filings for process ${processId}.`);
    return [];
  }

  let filings = (data ?? []).map((row) => mapProcessFilingRow(row as ProcessFilingRow));

  try {
    const updates = await getProceduralUpdatesByProcessId(processId);
    const admin = getSupabaseAdminClient();
    const syncResult = await syncSuggestedProcessFiling({
      supabase: admin,
      tenantId: session.workspace.tenant.id,
      processId,
      updates,
      existingFilings: filings
    });

    if (syncResult) {
      const refreshed = await supabase
        .from("process_filings")
        .select(PROCESS_FILING_SELECT)
        .eq("tenant_id", session.workspace.tenant.id)
        .eq("process_id", processId)
        .order("updated_at", { ascending: false });

      if (!refreshed.error) {
        filings = (refreshed.data ?? []).map((row) => mapProcessFilingRow(row as ProcessFilingRow));
      }
    }
  } catch (syncError) {
    console.warn(
      syncError instanceof Error
        ? syncError.message
        : `Failed to sync suggested filing for process ${processId}.`
    );
  }

  return filings;
}
