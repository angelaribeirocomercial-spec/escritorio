import { mockCases, mockClients, mockDocuments, mockProcesses } from "@lexia/mocks";

export type ClaraSourceAdapterId =
  | "cnj-datajud"
  | "bcb"
  | "stj"
  | "stf"
  | "consumidor-gov";

export type ClaraSourceAdapterStatus = "not_consulted" | "available" | "failed";

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
};

export type ClaraSourceAdapterContext = {
  clientId?: string;
  caseId?: string;
  processId?: string;
  documentId?: string;
  simulateFailedSources?: ClaraSourceAdapterId[];
};

function resolveContext(params?: ClaraSourceAdapterContext) {
  const selectedDocument =
    params?.documentId
      ? mockDocuments.find((document) => document.id === params.documentId) ?? mockDocuments[0]
      : mockDocuments[0];
  const bankingCase =
    params?.caseId
      ? mockCases.find((item) => item.id === params.caseId) ??
        mockCases.find((item) => item.id === selectedDocument.caseId) ??
        mockCases[0]
      : mockCases.find((item) => item.id === selectedDocument.caseId) ?? mockCases[0];
  const client =
    params?.clientId
      ? mockClients.find((item) => item.id === params.clientId) ??
        mockClients.find((item) => item.id === bankingCase.clientId) ??
        mockClients[0]
      : mockClients.find((item) => item.id === bankingCase.clientId) ?? mockClients[0];
  const process =
    params?.processId
      ? mockProcesses.find((item) => item.id === params.processId) ??
        mockProcesses.find((item) => item.caseId === bankingCase.id) ??
        mockProcesses[0]
      : mockProcesses.find((item) => item.caseId === bankingCase.id) ?? mockProcesses[0];

  return {
    client,
    bankingCase,
    process,
    selectedDocument
  };
}

function buildSourceResult(
  sourceId: ClaraSourceAdapterId,
  sourceLabel: string,
  scope: string,
  queryHint: string,
  contextTrail: string[],
  consulted = false,
  failureReason?: string
): ClaraSourceAdapterResult {
  return {
    sourceId,
    sourceLabel,
    scope,
    status: failureReason ? "failed" : consulted ? "available" : "not_consulted",
    consulted,
    queryHint,
    failureReason,
    sourceTrail: {
      origem_interna: contextTrail,
      origem_documental: [],
      origem_api: consulted ? [`${sourceLabel} consulted`] : [],
      inferencia_controlada: [
        "Adapter contract prepared without live consultation in this story.",
        "External source access remains isolated in server services."
      ]
    }
  };
}

export function getClaraSourceAdapters(params?: ClaraSourceAdapterContext) {
  const context = resolveContext(params);
  const contextTrail = [
    `Cliente ${context.client.id}`,
    `Caso ${context.bankingCase.id}`,
    `Processo ${context.process.id}`,
    `Documento ${context.selectedDocument.id}`
  ];
  const failed = new Set(params?.simulateFailedSources ?? []);

  return [
    buildSourceResult(
      "cnj-datajud",
      "CNJ / DataJud",
      "Metadados processuais, andamento e fase processual",
      `Consultar o processo ${context.bankingCase.processNumber} para metadados processuais e movimentacoes.`,
      contextTrail,
      false,
      failed.has("cnj-datajud") ? "DataJud indisponivel no momento da consulta simulada." : undefined
    ),
    buildSourceResult(
      "bcb",
      "Banco Central do Brasil",
      "Tarifas, series economicas, PTAX e indicadores financeiros",
      `Consultar relacoes economicas ligadas a ${context.bankingCase.bankName} e ao contexto bancario do caso.`,
      contextTrail,
      false,
      failed.has("bcb") ? "Banco Central nao consultado nesta execucao simulada." : undefined
    ),
    buildSourceResult(
      "stj",
      "STJ",
      "Pesquisa de jurisprudencia bancaria e precedentes relevantes",
      `Pesquisar teses para ${context.bankingCase.title} com foco em direito bancario.`,
      contextTrail,
      false,
      failed.has("stj") ? "STJ indisponivel ou nao consultado na execucao simulada." : undefined
    ),
    buildSourceResult(
      "stf",
      "STF",
      "Pesquisa constitucional e repercussao geral quando aplicavel",
      `Consultar apenas quando houver recorte constitucional real para ${context.bankingCase.title}.`,
      contextTrail,
      false,
      failed.has("stf") ? "STF indisponivel ou nao consultado na execucao simulada." : undefined
    ),
    buildSourceResult(
      "consumidor-gov",
      "Consumidor.gov.br / Senacon",
      "Inteligencia complementar sobre reclamacoes bancarias",
      `Buscar padroes de reclamacao relacionados a ${context.bankingCase.bankName}.`,
      contextTrail,
      false,
      failed.has("consumidor-gov") ? "Consumidor.gov.br / Senacon nao consultado nesta execucao simulada." : undefined
    )
  ];
}

export function getClaraSourceAdapterFailure(
  sourceId: ClaraSourceAdapterId,
  reason: string,
  params?: ClaraSourceAdapterContext
) {
  const context = resolveContext(params);

  return buildSourceResult(
    sourceId,
    sourceId === "cnj-datajud"
      ? "CNJ / DataJud"
      : sourceId === "bcb"
        ? "Banco Central do Brasil"
        : sourceId === "stj"
          ? "STJ"
          : sourceId === "stf"
            ? "STF"
            : "Consumidor.gov.br / Senacon",
    "Adapter falhou na consulta",
    `${context.bankingCase.processNumber} | ${context.bankingCase.bankName}`,
    [`Cliente ${context.client.id}`, `Caso ${context.bankingCase.id}`, `Processo ${context.process.id}`],
    false,
    reason
  );
}
