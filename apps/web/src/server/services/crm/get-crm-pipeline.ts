import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";

export type CrmPipelineStage = {
  id: string;
  label: string;
  count: number;
  summary: string;
};

export type CrmFollowUpRecord = {
  id: string;
  clientId: string;
  clientName: string;
  caseId: string | null;
  title: string;
  detail: string;
  priority: "low" | "medium" | "high";
  nextAction: string;
};

function getStageId(serviceStatus: string, hasCases: boolean) {
  const normalized = serviceStatus.toLowerCase();

  if (normalized.includes("signed") || normalized.includes("contrat")) {
    return "contracts";
  }

  if (normalized.includes("proposal") || normalized.includes("proposta")) {
    return "proposal";
  }

  if (normalized.includes("talk") || normalized.includes("contato") || hasCases) {
    return "followup";
  }

  return "lead";
}

function getStageLabel(stageId: string) {
  switch (stageId) {
    case "contracts":
      return "Contratos";
    case "proposal":
      return "Pipeline";
    case "followup":
      return "Follow-ups";
    default:
      return "Leads";
  }
}

function getFollowUpPriority(serviceStatus: string, caseCount: number): "low" | "medium" | "high" {
  const normalized = serviceStatus.toLowerCase();

  if (normalized.includes("signed") || caseCount > 0) {
    return "high";
  }

  if (normalized.includes("proposal") || normalized.includes("proposta")) {
    return "medium";
  }

  return "low";
}

export async function getCrmPipeline() {
  const [clients, cases] = await Promise.all([getClients(), getCases()]);

  const stagesMap = new Map<string, CrmPipelineStage>();
  const followUps: CrmFollowUpRecord[] = [];

  for (const client of clients) {
    const clientCases = cases.filter((bankingCase) => bankingCase.clientId === client.id);
    const stageId = getStageId(client.serviceStatus, clientCases.length > 0);
    const existingStage = stagesMap.get(stageId);

    stagesMap.set(stageId, {
      id: stageId,
      label: getStageLabel(stageId),
      count: (existingStage?.count ?? 0) + 1,
      summary: existingStage?.summary ?? ""
    });

    const latestTimeline = client.timeline[0] ?? "Aguardando registro de follow-up";
    followUps.push({
      id: `${client.id}-${clientCases[0]?.id ?? "lead"}`,
      clientId: client.id,
      clientName: client.fullName,
      caseId: clientCases[0]?.id ?? null,
      title: client.signedContract ? "Acompanhar contrato fechado" : "Retomar contato comercial",
      detail: latestTimeline,
      priority: getFollowUpPriority(client.serviceStatus, clientCases.length),
      nextAction: client.signedContract
        ? "Validar se o caso ja entrou no fluxo juridico."
        : clientCases.length > 0
          ? "Agendar retorno para avançar o lead para conversao."
          : "Registrar novo contato e revisar proposta."
    });
  }

  const stages = Array.from(stagesMap.values()).map((stage) => {
    const summary =
      stage.id === "contracts"
        ? "Clientes com contrato fechado e prontos para transicao ao fluxo juridico."
        : stage.id === "proposal"
          ? "Clientes com proposta ou tratativa avancada."
          : stage.id === "followup"
            ? "Clientes que exigem retorno e validacao para avancar."
            : "Leads em entrada inicial ou triagem.";

    return {
      ...stage,
      summary
    };
  });

  const priorityOrder = { high: 3, medium: 2, low: 1 } as const;

  return {
    stages,
    followUps: followUps.sort((left, right) => priorityOrder[right.priority] - priorityOrder[left.priority]),
    totals: {
      clients: clients.length,
      cases: cases.length,
      stages: stages.length,
      followUps: followUps.length
    }
  };
}
