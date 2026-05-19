import { redirect } from "next/navigation";

export default function AndamentosMonitoramentosPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    modo?: string;
  };
}) {
  const params = new URLSearchParams();

  if (searchParams?.modo?.trim()) {
    params.set("modo", searchParams.modo.trim());
  }

  if (searchParams?.q?.trim()) {
    params.set("q", searchParams.q.trim());
  }

  const href = params.size > 0
    ? `/processos/monitoramentos?${params.toString()}`
    : "/processos/monitoramentos";

  redirect(href);
}
