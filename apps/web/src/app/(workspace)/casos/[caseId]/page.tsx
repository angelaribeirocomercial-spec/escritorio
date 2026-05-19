import { notFound, redirect } from "next/navigation";

import { getCaseById } from "@/server/services/cases/get-cases";
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
    const bankingCase = await getCaseById(params.caseId);

    if (!bankingCase) {
      notFound();
    }

    const query = new URLSearchParams();

    Object.entries(searchParams ?? {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((entry) => query.append(key, entry));
        return;
      }

      if (typeof value === "string") {
        query.set(key, value);
      }
    });

    query.set("case", bankingCase.id);
    query.set("case_context", "1");
    redirect(`/pessoas/clientes/${bankingCase.clientId}?${query.toString()}`);
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
