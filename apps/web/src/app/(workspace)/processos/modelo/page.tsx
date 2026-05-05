import { getBankingNicheLabel } from "@lexia/domain";

import { ProcessCockpitFrame } from "@/components/layout/process-cockpit-frame";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";
import { getProcesses } from "@/server/services/processes/get-processes";

function statusLabel(status: string) {
  switch (status) {
    case "monitoring":
      return "Em monitoramento";
    case "awaiting-filing":
      return "Aguardando protocolo";
    case "active":
      return "Ativo";
    case "stayed":
      return "Suspenso";
    default:
      return "Encerrado";
  }
}

function monitoringModeLabel(mode: string) {
  switch (mode) {
    case "oab":
      return "Boundary OAB";
    case "court":
      return "Monitoramento por tribunal";
    default:
      return "Monitoramento manual";
  }
}

function actionTypeLabel(niche: string) {
  switch (niche) {
    case "fraude":
      return "Fraude bancaria";
    case "busca-apreensao":
      return "Busca e apreensao";
    default:
      return "Revisional";
  }
}

function suggestedJudicialClass(niche: string) {
  return niche === "busca-apreensao" ? "Busca e apreensao" : "Procedimento comum civel";
}

function suggestedCnjSubject(niche: string, claimType: string) {
  const normalizedClaimType = claimType.toLowerCase();

  if (niche === "fraude" || normalizedClaimType.includes("fraude")) {
    return "Falha na prestacao do servico bancario / fraude";
  }

  if (niche === "busca-apreensao" || normalizedClaimType.includes("busca")) {
    return "Alienacao fiduciaria / busca e apreensao";
  }

  return "Contratos bancarios / revisao de clausulas";
}

function urgencyLabel(title: string, claimType: string, mainThesis: string, suggestedStrategy: string) {
  const evidence = [title, claimType, mainThesis, suggestedStrategy].join(" ").toLowerCase();
  return /urg|tutela|negativ|busca|apreens|fraude/.test(evidence) ? "Sim" : "Nao";
}

