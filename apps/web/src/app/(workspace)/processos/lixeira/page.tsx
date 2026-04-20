import { ReferenceListPage } from "@/components/layout/reference-list-page";

export default function ProcessosLixeiraPage() {
  return (
    <ReferenceListPage
      count={1}
      emptyState="Voce ainda nao moveu nenhum processo para a lixeira."
      rows={[
        {
          id: "archived",
          title: "Processos arquivados",
          detail: "Area preparada para restauracao ou auditoria de itens removidos."
        }
      ]}
      title="Lixeira"
    />
  );
}
