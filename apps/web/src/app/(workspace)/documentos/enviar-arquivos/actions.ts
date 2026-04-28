"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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

  const supabase = getSupabaseServerClient();
  const uploadedDocument = await uploadTenantDocument({
    tenantId: session.workspace.tenant.id,
    clientId: bankingCase.clientId,
    caseId: bankingCase.id,
    file,
    documentType,
    category,
    summary: summary || "Documento enviado pela interface e aguardando processamento.",
    tags
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
  revalidatePath("/tarefas");
  redirect(`/pessoas/clientes/${bankingCase.clientId}?case=${bankingCase.id}&uploaded=1`);
}
