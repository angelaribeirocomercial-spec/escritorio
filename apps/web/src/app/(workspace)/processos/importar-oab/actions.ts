"use server";

import { redirect } from "next/navigation";

import { enableOabMonitoring } from "@/server/services/processes/enable-oab-monitoring";

export async function enableProcessOabAction(formData: FormData) {
  const processId = String(formData.get("processId") ?? "").trim();

  if (!processId) {
    redirect("/processos/importar-oab?error=missing-process");
  }

  try {
    const result = await enableOabMonitoring({ processId });
    redirect(`/processos/importar-oab?process=${encodeURIComponent(result.processNumber)}&enabled=1`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao ativar monitoramento por OAB.";
    redirect(`/processos/importar-oab?error=${encodeURIComponent(message)}`);
  }
}
