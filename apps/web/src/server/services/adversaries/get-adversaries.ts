import { AdversaryRecord } from "@lexia/domain";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type AdversaryRow = {
  id: string;
  name: string;
  document_id: string;
  bank_name: string;
  case_summary: string;
  attorney_label: string;
  contact_label: string;
  status: AdversaryRecord["status"];
};

const ADVERSARY_SELECT = `
  id,
  name,
  document_id,
  bank_name,
  case_summary,
  attorney_label,
  contact_label,
  status
`;

function mapAdversaryRow(row: AdversaryRow): AdversaryRecord {
  return {
    id: row.id,
    name: row.name,
    documentId: row.document_id,
    bankName: row.bank_name,
    caseSummary: row.case_summary,
    attorneyLabel: row.attorney_label,
    contactLabel: row.contact_label,
    status: row.status
  };
}

export async function getAdversaries(): Promise<AdversaryRecord[]> {
  const session = await getWorkspaceSession();

  if (!session) {
    throw new Error("Workspace session is required to load adversaries.");
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("adversaries")
    .select(ADVERSARY_SELECT)
    .eq("tenant_id", session.workspace.tenant.id)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load adversaries for tenant ${session.workspace.tenant.id}.`);
  }

  return (data ?? []).map((row) => mapAdversaryRow(row as AdversaryRow));
}
