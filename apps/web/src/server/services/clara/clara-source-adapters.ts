import {
  resolveClaraWorkspaceContext,
  type ClaraWorkspaceContext
} from "@/server/services/clara/clara-workspace-context";

// Shared resolver keeps the real workspace lookups centralized:
// getClients(), getClientById(), getCases(), getCaseById(), getProcesses(), getProcessById(),
// getDocuments(), getDocumentById().

export type ClaraSourceAdapterId =
  | "cnj-datajud"
  | "bcb"
  | "stj"
  | "stf"
  | "consumidor-gov";

export type ClaraSourceAdapterStatus = "not_consulted" | "consulted" | "unavailable" | "failed";

export type ClaraSourceAdapterReference = {
  referenceId: string;
  kind: "process" | "document" | "case" | "institution" | "jurisprudence" | "consumer-complaint";
  label: string;
  detail: string;
  sourceHandle: string;
  metadata: Record<string, string>;
};

export type ClaraSourceAdapterFinding = {
  findingId: string;
  category: "process-monitoring" | "financial-indicator" | "precedent" | "consumer-signal";
  title: string;
  detail: string;
  referenceIds: string[];
};

export type ClaraSourceAdapterPayload = {
  summary: string;
  mode: "prepared_stub";
  persistenceKey: string;
  responseMetadata: {
    scope: string;
    queryHint: string;
    canPersist: boolean;
    canLog: boolean;
  };
  records: ClaraSourceAdapterReference[];
  findings: ClaraSourceAdapterFinding[];
  rawReferenceHandles: string[];
};

export type ClaraSourceAdapterResult = {
  sourceId: ClaraSourceAdapterId;
  sourceLabel: string;
  scope: string;
  status: ClaraSourceAdapterStatus;
  consulted: boolean;
  queryHint: string;
  failureReason?: string;
  consultedAt?: string;
  sourceTrail: {
    origem_interna: string[];
    origem_documental: string[];
    origem_api: string[];
    inferencia_controlada: string[];
  };
  payload: ClaraSourceAdapterPayload;
};

export type ClaraSourceAdapterContext = {
  clientId?: string;
  caseId?: string;
  processId?: string;
  documentId?: string;
  simulateFailedSources?: ClaraSourceAdapterId[];
};

type ResolvedAdapterContext = ClaraWorkspaceContext & {
  process: NonNullable<ClaraWorkspaceContext["process"]>;
  selectedDocument: NonNullable<ClaraWorkspaceContext["selectedDocument"]>;
};

type AdapterDescriptor = {
  sourceId: ClaraSourceAdapterId;
  sourceLabel: string;
  scope: string;
  queryHint: (context: ResolvedAdapterContext) => string;
  buildPayload: (
    context: ResolvedAdapterContext
  ) => Omit<ClaraSourceAdapterPayload, "mode" | "persistenceKey" | "responseMetadata">;
};

function buildContextTrail(context: ResolvedAdapterContext) {
  return [
    `Cliente ${context.client.id}`,
    `Caso ${context.bankingCase.id}`,
    `Processo ${context.process.id}`,
    `Documento ${context.selectedDocument.id}`
  ];
}

function buildDocumentTrail(context: ResolvedAdapterContext) {
  return context.caseDocuments.map((document) => document.id);
}

function buildPayloadBase(
  descriptor: AdapterDescriptor,
  context: ResolvedAdapterContext,
  queryHint: string
): Pick<ClaraSourceAdapterPayload, "mode" | "persistenceKey" | "responseMetadata"> {
  return {
    mode: "prepared_stub",
    persistenceKey: `${descriptor.sourceId}:${context.bankingCase.id}:${context.process.id}:${context.selectedDocument.id}`,
    responseMetadata: {
      scope: descriptor.scope,
      queryHint,
      canPersist: true,
      canLog: true
    }
  };
}

function buildSourceResult(
  descriptor: AdapterDescriptor,
  context: ResolvedAdapterContext,
  status: ClaraSourceAdapterStatus,
  failureReason?: string
): ClaraSourceAdapterResult {
  const queryHint = descriptor.queryHint(context);
  const payload = descriptor.buildPayload(context);
  const consulted = status === "consulted";

  return {
    sourceId: descriptor.sourceId,
    sourceLabel: descriptor.sourceLabel,
    scope: descriptor.scope,
    status,
    consulted,
    queryHint,
    failureReason,
    consultedAt: consulted ? new Date().toISOString() : undefined,
    sourceTrail: {
      origem_interna: buildContextTrail(context),
      origem_documental: buildDocumentTrail(context),
      origem_api: consulted ? [`${descriptor.sourceLabel} consultado no contrato do adapter.`] : [],
      inferencia_controlada: [
        "Adapter preparado como boundary server-side, sem acoplamento direto com a UI.",
        "Payload estruturado permanece logavel e persistivel mesmo quando a consulta real ainda nao foi executada."
      ]
    },
    payload: {
      ...payload,
      ...buildPayloadBase(descriptor, context, queryHint)
    }
  };
}

