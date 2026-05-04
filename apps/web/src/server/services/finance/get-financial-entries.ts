import { FinancialEntryKind, FinancialEntryRecord, FinancialEntryStatus } from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type FinancialEntryRow = {
  id: string;
  client_id: string | null;
  case_id: string | null;
  kind: FinancialEntryKind;
  title: string;
  description: string;
  account_label: string;
  counterparty_label: string;
  amount: number | string;
  due_date: string;
  settled_at: string | null;
  status: FinancialEntryStatus;
  category_label: string;
};

const FINANCIAL_ENTRY_SELECT = `
  id,
  client_id,
  case_id,
  kind,
  title,
  description,
  account_label,
  counterparty_label,
  amount,
  due_date,
  settled_at,
  status,
  category_label
`;

function mapFinancialEntryRow(row: FinancialEntryRow): FinancialEntryRecord {
  return {
    id: row.id,
    clientId: row.client_id ?? undefined,
    caseId: row.case_id ?? undefined,
    kind: row.kind,
    title: row.title,
    description: row.description,
    accountLabel: row.account_label,
    counterpartyLabel: row.counterparty_label,
    amount: Number(row.amount),
    dueDate: row.due_date,
    settledAt: row.settled_at ?? undefined,
    status: row.status,
    categoryLabel: row.category_label
  };
}

export async function getFinancialEntries(kind?: FinancialEntryKind): Promise<FinancialEntryRecord[]> {
  const session = await getWorkspaceSession();

  if (!session) {
    return [];
  }

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("financial_entries")
    .select(FINANCIAL_ENTRY_SELECT)
    .eq("tenant_id", session.workspace.tenant.id)
    .order("due_date", { ascending: true });

  if (kind) {
    query = query.eq("kind", kind);
  }

  const { data, error } = await query;

  if (error) {
    console.warn(
      `Failed to load financial entries for tenant ${session.workspace.tenant.id}.`
    );
    return [];
  }

  return (data ?? []).map((row) => mapFinancialEntryRow(row as FinancialEntryRow));
}

export function formatFinancialAmount(amount: number) {
  return amount.toLocaleString("pt-BR", {
    currency: "BRL",
    minimumFractionDigits: 2,
    style: "currency"
  });
}

export function getFinancialBalance(entries: readonly FinancialEntryRecord[]) {
  return entries.reduce((sum, entry) => {
    if (entry.kind === "expense") {
      return sum - entry.amount;
    }

    return sum + entry.amount;
  }, 0);
}
