import { ReferenceListPage } from "@/components/layout/reference-list-page";

export default function ProcessosImportarLotePage() {
  return (
    <ReferenceListPage
      actions={[{ label: "Importar", tone: "primary" }]}
      count={1}
      emptyState="Nenhum arquivo importado em lote."
      rows={[
        {
          id: "batch",
          title: "Importacao em lote",
          detail: "Area preparada para onboarding massivo da carteira."
        }
      ]}
      title="Importar lote"
    />
  );
}
