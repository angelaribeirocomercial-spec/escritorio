"use server";

import { redirect } from "next/navigation";

import { createProceduralDeadline } from "@/server/services/agenda/create-agenda-entry";

function buildReturnPath(formData: FormData) {
  const params = new URLSearchParams();
  params.set("created", "1");

  const record = String(formData.get("record") ?? "");
  if (record) {
    params.set("record", record);
  }

  return `/agenda/prazos?${params.toString()}`;
}

export async function createProceduralDeadlineAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const responsibleLabel = String(formData.get("responsibleLabel") ?? "").trim();
  const sourceLabel = String(formData.get("sourceLabel") ?? "").trim();
  const severity = String(formData.get("severity") ?? "medium") as "low" | "medium" | "high";

  if (!title || !dueDate || !responsibleLabel || !sourceLabel) {
    redirect("/agenda/prazos/novo");
  }

  await createProceduralDeadline({
    title,
    description,
    dueDate,
    responsibleLabel,
    sourceLabel,
    severity,
    clientId: String(formData.get("clientId") ?? "") || undefined,
    caseId: String(formData.get("caseId") ?? "") || undefined,
    processId: String(formData.get("processId") ?? "") || undefined
  });

  redirect(buildReturnPath(formData));
}