const ADAPTERS: AdapterDescriptor[] = [
  {
    sourceId: "cnj-datajud",
    sourceLabel: "CNJ / DataJud",
    scope: "Metadados processuais, andamento e fase processual",
    queryHint: (context) =>
      `Consultar o processo ${context.process.processNumber} para metadados processuais e movimentacoes oficiais.`,
    buildPayload: (context) => ({
      summary: `Stub preparado para monitorar o processo ${context.process.processNumber} no CNJ / DataJud.`,
      records: [
        {
          referenceId: `${context.process.id}-process`,
          kind: "process",
          label: context.process.processNumber,
          detail: `${context.process.tribunal} | ${context.process.courtName} | ${context.process.proceduralPhase}`,
          sourceHandle: `process:${context.process.id}`,
          metadata: {
            caseId: context.bankingCase.id,
            clientId: context.client.id,
            tribunal: context.process.tribunal
          }
        }
      ],
      findings: [
        {
          findingId: `${context.process.id}-phase`,
          category: "process-monitoring",
          title: "Monitoramento processual preparado",
          detail: "A consulta oficial ainda nao foi executada, mas o adapter ja expoe um registro estruturado para futuros andamentos.",
          referenceIds: [`${context.process.id}-process`]
        }
      ],
      rawReferenceHandles: [`process:${context.process.id}`]
    })
  },
  {
    sourceId: "bcb",
    sourceLabel: "Banco Central do Brasil",
    scope: "Tarifas, series economicas, PTAX e indicadores financeiros",
    queryHint: (context) =>
      `Consultar series e referencias economicas ligadas a ${context.bankingCase.bankName} no contexto do caso ${context.bankingCase.id}.`,
    buildPayload: (context) => ({
      summary: `Stub preparado para referencias economicas do Banco Central relacionadas a ${context.bankingCase.bankName}.`,
      records: [
        {
          referenceId: `${context.bankingCase.id}-institution`,
          kind: "institution",
          label: context.bankingCase.bankName,
          detail: "Instituicao financeira vinculada ao caso",
          sourceHandle: `bank:${context.bankingCase.bankName}`,
          metadata: {
            caseId: context.bankingCase.id,
            processId: context.process.id,
            niche: context.bankingCase.niche
          }
        }
      ],
      findings: [
        {
          findingId: `${context.bankingCase.id}-financial-context`,
          category: "financial-indicator",
          title: "Contexto economico preparado",
          detail: "O adapter organiza referencias para PTAX, tarifas e series economicas sem executar chamada externa nesta story.",
          referenceIds: [`${context.bankingCase.id}-institution`]
        }
      ],
      rawReferenceHandles: [`bank:${context.bankingCase.bankName}`]
    })
  },
  {
    sourceId: "stj",
    sourceLabel: "STJ",
    scope: "Pesquisa de jurisprudencia bancaria e precedentes relevantes",
    queryHint: (context) =>
      `Pesquisar precedentes do STJ para ${context.bankingCase.title} com foco em ${context.bankingCase.mainThesis}.`,
    buildPayload: (context) => ({
      summary: `Stub preparado para jurisprudencia do STJ sobre ${context.bankingCase.title}.`,
      records: [
        {
          referenceId: `${context.bankingCase.id}-stj-theme`,
          kind: "jurisprudence",
          label: context.bankingCase.title,
          detail: context.bankingCase.mainThesis,
          sourceHandle: `thesis:${context.bankingCase.id}:stj`,
          metadata: {
            caseId: context.bankingCase.id,
            processId: context.process.id,
            thesis: context.bankingCase.mainThesis
          }
        }
      ],
      findings: [
        {
          findingId: `${context.bankingCase.id}-stj-precedent`,
          category: "precedent",
          title: "Pesquisa de precedentes preparada",
          detail: "A consulta oficial ao STJ nao foi executada, mas o adapter ja entrega o pacote de referencias para logging e persistencia.",
          referenceIds: [`${context.bankingCase.id}-stj-theme`]
        }
      ],
      rawReferenceHandles: [`thesis:${context.bankingCase.id}:stj`]
    })
  },
  {
    sourceId: "stf",
    sourceLabel: "STF",
    scope: "Pesquisa constitucional e repercussao geral quando aplicavel",
    queryHint: (context) =>
      `Consultar o STF apenas se houver recorte constitucional real em ${context.bankingCase.title}.`,
    buildPayload: (context) => ({
      summary: `Stub preparado para pesquisa constitucional do STF vinculada ao caso ${context.bankingCase.id}.`,
      records: [
        {
          referenceId: `${context.bankingCase.id}-stf-scope`,
          kind: "jurisprudence",
          label: context.bankingCase.title,
          detail: "Recorte constitucional condicionado a necessidade real",
          sourceHandle: `constitutional-scope:${context.bankingCase.id}`,
          metadata: {
            caseId: context.bankingCase.id,
            processId: context.process.id,
            stage: context.bankingCase.stage
          }
        }
      ],
      findings: [
        {
          findingId: `${context.bankingCase.id}-stf-pre-screen`,
          category: "precedent",
          title: "Triagem constitucional preparada",
          detail: "O adapter delimita quando o STF faz sentido e preserva essa triagem como dado estruturado.",
          referenceIds: [`${context.bankingCase.id}-stf-scope`]
        }
      ],
      rawReferenceHandles: [`constitutional-scope:${context.bankingCase.id}`]
    })
  },
  {
    sourceId: "consumidor-gov",
    sourceLabel: "Consumidor.gov.br / Senacon",
    scope: "Inteligencia complementar sobre reclamacoes bancarias",
    queryHint: (context) =>
      `Buscar padroes de reclamacao relacionados a ${context.bankingCase.bankName} sem misturar contextos de outros casos.`,
    buildPayload: (context) => ({
      summary: `Stub preparado para sinais de reclamacao ligados a ${context.bankingCase.bankName}.`,
      records: [
        {
          referenceId: `${context.bankingCase.id}-consumer-bank`,
          kind: "consumer-complaint",
          label: context.bankingCase.bankName,
          detail: "Instituicao alvo de pesquisa em reclamacoes publicas",
          sourceHandle: `consumer-bank:${context.bankingCase.bankName}`,
          metadata: {
            caseId: context.bankingCase.id,
            processId: context.process.id,
            clientId: context.client.id
          }
        }
      ],
      findings: [
        {
          findingId: `${context.bankingCase.id}-consumer-signal`,
          category: "consumer-signal",
          title: "Pesquisa de reclamacoes preparada",
          detail: "O adapter separa a fonte de sinais do workspace interno e deixa o output pronto para trilha de auditoria.",
          referenceIds: [`${context.bankingCase.id}-consumer-bank`]
        }
      ],
      rawReferenceHandles: [`consumer-bank:${context.bankingCase.bankName}`]
    })
  }
];

