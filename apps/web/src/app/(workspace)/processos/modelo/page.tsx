import { getBankingNicheLabel } from "@lexia/domain";

import { ProcessCockpitFrame } from "@/components/layout/process-cockpit-frame";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";
import { getProcesses } from "@/server/services/processes/get-processes";

const CANONICAL_CLIENT_ID = "cl-002";
const CANONICAL_CASE_ID = "case-205";
const CANONICAL_PROCESS_ID = "proc-205";

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

  const modelClient = clients.find((client) => client.id === CANONICAL_CLIENT_ID) ?? clients[0] ?? null;
  const modelCase =
    cases.find((caseItem) => caseItem.id === CANONICAL_CASE_ID) ??
    cases.find((caseItem) => caseItem.client.id === CANONICAL_CLIENT_ID) ??
    cases[0] ??
    null;
  const modelProcess =
    processes.find((processItem) => processItem.id === CANONICAL_PROCESS_ID) ??
    processes.find((processItem) => processItem.caseId === CANONICAL_CASE_ID) ??
    processes.find((processItem) => processItem.client.id === CANONICAL_CLIENT_ID) ??
    processes[0] ??
    null;

  const bankingCase = modelCase
    ? {
        ...modelCase,
        stage: "Pronto para distribuir",
        status: "active" as const,
        linkedDocuments: [...modelCase.linkedDocuments, "Boletim de ocorrencia", "Extrato bancario detalhado"],
        linkedTasks: [...modelCase.linkedTasks, "Conferir poderes de representacao"],
        linkedDeadlines: [...modelCase.linkedDeadlines, "Validar anexos ate 17/04/2026"],
        lexiaInsights: [
          ...modelCase.lexiaInsights,
          "Exemplo canonico para visualizar a transicao do cliente ate a distribuicao."
        ]
      }
    : {
        id: "case-modelo",
        clientId: modelClient?.id ?? CANONICAL_CLIENT_ID,
        title: "Fraude bancaria via PIX",
        bankName: "Itau",
        processNumber: "5011274-65.2026.8.19.0001",
        contractNumber: "MODELO-001",
        claimType: "fraude_bancaria",
        stage: "Pronto para distribuir",
        status: "active" as const,
        amountInDispute: 18750,
        estimatedValue: 41000,
        mainThesis: "Falha de seguranca e dano moral",
        legalRisk: "medium" as const,
        suggestedStrategy:
          "Fechar cronologia do evento, reforcar prova documental e estruturar narrativa de falha na seguranca da operacao PIX.",
        ownerLabel: "Dr. Caio Nascimento",
        niche: "fraude" as const,
        linkedDocuments: [
          "Comprovantes PIX",
          "Atendimento bancario",
          "Capturas de tela",
          "Boletim de ocorrencia",
          "Extrato bancario detalhado"
        ],
        linkedTasks: ["Cobrar boletim de ocorrencia", "Solicitar comprovante bancario detalhado", "Montar cronologia do golpe"],
        linkedDeadlines: ["Revisar pendencias documentais em 11/04/2026"],
        lexiaInsights: [
          "Sem boletim de ocorrencia, a narrativa probatoria fica fragil.",
          "A tese principal permanece viavel se a cronologia for bem consolidada."
        ]
      };

  const process = modelProcess
    ? {
        id: modelProcess.id,
        processNumber: modelProcess.processNumber,
        clientName: modelProcess.client.fullName,
        clientDocumentId: modelProcess.client.documentId,
        tribunal: modelProcess.tribunal,
        courtDistrict: modelProcess.courtDistrict,
        courtName: modelProcess.courtName,
        proceduralPhase: "Pronto para distribuir",
        statusLabel: "Pronto para distribuir",
        monitoringModeLabel: "Monitoramento manual",
        responsibleLawyer: modelProcess.responsibleLawyer
      }
    : {
        id: "modelo-processo",
        processNumber: bankingCase.processNumber,
        clientName: modelClient?.fullName ?? "Carlos Henrique Duarte",
        clientDocumentId: modelClient?.documentId ?? "000.000.000-00",
        tribunal: "TJRJ",
        courtDistrict: "Rio de Janeiro/RJ",
        courtName: "7o Juizado Especial Civel da Capital",
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
        title: "Prontidao assistida",
        description:
          "O quadro apresenta os dados locais que o escritorio acompanharia antes do processo nascer, usando o cliente Carlos Henrique Duarte como base.",
        source: "MODELO",
        criticality: "medium" as const
      },
      {
        id: "modelo-t2",
        occurredAt: "2026-05-05",
        title: "Acesso oficial aberto manualmente",
        description:
          "O acesso externo existe apenas como atalho, sem integracao automatica. A pos-distribuicao real entra por importacao do orgao competente.",
        source: "MODELO",
        criticality: "low" as const
      }
    ];

  return (
    <div className="space-y-6">
      <WorkspacePage
        description="Fluxo canonico de Carlos Henrique Duarte: caso -> pronto para distribuir -> processo, com distribuicao assistida e sem protocolo real."
        eyebrow="Processos"
        metrics={[
          { label: "Caso", value: "Carlos Henrique Duarte" },
          { label: "Processo", value: "5011274-65.2026.8.19.0001" },
          { label: "Prontidao", value: "Assistida" },
          { label: "Protocolo", value: "Nao automatizado" }
        ]}
        title="Modelo de processo"
      >
        <div className="mj-model-panel border border-cyan-300/20 bg-cyan-300/10 px-4 py-4">
          <p className="mj-model-title">Fluxo canonico</p>
          <p className="mt-1 text-[13px] leading-6 text-slate-300">
            Carlos Henrique Duarte {"->"} caso {"->"} pronto para distribuir {"->"} processo. Esta tela mostra a prontidao
            do caso e o processo resultante, mas nao executa protocolo real.
          </p>
        </div>
        <ProcessCockpitFrame
          actionLinks={{
            continueClara: `/clara?tab=analise&process=${process.id}&client=${modelClient?.id ?? process.id}#clara-workbench`,
            backToProcesses: "/processos",
            openClaraHistory: `/clara?tab=analise&process=${process.id}&client=${modelClient?.id ?? process.id}#clara-history`,
            openDataJud: `/processos/${encodeURIComponent(process.id)}/datajud`,
            openOabMonitoring: `/processos/importar-oab?process=${encodeURIComponent(process.id)}`,
            openOfficialSystem: "https://pje.tjmg.jus.br/pje/"
          }}
          bankingCase={{
            amountInDispute: bankingCase.amountInDispute,
            bankName: bankingCase.bankName,
            checklistCompletionLabel: "Checklist concluido para exemplo canonico",
            checklistItems: bankingCase.linkedDocuments.map((label) => ({
              id: label,
              label,
              state: "received" as const,
              required: true
            })),
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
            workflowCompletionLabel: "Documentos completos para distribuicao assistida",
            workflowCurrentStep: "Pronto para distribuir",
            workflowPhaseLabel: bankingCase.stage,
            workflowReadiness: [
              {
                id: "docs",
                label: "Documentos",
                state: "ready",
                detail: "Todos os docs do caso foram preenchidos para o exemplo.",
                blockers: []
              },
              {
                id: "piece",
                label: "Peca",
                state: "ready",
                detail: "A minuta está gerada e aguardando o ato de distribuicao.",
                blockers: []
              },
              {
                id: "protocol",
                label: "Distribuicao",
                state: "ready",
                detail: "A distribuicao depende apenas do fechamento humano no orgao competente.",
                blockers: []
              }
            ],
            workflowSteps: [
              { id: "triagem", title: "Triagem documental", detail: "Caso e documentos conferidos", state: "done" },
              { id: "peca", title: "Geracao da peca", detail: "Minuta liberada para revisao", state: "done" },
              {
                id: "distribuir",
                title: "Pronto para distribuir",
                detail: "Ato final depende do advogado ou do orgao competente",
                state: "current"
              }
            ]
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
            integrationStatusLabel: "Exemplo canonico sem protocolo automatizado.",
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
