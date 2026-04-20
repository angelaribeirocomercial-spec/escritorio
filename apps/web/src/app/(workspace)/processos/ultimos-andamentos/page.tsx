import { ReferenceListPage } from "@/components/layout/reference-list-page";

export default function ProcessosUltimosAndamentosPage() {
  return (
    <ReferenceListPage
      count={1}
      emptyState="Nenhum andamento recente disponivel."
      rows={[
        {
          id: "updates",
          title: "Abrir modulo de andamentos",
          detail: "Acesso aos andamentos automaticos e monitorados.",
          href: "/andamentos"
        }
      ]}
      title="Ultimos andamentos"
    />
  );
}