export default async function ProcessModelPage() {
  const [processes, clients, cases] = await Promise.all([getProcesses(), getClients(), getCases()]);

  const modelProcess = processes[0] ?? null;
  const modelCase = cases[0] ?? null;
  const modelClient = clients[0] ?? modelCase?.client ?? null;

  const fallbackCase = {
    id: "case-modelo",
    clientId: modelClient?.id ?? "cl-modelo",
    title: "Caso revisional pronto para distribuir",
    bankName: modelClient?.bankName ?? "Banco modelo",
    processNumber: "7012844-11.2026.8.13.0024",
    contractNumber: "MODELO-001",
    claimType: "acao_revisional",
    stage: "Pronto para distribuir",
    status: "active" as const,
    amountInDispute: 248000,
    estimatedValue: 118000,
    mainThesis: "Capitalizacao mensal indevida",
    legalRisk: "low" as const,
    suggestedStrategy: "Consolidar a inicial com memoria de calculo e conferir os anexos antes de virar processo.",
    ownerLabel: "Dra. Julia Ramalho",
    niche: "revisional" as const,
    linkedDocuments: ["CCB", "Extratos", "Comprovantes bancarios"],
    linkedTasks: ["Fechar memoria de calculo", "Conferir poderes de representacao"],
    linkedDeadlines: ["Validar anexos ate 17/04/2026"],
    lexiaInsights: ["Exemplo canônico para visualizar a tela de processo e distribuição."]
  };

  const bankingCase = modelCase ?? fallbackCase;
  const process = modelProcess
    ? {
        id: modelProcess.id,
        processNumber: modelProcess.processNumber,
        clientName: modelProcess.client.fullName,
        clientDocumentId: modelProcess.client.documentId,
        tribunal: modelProcess.tribunal,
        courtDistrict: modelProcess.courtDistrict,
        courtName: modelProcess.courtName,
        proceduralPhase: modelProcess.proceduralPhase,
        statusLabel: statusLabel(modelProcess.status),
        monitoringModeLabel: monitoringModeLabel(modelProcess.monitoringMode),
        responsibleLawyer: modelProcess.responsibleLawyer
      }
    : {
        id: "modelo-processo",
        processNumber: bankingCase.processNumber,
        clientName: modelClient?.fullName ?? "Cliente modelo",
        clientDocumentId: modelClient?.documentId ?? "000.000.000-00",
        tribunal: "TJMG",
        courtDistrict: "Belo Horizonte/MG",
        courtName: "4a Vara Civel de Belo Horizonte",
        proceduralPhase: "Pronto para distribuir",
        statusLabel: "Pronto para distribuir",
        monitoringModeLabel: "Monitoramento manual",
        responsibleLawyer: bankingCase.ownerLabel
      };

  const latestTimeline =
    modelProcess?.latestTimeline ?? [
      {
        id: "modelo-t1",
        occurredAt: "2026-05-05",
        title: "Prontidao simulada",
        description: "O quadro apresenta os dados locais que o escritorio acompanharia antes do processo nascer.",
        source: "MODELO",
        criticality: "medium" as const
      },
      {
        id: "modelo-t2",
        occurredAt: "2026-05-05",
        title: "PJe/TJMG aberto manualmente",
        description: "O acesso externo existe apenas como atalho, sem integracao automatica.",
        source: "MODELO",
        criticality: "low" as const
      }
    ];

  return (
    <div className="space-y-6">
      <WorkspacePage
        description="Fluxo canonico: caso -> pronto para distribuir -> processo, com distribuicao apenas simulada e sem protocolo real."
        eyebrow="Processos"
        metrics={[
          { label: "Caso", value: "Pronto para distribuir" },
          { label: "Processo", value: "Modelo canonico" },
          { label: "Prontidao", value: "Simulada" },
          { label: "Protocolo", value: "Nao automatizado" }
        ]}
        title="Modelo de processo"
      >
        <div className="mj-model-panel border border-cyan-300/20 bg-cyan-300/10 px-4 py-4">
          <p className="mj-model-title">Fluxo canonico</p>
          <p className="mt-1 text-[13px] leading-6 text-slate-300">
            Caso {"->"} pronto para distribuir {"->"} processo. Esta tela mostra a prontidao do caso e o processo resultante,
            mas nao executa protocolo real.
          </p>
        </div>
        <ProcessCockpitFrame
          actionLinks={{
            continueClara: `/clara?tab=analise&process=${process.id}&client=${modelClient?.id ?? process.id}#clara-workbench`,
            backToProcesses: "/processos",
            openClaraHistory: `/clara?tab=analise&process=${process.id}&client=${modelClient?.id ?? process.id}#clara-history`,
            openDataJud: `/api/processos/${encodeURIComponent(process.processNumber)}/datajud`,
            openOabMonitoring: `/processos/importar-oab?process=${encodeURIComponent(process.id)}`,
            openOfficialSystem: "https://pje.tjmg.jus.br/pje/"
          }}
          bankingCase={{
            amountInDispute: bankingCase.amountInDispute,
            bankName: bankingCase.bankName,
            checklistCompletionLabel: "Exemplo canônico",
            checklistItems: [],
            claimType: bankingCase.claimType,
            estimatedValue: bankingCase.estimatedValue,
            legalRiskLabel: bankingCase.legalRisk === "low" ? "Baixa" : bankingCase.legalRisk === "medium" ? "Media" : "Alta",
            linkedDeadlines: bankingCase.linkedDeadlines,
            linkedDocuments: bankingCase.linkedDocuments,
            missingDocuments: [],
            linkedTasks: bankingCase.linkedTasks,
            lexiaInsights: bankingCase.lexiaInsights,
            mainThesis: bankingCase.mainThesis,
            nicheLabel: getBankingNicheLabel(bankingCase.niche),
            ownerLabel: bankingCase.ownerLabel,
            requiredDocuments: bankingCase.linkedDocuments,
            stage: bankingCase.stage,
            status: bankingCase.status,
            suggestedStrategy: bankingCase.suggestedStrategy,
            title: bankingCase.title,
            workflowCompletionLabel: "Exemplo canônico pronto para visualizacao",
            workflowCurrentStep: bankingCase.suggestedStrategy,
            workflowPhaseLabel: bankingCase.stage,
            workflowReadiness: [],
            workflowSteps: []
          }}
          claraHistoryItems={[]}
          claraSummary={null}
          dataJudLabel="Consultar DataJud (CNJ)"
          distributionSummary={{
            actionTypeLabel: actionTypeLabel(bankingCase.niche),
            adversePartyLabel: bankingCase.bankName,
            competenceLabel: process.courtName,
            distributedProcessNumber: process.processNumber,
            distributionDateLabel: latestTimeline[0]?.occurredAt ?? "2026-05-05",
            distributionStatusLabel: "Caso pronto para distribuir",
            integrationStatusLabel: "Exemplo canônico sem protocolo automatizado.",
            officialSystemLabel: "Abrir PJe/TJMG",
            processClassLabel: suggestedJudicialClass(bankingCase.niche),
            protocolReceiptLabel: "Nao registrado no workspace",
            suggestedCnjSubjectLabel: suggestedCnjSubject(bankingCase.niche, bankingCase.claimType),
            urgencyLabel: urgencyLabel(
              bankingCase.title,
              bankingCase.claimType,
              bankingCase.mainThesis,
              bankingCase.suggestedStrategy
            ),
            valueInCauseLabel: `R$ ${bankingCase.estimatedValue.toLocaleString("pt-BR")}`
          }}
          latestTimeline={latestTimeline}
          linkedUpdates={[]}
          process={process}
          relatedClaraRecordsCount={0}
        />
      </WorkspacePage>
    </div>
  );
}
