import { getCaseById, getCases } from "@/server/services/cases/get-cases";
import { getClientById } from "@/server/services/clients/get-clients";
import {
  getClaraContextualAnalysis,
  type ClaraContextualTaskType
} from "@/server/services/clara/get-clara-contextual-analysis";
import { getClaraProcessArtifact } from "@/server/services/clara/get-clara-artifacts";
import { getClaraStructuredCore } from "@/server/services/clara/get-clara-structured-core";
import { getClaraTextDraftArtifact } from "@/server/services/clara/get-clara-artifacts";
import { getDocuments } from "@/server/services/documents/get-documents";
import { getProceduralUpdatesByProcessId } from "@/server/services/procedural-updates/get-procedural-updates";

type ResolvedCase = NonNullable<Awaited<ReturnType<typeof getCaseById>>>;

function getControlledCaseClassification(bankingCase: ResolvedCase) {
  const claimType = bankingCase.claimType.toLowerCase();

  if (claimType.includes("fraude")) {
    return {
      nicheId: bankingCase.niche,
      nicheLabel: "Fraude bancaria",
      scenarioLabel: "Fraude bancaria",
      confidenceLabel: "Media",
      decisionLabel: "Prosseguir com leitura de fraude bancaria e reforco documental",
      rationale: "Classificacao controlada baseada apenas no caso e nos documentos locais."
    };
  }

  if (claimType.includes("busca") || bankingCase.title.toLowerCase().includes("busca")) {
    return {
      nicheId: bankingCase.niche,
      nicheLabel: "Busca e apreensao",
      scenarioLabel: "Busca e apreensao",
      confidenceLabel: "Media",
      decisionLabel: "Prosseguir com defesa urgente e preservacao do bem",
      rationale: "Classificacao controlada baseada apenas no caso e nos documentos locais."
    };
  }

  return {
    nicheId: bankingCase.niche,
    nicheLabel: "Revisional de contratos",
    scenarioLabel: "Revisional de contratos",
    confidenceLabel: "Media",
    decisionLabel: "Prosseguir com revisao contratual e memoria de calculo",
    rationale: "Classificacao controlada baseada apenas no caso e nos documentos locais."
  };
}

async function resolveControlledCaseContext(caseId: string, documentId?: string) {
  const bankingCase = await getCaseById(caseId);

  if (!bankingCase) {
    throw new Error(`Caso ${caseId} nao encontrado.`);
  }

  const documents = (await getDocuments()).filter((document) => document.caseId === caseId);
  const selectedDocument =
    (documentId ? documents.find((document) => document.id === documentId) : null) ??
    documents[0] ??
    null;

  return {
    bankingCase,
    documents,
    selectedDocument
  };
}

export async function getClaraClientApiPayload(clientId: string) {
  const client = await getClientById(clientId);

  if (!client) {
    throw new Error(`Cliente ${clientId} nao encontrado.`);
  }

  const cases = await getCases({ clientId });

  return {
    client,
    cases,
    summary: `Cliente ${client.fullName} com ${cases.length} caso(s) vinculados ao workspace.`,
    nextActions: [
      "Abrir o cockpit do cliente",
      "Conferir os casos vinculados",
      "Revisar a documentacao pendente"
    ]
  };
}

export async function getClaraCaseApiPayload(caseId: string) {
  const { bankingCase, documents } = await resolveControlledCaseContext(caseId);
  let structuredCore = null;

  try {
    structuredCore = await getClaraStructuredCore({
      clientId: bankingCase.clientId,
      caseId,
      strict: true
    });
  } catch {
    structuredCore = null;
  }

  return {
    bankingCase,
    documents,
    summary:
      structuredCore?.summary ??
      `Caso ${bankingCase.title} resolvido em modo controlado, com ${documents.length} documento(s) vinculado(s).`,
    classification:
      structuredCore?.classification ?? getControlledCaseClassification(bankingCase),
    checklist:
      structuredCore?.checklist ??
      [
        "Conferir documentos realmente anexados ao caso",
        "Validar cronologia e prova util antes de concluir a tese",
        "Revisar o proximo passo operacional"
      ],
    nextStep:
      structuredCore?.nextStep ?? "Prosseguir com validacao documental e revisao humana do caso.",
    recommendation:
      structuredCore?.recommendation ??
      "A Clara recomenda seguir com o fluxo controlado ate o workspace completo ficar disponivel.",
    risks:
      structuredCore?.risks ?? [
        "Contexto parcial resolvido em fallback controlado.",
        "Validacao humana continua obrigatoria antes da saida final."
      ],
    sourceTrace:
      structuredCore?.classification.sourceTrail ?? {
        origem_interna: [`Caso ${bankingCase.id}`],
        origem_documental: documents.map((document) => document.id),
        origem_api: [],
        inferencia_controlada: ["Fallback controlado para evitar bloqueio do endpoint."]
      }
  };
}

