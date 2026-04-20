import { SimpleClientList } from "@/components/workspace/simple-client-list";
import { getClients } from "@/server/services/clients/get-clients";

export default async function PessoasClientesPage({
  searchParams
}: {
  searchParams?: { pesquisa?: string };
}) {
  const clients = await getClients();
  const search = searchParams?.pesquisa?.toLowerCase().trim() ?? "";
  const filteredClients = clients.filter((client) =>
    !search
      ? true
      : [client.fullName, client.documentId, client.bankName, client.serviceStatus]
          .join(" ")
          .toLowerCase()
          .includes(search)
  );

  return (
    <SimpleClientList
      clients={filteredClients}
      searchValue={searchParams?.pesquisa ?? ""}
    />
  );
}
