import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";

export type CrmContractRecord = {
  id: string;
  clientId: string;
  clientName: string;
  caseId: string | null;
  contractNumber: string;
  bankName: string;
  statusLabel: string;
  detail: string;
  nextAction: string;
};

export async function getCrmContracts(): Promise<CrmContractRecord[]> {
  const [clients, cases] = await Promise.all([getClients(), getCases()]);

  return clients
    .filter((client) => client.signedContract || client.serviceStatus.toLowerCase().includes("signed"))
    .map((client) => {
      const clientCase = cases.find((bankingCase) => bankingCase.clientId === client.id) ?? null;

      return {
        id: `${client.id}-${clientCase?.id ?? "contract"}`,
        clientId: client.id,
        clientName: client.fullName,
        caseId: clientCase?.id ?? null,
        contractNumber: clientCase?.contractNumber ?? "Contrato pendente de vinculo",
        bankName: client.bankName,
        statusLabel: client.signedContract ? "Contrato assinado" : "Contrato em validacao",
        detail: clientCase
          ? `Contrato vinculado ao caso ${clientCase.title} e ao banco ${client.bankName}.`
          : `Contrato fechado com ${client.bankName}, aguardando vinculacao completa ao caso.`,
        nextAction: clientCase
          ? "Conferir se a transicao para o fluxo juridico ja ocorreu."
          : "Vincular o contrato ao caso e registrar a entrada juridica."
      };
    });
}
