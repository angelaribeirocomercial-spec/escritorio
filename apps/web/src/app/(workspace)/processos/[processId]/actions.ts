"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function normalizeDate(value: string) {
  if (!value) {
    return "";
  }

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    return value;
  }

  const ptBrMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!ptBrMatch) {
    return "";
  }

  const [, day, month, year] = ptBrMatch;
  return `${year}-${month}-${day}`;
}

function buildReturnPath(processId: string, params: Record<string, string>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `/processos/${processId}?${query}` : `/processos/${processId}`;
}

export async function registerOfficialDistributionAction(formData: FormData) {
  const session = await requireWorkspaceSession();
  const processId = readText(formData, "processId");
  const localReferenceNumber = readText(formData, "localReferenceNumber");
  const officialProcessNumber = readText(formData, "officialProcessNumber");
  const officialDistributionDateInput = readText(formData, "officialDistributionDate");
  const officialSource = readText(formData, "officialSource");
  const officialDistributionStatus = readText(formData, "officialDistributionStatus");
  const protocolReceiptDocumentId = readText(formData, "protocolReceiptDocumentId");
  const auditDetail = readText(formData, "auditDetail");

  const officialDistributionDate = normalizeDate(officialDistributionDateInput);

  if (!processId) {
    redirect("/processos");
  }

  if (!localReferenceNumber || !officialProcessNumber || !officialDistributionDate || !officialSource || !officialDistributionStatus) {
    redirect(
      buildReturnPath(processId, {
        distributionError: "Preencha referencia local, numero oficial, data, origem e status."
      })
    );
  }

  if (!["manual_confirmed", "official_import"].includes(officialSource)) {
    redirect(buildReturnPath(processId, { distributionError: "Origem oficial invalida." }));
  }

  if (!["preparatory_local", "attempt_failed", "official_confirmed"].includes(officialDistributionStatus)) {
    redirect(buildReturnPath(processId, { distributionError: "Status oficial invalido." }));
  }

  const supabase = getSupabaseAdminClient();
  const { data: processRow, error: processError } = await supabase
    .from("processes")
    .select("distribution_audit_trail")
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("id", processId)
    .maybeSingle();

  if (processError || !processRow) {
    redirect(buildReturnPath(processId, { distributionError: "Nao foi possivel localizar o processo." }));
  }

  const existingAuditTrail = Array.isArray(processRow.distribution_audit_trail)
    ? processRow.distribution_audit_trail
    : [];

  const auditTitle =
    officialDistributionStatus === "attempt_failed"
      ? "Tentativa frustrada registrada"
      : officialDistributionStatus === "official_confirmed"
        ? "Retorno oficial confirmado"
        : "Estado local preparatorio registrado";

  const nextAuditTrail = [
    ...existingAuditTrail,
    {
      id: `audit-${randomUUID()}`,
      occurredAt: new Date().toISOString(),
      status: officialDistributionStatus,
      source: officialSource,
      title: auditTitle,
      detail:
        auditDetail ||
        (officialDistributionStatus === "official_confirmed"
          ? "Numero oficial, data e comprovante revisados no retorno pos-distribuicao."
          : officialDistributionStatus === "attempt_failed"
            ? "Tentativa registrada com falha operacional ou documental."
            : "Registro local mantido enquanto o retorno oficial ainda nao foi consolidado.")
    }
  ];

  const { error: updateError } = await supabase
    .from("processes")
    .update({
      local_reference_number: localReferenceNumber,
      official_process_number: officialProcessNumber,
      official_distribution_date: officialDistributionDate,
      official_source: officialSource,
      official_distribution_status: officialDistributionStatus,
      protocol_receipt_document_id: protocolReceiptDocumentId || null,
      distribution_audit_trail: nextAuditTrail
    })
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("id", processId);

  if (updateError) {
    redirect(
      buildReturnPath(processId, {
        distributionError: `Nao foi possivel salvar o retorno oficial: ${updateError.message}`
      })
    );
  }

  revalidatePath(`/processos/${processId}`);
  revalidatePath("/processos");
  redirect(buildReturnPath(processId, { distributionSaved: "1" }));
}
