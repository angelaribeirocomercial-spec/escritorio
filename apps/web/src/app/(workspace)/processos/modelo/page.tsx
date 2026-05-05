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
        stage: "Distribuido",
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
        stage: "Distribuido",
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
        proceduralPhase: "Distribuido",
        statusLabel: "Distribuido",
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
        proceduralPhase: "Distribuido",
        statusLabel: "Distribuido",
        monitoringModeLabel: "Monitoramento manual",
        responsibleLawyer: bankingCase.ownerLabel
      };

  const latestTimeline =
    modelProcess?.latestTimeline ?? [
      {
        id: "modelo-t1",
        occurredAt: "2026-05-05",
        title: "Distribuicao concluida",
        description:
          "O quadro apresenta o processo apos a saida do handoff, usando o cliente Carlos Henrique Duarte como referencia inicial.",
        source: "MODELO",
        criticality: "medium" as const
      },
      {
        id: "modelo-t2",
        occurredAt: "2026-05-05",
        title: "Acompanhamento oficial habilitado",
        description:
          "O acesso externo existe apenas como atalho, sem integracao automatica. A pos-distribuicao real entra por importacao do orgao competente.",
        source: "MODELO",
        criticality: "low" as const
      }
    ];

  return (
    <div className="space-y-6">
      <WorkspacePage
        description="Fluxo pos-distribuicao de Carlos Henrique Duarte: handoff concluido -> processo -> acompanhamento oficial."
        eyebrow="Processos"
        metrics={[
          { label: "Caso", value: "Carlos Henrique Duarte" },
          { label: "Processo", value: "5011274-65.2026.8.19.0001" },
          { label: "Distribuicao", value: "Concluida" },
          { label: "Protocolo", value: "Nao automatizado" }
        ]}
        title="Processo pos-distribuicao"
      >
        <div className="mj-model-panel border border-cyan-300/20 bg-cyan-300/10 px-4 py-4">
          <p className="mj-model-title">Fluxo pos-distribuicao</p>
          <p className="mt-1 text-[13px] leading-6 text-slate-300">
            Carlos Henrique Duarte {"->"} distribuicao {"->"} processo. Esta tela mostra o registro apos o ato humano e
            deixa claro que o processo nasce depois da distribuicao, nao antes.
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
            workflowCompletionLabel: "Processo distribuido e pronto para acompanhamento",
            workflowCurrentStep: "Processo distribuido",
            workflowPhaseLabel: bankingCase.stage,
            workflowReadiness: [
              {
                id: "docs",
                label: "Documentos",
                state: "ready",
                detail: "Base documental fechada antes do protocolo humano.",
                blockers: []
              },
              {
                id: "piece",
                label: "Peca",
                state: "ready",
                detail: "A minuta foi usada no handoff e gerou o ato de distribuicao.",
                blockers: []
              },
              {
                id: "protocol",
                label: "Distribuicao",
                state: "ready",
                detail: "A distribuicao foi concluida e agora o processo pode ser acompanhado.",
                blockers: []
              }
            ],
            workflowSteps: [
              { id: "triagem", title: "Triagem documental", detail: "Base fechada antes do handoff", state: "done" },
              { id: "peca", title: "Geracao da peca", detail: "Minuta usada para protocolar", state: "done" },
              {
                id: "distribuir",
                title: "Distribuicao",
                detail: "Ato humano concluido e processo registrado",
                state: "done"
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
            distributionStatusLabel: "Distribuido e em acompanhamento",
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
