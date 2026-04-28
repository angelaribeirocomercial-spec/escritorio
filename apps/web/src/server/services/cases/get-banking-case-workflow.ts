import {
  BankingCaseChecklistItemRecord,
  BankingCaseChecklistStateRecord,
  BankingCaseRecord,
  BankingCaseWorkflowStateRecord,
  BankingCaseWorkflowStepRecord,
  BankingChecklistItemState,
  BankingNiche,
  BankingWorkflowStepState
} from "@lexia/domain";

export type BankingCaseWorkflow = BankingCaseWorkflowStateRecord & {
  requiredDocuments: readonly string[];
  missingDocuments: readonly string[];
};

const WORKFLOW_BLUEPRINTS: Record<
  BankingNiche,
  {
    steps: ReadonlyArray<{ id: string; title: string; detail: string }>;
    requiredDocuments: readonly string[];
  }
> = {
  revisional: {
    steps: [
      { id: "cadastro", title: "Cadastro concluido", detail: "Cliente, banco, nicho e objetivo inicial registrados." },
      { id: "documentos", title: "Documentos essenciais", detail: "Contrato, comprovantes e base minima para leitura revisional." },
      { id: "analise", title: "Analise contratual", detail: "Leitura juridica e economica do contrato e das abusividades." },
      { id: "memoria", title: "Memoria inicial", detail: "Consolidacao da narrativa economica e dos pontos de revisao." },
      { id: "estrategia", title: "Estrategia juridica", detail: "Definicao do pedido, da tese principal e do reforco probatorio." },
      { id: "inicial", title: "Peticao inicial", detail: "Preparacao da minuta e dos pedidos principais da revisional." },
      { id: "revisao", title: "Revisao do advogado", detail: "Checagem humana final antes da distribuicao." },
      { id: "distribuicao", title: "Distribuicao e acompanhamento", detail: "Protocolo, cadastro do processo e monitoramento continuo." }
    ],
    requiredDocuments: [
      "Contrato bancario ou CCB",
      "Documento pessoal do cliente",
      "Comprovante de residencia",
      "Comprovantes de pagamento",
      "Planilha ou historico das parcelas"
    ]
  },
  fraude: {
    steps: [
      { id: "cadastro", title: "Cadastro concluido", detail: "Cliente, banco e relato inicial registrados." },
      { id: "documentos", title: "Prova documental", detail: "Extratos, comprovantes e comunicacoes com o banco reunidos." },
      { id: "cronologia", title: "Cronologia da fraude", detail: "Reconstrucao objetiva da contratacao ou desconto indevido." },
      { id: "estrategia", title: "Estrategia juridica", detail: "Definicao da medida, urgencia e provas principais." },
      { id: "distribuicao", title: "Distribuicao e acompanhamento", detail: "Protocolo da acao e monitoramento das respostas." }
    ],
    requiredDocuments: [
      "Documento pessoal do cliente",
      "Extrato do beneficio ou extrato bancario",
      "Comunicacoes com o banco"
    ]
  },
  "busca-apreensao": {
    steps: [
      { id: "cadastro", title: "Cadastro concluido", detail: "Cliente, banco e contexto inicial registrados." },
      { id: "documentos", title: "Base contratual", detail: "Contrato, notificacao de mora e documentos do veiculo reunidos." },
      { id: "risco", title: "Analise de risco", detail: "Urgencia, posse do veiculo e estrategia de defesa definidos." },
      { id: "estrategia", title: "Estrategia juridica", detail: "Definicao da peca e da protecao processual adequada." },
      { id: "distribuicao", title: "Distribuicao e acompanhamento", detail: "Protocolo e monitoramento processual do caso." }
    ],
    requiredDocuments: [
      "Contrato bancario ou CCB",
      "Documento pessoal do cliente",
      "Documento do veiculo",
      "Notificacao de mora"
    ]
  }
};

function normalizeLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function documentMatchesRequirement(documentLabel: string, requiredLabel: string) {
  const normalizedDocument = normalizeLabel(documentLabel);
  const normalizedRequired = normalizeLabel(requiredLabel);

  return (
    normalizedDocument.includes(normalizedRequired) ||
    normalizedRequired.includes(normalizedDocument) ||
    (normalizedRequired.includes("contrato") &&
      (normalizedDocument.includes("contrato") || normalizedDocument.includes("ccb"))) ||
    (normalizedRequired.includes("documento pessoal") &&
      (normalizedDocument.includes("cpf") ||
        normalizedDocument.includes("rg") ||
        normalizedDocument.includes("documento"))) ||
    (normalizedRequired.includes("comprovante de residencia") &&
      normalizedDocument.includes("resid")) ||
    (normalizedRequired.includes("comprovantes de pagamento") &&
      (normalizedDocument.includes("pagamento") || normalizedDocument.includes("comprovante"))) ||
    (normalizedRequired.includes("planilha") &&
      (normalizedDocument.includes("planilha") || normalizedDocument.includes("parcela"))) ||
    (normalizedRequired.includes("extrato") &&
      (normalizedDocument.includes("extrato") || normalizedDocument.includes("beneficio"))) ||
    (normalizedRequired.includes("comunicacoes com o banco") &&
      (normalizedDocument.includes("mensagem") ||
        normalizedDocument.includes("email") ||
        normalizedDocument.includes("banco") ||
        normalizedDocument.includes("protocolo"))) ||
    (normalizedRequired.includes("notificacao de mora") &&
      (normalizedDocument.includes("notificacao") || normalizedDocument.includes("mora"))) ||
    (normalizedRequired.includes("documento do veiculo") &&
      (normalizedDocument.includes("veiculo") || normalizedDocument.includes("crlv")))
  );
}

