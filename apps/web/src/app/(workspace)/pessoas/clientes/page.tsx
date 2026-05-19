import { ClientRecord } from "@lexia/domain";

import { SimpleClientList } from "@/components/workspace/simple-client-list";
import { getClients } from "@/server/services/clients/get-clients";

export default async function PessoasClientesPage({
  searchParams
}: {
  searchParams?: { pesquisa?: string };
}) {
  let clients: ClientRecord[] = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    clients = await getClients({ failOnError: true });
  } catch {
    state = {
      title: "Clientes indisponiveis no momento",
      description:
        "Nao foi possivel carregar a base real de clientes. Valide a configuracao do Supabase, a migration da vertical e o seed local.",
      tone: "danger"
    };
  }

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
      state={state}
    />
  );
}
