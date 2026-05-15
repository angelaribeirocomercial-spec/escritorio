"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildBankingCaseOperationalTaskState,
  buildPersistedBankingCaseLifecycle
} from "@/server/services/cases/get-banking-case-workflow";
import { getCaseById } from "@/server/services/cases/get-cases";
import { getDocumentsByCaseId } from "@/server/services/documents/get-documents";
import {
  MAX_TENANT_DOCUMENT_SIZE_BYTES,
  uploadTenantDocument
} from "@/server/services/documents/upload-tenant-document";
import { syncCaseDossierFromDocument } from "@/server/services/contract-analysis/sync-case-dossier-from-document";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function uploadDocumentAction(formData: FormData) {
  const session = await requireWorkspaceSession();

  if (!["owner", "admin"].includes(session.role)) {
    throw new Error("Only owners and admins can upload documents.");
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Select a file before uploading.");
  }

  if (file.size > MAX_TENANT_DOCUMENT_SIZE_BYTES) {
    throw new Error("The selected file exceeds the 30 MB upload limit.");
  }

  const caseId = readText(formData, "caseId");
  const documentType = readText(formData, "documentType");
  const category = readText(formData, "category");
  const summary = readText(formData, "summary");
  const returnTo = readText(formData, "returnTo");
  const tags = readText(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!caseId || !documentType || !category) {
    throw new Error("Case, document type and category are required.");
  }

  const bankingCase = await getCaseById(caseId);

  if (!bankingCase) {
    throw new Error("Selected case was not found for the active tenant.");
  }

  const supabase = getSupabaseAdminClient();
  const uploadedDocument = await uploadTenantDocument({
    supabaseClient: supabase,
    tenantId: session.workspace.tenant.id,
    clientId: bankingCase.clientId,
    caseId: bankingCase.id,
    file,
    documentType,
    category,
    summary: summary || "Documento enviado pela interface e aguardando leitura OCR.",
    tags
  });
  await syncCaseDossierFromDocument({
    supabase,
    tenantId: session.workspace.tenant.id,
    document: uploadedDocument.document,
    client: {
      id: bankingCase.client.id,
      fullName: bankingCase.client.fullName,
      bankName: bankingCase.client.bankName
    },
    bankingCase: {
      id: bankingCase.id,
      title: bankingCase.title,
      bankName: bankingCase.bankName,
      niche: bankingCase.niche,
      claimType: bankingCase.claimType
    }
  });

  const nextCaseLinkedDocuments = Array.from(
    new Set([...bankingCase.linkedDocuments, uploadedDocument.documentId])
  );
  const nextClientLinkedDocuments = Array.from(
    new Set([...bankingCase.client.linkedDocuments, uploadedDocument.documentId])
  );
  const existingDocuments = await getDocumentsByCaseId(bankingCase.id);
  const lifecycleState = buildPersistedBankingCaseLifecycle({
    niche: bankingCase.niche,
    stage: bankingCase.stage,
    documentLabels: [...existingDocuments.map((document) => document.documentType), documentType]
  });
  const checklistTaskState = buildBankingCaseOperationalTaskState({
    niche: bankingCase.niche,
    stage: bankingCase.stage,
    documentLabels: [...existingDocuments.map((document) => document.documentType), documentType]
  });

  const { error: updateCaseError } = await supabase
    .from("cases")
    .update({
      linked_documents: nextCaseLinkedDocuments,
      workflow_state: lifecycleState.workflowState,
      checklist_state: lifecycleState.checklistState
    })
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("id", bankingCase.id);

  if (updateCaseError) {
    throw new Error(`Failed to update case document links: ${updateCaseError.message}`);
  }

  const { error: updateTaskError } = await supabase
    .from("tasks")
    .update({
      checklist: checklistTaskState.checklist,
      notes: checklistTaskState.notes,
      lexia_next_step: checklistTaskState.nextStep,
      status: checklistTaskState.status
    })
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("case_id", bankingCase.id)
    .eq("title", "Fechar checklist documental inicial");

  if (updateTaskError) {
    throw new Error(`Failed to update case workflow task: ${updateTaskError.message}`);
  }

  const { error: updateClientError } = await supabase
    .from("clients")
    .update({
      linked_documents: nextClientLinkedDocuments,
      documents_sent: Math.max(bankingCase.client.documentsSent, nextClientLinkedDocuments.length)
    })
    .eq("tenant_id", session.workspace.tenant.id)
    .eq("id", bankingCase.clientId);

  if (updateClientError) {
    throw new Error(`Failed to update client document links: ${updateClientError.message}`);
  }

  revalidatePath("/documentos/meus-arquivos");
  revalidatePath(`/pessoas/clientes/${bankingCase.clientId}`);
  revalidatePath("/processos");
  revalidatePath("/tarefas");

  if (returnTo.startsWith("/")) {
    redirect(returnTo.includes("?") ? `${returnTo}&uploaded=1` : `${returnTo}?uploaded=1`);
  }

  redirect(`/pessoas/clientes/${bankingCase.clientId}?case=${bankingCase.id}&uploaded=1`);
}
