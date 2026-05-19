import { randomUUID } from "node:crypto";

import type { FinancialEntryKind, FinancialEntryStatus } from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type CreateFinancialEntryInput = {
  kind: FinancialEntryKind;
  title: string;
  description: string;
  accountLabel: string;
  counterpartyLabel: string;
  amount: number;
  dueDate: string;
  status: FinancialEntryStatus;
  categoryLabel: string;
  clientId?: string;
  caseId?: string;
  settledAt?: string;
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

export async function createFinancialEntry(input: CreateFinancialEntryInput) {
  const { session, supabase } = await resolveTenant();
  const id = `financial-${randomUUID()}`;

  const { error } = await supabase.from("financial_entries").insert({
    id,
    tenant_id: session.workspace.tenant.id,
    client_id: input.clientId ?? null,
    case_id: input.caseId ?? null,
    kind: input.kind,
    title: input.title,
    description: input.description,
    account_label: input.accountLabel,
    counterparty_label: input.counterpartyLabel,
    amount: input.amount,
    due_date: input.dueDate,
    settled_at: input.settledAt ?? null,
    status: input.status,
    category_label: input.categoryLabel
  });

  if (error) {
    throw new Error(`Falha ao criar lancamento financeiro: ${error.message}`);
  }

  return id;
}
