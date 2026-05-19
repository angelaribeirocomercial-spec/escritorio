"use server";

import { redirect } from "next/navigation";

import { createAgendaCommitment } from "@/server/services/agenda/create-agenda-entry";

function buildReturnPath(formData: FormData) {
  const params = new URLSearchParams();
  params.set("created", "1");

  const record = String(formData.get("record") ?? "");
  if (record) {
    params.set("record", record);
  }

  return `/agenda/compromissos?${params.toString()}`;
}

export async function createAgendaCommitmentAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const scheduledFor = String(formData.get("scheduledFor") ?? "").trim();
  const responsibleLabel = String(formData.get("responsibleLabel") ?? "").trim();
  const locationLabel = String(formData.get("locationLabel") ?? "").trim();
  const category = String(formData.get("category") ?? "meeting") as
    | "hearing"
    | "client-follow-up"
    | "internal-review"
    | "meeting";

  if (!title || !scheduledFor || !responsibleLabel || !locationLabel) {
    redirect("/agenda/compromissos/novo");
  }

  await createAgendaCommitment({
    title,
    description,
    scheduledFor,
    responsibleLabel,
    locationLabel,
    category,
    clientId: String(formData.get("clientId") ?? "") || undefined,
    caseId: String(formData.get("caseId") ?? "") || undefined,
    processId: String(formData.get("processId") ?? "") || undefined
  });

  redirect(buildReturnPath(formData));
}
