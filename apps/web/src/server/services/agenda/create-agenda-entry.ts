import { randomUUID } from "node:crypto";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type CreateAgendaCommitmentInput = {
  title: string;
  description: string;
  scheduledFor: string;
  responsibleLabel: string;
  locationLabel: string;
  category: "hearing" | "client-follow-up" | "internal-review" | "meeting";
  clientId?: string;
  caseId?: string;
  processId?: string;
};

type CreateProceduralDeadlineInput = {
  title: string;
  description: string;
  dueDate: string;
  responsibleLabel: string;
  sourceLabel: string;
  severity: "low" | "medium" | "high";
  clientId?: string;
  caseId?: string;
  processId?: string;
};

async function resolveTenant() {
  const session = await getWorkspaceSession();

  if (!session) {
    throw new Error("Workspace session is required.");
  }

  return {
    session,
    supabase: getSupabaseAdminClient()
  };
}

export async function createAgendaCommitment(input: CreateAgendaCommitmentInput) {
  const { session, supabase } = await resolveTenant();
  const id = `commitment-${randomUUID()}`;

  const { error } = await supabase.from("agenda_commitments").insert({
    id,
    tenant_id: session.workspace.tenant.id,
    client_id: input.clientId ?? null,
    case_id: input.caseId ?? null,
    process_id: input.processId ?? null,
    title: input.title,
    description: input.description,
    scheduled_for: input.scheduledFor,
    responsible_label: input.responsibleLabel,
    location_label: input.locationLabel,
    category: input.category
  });

  if (error) {
    throw new Error(`Falha ao criar compromisso da agenda: ${error.message}`);
  }

  return id;
}

export async function createProceduralDeadline(input: CreateProceduralDeadlineInput) {
  const { session, supabase } = await resolveTenant();
  const id = `deadline-${randomUUID()}`;

  const { error } = await supabase.from("procedural_deadlines").insert({
    id,
    tenant_id: session.workspace.tenant.id,
    client_id: input.clientId ?? "",
    case_id: input.caseId ?? "",
    process_id: input.processId ?? null,
    title: input.title,
    description: input.description,
    due_date: input.dueDate,
    responsible_label: input.responsibleLabel,
    source_label: input.sourceLabel,
    severity: input.severity
  });

  if (error) {
    throw new Error(`Falha ao criar prazo processual: ${error.message}`);
  }

  return id;
}
