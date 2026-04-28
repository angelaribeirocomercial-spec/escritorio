import { notFound, redirect } from "next/navigation";

const canonicalAgendaRoutes: Record<string, string> = {
  compromissos: "/agenda/compromissos",
  prazos: "/agenda/prazos",
  tarefas: "/agenda/tarefas"
};

export default function AgendaSubpage({
  params
}: {
  params: { subpage: string };
}) {
  const route = canonicalAgendaRoutes[params.subpage];

  if (route) {
    redirect(route);
  }

  notFound();
}
