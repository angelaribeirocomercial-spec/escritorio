import { BANKING_NICHES, getBankingNicheLabel, type ContractAnalysisRecord } from "@lexia/domain";

import { buildClaraAuditTrail, type ClaraAuditTrail } from "@/server/services/clara/clara-audit-trail";
import { getClaraSourceAdapters, type ClaraSourceAdapterResult } from "@/server/services/clara/clara-source-adapters";
import {
  resolveClaraWorkspaceContext,
  type ClaraWorkspaceCase,
  type ClaraWorkspaceClient,
  type ClaraWorkspaceDocument,
  type ClaraWorkspaceProcess
} from "@/server/services/clara/clara-workspace-context";
import { getDocuments } from "@/server/services/documents/get-documents";

// Shared resolver keeps the real workspace lookups centralized:
// getClients(), getClientById(), getCases(), getCaseById(), getProcesses(), getProcessById(),
// getDocuments(), getDocumentById(), getContractAnalysisByDocumentId().

type StructuredCoreParams = {
  clientId?: string;
  caseId?: string;
  processId?: string;
  documentId?: string;
  niche?: string;
  tab?: string;
};

type StructuredDocumentRequirement = {
  label: string;
  tokens: string[];
  importance: "essential" | "supporting";
};

type ClientData = ClaraWorkspaceClient;
type BankingCaseData = ClaraWorkspaceCase;
type ProcessData = ClaraWorkspaceProcess;
type DocumentData = ClaraWorkspaceDocument;

export type ClaraStructuredCore = {
  summary: string;
  context: {
    client: ClientData;
    bankingCase: BankingCaseData;
    process: ProcessData;
    selectedDocument: DocumentData;
    caseDocuments: DocumentData[];
    primaryAnalysis: ContractAnalysisRecord | null;
  };
  classification: {
    nicheId: string;
    nicheLabel: string;
    scenarioLabel: string;
    confidenceLabel: string;
    decisionLabel: string;
    rationale: string;
    sourceTrail: {
      origem_interna: string[];
      origem_documental: string[];
      origem_api: string[];
      inferencia_controlada: string[];
    };
  };
  confirmedFacts: string[];
  documentsFound: Array<{
    id: string;
    label: string;
    detail: string;
  }>;
  documentsMissing: string[];
  risks: string[];
  nextStep: string;
  recommendation: string;
  checklist: string[];
  sourceAdapters: ClaraSourceAdapterResult[];
  auditTrail: ClaraAuditTrail;
};

