import { notFound } from "next/navigation";

import { ReferenceListPage } from "@/components/layout/reference-list-page";

const content = {
  compromissos: {
    title: "Compromissos",
    searchPlaceholder: "Cliente, processo ou compromisso",
    emptyState: "Voce ainda nao cadastrou nenhum compromisso.",
    rows: [{ id: "agenda", title: "Abrir agenda completa", detail: "Voltar para a agenda unificada.", href: "/agenda" }]
  },
  tarefas: {
    title: "Tarefas",
    searchPlaceholder: "Cliente, tarefa ou responsavel",
    emptyState: "Voce ainda nao cadastrou nenhuma tarefa.",
    rows: [{ id: "tasks", title: "Abrir tarefas", detail: "Lista operacional da agenda.", href: "/agenda/tarefas" }]
  },
  prazos: {
    title: "Prazos",
    searchPlaceholder: "Processo, prazo ou responsavel",
    emptyState: "Voce ainda nao cadastrou nenhum prazo.",
    rows: [{ id: "deadlines", title: "Abrir agenda completa", detail: "Filtre a agenda por prazos e responsavel.", href: "/agenda?view=week" }]
  }
} as const;

export default function AgendaSubpage({
  params
}: {
  params: { subpage: keyof typeof content };
}) {
  const page = content[params.subpage];

  if (!page) {
    notFound();
  }

  return (
    <ReferenceListPage
      actions={[{ label: "Adicionar", tone: "primary" }]}
      count={page.rows.length}
      emptyState={page.emptyState}
      rows={page.rows}
      searchPlaceholder={page.searchPlaceholder}
      title={page.title}
    />
  );
}
