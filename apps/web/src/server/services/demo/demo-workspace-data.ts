import type {
  BankingCaseRecord,
  BankingCaseChecklistStateRecord,
  BankingCaseWorkflowStateRecord,
  ClientLinkedCaseSummary,
  ClientRecord,
  DocumentRecord,
  JudicialProcessRecord,
  ProceduralUpdateRecord
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
  linkedDocuments: ["Comprovantes PIX", "Atendimento bancario", "Capturas de tela", "Boletim de ocorrencia", "Comprovante de protocolo"],
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
  linkedDocuments: ["Comprovantes PIX", "Atendimento bancario", "Capturas de tela", "Boletim de ocorrencia", "Comprovante de protocolo"],
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
  localReferenceNumber: "pendente-distribuicao-case-205",
  officialProcessNumber: "5011274-65.2026.8.19.0001",
  officialDistributionDate: "2026-05-05",
  officialSource: "manual_confirmed",
  officialDistributionStatus: "official_confirmed",
  protocolReceiptDocumentId: "doc-205-protocolo",
  distributionAuditTrail: [
    {
      id: "audit-205-attempt",
      occurredAt: "2026-05-05T12:40:00.000Z",
      status: "attempt_failed",
      source: "manual_confirmed",
      title: "Primeira tentativa frustrada",
      detail: "A primeira tentativa manual foi interrompida por inconsistencias de anexo antes do protocolo final."
    },
    {
      id: "audit-205-confirmed",
      occurredAt: "2026-05-05T13:45:00.000Z",
      status: "official_confirmed",
      source: "manual_confirmed",
      title: "Distribuicao confirmada",
      detail: "Numero oficial, data e comprovante do protocolo foram revisados e registrados no workspace."
    }
  ],
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

export const DEMO_DOCUMENT_RECORDS: DocumentRecord[] = [
  {
    id: "doc-205-protocolo",
    clientId: DEMO_CLIENT_ID,
    caseId: DEMO_CASE_ID,
    fileName: "comprovante-protocolo-carlos-henrique.pdf",
    originalFileName: "comprovante-protocolo.pdf",
    documentType: "Comprovante de protocolo",
    category: "protocolo-oficial",
    tags: ["protocolo", "distribuicao", "oficial"],
    aiStatus: "analyzed",
    summary: "Recibo oficial do protocolo manual usado para consolidar o processo judicial no workspace.",
    pageCount: 1,
    uploadedAt: "2026-05-05T13:45:00.000Z",
    previewLabel: "Comprovante oficial do protocolo",
    storageBucket: "demo",
    storagePath: "documents/case-205/comprovante-protocolo.pdf",
    storageMimeType: "application/pdf",
    storageSizeBytes: 98304,
    actions: ["visualizar"]
  },
  {
    id: "doc-205-pix",
    clientId: DEMO_CLIENT_ID,
    caseId: DEMO_CASE_ID,
    fileName: "comprovantes-pix-carlos-henrique.pdf",
    originalFileName: "comprovantes-pix.pdf",
    documentType: "Comprovantes PIX",
    category: "financeiro",
    tags: ["pix", "fraude", "banco"],
    aiStatus: "analyzed",
    summary: "Comprovantes das transferencias via PIX vinculadas ao evento principal da fraude.",
    pageCount: 4,
    uploadedAt: "2026-05-05T09:00:00.000Z",
    previewLabel: "Comprovantes PIX consolidados",
    storageBucket: "demo",
    storagePath: "documents/case-205/comprovantes-pix.pdf",
    storageMimeType: "application/pdf",
    storageSizeBytes: 245760,
    actions: ["visualizar"]
  },
  {
    id: "doc-205-atendimento",
    clientId: DEMO_CLIENT_ID,
    caseId: DEMO_CASE_ID,
    fileName: "atendimento-bancario-carlos-henrique.pdf",
    originalFileName: "atendimento-bancario.pdf",
    documentType: "Atendimento bancario",
    category: "atendimento",
    tags: ["banco", "protocolo"],
    aiStatus: "analyzed",
    summary: "Protocolos de atendimento e respostas iniciais do banco sobre a contestacao.",
    pageCount: 3,
    uploadedAt: "2026-05-05T09:10:00.000Z",
    previewLabel: "Atendimento bancario registrado",
    storageBucket: "demo",
    storagePath: "documents/case-205/atendimento-bancario.pdf",
    storageMimeType: "application/pdf",
    storageSizeBytes: 188416,
    actions: ["visualizar"]
  },
  {
    id: "doc-205-capturas",
    clientId: DEMO_CLIENT_ID,
    caseId: DEMO_CASE_ID,
    fileName: "capturas-de-tela-carlos-henrique.pdf",
    originalFileName: "capturas-de-tela.pdf",
    documentType: "Capturas de tela",
    category: "prova-digital",
    tags: ["whatsapp", "aplicativo", "fraude"],
    aiStatus: "needs_review",
    summary: "Capturas do aplicativo bancario e das mensagens usadas para reconstruir a cronologia.",
    pageCount: 8,
    uploadedAt: "2026-05-05T09:20:00.000Z",
    previewLabel: "Capturas da cronologia",
    storageBucket: "demo",
    storagePath: "documents/case-205/capturas-de-tela.pdf",
    storageMimeType: "application/pdf",
    storageSizeBytes: 412876,
    actions: ["visualizar"]
  },
  {
    id: "doc-205-bo",
    clientId: DEMO_CLIENT_ID,
    caseId: DEMO_CASE_ID,
    fileName: "boletim-de-ocorrencia-carlos-henrique.pdf",
    originalFileName: "boletim-de-ocorrencia.pdf",
    documentType: "Boletim de ocorrencia",
    category: "prova-oficial",
    tags: ["bo", "delegacia"],
    aiStatus: "analyzed",
    summary: "Boletim de ocorrencia anexado e pronto para reforcar a narrativa probatoria da inicial.",
    pageCount: 2,
    uploadedAt: "2026-05-05T09:30:00.000Z",
    previewLabel: "Boletim de ocorrencia validado",
    storageBucket: "demo",
    storagePath: "documents/case-205/boletim-de-ocorrencia.pdf",
    storageMimeType: "application/pdf",
    storageSizeBytes: 102400,
    actions: ["visualizar"]
  }
];

export const DEMO_PROCEDURAL_UPDATE_RECORDS: ProceduralUpdateRecord[] = [
  {
    id: "upd-205-1",
    processId: DEMO_PROCESS_ID,
    caseId: DEMO_CASE_ID,
    clientId: DEMO_CLIENT_ID,
    occurredAt: "2026-05-05T13:45:00.000Z",
    movementType: "Distribuicao protocolada",
    sourceCourt: "TJRJ",
    sourceLabel: "PJe / comprovante oficial",
    rawMovement: "Protocolo gerado e distribuicao confirmada no sistema oficial.",
    operationalSummary: "Processo protocolado com comprovante oficial e numero judicial consolidado no workspace.",
    criticality: "medium",
    claraImpactSummary: "Clara pode assumir acompanhamento pos-distribuicao com base no numero oficial.",
    claraCaution: "Conferir anexos finais e poderes antes de qualquer nova medida.",
    claraNextActions: [
      "Validar recibo de protocolo",
      "Cruzar dados do processo com o caso",
      "Abrir rotina de acompanhamento"
    ]
  },
  {
    id: "upd-205-2",
    processId: DEMO_PROCESS_ID,
    caseId: DEMO_CASE_ID,
    clientId: DEMO_CLIENT_ID,
    occurredAt: "2026-05-06T10:15:00.000Z",
    movementType: "Cadastro para acompanhamento",
    sourceCourt: "TJRJ",
    sourceLabel: "Leitura interna",
    rawMovement: "Processo marcado para acompanhamento manual e conferencia inicial.",
    operationalSummary: "Acompanhamento manual habilitado enquanto nao ha importacao automatica do tribunal.",
    criticality: "low",
    claraImpactSummary: "A Clara passa a operar sobre um processo real, sem confundir etapa de caso com processo.",
    claraCaution: "Sem automacao externa; cada andamento precisa de leitura humana.",
    claraNextActions: [
      "Registrar proxima janela de leitura",
      "Atualizar cliente sobre distribuicao"
    ]
  }
];
