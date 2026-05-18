import {
  DEMO_CASE_ID,
  DEMO_CLIENT_ID,
  DEMO_PROCESS_ID
} from "@/server/services/demo/demo-workspace-data";

export function getDemoClaraFirstHref() {
  const searchParams = new URLSearchParams();
  searchParams.set("niche", "fraude");
  searchParams.set("client", DEMO_CLIENT_ID);
  searchParams.set("case", DEMO_CASE_ID);
  searchParams.set("process", DEMO_PROCESS_ID);
  searchParams.set("document", "doc-205-pix");
  searchParams.set("tab", "analise");

  return `/clara?${searchParams.toString()}#clara-workbench`;
}
