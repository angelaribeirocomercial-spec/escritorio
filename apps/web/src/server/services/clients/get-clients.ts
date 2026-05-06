import { ClientLinkedCaseSummary, ClientRecord } from "@lexia/domain";

import {
  DEMO_CLIENT_RECORD,
  DEMO_CLIENT_ID
} from "@/server/services/demo/demo-workspace-data";
import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type ClientRow = {
  id: string;
  full_name: string;
  document_id: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  lead_source: string;
  bank_name: string;
  service_status: ClientRecord["serviceStatus"];
  signed_contract: boolean;
  legal_viability_score: number;
  fees_label: string;
  documents_sent: number;
  notes: string;
  ia_context: string;
  linked_cases: ClientLinkedCaseSummary[] | null;
  linked_documents: string[] | null;
  timeline: string[] | null;
};

function mapClientRow(row: ClientRow): ClientRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    documentId: row.document_id,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    address: row.address,
    leadSource: row.lead_source,
    bankName: row.bank_name,
    serviceStatus: row.service_status,
    signedContract: row.signed_contract,
    legalViabilityScore: row.legal_viability_score,
    feesLabel: row.fees_label,
    documentsSent: row.documents_sent,
    notes: row.notes,
    iaContext: row.ia_context,
    linkedCases: row.linked_cases ?? [],
    linkedDocuments: row.linked_documents ?? [],
    timeline: row.timeline ?? []
  };
}

export async function getClients(): Promise<ClientRecord[]> {
  const session = await getWorkspaceSession();

  if (!session) {
    return [];
  }

  if (session.workspace.tenant.slug === "clara-bancaria-demo" || process.env.NEXT_PUBLIC_SUPABASE_URL == null || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY == null) {
    return [DEMO_CLIENT_RECORD];
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      `
        id,
        full_name,
        document_id,
        email,
        phone,
        whatsapp,
        address,
        lead_source,
        bank_name,
        service_status,
        signed_contract,
        legal_viability_score,
        fees_label,
        documents_sent,
        notes,
        ia_context,
        linked_cases,
        linked_documents,
        timeline
      `
    )
    .eq("tenant_id", session.workspace.tenant.id)
    .order("full_name", { ascending: true });

  if (error) {
    console.warn(`Failed to load clients for tenant ${session.workspace.tenant.id}.`);
    return [];
  }

  return (data ?? []).map((row) => mapClientRow(row as ClientRow));
}

export async function getClientById(clientId: string): Promise<ClientRecord | null> {
  const session = await getWorkspaceSession();

  if (!session) {
    return null;
  }

  if (
    clientId === DEMO_CLIENT_ID &&
    (session.workspace.tenant.slug === "clara-bancaria-demo" ||
      process.env.NEXT_PUBLIC_SUPABASE_URL == null ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY == null)
  ) {
    return DEMO_CLIENT_RECORD;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      `
        id,
        full_name,
        document_id,
        email,
        phone,
        whatsapp,
        address,
        lead_source,
        bank_name,
        service_status,
        signed_contract,
        legal_viability_score,
        fees_label,
        documents_sent,
        notes,
        ia_context,
        linked_cases,
        linked_documents,
        timeline
      `
    )
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("id", clientId)
    .maybeSingle();

  if (error) {
    console.warn(`Failed to load client ${clientId} for tenant ${session.workspace.tenant.id}.`);
    return null;
  }

  return data ? mapClientRow(data as ClientRow) : null;
}