export async function getClaraCaseDocumentsApiPayload(caseId: string) {
  const documents = (await getDocuments()).filter((document) => document.caseId === caseId);

  return {
    caseId,
    total: documents.length,
    documents: documents.map((document) => ({
      id: document.id,
      fileName: document.fileName,
      documentType: document.documentType,
      category: document.category,
      summary: document.summary,
      aiStatus: document.aiStatus
    }))
  };
}

export async function getClaraCaseChecklistApiPayload(caseId: string) {
  const { bankingCase, documents } = await resolveControlledCaseContext(caseId);
  let structuredCore = null;

  try {
    structuredCore = await getClaraStructuredCore({
      clientId: bankingCase.clientId,
      caseId,
      strict: true
    });
  } catch {
    structuredCore = null;
  }

  return {
    caseId,
    clientId: bankingCase.clientId,
    summary:
      structuredCore?.summary ??
      `Checklist controlado para o caso ${bankingCase.title} com ${documents.length} documento(s) no workspace.`,
    confirmedFacts:
      structuredCore?.confirmedFacts ?? [
        `Caso: ${bankingCase.title}`,
        `Cliente: ${bankingCase.clientId}`,
        `Documentos vinculados: ${documents.length}`
      ],
    documentsFound:
      structuredCore?.documentsFound ??
      documents.map((document) => ({
        id: document.id,
        label: document.fileName,
        detail: `${document.documentType} | ${document.category} | ${document.summary}`
      })),
    documentsMissing:
      structuredCore?.documentsMissing ??
      (bankingCase.checklistState?.missingDocuments?.length > 0
        ? bankingCase.checklistState.missingDocuments
        : ["Documento base ainda nao vinculado", "Validacao humana pendente"]),
    risks:
      structuredCore?.risks ?? [
        `Risco processual informado na base: ${bankingCase.legalRisk}.`,
        "Checklist controlado sem leitura analitica completa."
      ],
    recommendations:
      structuredCore ? [structuredCore.nextStep, structuredCore.recommendation] : [
        "Validar documentos essenciais antes da saida final.",
        "Abrir o cockpit do cliente para revisar o caso."
      ],
    checklist:
      structuredCore?.checklist ?? [
        "Confirmar documento base",
        "Validar cronologia do caso",
        "Revisar proximo passo"
      ]
  };
}

export async function getClaraTechnicalOpinionApiPayload(params: {
  clientId: string;
  caseId: string;
  processId?: string;
  documentId?: string;
}) {
  const analysis = await getClaraAnalysisApiPayload({
    ...params,
    taskType: "parecer-tecnico"
  });

  return {
    executionId: analysis.executionId,
    taskType: analysis.taskType,
    contextSnapshot: analysis.contextSnapshot,
    sourceTrace: analysis.sourceTrace,
    summary: analysis.summary,
    technicalOpinion: {
      title: "Parecer tecnico inicial",
      conclusion:
        analysis.caseAnalysis.suggestions[0] ??
        "A Clara recomenda seguir com revisao humana e validacao documental antes da minuta.",
      facts: analysis.caseAnalysis.confirmedFacts,
      documentsFound: analysis.caseAnalysis.documentsFound,
      documentsMissing: analysis.caseAnalysis.documentsMissing,
      risks: analysis.caseAnalysis.risks,
      recommendations: analysis.caseAnalysis.suggestions,
      reviewNotes: [
        "Separar fato confirmado de inferencia controlada.",
        "Validar ausencia documental antes de produzir a peca.",
        "Encaminhar para revisao humana antes de protocolar."
      ]
    }
  };
}

export async function getClaraCaseModelsApiPayload(caseId: string) {
  const { bankingCase } = await resolveControlledCaseContext(caseId);
  let structuredCore = null;

  try {
    structuredCore = await getClaraStructuredCore({
      clientId: bankingCase.clientId,
      caseId,
      strict: true
    });
  } catch {
    structuredCore = null;
  }

  return {
    caseId,
    clientId: bankingCase.clientId,
    workflowState: bankingCase.workflowState,
    checklistState: bankingCase.checklistState,
    classification:
      structuredCore?.classification ?? getControlledCaseClassification(bankingCase),
    nextStep:
      structuredCore?.nextStep ?? "Prosseguir com validacao documental e revisao humana.",
    recommendation:
      structuredCore?.recommendation ??
      "A Clara recomenda manter o caso em estado controlado ate concluir a leitura estruturada.",
    auditSummary:
      structuredCore?.auditTrail.summary ??
      "Fallback controlado para manter o caso observavel sem bloqueio de infraestrutura."
  };
}