function getDescriptor(sourceId: ClaraSourceAdapterId) {
  return ADAPTERS.find((adapter) => adapter.sourceId === sourceId);
}

export async function getClaraSourceAdapters(params?: ClaraSourceAdapterContext) {
  const context = await resolveClaraWorkspaceContext(params);
  const unavailableSources = new Set(params?.simulateFailedSources ?? []);

  if (!context.process || !context.selectedDocument) {
    return [];
  }

  const resolvedContext = context as ResolvedAdapterContext;

  return ADAPTERS.map((descriptor) =>
    buildSourceResult(
      descriptor,
      resolvedContext,
      unavailableSources.has(descriptor.sourceId) ? "unavailable" : "not_consulted",
      unavailableSources.has(descriptor.sourceId)
        ? `${descriptor.sourceLabel} indisponivel na execucao simulada. Nenhuma consulta externa foi realizada.`
        : undefined
    )
  );
}

export async function getClaraSourceAdapterFailure(
  sourceId: ClaraSourceAdapterId,
  reason: string,
  params?: ClaraSourceAdapterContext
) {
  const context = await resolveClaraWorkspaceContext(params);
  const descriptor = getDescriptor(sourceId);

  if (!descriptor) {
    throw new Error(`Unknown Clara source adapter: ${sourceId}`);
  }

  if (!context.process || !context.selectedDocument) {
    throw new Error("Clara source adapter failure requires resolved process and document context.");
  }

  return buildSourceResult(descriptor, context as ResolvedAdapterContext, "failed", reason);
}
