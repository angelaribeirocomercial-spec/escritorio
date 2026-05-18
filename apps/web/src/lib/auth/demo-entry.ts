import { DEMO_CASE_ID, DEMO_CLIENT_ID } from "@/server/services/demo/demo-workspace-data";

export function getDemoClaraFirstHref() {
  const searchParams = new URLSearchParams();
  searchParams.set("case", DEMO_CASE_ID);
  searchParams.set("panel", "clara");

  return `/pessoas/clientes/${DEMO_CLIENT_ID}?${searchParams.toString()}#client-dossier-tab-trigger-clara`;
}