export async function getClaraAnalysisApiPayload(params: {
  clientId: string;
  caseId: string;
  processId?: string;
  documentId?: string;
  taskType: ClaraContextualTaskType;
}) {
  let analysis = null;

  try {
    analysis = await getClaraContextualAnalysis(params);
  } catch {
    analysis = null;
  }

  return {
    executionId: analysis?.executionId ?? `clara-api-fallback-${Date.now()}`,
    taskType: params.taskType,
    contextSnapshot:
      analysis?.contextSnapshot ?? {
        clientId: params.clientId,
        caseId: params.caseId,
        processId: params.processId ?? null,
        documentId: params.documentId ?? null,
        niche: "contexto-controlado",
        stage: "estado-controlado",
        workflowStep: "resolucao-minima"
      },
    sourceTrace:
      analysis?.sourceTrace ?? {
        origem_interna: [`Cliente ${params.clientId}`, `Caso ${params.caseId}`],
        origem_documental: params.documentId ? [params.documentId] : [],
        origem_api: [],
        inferencia_controlada: ["Fallback controlado para manter a API operacional."]
      },
    summary:
      analysis?.summary ??
      "Analise contextual minima em fallback controlado, aguardando o workspace completo.",
    caseAnalysis:
      analysis?.caseAnalysis ?? {
        confirmedFacts: [
          `clientId: ${params.clientId}`,
          `caseId: ${params.caseId}`,
          `taskType: ${params.taskType}`
        ],
        documentsFound: [],
        documentsMissing: [
          "Documento base ainda nao vinculado",
          "Processo ainda nao vinculado ao contexto minimo"
        ],
        risks: [
          "Workspace completo indisponivel; seguir pelo cockpit do cliente.",
          "Validacao humana continua obrigatoria."
        ],
        suggestions: [
          "Voltar ao cockpit do cliente para completar o contexto.",
          "Anexar documentos do caso antes da saida final."
        ]
      }
  };
}

export async function getClaraNextStepApiPayload(params: {
  clientId: string;
  caseId: string;
  processId?: string;
  documentId?: string;
  taskType: ClaraContextualTaskType;
}) {
  const analysis = await getClaraAnalysisApiPayload(params);

  return {
    executionId: analysis.executionId,
    taskType: analysis.taskType,
    summary: analysis.summary,
    nextStep:
      analysis.caseAnalysis.suggestions[0] ??
      analysis.caseAnalysis.suggestions[1] ??
      analysis.summary,
    recommendations: analysis.caseAnalysis.suggestions,
    risks: analysis.caseAnalysis.risks,
    documentsMissing: analysis.caseAnalysis.documentsMissing
  };
}

export async function getClaraProcessSummaryApiPayload(params: {
  processId?: string;
  clientId?: string;
  documentId?: string;
}) {
  const processArtifact = await getClaraProcessArtifact(
    params.processId,
    params.clientId,
    params.documentId,
    true
  );

  const updates = params.processId ? await getProceduralUpdatesByProcessId(params.processId) : [];

  return {
    processArtifact,
    updates: updates.slice(0, 10),
    summary: processArtifact.summary,
    nextActions: processArtifact.highlights
  };
}

export async function getClaraPieceDraftApiPayload(params: {
  caseId?: string;
  documentId?: string;
  piece?: string;
  objective?: string;
  committed?: boolean;
}) {
  const draft = await getClaraTextDraftArtifact({
    caseId: params.caseId,
    documentId: params.documentId,
    piece: params.piece,
    objective: params.objective,
    committed: params.committed ?? true
  });

  return {
    draft,
    summary: draft.preview,
    nextStep: draft.revisionalMemory?.decisionSummary ?? draft.preview
  };
}

export async function getClaraMinutaReviewApiPayload(params: {
  caseId?: string;
  documentId?: string;
  objective?: string;
  piece?: string;
}) {
  const draft = await getClaraTextDraftArtifact({
    caseId: params.caseId,
    documentId: params.documentId,
    piece: params.piece,
    objective: params.objective,
    committed: false
  });

  return {
    draft,
    reviewChecklist: [
      "Confirmar coerencia entre fatos, documentos e pedidos",
      "Validar nomes, datas e numeros antes de protocolar",
      "Revisar risco de prova insuficiente e lacunas documentais",
      "Submeter a revisao humana antes da saida final"
    ],
    warnings: [
      "A minuta continua sujeita a revisao humana final.",
      "Nenhuma afirmacao processual deve ser tratada como fato sem validacao do caso."
    ]
  };
}
