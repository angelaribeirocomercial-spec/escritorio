"use server";

import { revalidatePath } from "next/cache";

import { requireWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { syncCaseDossierFromDocument } from "@/server/services/contract-analysis/sync-case-dossier-from-document";
import { getCaseById } from "@/server/services/cases/get-cases";
import { getClientById } from "@/server/services/clients/get-clients";
import { getDocumentById } from "@/server/services/documents/get-documents";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function reviewDocumentExtractionAction(formData: FormData) {
  const session = await requireWorkspaceSession();

  if (!["owner", "admin"].includes(session.role)) {
    throw new Error("Only owners and admins can review structured document extraction.");
  }

  const documentId = readText(formData, "documentId");
  const reviewNotes = readText(formData, "reviewNotes");

  if (!documentId) {
    throw new Error("Document id is required.");
  }

  const document = await getDocumentById(documentId);

  if (!document) {
    throw new Error("Document not found for review.");
  }

  const client = document.client ?? (await getClientById(document.clientId));
  const bankingCase = document.bankingCase ?? (await getCaseById(document.caseId));

  if (!client || !bankingCase) {
    throw new Error("Document context is incomplete for review.");
  }

  const existingExtraction = document.structuredExtraction ?? {};
  const mergeField = (key: string, label: string) => {
    const nextValue = readText(formData, key);
    const existing = existingExtraction[key];

    return {
      value: nextValue || existing?.value || "",
      confidence: nextValue ? "high" : existing?.confidence ?? "medium",
      sourceLabel: nextValue ? `Correcao humana: ${label}` : existing?.sourceLabel ?? "Leitura estruturada"
    } as const;
  };

  const forcedExtraction = {
    ...existingExtraction,
    banco: mergeField("banco", "Banco"),
    modalidade: mergeField("modalidade", "Modalidade"),
    competencia: mergeField("competencia", "Competencia"),
    taxaContrato: mergeField("taxaContrato", "Taxa do contrato"),
    cet: mergeField("cet", "CET"),
    parcelas: mergeField("parcelas", "Parcelas"),
    valorFinanciado: mergeField("valorFinanciado", "Valor financiado"),
    parcelaContratada: mergeField("parcelaContratada", "Parcela contratada"),
    parcelaCobrada: mergeField("parcelaCobrada", "Parcela cobrada"),
    seguro: mergeField("seguro", "Seguro"),
    tarifas: mergeField("tarifas", "Tarifas"),
    permanencia: mergeField("permanencia", "Comissao de permanencia"),
    multa: mergeField("multa", "Multa")
  };

  const supabase = getSupabaseAdminClient();

  await syncCaseDossierFromDocument({
    supabase,
    tenantId: session.workspace.tenant.id,
    document,
    client: {
      id: client.id,
      fullName: client.fullName,
      bankName: client.bankName
    },
    bankingCase: {
      id: bankingCase.id,
      title: bankingCase.title,
      bankName: bankingCase.bankName,
      niche: bankingCase.niche,
      claimType: bankingCase.claimType
    },
    forcedExtraction,
    reviewStatus: "corrected",
    reviewNotes
  });

  revalidatePath(`/documentos/${documentId}`);
  revalidatePath(`/pessoas/clientes/${client.id}`);
  revalidatePath(`/clara`);
}