function detectCurrentStepIndex(
  niche: BankingNiche,
  stage: string,
  missingDocuments: readonly string[]
) {
  const normalizedStage = normalizeLabel(stage);

  if (normalizedStage.includes("distribu")) {
    return WORKFLOW_BLUEPRINTS[niche].steps.findIndex((step) => step.id === "distribuicao");
  }

  if (normalizedStage.includes("revisao")) {
    return WORKFLOW_BLUEPRINTS[niche].steps.findIndex((step) => step.id === "revisao");
  }

  if (normalizedStage.includes("estrateg")) {
    return WORKFLOW_BLUEPRINTS[niche].steps.findIndex((step) => step.id === "estrategia");
  }

  if (normalizedStage.includes("memoria")) {
    return WORKFLOW_BLUEPRINTS[niche].steps.findIndex((step) => step.id === "memoria");
  }

  if (normalizedStage.includes("analise")) {
    return missingDocuments.length > 0 ? 1 : 2;
  }

  return missingDocuments.length > 0 ? 1 : 2;
}

export function buildBankingCaseChecklistState(
  niche: BankingNiche,
  documentLabels: readonly string[]
): BankingCaseChecklistStateRecord {
  const requiredDocuments = WORKFLOW_BLUEPRINTS[niche].requiredDocuments;
  const items: BankingCaseChecklistItemRecord[] = requiredDocuments.map((requiredLabel, index) => {
    const state: BankingChecklistItemState = documentLabels.some((documentLabel) =>
      documentMatchesRequirement(documentLabel, requiredLabel)
    )
      ? "received"
      : "missing";

    return {
      id: `checklist-${niche}-${index + 1}`,
      label: requiredLabel,
      state,
      required: true
    };
  });

  const missingDocuments = items.filter((item) => item.state === "missing").map((item) => item.label);
  const receivedCount = items.length - missingDocuments.length;

  return {
    completionLabel: `${receivedCount}/${requiredDocuments.length} documentos-base no caso`,
    requiredDocuments,
    missingDocuments,
    items
  };
}

export function buildBankingCaseWorkflowState(
  niche: BankingNiche,
  stage: string,
  checklistState: BankingCaseChecklistStateRecord
): BankingCaseWorkflowStateRecord {
  const blueprint = WORKFLOW_BLUEPRINTS[niche];
  const currentStepIndex = Math.max(
    0,
    Math.min(
      detectCurrentStepIndex(niche, stage, checklistState.missingDocuments),
      blueprint.steps.length - 1
    )
  );

  const steps: BankingCaseWorkflowStepRecord[] = blueprint.steps.map((step, index) => {
    const state: BankingWorkflowStepState =
      index < currentStepIndex ? "done" : index === currentStepIndex ? "current" : "pending";

    return {
      ...step,
      state
    };
  });

  const currentStep = steps[currentStepIndex] ?? steps[0];
  const nextStep =
    checklistState.missingDocuments.length > 0
      ? `Reunir ${checklistState.missingDocuments[0].toLowerCase()} para destravar o fluxo do caso.`
      : currentStep.detail;

  return {
    phaseLabel: currentStep.title,
    nextStep,
    completionLabel: checklistState.completionLabel,
    currentStepId: currentStep.id,
    steps
  };
}

export function buildPersistedBankingCaseLifecycle(params: {
  niche: BankingNiche;
  stage: string;
  documentLabels: readonly string[];
}) {
  const checklistState = buildBankingCaseChecklistState(params.niche, params.documentLabels);
  const workflowState = buildBankingCaseWorkflowState(params.niche, params.stage, checklistState);

  return {
    checklistState,
    workflowState
  };
}

export function getBankingCaseWorkflow(
  bankingCase: BankingCaseRecord,
  params?: { documentLabels?: readonly string[] }
): BankingCaseWorkflow {
  const documentLabels = params?.documentLabels ?? [];
  const fallbackLifecycle = buildPersistedBankingCaseLifecycle({
    niche: bankingCase.niche,
    stage: bankingCase.stage,
    documentLabels
  });
  const workflowState =
    bankingCase.workflowState?.steps?.length && bankingCase.workflowState.currentStepId
      ? bankingCase.workflowState
      : fallbackLifecycle.workflowState;
  const checklistState =
    bankingCase.checklistState?.items?.length || bankingCase.checklistState?.requiredDocuments?.length
      ? bankingCase.checklistState
      : fallbackLifecycle.checklistState;

  return {
    ...workflowState,
    requiredDocuments: checklistState.requiredDocuments,
    missingDocuments: checklistState.missingDocuments
  };
}
