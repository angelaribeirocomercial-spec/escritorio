import {
  BankingCaseRecord,
  ClientRecord,
  JudicialProcessRecord,
  ProceduralUpdateRecord
} from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";
import { getProcesses } from "@/server/services/processes/get-processes";

export type ProceduralUpdateWithRelations = ProceduralUpdateRecord & {
  client: ClientRecord;
  bankingCase: BankingCaseRecord;
  judicialProcess: JudicialProcessRecord;
};

type ProceduralUpdateRow = {
  id: string;
  process_id: string;
  case_id: string;
  client_id: string;
  occurred_at: string;
  movement_type: string;
  source_court: string;
  source_label: string;
  raw_movement: string;
  operational_summary: string;
  criticality: ProceduralUpdateRecord["criticality"];
  clara_impact_summary: string;
  clara_caution: string;
  clara_next_actions: string[] | null;
};

const PROCEDURAL_UPDATE_SELECT = `
  id,
  process_id,
  case_id,
  client_id,
  occurred_at,
  movement_type,
  source_court,
  source_label,
  raw_movement,
  operational_summary,
  criticality,
  clara_impact_summary,
  clara_caution,
  clara_next_actions
`;

function mapProceduralUpdateRow(
  row: ProceduralUpdateRow,
  context: {
    clients: readonly ClientRecord[];
    cases: readonly BankingCaseRecord[];
    processes: readonly JudicialProcessRecord[];
  }
): ProceduralUpdateWithRelations | null {
  const client = context.clients.find((entry) => entry.id === row.client_id);
  const bankingCase = context.cases.find((entry) => entry.id === row.case_id);
  const judicialProcess = context.processes.find((entry) => entry.id === row.process_id);

  if (!client || !bankingCase || !judicialProcess) {
    return null;
  }

  return {
    id: row.id,
    processId: row.process_id,
    caseId: row.case_id,
    clientId: row.client_id,
    occurredAt: row.occurred_at,
    movementType: row.movement_type,
    sourceCourt: row.source_court,
    sourceLabel: row.source_label,
    rawMovement: row.raw_movement,
    operationalSummary: row.operational_summary,
    criticality: row.criticality,
    claraImpactSummary: row.clara_impact_summary,
    claraCaution: row.clara_caution,
    claraNextActions: row.clara_next_actions ?? [],
    client,
    bankingCase,
    judicialProcess
  };
}

export async function getProceduralUpdates(): Promise<
  ProceduralUpdateWithRelations[]
> {
  const session = await getWorkspaceSession();

  if (!session) {
    throw new Error("Workspace session is required to load procedural updates.");
  }

  const supabase = getSupabaseServerClient();
  const [{ data, error }, clients, cases, processes] = await Promise.all([
    supabase
      .from("procedural_updates")
      .select(PROCEDURAL_UPDATE_SELECT)
      .eq("tenant_id", session.workspace.tenant.id)
      .order("occurred_at", { ascending: false }),
    getClients(),
    getCases(),
    getProcesses()
  ]);

  if (error) {
    throw new Error(`Failed to load procedural updates for tenant ${session.workspace.tenant.id}.`);
  }

  return (data ?? [])
    .map((row) =>
      mapProceduralUpdateRow(row as ProceduralUpdateRow, {
        cases,
        clients,
        processes
      })
    )
    .filter((row): row is ProceduralUpdateWithRelations => row !== null);
}

export async function getProceduralUpdateById(
  updateId: string
): Promise<ProceduralUpdateWithRelations | null> {
  const updates = await getProceduralUpdates();
  return updates.find((entry) => entry.id === updateId) ?? null;
}

export async function getProceduralUpdatesByProcessId(
  processId: string
): Promise<ProceduralUpdateWithRelations[]> {
  const updates = await getProceduralUpdates();
  return updates.filter((entry) => entry.processId === processId);
}
