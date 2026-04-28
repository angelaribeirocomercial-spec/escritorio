import {
  BankingCaseChecklistItemRecord,
  BankingCaseChecklistStateRecord,
  BankingCaseRecord,
  BankingCaseWorkflowReadinessRecord,
  BankingCaseWorkflowStateRecord,
  BankingCaseWorkflowStepRecord,
  BankingChecklistItemState,
  BankingNiche,
  BankingWorkflowStepState,
  TaskChecklistItem,
  TaskStatus
} from "@lexia/domain";

export type BankingCaseWorkflow = BankingCaseWorkflowStateRecord & {
  requiredDocuments: readonly string[];
  missingDocuments: readonly string[];
  blockers: readonly string[];
  readiness: readonly BankingCaseWorkflowReadinessRecord[];
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

function hasRequiredDocument(
  documentLabels: readonly string[],
  requiredLabel: string
) {
  return documentLabels.some((documentLabel) =>
    documentMatchesRequirement(documentLabel, requiredLabel)
  );
}

function stageReached(
  stage: string,
  candidate: "analise" | "memoria" | "estrategia" | "inicial" | "revisao" | "distribuicao"
) {
  const normalizedStage = normalizeLabel(stage);

  switch (candidate) {
    case "distribuicao":
      return normalizedStage.includes("distribu");
    case "revisao":
      return normalizedStage.includes("revisao") || normalizedStage.includes("distribu");
    case "inicial":
      return normalizedStage.includes("inicial") || normalizedStage.includes("peticao") || normalizedStage.includes("revisao") || normalizedStage.includes("distribu");
    case "estrategia":
      return normalizedStage.includes("estrateg") || normalizedStage.includes("inicial") || normalizedStage.includes("peticao") || normalizedStage.includes("revisao") || normalizedStage.includes("distribu");
    case "memoria":
      return normalizedStage.includes("memoria") || normalizedStage.includes("estrateg") || normalizedStage.includes("inicial") || normalizedStage.includes("peticao") || normalizedStage.includes("revisao") || normalizedStage.includes("distribu");
    case "analise":
      return normalizedStage.includes("analise") || normalizedStage.includes("memoria") || normalizedStage.includes("estrateg") || normalizedStage.includes("inicial") || normalizedStage.includes("peticao") || normalizedStage.includes("revisao") || normalizedStage.includes("distribu");
    default:
      return false;
  }
}

function buildWorkflowBlockers(
  niche: BankingNiche,
  stage: string,
  checklistState: BankingCaseChecklistStateRecord
) {
  const blockers = [...checklistState.missingDocuments];

  if (niche === "revisional" && !stageReached(stage, "estrategia")) {
    blockers.push("Parecer tecnico e estrategia juridica ainda nao consolidados.");
  }

  return blockers;
}

function buildWorkflowReadiness(
  niche: BankingNiche,
  stage: string,
  documentLabels: readonly string[],
  checklistState: BankingCaseChecklistStateRecord
): BankingCaseWorkflowReadinessRecord[] {
  if (niche !== "revisional") {
    return [
      {
        id: `${niche}-initial-readiness`,
        label: "Leitura juridica inicial",
        state: checklistState.missingDocuments.length === 0 ? "ready" : "blocked",
        detail:
          checklistState.missingDocuments.length === 0
            ? "Base documental suficiente para aprofundar a leitura do caso."
            : "Ainda faltam documentos-base para aprofundar a leitura juridica.",
        blockers: checklistState.missingDocuments
      }
    ];
  }

  const hasContract = hasRequiredDocument(documentLabels, "Contrato bancario ou CCB");
  const hasPersonalDocument = hasRequiredDocument(documentLabels, "Documento pessoal do cliente");
  const hasAddressProof = hasRequiredDocument(documentLabels, "Comprovante de residencia");
  const contractAnalysisBlockers = [
    !hasContract ? "Contrato bancario ou CCB" : null,
    !hasPersonalDocument ? "Documento pessoal do cliente" : null,
    !hasAddressProof ? "Comprovante de residencia" : null
  ].filter((value): value is string => Boolean(value));
  const technicalOpinionBlockers = [...checklistState.missingDocuments];
  const petitionDraftBlockers = [
    ...checklistState.missingDocuments,
    ...(stageReached(stage, "estrategia")
      ? []
      : ["Parecer tecnico e estrategia juridica ainda nao avancaram ate a fase de estrategia."])
  ];

  return [
    {
      id: "contract-analysis",
      label: "Leitura automatica do contrato",
      state: contractAnalysisBlockers.length === 0 ? "ready" : "blocked",
      detail:
        contractAnalysisBlockers.length === 0
          ? "Contrato e identificacao minima estao prontos para leitura automatica."
          : "Ainda falta base minima para iniciar a leitura automatica do contrato.",
      blockers: contractAnalysisBlockers
    },
    {
      id: "technical-opinion",
      label: "Parecer tecnico inicial",
      state: technicalOpinionBlockers.length === 0 ? "ready" : "blocked",
      detail:
        technicalOpinionBlockers.length === 0
          ? "A base documental revisional esta completa para consolidar o parecer tecnico."
          : "O parecer tecnico segue bloqueado por lacunas documentais do caso.",
      blockers: technicalOpinionBlockers
    },
    {
      id: "petition-draft",
      label: "Minuta da peticao inicial",
      state: petitionDraftBlockers.length === 0 ? "ready" : "blocked",
      detail:
        petitionDraftBlockers.length === 0
          ? "O caso ja tem base documental e etapa juridica suficientes para preparar a minuta inicial."
          : "A minuta ainda nao deve ser aberta porque faltam documentos ou a estrategia juridica nao foi consolidada.",
      blockers: petitionDraftBlockers
    }
  ];
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
  checklistState: BankingCaseChecklistStateRecord,
  documentLabels: readonly string[]
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
  const readiness = buildWorkflowReadiness(niche, stage, documentLabels, checklistState);
  const blockers = buildWorkflowBlockers(niche, stage, checklistState);
  const nextStep =
    checklistState.missingDocuments.length > 0
      ? `Reunir ${checklistState.missingDocuments[0].toLowerCase()} para destravar o fluxo do caso.`
      : readiness.find((item) => item.state === "ready" && item.id === "petition-draft")
        ? "Preparar a minuta da peticao inicial dentro do contexto deste caso."
        : readiness.find((item) => item.state === "ready" && item.id === "technical-opinion")
          ? "Consolidar o parecer tecnico inicial com base na documentacao recebida."
          : readiness.find((item) => item.state === "ready" && item.id === "contract-analysis")
            ? "Caso apto para leitura automatica do contrato e abertura do parecer tecnico inicial."
            : blockers[0] ?? currentStep.detail;

  return {
    phaseLabel: currentStep.title,
    nextStep,
    completionLabel: checklistState.completionLabel,
    currentStepId: currentStep.id,
    blockers,
    readiness,
    steps
  };
}

export function buildPersistedBankingCaseLifecycle(params: {
  niche: BankingNiche;
  stage: string;
  documentLabels: readonly string[];
}) {
  const checklistState = buildBankingCaseChecklistState(params.niche, params.documentLabels);
  const workflowState = buildBankingCaseWorkflowState(
    params.niche,
    params.stage,
    checklistState,
    params.documentLabels
  );

  return {
    checklistState,
    workflowState
  };
}

export function buildBankingCaseOperationalTaskState(params: {
  niche: BankingNiche;
  stage: string;
  documentLabels: readonly string[];
}) {
  const { checklistState, workflowState } = buildPersistedBankingCaseLifecycle(params);
  const checklist: TaskChecklistItem[] = checklistState.items.map((item) => ({
    id: item.id,
    label: item.label,
    done: item.state === "received"
  }));
  const missingDocuments = checklistState.missingDocuments;
  const status: TaskStatus = missingDocuments.length > 0 ? "todo" : "done";
  const notes =
    missingDocuments.length > 0
      ? `Pendencias prioritarias: ${missingDocuments.join(", ")}.`
      : "Checklist documental inicial consolidado e pronto para liberar a leitura juridica.";
  const nextStep =
    missingDocuments.length > 0
      ? `Cobrar ${missingDocuments[0]?.toLowerCase()} antes de aprofundar a estrategia.`
      : workflowState.nextStep;

  return {
    checklist,
    notes,
    nextStep,
    status
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
    missingDocuments: checklistState.missingDocuments,
    blockers: workflowState.blockers ?? [],
    readiness: workflowState.readiness ?? []
  };
}
