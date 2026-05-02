import { ClientRecord } from "@lexia/domain";

import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";

export type CrmLeadRecord = {
  id: string;
  client: ClientRecord;
  caseCount: number;
  stageLabel: string;
  nextAction: string;
  pipelineLabel: string;
  riskLabel: string;
};

function getPipelineLabel(client: ClientRecord, caseCount: number) {
  const serviceStatus = client.serviceStatus.toLowerCase();

  if (client.signedContract || serviceStatus.includes("signed")) {
    return "Contrato fechado";
  }

  if (serviceStatus.includes("proposal") || serviceStatus.includes("proposta")) {
    return "Proposta enviada";
  }

  if (serviceStatus.includes("talk") || serviceStatus.includes("contato") || caseCount > 0) {
    return "Em conversa";
  }

  return "Novo lead";
}

function getNextAction(client: ClientRecord, caseCount: number) {
  if (client.signedContract) {
    return "Levar o cliente ao cockpit do caso e vincular o fluxo operacional.";
  }

  if (caseCount > 0) {
    return "Revisar caso vinculado e avançar o follow-up para conversao.";
  }

  return "Registrar proposta, definir follow-up e abrir o caso quando houver autorizacao.";
}

function getRiskLabel(client: ClientRecord) {
  if (client.legalViabilityScore >= 80) {
    return "Baixo";
  }

  if (client.legalViabilityScore >= 60) {
    return "Moderado";
  }

  return "Alto";
}

export async function getCrmLeads(): Promise<CrmLeadRecord[]> {
  const [clients, cases] = await Promise.all([getClients(), getCases()]);

  return clients.map((client) => {
    const clientCases = cases.filter((bankingCase) => bankingCase.clientId === client.id);

    return {
      id: client.id,
      client,
      caseCount: clientCases.length,
      stageLabel: client.serviceStatus,
      nextAction: getNextAction(client, clientCases.length),
      pipelineLabel: getPipelineLabel(client, clientCases.length),
      riskLabel: getRiskLabel(client)
    };
  });
}
