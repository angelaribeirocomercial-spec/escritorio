import { redirect } from "next/navigation";

export default function AndamentosAutomaticosPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
  };
}) {
  const query = searchParams?.q?.trim();
  const href = query
    ? `/processos/ultimos-andamentos?termo=${encodeURIComponent(query)}`
    : "/processos/ultimos-andamentos";

  redirect(href);
}
