import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";

export type CrmConversationRecord = {
  id: string;
  clientId: string;
  clientName: string;
  caseId: string | null;
  lastMessage: string;
  summary: string;
  statusLabel: string;
  nextAction: string;
};

export async function getCrmConversations(): Promise<CrmConversationRecord[]> {
  const [clients, cases] = await Promise.all([getClients(), getCases()]);

  return clients.map((client) => {
    const clientCase = cases.find((bankingCase) => bankingCase.clientId === client.id) ?? null;
    const latestTimeline = client.timeline[0] ?? "Sem conversa recente registrada.";
    const hasCase = clientCase !== null;

    return {
      id: `${client.id}-${clientCase?.id ?? "conversation"}`,
      clientId: client.id,
      clientName: client.fullName,
      caseId: clientCase?.id ?? null,
      lastMessage: latestTimeline,
      summary: hasCase
        ? `Conversa conectada ao caso ${clientCase.title}.`
        : "Conversa comercial ainda antes da conversao juridica.",
      statusLabel: hasCase ? "Conversa juridica" : client.signedContract ? "Contrato fechado" : "Em conversa",
      nextAction: hasCase
        ? "Reforcar alinhamento documental e proximos passos do caso."
        : client.signedContract
          ? "Abrir o caso juridico e consolidar o contrato."
          : "Registrar novo contato e manter o follow-up ativo."
    };
  });
}
