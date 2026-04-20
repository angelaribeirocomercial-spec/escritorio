import { notFound } from "next/navigation";

import { ReferenceListPage } from "@/components/layout/reference-list-page";

const content = {
  "advogados-equipe": {
    title: "Advogados / Equipe",
    emptyState: "Voce ainda nao cadastrou nenhum advogado na equipe.",
    rows: [
      { id: "helena", title: "Dra. Helena Siqueira", detail: "Responsavel por contencioso bancario" },
      { id: "caio", title: "Dr. Caio Nascimento", detail: "Responsavel por estrategia processual" }
    ]
  },
  "grupo-de-advogados": {
    title: "Grupo de advogados",
    emptyState: "Voce ainda nao cadastrou nenhum grupo de advogados.",
    rows: [{ id: "banking", title: "Contencioso bancario", detail: "Grupo principal da operacao" }]
  }
} as const;

export default function EquipeSubpage({
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
      title={page.title}
    />
  );
}
