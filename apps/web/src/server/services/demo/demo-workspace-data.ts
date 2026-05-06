import type {
  BankingCaseRecord,
  BankingCaseChecklistStateRecord,
  BankingCaseWorkflowStateRecord,
  ClientLinkedCaseSummary,
  ClientRecord,
  JudicialProcessRecord
} from "@lexia/domain";

export const DEMO_CLIENT_ID = "cl-002";
export const DEMO_CASE_ID = "case-205";
export const DEMO_PROCESS_ID = "proc-205";

export const DEMO_CLIENT_RECORD: ClientRecord = {
  id: DEMO_CLIENT_ID,
  fullName: "Carlos Henrique Duarte",
  documentId: "123.456.789-00",
  email: "carlos.henrique.duarte@example.com",
  phone: "(21) 99876-5432",
  whatsapp: "(21) 99876-5432",
  address: "Rua das Flores, 123, Rio de Janeiro - RJ",
  leadSource: "Demonstracao guiada",
  bankName: "Itau",
  serviceStatus: "active",
  signedContract: true,
  legalViabilityScore: 92,
  feesLabel: "Honorarios fixos + êxito",
  documentsSent: 5,
  notes: "Cliente canônico para demonstracao do fluxo caso -> handoff -> processo.",
  iaContext: "O caso foi preparado para mostrar a passagem do cockpit do cliente ao handoff de distribuicao.",
  linkedCases: [
    {
      id: DEMO_CASE_ID,
      title: "Fraude bancaria via PIX",
      status: "Distribuido",
      thesis: "Falha de seguranca e dano moral"
    } satisfies ClientLinkedCaseSummary
  ],
  linkedDocuments: ["Comprovantes PIX", "Atendimento bancario", "Capturas de tela", "Boletim de ocorrencia"],
  timeline: [
    "Captação inicial e enquadramento bancario",
    "Checklist documental concluido",
    "Handoff de distribuicao pronto"
  ]
};

const DEMO_CHECKLIST_STATE: BankingCaseChecklistStateRecord = {
  completionLabel: "4/4 documentos-base no caso",
  requiredDocuments: ["Comprovantes PIX", "Atendimento bancario", "Capturas de tela", "Boletim de ocorrencia"],
  missingDocuments: [],
  items: [
    {
      id: "comp",
      label: "Comprovantes PIX",
      state: "received",
      required: true
    },
    {
      id: "atendimento",
      label: "Atendimento bancario",
      state: "received",
      required: true
    },
    {
      id: "capturas",
      label: "Capturas de tela",
      state: "received",
      required: true
    },
    {
      id: "bo",
      label: "Boletim de ocorrencia",
      state: "received",
      required: true
    }
  ]
};

const DEMO_WORKFLOW_STATE: BankingCaseWorkflowStateRecord = {
  phaseLabel: "Distribuido",
  nextStep: "Acompanhar o processo e consolidar andamentos oficiais",
  completionLabel: "Checklist concluido para exemplo canonico",
  currentStepId: "distribuir",
  steps: [
    {
      id: "triagem",
      title: "Triagem documental",
      detail: "Base fechada antes do handoff",
      state: "done"
    },
    {
      id: "peca",
      title: "Geracao da peca",
      detail: "Minuta usada para protocolar",
      state: "done"
    },
    {
      id: "distribuir",
      title: "Distribuicao",
      detail: "Ato humano concluido e processo registrado",
      state: "done"
    }
  ],
  readiness: [
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
  blockers: []
};

export const DEMO_CASE_RECORD: BankingCaseRecord & { client: ClientRecord } = {
  id: DEMO_CASE_ID,
  clientId: DEMO_CLIENT_ID,
  title: "Fraude bancaria via PIX",
  bankName: "Itau",
  processNumber: "5011274-65.2026.8.19.0001",
  contractNumber: "PIX-FRD-1180",
  claimType: "fraude_bancaria",
  stage: "Distribuido",
  status: "active",
  amountInDispute: 18750,
  estimatedValue: 41000,
  mainThesis: "Falha de seguranca e dano moral",
  legalRisk: "medium",
  suggestedStrategy:
    "Fechar cronologia do evento, reforcar prova documental e estruturar narrativa de falha na seguranca da operacao PIX.",
  ownerLabel: "Dr. Caio Nascimento",
  niche: "fraude",
  linkedDocuments: ["Comprovantes PIX", "Atendimento bancario", "Capturas de tela", "Boletim de ocorrencia"],
  linkedTasks: ["Cobrar boletim de ocorrencia", "Solicitar comprovante bancario detalhado", "Montar cronologia do golpe"],
  linkedDeadlines: ["Revisar pendencias documentais em 11/04/2026"],
  lexiaInsights: [
    "Sem boletim de ocorrencia, a narrativa probatoria fica fragil.",
    "A tese principal permanece viavel se a cronologia for bem consolidada."
  ],
  workflowState: DEMO_WORKFLOW_STATE,
  checklistState: DEMO_CHECKLIST_STATE,
  client: DEMO_CLIENT_RECORD
};

export const DEMO_PROCESS_RECORD: JudicialProcessRecord = {
  id: DEMO_PROCESS_ID,
  caseId: DEMO_CASE_ID,
  clientId: DEMO_CLIENT_ID,
  processNumber: "5011274-65.2026.8.19.0001",
  tribunal: "TJRJ",
  courtDistrict: "Rio de Janeiro/RJ",
  courtName: "7o Juizado Especial Civel da Capital",
  proceduralPhase: "Distribuido",
  status: "active",
  responsibleLawyer: "Dr. Caio Nascimento",
  monitoringMode: "manual",
  latestTimeline: [
    {
      id: "modelo-t1",
      occurredAt: "2026-05-05",
      title: "Distribuicao concluida",
      description:
        "O quadro apresenta o processo apenas depois do ato humano de distribuicao, usando Carlos Henrique Duarte como referencia canonica.",
      source: "MODELO",
      criticality: "medium"
    },
    {
      id: "modelo-t2",
      occurredAt: "2026-05-05",
      title: "Acompanhamento oficial habilitado",
      description:
        "A leitura oficial entra por importacao do orgao competente; aqui a tela apenas organiza o registro pos-distribuicao.",
      source: "MODELO",
      criticality: "low"
    }
  ]
};

