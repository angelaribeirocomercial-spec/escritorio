import { notFound, redirect } from "next/navigation";

import { getProcessByCaseId } from "@/server/services/processes/get-processes";

export default async function CaseRedirectPage({
  params,
  searchParams
}: {
  params: { caseId: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const processItem = await getProcessByCaseId(params.caseId);

  if (!processItem) {
    notFound();
  }

  const paramsOut = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => paramsOut.append(key, entry));
      return;
    }

    if (typeof value === "string") {
      paramsOut.set(key, value);
    }
  });

  paramsOut.set("case_context", "1");
  const query = paramsOut.toString();
  redirect(query ? `/processos/${processItem.id}?${query}` : `/processos/${processItem.id}`);
}
