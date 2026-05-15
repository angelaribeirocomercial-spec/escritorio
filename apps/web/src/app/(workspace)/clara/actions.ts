"use server";

import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  createClaraRecord,
  getClaraRecord,
  updateClaraRecordContent,
  updateClaraRecordReviewNote,
  updateClaraRecordWorkflowStatus
} from "@/server/services/clara/clara-record-store";

function withRecord(targetPath: string, recordId: string) {
  const url = new URL(targetPath, "http://localhost");
  url.searchParams.set("record", recordId);
  return `${url.pathname}${url.search}`;
}

export async function commitClaraExecutionAction(formData: FormData) {
  const targetPath = String(formData.get("targetPath") ?? "");
  const recordKind = String(formData.get("recordKind") ?? "");
  const sourceAction = String(formData.get("sourceAction") ?? "");

  if (!targetPath || !recordKind || !sourceAction) {
    redirect("/clara");
  }

  const record = await createClaraRecord({
    kind: recordKind as "agenda" | "deadline" | "task" | "text-draft" | "comparison" | "filing-package" | "process" | "case" | "client",
    sourceAction,
    targetPath,
    caseId: String(formData.get("case") ?? "") || undefined,
    clientId: String(formData.get("client") ?? "") || undefined,
    deadlineAction: String(formData.get("deadlineAction") ?? "") || undefined,
    documentId: String(formData.get("document") ?? "") || undefined,
    documentId2: String(formData.get("document2") ?? "") || undefined,
    piece: String(formData.get("piece") ?? "") || undefined,
    processId: String(formData.get("process") ?? "") || undefined,
    taskId: String(formData.get("task") ?? "") || undefined,
    focus: String(formData.get("focus") ?? "") || undefined,
    objective: String(formData.get("objective") ?? "") || undefined
  });

  redirect(withRecord(targetPath, record.id));
}

export async function updateClaraWorkflowStatusAction(formData: FormData) {
  const recordId = String(formData.get("recordId") ?? "");
  const workflowStatus = String(formData.get("workflowStatus") ?? "");
  const returnPath = String(formData.get("returnPath") ?? "/clara");

  if (!recordId || !workflowStatus) {
    redirect(returnPath);
  }

  await updateClaraRecordWorkflowStatus(
    recordId,
    workflowStatus as "created" | "reviewed" | "completed"
  );

  const record = await getClaraRecord(recordId);

  if (record?.kind === "text-draft") {
    const payload = record.payload as {
      documentId?: string;
      pieceLabel?: string;
      caseId?: string;
    };

    if (
      payload.documentId &&
      payload.caseId &&
      ["acao-revisional", "peticao-inicial"].includes(payload.pieceLabel ?? "")
    ) {
      const supabase = getSupabaseAdminClient();
      await supabase
        .from("contract_analyses")
        .update({
          approved_for_filing: workflowStatus === "completed",
          petition_snapshot: {
            reviewState: workflowStatus,
            approvedAt: workflowStatus === "completed" ? new Date().toISOString() : null
          }
        })
        .eq("document_id", payload.documentId)
        .eq("case_id", payload.caseId);
    }
  }

  redirect(returnPath);
}

export async function updateClaraReviewNoteAction(formData: FormData) {
  const recordId = String(formData.get("recordId") ?? "");
  const reviewNote = String(formData.get("reviewNote") ?? "");
  const returnPath = String(formData.get("returnPath") ?? "/clara");

  if (!recordId) {
    redirect(returnPath);
  }

  await updateClaraRecordReviewNote(recordId, reviewNote);

  redirect(returnPath);
}

export async function updateClaraRecordContentAction(formData: FormData) {
  const recordId = String(formData.get("recordId") ?? "");
  const editedTitle = String(formData.get("editedTitle") ?? "");
  const editedDetail = String(formData.get("editedDetail") ?? "");
  const returnPath = String(formData.get("returnPath") ?? "/clara");

  if (!recordId) {
    redirect(returnPath);
  }

  await updateClaraRecordContent({
    recordId,
    editedTitle,
    editedDetail
  });

  redirect(returnPath);
}
