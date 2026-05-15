import { getBankingNicheLabel } from "@lexia/domain";

import { ProcessCockpitFrame } from "@/components/layout/process-cockpit-frame";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { isSupabaseConfigured } from "@/lib/supabase/env";
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

type ProcessList = Awaited<ReturnType<typeof getProcesses>>;
type ClientList = Awaited<ReturnType<typeof getClients>>;
type CaseList = Awaited<ReturnType<typeof getCases>>;

function buildDemoModel() {
  return {
    client: {
      id: CANONICAL_CLIENT_ID,
      fullName: "Carlos Henrique Duarte",
      documentId: "123.456.789-00"
    },
    bankingCase: {
      id: CANONICAL_CASE_ID,
      clientId: CANONICAL_CLIENT_ID,
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
    },
    process: {
      id: CANONICAL_PROCESS_ID,
      processNumber: "5011274-65.2026.8.19.0001",
      client: {
        id: CANONICAL_CLIENT_ID,
        fullName: "Carlos Henrique Duarte",
        documentId: "123.456.789-00"
      },
      tribunal: "TJRJ",
      courtDistrict: "Rio de Janeiro/RJ",
      courtName: "7o Juizado Especial Civel da Capital",
      proceduralPhase: "Distribuido",
      statusLabel: "Distribuido",
      monitoringModeLabel: "Monitoramento manual",
      responsibleLawyer: "Dr. Caio Nascimento",
      latestTimeline: [
        {
          id: "modelo-t1",
          occurredAt: "2026-05-05",
          title: "Distribuicao concluida",
          description:
            "O quadro apresenta o processo apenas depois do ato humano de distribuicao, usando Carlos Henrique Duarte como referencia canonica.",
          source: "MODELO",
          criticality: "medium" as const
        },
        {
          id: "modelo-t2",
          occurredAt: "2026-05-05",
          title: "Acompanhamento oficial habilitado",
          description:
            "A leitura oficial entra por importacao do orgao competente; aqui a tela apenas organiza o registro pos-distribuicao.",
          source: "MODELO",
          criticality: "low" as const
        }
      ]
    },
  };
}

export default async function ProcessModelPage() {
  const localModel = buildDemoModel();
  const supabaseConfigured = isSupabaseConfigured();

  const [processes, clients, cases]: [ProcessList, ClientList, CaseList] = supabaseConfigured
    ? await Promise.all([getProcesses(), getClients(), getCases()])
    : [[], [], []];

  const modelClient = clients.find((client) => client.id === CANONICAL_CLIENT_ID) ?? clients[0] ?? localModel.client;
  const modelCase =
    cases.find((caseItem) => caseItem.id === CANONICAL_CASE_ID) ??
    cases.find((caseItem) => caseItem.client.id === CANONICAL_CLIENT_ID) ??
    cases[0] ??
    localModel.bankingCase;
  const modelProcess =
    processes.find((processItem) => processItem.id === CANONICAL_PROCESS_ID) ??
    processes.find((processItem) => processItem.caseId === CANONICAL_CASE_ID) ??
    processes.find((processItem) => processItem.client.id === CANONICAL_CLIENT_ID) ??
    processes[0] ??
    localModel.process;

  const bankingCase = {
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
  };

  const process = {
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
  };

  const latestTimeline = modelProcess.latestTimeline ?? localModel.process.latestTimeline;
  const relatedClientId = modelProcess.client.id ?? modelCase.clientId ?? modelClient.id;

  return (
    <div className="space-y-6">
      <WorkspacePage
        description="Registro pos-distribuicao de Carlos Henrique Duarte. O caso vive no cockpit; esta tela so exibe o processo ja nascido e sua leitura oficial."
        eyebrow="Processos"
        metrics={[
          { label: "Caso", value: "Carlos Henrique Duarte" },
          { label: "Processo", value: process.processNumber },
          { label: "Distribuicao", value: "Concluida" },
          { label: "Protocolo", value: "Nao automatizado" }
        ]}
        title="Processo pos-distribuicao"
      >
        <ProcessCockpitFrame
          actionLinks={{
            continueClara: `/clara?tab=analise&process=${process.id}&client=${relatedClientId}#clara-workbench`,
            backToProcesses: "/processos",
            openClaraHistory: `/clara?tab=analise&process=${process.id}&client=${relatedClientId}#clara-history`,
            openDataJud: `/processos/${encodeURIComponent(process.id)}/datajud`,
            openOabMonitoring: `/processos/importar-oab?process=${encodeURIComponent(process.id)}`,
            uploadOfficialReceipt: `/documentos/enviar-arquivos?caseId=${encodeURIComponent(bankingCase.id)}&documentType=${encodeURIComponent("Comprovante de protocolo")}&returnTo=${encodeURIComponent(`/processos/${process.id}`)}`,
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
            localReferenceNumber: "pendente-distribuicao-case-205",
            distributedProcessNumber: process.processNumber,
            distributionDateLabel: latestTimeline[0]?.occurredAt ?? "2026-05-05",
            distributionStatusLabel: "Retorno oficial confirmado",
            officialSourceLabel: "Manual confirmada",
            integrationStatusLabel: "Exemplo canonico sem protocolo automatizado.",
            officialSystemLabel: "Abrir PJe/TJMG",
            processClassLabel: suggestedJudicialClass(bankingCase.niche),
            protocolReceiptLabel: "Comprovante de protocolo | comprovante-protocolo-carlos-henrique.pdf",
            protocolReceiptHref: "/documentos/doc-205-protocolo",
            suggestedCnjSubjectLabel: suggestedCnjSubject(bankingCase.niche, bankingCase.claimType),
            urgencyLabel: urgencyLabel(
              bankingCase.title,
              bankingCase.claimType,
              bankingCase.mainThesis,
              bankingCase.suggestedStrategy
            ),
            valueInCauseLabel: `R$ ${bankingCase.estimatedValue.toLocaleString("pt-BR")}`,
            auditTrail: [
              {
                id: "modelo-audit-1",
                occurredAt: "2026-05-05T12:40:00.000Z",
                title: "Tentativa frustrada registrada",
                detail: "A primeira tentativa manual foi interrompida para ajustar o anexo antes do protocolo final.",
                statusLabel: "Tentativa frustrada",
                sourceLabel: "Manual confirmada"
              },
              {
                id: "modelo-audit-2",
                occurredAt: "2026-05-05T13:45:00.000Z",
                title: "Retorno oficial confirmado",
                detail: "Numero oficial, data e comprovante foram consolidados depois da distribuicao humana.",
                statusLabel: "Retorno oficial confirmado",
                sourceLabel: "Manual confirmada"
              }
            ]
          }}
          officialRegistration={{
            readOnly: true,
            formAction: "#",
            processId: process.id,
            localReferenceNumber: "pendente-distribuicao-case-205",
            officialProcessNumber: process.processNumber,
            officialDistributionDate: "2026-05-05",
            officialSource: "manual_confirmed",
            officialDistributionStatus: "official_confirmed",
            protocolReceiptDocumentId: "doc-205-protocolo",
            receiptCandidates: [
              {
                id: "doc-205-protocolo",
                label: "Comprovante de protocolo | comprovante-protocolo-carlos-henrique.pdf"
              }
            ]
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
