import { ReferenceListPage } from "@/components/layout/reference-list-page";

export default function ProcessosListaPage() {
  return (
    <ReferenceListPage
      actions={[{ label: "Adicionar", tone: "primary" }]}
      count={1}
      emptyState="Voce ainda nao cadastrou nenhum processo."
      rows={[
        {
          id: "open-list",
          title: "Abrir lista completa de processos",
          detail: "Acesso ao modulo principal de processos.",
          href: "/processos"
        }
      ]}
      title="Lista"
    />
  );
}