type ResolvedStructuredCore = {
  client: ClientData;
  bankingCase: BankingCaseData;
  process: ProcessData;
  selectedDocument: DocumentData;
  caseDocuments: DocumentData[];
  primaryAnalysis: ContractAnalysisRecord | null;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesAny(haystack: string, tokens: readonly string[]) {
  return tokens.some((token) => haystack.includes(normalize(token)));
}

async function resolveCase(params?: StructuredCoreParams): Promise<ResolvedStructuredCore> {
  return resolveClaraWorkspaceContext(params);
}

function classifyScenario(params: ResolvedStructuredCore) {
  const normalizedClaim = normalize(params.bankingCase.claimType);
  const normalizedTitle = normalize(params.bankingCase.title);
  const selectedDocumentText = normalize(
    [
      params.selectedDocument.documentType,
      params.selectedDocument.category,
      params.selectedDocument.summary,
      params.selectedDocument.tags.join(" "),
      params.selectedDocument.fileName
    ].join(" ")
  );

  if (
    normalizedClaim.includes("busca apreensao") ||
    normalizedTitle.includes("busca e apreensao") ||
    selectedDocumentText.includes("busca apreensao")
  ) {
    return {
      nicheId: BANKING_NICHES[2].value,
      nicheLabel: getBankingNicheLabel(BANKING_NICHES[2].value),
      scenarioLabel: "Busca e apreensao",
      confidenceLabel: "Alta",
      decisionLabel: "Defesa urgente com foco em preservacao do veiculo",
      rationale:
        "A classificacao foi definida pelo tipo de acao e pela narrativa principal do caso, que menciona preservacao do bem, mora controvertida e medida de apreensao."
    };
  }

  if (
    normalizedClaim.includes("fraude") ||
    normalizedTitle.includes("fraude") ||
    selectedDocumentText.includes("fraude") ||
    selectedDocumentText.includes("consignado")
  ) {
    return {
      nicheId: BANKING_NICHES[1].value,
      nicheLabel: getBankingNicheLabel(BANKING_NICHES[1].value),
      scenarioLabel: "Fraude bancaria",
      confidenceLabel: "Alta",
      decisionLabel: "Peticao inicial ou resposta com foco em desconto indevido",
      rationale:
        "A classificacao se apoia no claimType, nos documentos de consignado e na tese central de desconto indevido e falha de contratacao."
    };
  }

  if (
    normalizedClaim.includes("revisional") ||
    normalizedClaim.includes("juros abusivos") ||
    normalizedTitle.includes("revisional") ||
    normalizedTitle.includes("juros abusivos") ||
    params.selectedDocument.documentType === "CCB" ||
    normalizedTitle.includes("capital de giro")
  ) {
    return {
      nicheId: BANKING_NICHES[0].value,
      nicheLabel: getBankingNicheLabel(BANKING_NICHES[0].value),
      scenarioLabel: "Revisional de contratos",
      confidenceLabel: "Alta",
      decisionLabel: "Peticao inicial revisional com memoria de calculo",
      rationale:
        "A classificacao se apoia na estrutura revisional do caso, no tipo documental e na tese principal de juros abusivos ou capitalizacao."
    };
  }

  return {
    nicheId: params.bankingCase.niche,
    nicheLabel: getBankingNicheLabel(params.bankingCase.niche),
    scenarioLabel: getBankingNicheLabel(params.bankingCase.niche),
    confidenceLabel: "Media",
    decisionLabel: "Triagem juridica assistida",
    rationale:
      "Nao foi possivel fechar uma classificacao forte apenas pela base atual, entao a Clara manteve a leitura guiada pela estrutura do caso."
    };
}

function requiredDocumentsForNiche(nicheId: string): StructuredDocumentRequirement[] {
  if (nicheId === BANKING_NICHES[1].value) {
    return [
      { label: "Documento de identificacao e CPF", tokens: ["rg", "cpf", "identidade"], importance: "essential" },
      { label: "Comprovante de endereco", tokens: ["endereco", "residencia", "comprovante"], importance: "essential" },
      { label: "Extrato bancario ou do consignado", tokens: ["extrato", "consignado", "desconto"], importance: "essential" },
      { label: "Protocolo administrativo ou prints do evento", tokens: ["protocolo", "print", "atendimento"], importance: "supporting" }
    ];
  }

  if (nicheId === BANKING_NICHES[2].value) {
    return [
      { label: "Contrato de financiamento do veiculo", tokens: ["contrato", "financiamento", "veiculo"], importance: "essential" },
      { label: "Comprovantes de pagamento", tokens: ["pagamento", "boleto", "parcela"], importance: "essential" },
      { label: "Notificacao ou medida de busca e apreensao", tokens: ["notificacao", "intimacao", "busca", "apreensao"], importance: "essential" },
      { label: "Documento do veiculo e prova de posse", tokens: ["veiculo", "posse", "crlv"], importance: "supporting" }
    ];
  }

  return [
    { label: "Contrato principal ou CCB", tokens: ["contrato", "ccb"], importance: "essential" },
    { label: "Planilha ou memoria de calculo", tokens: ["planilha", "memoria", "calculo"], importance: "essential" },
    { label: "Extratos bancarios e historico de parcelas", tokens: ["extrato", "parcela", "amortizacao"], importance: "essential" },
    { label: "Comprovante de renda ou impacto financeiro", tokens: ["renda", "holerite", "beneficio"], importance: "supporting" }
  ];
}

function describeDocument(document: Awaited<ReturnType<typeof getDocuments>>[number]) {
  return {
    id: document.id,
    label: document.fileName,
    detail: `${document.documentType} | ${document.category} | ${document.summary}`
  };
}

export async function getClaraStructuredCore(
  params?: StructuredCoreParams
): Promise<ClaraStructuredCore> {
  const resolved = await resolveCase(params);
  const classification = classifyScenario(resolved);
  const requiredDocuments = requiredDocumentsForNiche(classification.nicheId);
  const caseDocuments = resolved.caseDocuments;
  const sourceAdapters = await getClaraSourceAdapters({
    clientId: resolved.client.id,
    caseId: resolved.bankingCase.id,
    processId: resolved.process.id,
    documentId: resolved.selectedDocument.id
  });
  const existingDocumentText = caseDocuments
    .map((document) =>
      normalize(
        [
          document.documentType,
          document.category,
          document.summary,
          document.tags.join(" "),
          document.fileName,
          document.originalFileName ?? ""
        ].join(" ")
      )
    )
    .join(" ");

  const missingDocuments = requiredDocuments
    .filter((requirement) => !includesAny(existingDocumentText, requirement.tokens))
    .map((requirement) => requirement.label);

  const foundDocuments = caseDocuments.map(describeDocument);

  const confirmedFacts = [
    `Cliente: ${resolved.client.fullName}`,
    `Caso: ${resolved.bankingCase.title}`,
    `Banco: ${resolved.bankingCase.bankName}`,
    `Processo: ${resolved.process.processNumber}`,
    `Fase atual: ${resolved.bankingCase.stage}`,
    `Tese principal: ${resolved.bankingCase.mainThesis}`,
    `Documento selecionado: ${resolved.selectedDocument.documentType} | ${resolved.selectedDocument.fileName}`
  ];

  const analyticFacts = resolved.primaryAnalysis
    ? [
        `Analise contratual sugere: ${resolved.primaryAnalysis.executiveSummary}`,
        `CET apontado na analise: ${resolved.primaryAnalysis.cetLabel}`
      ]
    : [];

  const risks = [
    `Risco processual informado na base: ${resolved.bankingCase.legalRisk}.`,
    ...(
      missingDocuments.length > 0
        ? [`Lacunas documentais ativas: ${missingDocuments.join(", ")}.`]
        : ["Base documental suficiente para seguir para a proxima saida formal."]
    )
  ];

  const nextStep =
    classification.nicheId === BANKING_NICHES[2].value
      ? missingDocuments.length > 0
        ? "Fechar prova de posse, contrato e notificacao antes de abrir a defesa urgente."
        : "Abrir defesa urgente e revisar tutela para preservacao do veiculo."
      : classification.nicheId === BANKING_NICHES[1].value
        ? missingDocuments.length > 0
          ? "Cobrar documentos de consignado e protocolos antes de consolidar a inicial."
          : "Abrir minuta sobre fraude bancaria e validar pedidos com revisao humana."
        : missingDocuments.length > 0
          ? "Completar contrato, planilha e extratos antes da minuta revisional."
          : "Abrir minuta revisional com memoria de calculo e revisar pedido de tutela.";

  const recommendation =
    missingDocuments.length > 0
      ? "A Clara recomenda parar na consolidacao documental e nao transformar a leitura em peca final antes de validar as lacunas."
      : "A Clara recomenda seguir para a saida formal do nicho classificado, mantendo revisao humana final antes de protocolar.";

  const checklist = [
    classification.decisionLabel,
    ...requiredDocuments.map((requirement) =>
      `${requirement.importance === "essential" ? "Essencial" : "Apoio"}: ${requirement.label}`
    ),
    "Separar fatos confirmados, lacunas e risco antes da minuta",
    "Manter a revisao humana como etapa final"
  ];
  const auditTrail = buildClaraAuditTrail({
    summary: `Clara classificou ${resolved.bankingCase.title} como ${classification.scenarioLabel.toLowerCase()} com decisao orientada para ${classification.decisionLabel.toLowerCase()}.`,
    classification: {
      confidenceLabel: classification.confidenceLabel,
      rationale: classification.rationale
    },
    confirmedFacts,
    analyticFacts,
    documentsFound: foundDocuments,
    documentsMissing: missingDocuments,
    risks,
    nextStep,
    recommendation,
    checklist,
    sourceAdapters
  });

  return {
    summary: `Clara classificou ${resolved.bankingCase.title} como ${classification.scenarioLabel.toLowerCase()} com decisao orientada para ${classification.decisionLabel.toLowerCase()}.`,
    context: {
      client: resolved.client,
      bankingCase: resolved.bankingCase,
      process: resolved.process,
      selectedDocument: resolved.selectedDocument,
      caseDocuments,
      primaryAnalysis: resolved.primaryAnalysis
    },
    classification: {
      ...classification,
      sourceTrail: {
        origem_interna: [
          `Caso ${resolved.bankingCase.id}`,
          `Cliente ${resolved.client.id}`,
          `Processo ${resolved.process.id}`
        ],
        origem_documental: caseDocuments.map((document) => document.id),
        origem_api: sourceAdapters.map((adapter) => `${adapter.sourceLabel}: ${adapter.status}`),
        inferencia_controlada: [
          "Classificacao baseada em claimType, tese principal, tipo documental e narrativa da base real do tenant.",
          "Checklist documental calculado a partir da combinacao entre documentos encontrados e requisitos do nicho.",
          ...analyticFacts
        ]
      }
    },
    confirmedFacts,
    documentsFound: foundDocuments,
    documentsMissing: missingDocuments,
    risks,
    nextStep,
    recommendation,
    checklist,
    sourceAdapters,
    auditTrail
  };
}
