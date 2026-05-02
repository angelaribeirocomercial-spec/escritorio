import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";

export type CrmConversionRecord = {
  id: string;
  clientId: string;
  clientName: string;
  caseId: string | null;
  sourceLabel: string;
  stageLabel: string;
  summary: string;
  nextAction: string;
};

export async function getCrmConversions(): Promise<CrmConversionRecord[]> {
  const [clients, cases] = await Promise.all([getClients(), getCases()]);

  return clients.map((client) => {
    const clientCase = cases.find((bankingCase) => bankingCase.clientId === client.id) ?? null;
    const hasContract = client.signedContract || client.serviceStatus.toLowerCase().includes("signed");

    return {
      id: `${client.id}-${clientCase?.id ?? "conversion"}`,
      clientId: client.id,
      clientName: client.fullName,
      caseId: clientCase?.id ?? null,
      sourceLabel: client.leadSource || "Canal nao informado",
      stageLabel: clientCase ? "Cliente convertido em caso" : hasContract ? "Contrato fechado" : "Lead em conversao",
      summary: clientCase
        ? `O lead virou cliente e caso no fluxo do escritorio.`
        : hasContract
          ? "O lead assinou o contrato e aguarda abertura do caso."
          : "O lead ainda precisa de classificacao, proposta e follow-up para conversao.",
      nextAction: clientCase
        ? "Manter acompanhamento juridico e registrar os proximos atos do caso."
        : hasContract
          ? "Abrir o novo atendimento bancario e formalizar o caso."
          : "Registrar origem, classificar o lead e acionar o chatbot de intake quando disponivel."
    };
  });
}
