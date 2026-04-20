import { ReferenceListPage } from "@/components/layout/reference-list-page";

export default function ProcessosImportarOabPage() {
  return (
    <ReferenceListPage
      actions={[{ label: "Importar", tone: "primary" }]}
      count={1}
      emptyState="Nenhum processo importado via OAB."
      rows={[
        {
          id: "oab",
          title: "Importacao via OAB",
          detail: "Area preparada para captacao automatizada por numero de registro."
        }
      ]}
      title="Importar via OAB"
    />
  );
}
