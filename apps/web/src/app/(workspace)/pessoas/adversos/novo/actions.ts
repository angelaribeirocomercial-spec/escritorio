import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function createAdversaryAction(formData: FormData) {
  const session = await getWorkspaceSession();

  if (!session) {
    redirect("/sign-in");
  }

  const name = String(formData.get("name") ?? "").trim();
  const documentId = String(formData.get("documentId") ?? "").trim();
  const bankName = String(formData.get("bankName") ?? "").trim();
  const caseSummary = String(formData.get("caseSummary") ?? "").trim();
  const attorneyLabel = String(formData.get("attorneyLabel") ?? "").trim();
  const contactLabel = String(formData.get("contactLabel") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim() === "inactive" ? "inactive" : "active";

  if (!name || !documentId || !bankName) {
    redirect("/pessoas/adversos/novo?error=Campos+obrigatorios+nao+preenchidos");
  }

  const supabase = getSupabaseAdminClient();
  const adversaryId = `adv-${randomUUID()}`;

  const { error } = await supabase.from("adversaries").insert({
    id: adversaryId,
    tenant_id: session.workspace.tenant.id,
    name,
    document_id: documentId,
    bank_name: bankName,
    case_summary: caseSummary,
    attorney_label: attorneyLabel,
    contact_label: contactLabel,
    status
  });

  if (error) {
    redirect(`/pessoas/adversos/novo?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/pessoas/adversos?created=1&adversary=${encodeURIComponent(adversaryId)}`);
}
