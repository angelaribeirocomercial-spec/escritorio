"use client";

import Link from "next/link";
import { useState } from "react";

import { DeleteClientButton } from "@/components/layout/delete-client-button";

type ClientCockpitCase = {
  id: string;
  title: string;
  claimType: string;
  nicheLabel: string;
  status: string;
  stage: string;
  legalRiskLabel: string;
  mainThesis: string;
  suggestedStrategy: string;
};

type ClientCockpitContractAnalysis = {
  analysis: {
    rateLabel: string;
    cetLabel: string;
    capitalizationLabel: string;
    feesLabel: string;
    bundledInsuranceLabel: string;
    permanenceCommissionLabel: string;
    penaltyLabel: string;
    sensitiveClauses: ReadonlyArray<string>;
    abusivenessSignals: ReadonlyArray<string>;
    suggestedThesis: string;
    proceduralRisk: "low" | "medium" | "high";
    suggestedRequests: ReadonlyArray<string>;
    executiveSummary: string;
  };
  bacenComparison: {
    summary: string;
    classificationLabel: string;
    contractRateLabel: string;
    marketReferenceLabel: string;
    modalityLabel: string;
    consultedPeriodLabel: string;
    differencePercentLabel: string;
  };
  caseCalculations: {
    scenarioDetected: {
      label: string;
      summary: string;
    };
    activatedCalculations: ReadonlyArray<{
      id: string;
      label: string;
      reason: string;
      priority: 1 | 2;
    }>;
    availableCalculations: ReadonlyArray<{
      id: string;
      label: string;
      enabled: boolean;
      reason: string;
      priority: 1 | 2;
    }>;
    inputData: ReadonlyArray<{
      label: string;
      value: string;
    }>;
    memory: {
      summary: string;
      highlights: ReadonlyArray<string>;
      legalImpactSuggestions: ReadonlyArray<string>;
    };
    results: ReadonlyArray<{
      id: string;
      label: string;
      resultLabel: string;
      detail: string;
      legalImpact: string;
    }>;
  };
  bacenDossier: {
    contractDetectedLabel: string;
    referenceDateLabel: string;
    contractRateLabel: string;
    marketRateLabel: string;
    marketRateSourceLabel: string;
    modalityLabel: string;
    comparisonSummary: string;
    differenceLabel: string;
    legalAlert: string;
  };
  calculationMemory: {
    labels: {
      financedAmount: string;
      installmentCount: string;
      contractedInstallment: string;
      chargedInstallment: string;
      targetReductionPercent: string;
    };
    basis: string;
  };
  detectedAbuses: ReadonlyArray<{
    id: string;
    signalLabel: string;
    severity: "low" | "medium" | "high";
    evidenceLabel: string;
    financialImpactLabel: string;
    legalSuggestion: string;
  }>;
  caseDossier: {
    clara: {
      summary: string;
      focusPoints: ReadonlyArray<string>;
    };
    laudo: {
      summary: string;
      sources: ReadonlyArray<string>;
    };
    peticoes: {
      summary: string;
      sources: ReadonlyArray<string>;
    };
  };
  revisionalChecklist: ReadonlyArray<string>;
  thesisFrames: ReadonlyArray<{
    title: string;
    detail: string;
  }>;
  revisionalRequests: ReadonlyArray<string>;
  proofStrategy: ReadonlyArray<string>;
  revisionalStructure: ReadonlyArray<string>;
};

type ClientCockpitWorkflowStep = {
  id: string;
  title: string;
  detail: string;
  state: "done" | "current" | "pending";
};

type ClientCockpitReadinessItem = {
  id: string;
  label: string;
  detail: string;
  state: "ready" | "blocked";
  blockers: ReadonlyArray<string>;
};

type ClientCockpitDocument = {
  id: string;
  documentType: string;
  fileName: string;
  aiStatus: "not_analyzed" | "analyzed" | "needs_review";
  summary: string;
  uploadedAt: string;
  previewLabel: string;
  actions: ReadonlyArray<string>;
  detailHref: string;
  pdfHref: string | null;
};

type ClientCockpitGeneratedDocument = {
  kind: "procuracao" | "contrato-honorarios";
  label: string;
  detail: string;
  href: string;
  statusLabel: string;
};

type ClientCockpitProcessTimelineItem = {
  id: string;
  occurredAt: string;
  title: string;
  description: string;
  source: string;
};

type ClientCockpitProcessUpdate = {
  id: string;
  movementType: string;
  sourceLabel: string;
  occurredAt: string;
  operationalSummary: string;
  criticality: "low" | "medium" | "high";
};

type ClientCockpitRelatedProcess = {
  processNumber: string;
  tribunal: string;
  courtDistrict: string;
  courtName: string;
  statusLabel: string;
  proceduralPhase: string;
  monitoringModeLabel: string;
  processClassLabel: string;
  suggestedCnjSubjectLabel: string;
  urgencyLabel: string;
  actionTypeLabel: string;
  valueInCauseLabel: string;
  distributionDateLabel: string;
  protocolReceiptLabel: string;
  integrationStatusLabel: string;
  officialTimeline: ReadonlyArray<ClientCockpitProcessTimelineItem>;
  linkedUpdates: ReadonlyArray<ClientCockpitProcessUpdate>;
};

type DossierTabKey =
  | "visao-geral"
  | "documentos"
  | "financeiro"
  | "bacen"
  | "estrategico"
  | "laudo"
  | "peticoes"
  | "clara";

type OverviewReadState = "read" | "pending" | "needs_review";

type OverviewField = {
  id: "contrato" | "taxas" | "cet" | "parcelas" | "banco" | "juros";
  label: string;
  value: string;
  detail: string;
  sourceLabel: string;
  state: OverviewReadState;
};

type ClientCockpitDossierTab = {
  key: DossierTabKey;
  label: string;
};

type ClientCockpitFrameProps = {
  client: {
    id: string;
    fullName: string;
    documentId: string;
    bankName: string;
    legalViabilityScore: number;
    leadSource: string;
    serviceStatusLabel: string;
    address: string;
    notes: string;
    email: string;
    phone: string;
    whatsapp: string;
  };
  activeCase: ClientCockpitCase | null;
  workflow: {
    phaseLabel: string;
    completionLabel: string;
    requiredDocuments: ReadonlyArray<string>;
    missingDocuments: ReadonlyArray<string>;
    blockers: ReadonlyArray<string>;
    steps: ReadonlyArray<ClientCockpitWorkflowStep>;
    readiness: ReadonlyArray<ClientCockpitReadinessItem>;
  } | null;
  caseDocuments: ReadonlyArray<ClientCockpitDocument>;
  generatedDocuments: ReadonlyArray<ClientCockpitGeneratedDocument>;
  petitionDraftHref: string | null;
  nextStepLabel: string;
  nextTaskTitle: string | null;
  relatedClaraRecordsCount: number;
  relatedProcess: ClientCockpitRelatedProcess | null;
  normalizedCaseInsights: ReadonlyArray<string>;
  normalizedClientIaContext: string;
  normalizedTimeline: ReadonlyArray<string>;
  clientCaseCount: number;
  dossierTabs: ReadonlyArray<ClientCockpitDossierTab>;
  contractAnalysis: ClientCockpitContractAnalysis | null;
  actionLinks: {
    attachDocuments?: DossierTabKey;
    continueClara: DossierTabKey;
  };
};

function criticalityTone(criticality: "low" | "medium" | "high") {
  switch (criticality) {
    case "high":
      return "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100";
    case "medium":
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
    default:
      return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  }
}

const CONTRACT_ANALYSIS_DOCUMENT_TYPES = new Set(["Contrato bancario", "CCB"]);

function isContractAnalysisDocument(documentType: string) {
  return CONTRACT_ANALYSIS_DOCUMENT_TYPES.has(documentType);
}

function overviewStateFromDocumentStatus(status: ClientCockpitDocument["aiStatus"]): OverviewReadState {
  switch (status) {
    case "analyzed":
      return "read";
    case "needs_review":
      return "needs_review";
    default:
      return "pending";
  }
}

function overviewStateLabel(state: OverviewReadState) {
  switch (state) {
    case "read":
      return "Lido";
    case "needs_review":
      return "Precisa revisao";
    default:
      return "Pendente";
  }
}

function overviewStateTone(state: OverviewReadState) {
  switch (state) {
    case "read":
      return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
    case "needs_review":
      return "border-amber-300/30 bg-amber-300/10 text-amber-100";
    default:
      return "border-slate-400/20 bg-slate-400/10 text-slate-200";
  }
}

function formatReadingDate(value: string | null) {
  if (!value) {
    return "Nao registrada";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
}

function tabPanelId(tabKey: DossierTabKey) {
  return `client-dossier-tab-${tabKey}`;
}

function tabButtonId(tabKey: DossierTabKey) {
  return `client-dossier-tab-trigger-${tabKey}`;
}

export function ClientCockpitFrame({
  client,
  activeCase,
  workflow,
  caseDocuments,
  generatedDocuments,
  petitionDraftHref,
  nextStepLabel,
  nextTaskTitle,
  relatedProcess,
  normalizedCaseInsights,
  normalizedClientIaContext,
  normalizedTimeline,
  clientCaseCount,
  dossierTabs,
  contractAnalysis,
  actionLinks
}: ClientCockpitFrameProps) {
  const [activePanel, setActivePanel] = useState<DossierTabKey>(dossierTabs[0]?.key ?? "visao-geral");

  const documentsRequired = workflow?.requiredDocuments.length ?? 0;
  const documentsReceived = caseDocuments.length;
  const documentsMissing = workflow?.missingDocuments.length ?? 0;
  const chanceOfSuccessLabel = client.legalViabilityScore > 0 ? `${client.legalViabilityScore}%` : "Nao calculada";
  const activeCaseTitle = activeCase?.title ?? "Sem caso ativo";
  const activeCaseClaim = activeCase?.claimType ?? activeCase?.title ?? "A definir";
  const activeCaseRisk = activeCase?.legalRiskLabel ?? "A definir";
  const abusivenessLabel =
    contractAnalysis?.bacenComparison.classificationLabel ??
    (contractAnalysis ? `${contractAnalysis.analysis.abusivenessSignals.length} sinal(is)` : "A definir");
  const comparison = contractAnalysis?.bacenComparison;
  const caseCalculations = contractAnalysis?.caseCalculations;
  const bacenDossier = contractAnalysis?.bacenDossier;
  const strategicSummary =
    contractAnalysis?.analysis.executiveSummary ?? activeCase?.mainThesis ?? "Resumo executivo indisponivel";
  const strategicThesis = contractAnalysis?.analysis.suggestedThesis ?? activeCase?.suggestedStrategy ?? "A definir";
  const strategicRisk = contractAnalysis?.analysis.proceduralRisk ?? "medium";
  const claraResponse =
    contractAnalysis?.caseDossier.clara.summary ??
    normalizedClientIaContext ??
    "A Clara ainda nao consolidou um resumo contextual para este caso.";
  const claraFocusPoints = contractAnalysis?.caseDossier.clara.focusPoints ?? [];
  const laudoSummary = contractAnalysis?.caseDossier.laudo.summary ?? "Laudo automatico indisponivel no momento.";
  const laudoSources = contractAnalysis?.caseDossier.laudo.sources ?? [];
  const peticoesSummary =
    contractAnalysis?.caseDossier.peticoes.summary ?? "Peticoes automaticas indisponiveis no momento.";
  const peticoesSources = contractAnalysis?.caseDossier.peticoes.sources ?? [];
  const laudoPdfHref = activeCase ? `/api/clientes/${client.id}/documentos-gerados/laudo/pdf?caseId=${activeCase.id}` : null;
  const baseOverviewDocument =
    caseDocuments.find((document) => isContractAnalysisDocument(document.documentType)) ?? caseDocuments[0] ?? null;
  const baseOverviewState = baseOverviewDocument
    ? overviewStateFromDocumentStatus(baseOverviewDocument.aiStatus)
    : "pending";
  const structuredOverviewAvailable = Boolean(contractAnalysis);
  const structuredOverviewState: OverviewReadState = structuredOverviewAvailable ? "read" : baseOverviewState;
  const installmentsInput = caseCalculations?.inputData.find((item) => item.label === "Numero de parcelas")?.value;
  const contractedInstallmentInput =
    caseCalculations?.inputData.find((item) => item.label === "Parcela contratada")?.value;
  const chargedInstallmentInput =
    caseCalculations?.inputData.find((item) => item.label === "Parcela cobrada")?.value;
  const overviewFields: ReadonlyArray<OverviewField> = [
    {
      id: "contrato",
      label: "Contrato",
      value: baseOverviewDocument
        ? `${baseOverviewDocument.documentType} | ${baseOverviewDocument.fileName}`
        : "Nenhum documento-base vinculado",
      detail: baseOverviewDocument?.previewLabel ?? "Anexe o contrato ou a CCB para iniciar a leitura do dossie.",
      sourceLabel: baseOverviewDocument ? `Documento ${baseOverviewDocument.fileName}` : "Sem origem documental",
      state: baseOverviewState
    },
    {
      id: "taxas",
      label: "Taxas",
      value: contractAnalysis?.analysis.rateLabel ?? "Sem leitura estruturada persistida",
      detail: structuredOverviewAvailable
        ? "Taxa contratual carregada do envelope atual de analise."
        : "A taxa depende de OCR estruturado persistido ou revisao manual do contrato.",
      sourceLabel: structuredOverviewAvailable
        ? "Analise contratual persistida"
        : baseOverviewDocument
          ? `Boundary documental: ${baseOverviewDocument.fileName}`
          : "Sem origem documental",
      state: structuredOverviewState
    },
    {
      id: "cet",
      label: "CET",
      value: contractAnalysis?.analysis.cetLabel ?? "Sem leitura estruturada persistida",
      detail: structuredOverviewAvailable
        ? "CET carregado do envelope atual de analise."
        : "O CET ainda nao foi materializado no envelope atual.",
      sourceLabel: structuredOverviewAvailable
        ? "Analise contratual persistida"
        : baseOverviewDocument
          ? `Boundary documental: ${baseOverviewDocument.fileName}`
          : "Sem origem documental",
      state: structuredOverviewState
    },
    {
      id: "parcelas",
      label: "Parcelas",
      value:
        installmentsInput && contractedInstallmentInput
          ? `${installmentsInput} parcelas | ${contractedInstallmentInput}`
          : "Sem leitura estruturada persistida",
      detail:
        installmentsInput && chargedInstallmentInput
          ? `Parcela cobrada no envelope atual: ${chargedInstallmentInput}.`
          : "Quantidade e valor das parcelas ainda dependem de leitura estruturada ou conferencia manual.",
      sourceLabel: structuredOverviewAvailable
        ? "Memoria de calculo do caso"
        : baseOverviewDocument
          ? `Boundary documental: ${baseOverviewDocument.fileName}`
          : "Sem origem documental",
      state: structuredOverviewState
    },
    {
      id: "banco",
      label: "Banco",
      value: client.bankName || activeCase?.title || "Nao identificado",
      detail: client.bankName
        ? "Banco resolvido pelo cadastro atual do cliente/caso."
        : "Banco ainda nao consolidado no cadastro atual.",
      sourceLabel: client.bankName ? "Cadastro do cliente" : "Cadastro pendente",
      state: client.bankName ? "read" : baseOverviewDocument ? baseOverviewState : "pending"
    },
    {
      id: "juros",
      label: "Juros",
      value:
        contractAnalysis?.bacenComparison.classificationLabel ??
        contractAnalysis?.analysis.rateLabel ??
        "Sem leitura estruturada persistida",
      detail: structuredOverviewAvailable
        ? contractAnalysis?.analysis.abusivenessSignals[0] ??
          "A leitura de juros foi consolidada sem sinal de abusividade destacado."
        : "A leitura de juros depende de OCR estruturado persistido ou revisao humana do contrato.",
      sourceLabel: structuredOverviewAvailable
        ? "Analise contratual e leitura Bacen"
        : baseOverviewDocument
          ? `Boundary documental: ${baseOverviewDocument.fileName}`
          : "Sem origem documental",
      state: structuredOverviewState
    }
  ];
  const overviewOriginLabel = baseOverviewDocument
    ? `${baseOverviewDocument.documentType} | ${baseOverviewDocument.fileName}`
    : "Sem documento-base para leitura inicial";
  const overviewReadingStatusLabel = structuredOverviewAvailable
    ? "Leitura estruturada disponivel no envelope atual."
    : baseOverviewDocument
      ? `${overviewStateLabel(baseOverviewState)} no boundary documental atual, sem OCR estruturado persistido.`
      : "Nenhuma leitura automatica disponivel ainda.";
  const overviewReadingDateLabel = formatReadingDate(baseOverviewDocument?.uploadedAt ?? null);
  const overviewNextSteps = [
    !baseOverviewDocument ? "Anexar o contrato ou a CCB para abrir a leitura inicial do dossie." : null,
    baseOverviewDocument && !structuredOverviewAvailable
      ? "Revisar manualmente o documento-base; ainda nao existe OCR estruturado persistido para este caso."
      : null,
    documentsMissing > 0
      ? `Completar base documental pendente: ${workflow?.missingDocuments.join(" | ") ?? "revisar checklist do caso"}.`
      : null,
    structuredOverviewAvailable
      ? "Aprofundar a prova economica nas abas separadas de Calculos e Bacen."
      : null,
    nextTaskTitle ? `Proxima tarefa humana: ${nextTaskTitle}.` : null
  ].filter((item): item is string => Boolean(item));

  const generatedDocumentsContent = generatedDocuments.length ? (
    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      {generatedDocuments.map((document) => (
        <div key={document.kind} className="detail-soft-row flex flex-col gap-3 px-4 py-4 text-sm text-slate-300">
          <div className="space-y-1">
            <p className="font-semibold text-white">{document.label}</p>
            <p className="leading-6 text-slate-300">{document.detail}</p>
          </div>
          <div>
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={document.href}>
              {document.statusLabel}
            </Link>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="mt-4 detail-soft-row px-4 py-4 text-sm text-slate-300">
      Nenhum PDF do pacote documental foi gerado para este cliente ainda.
    </div>
  );

  const dossierHeaderCards = [
    { label: "Banco", value: client.bankName || "Nao informado" },
    { label: "Tipo de acao", value: activeCaseClaim },
    { label: "Risco", value: activeCaseRisk },
    { label: "Chance de exito", value: chanceOfSuccessLabel },
    { label: "Abusividade", value: abusivenessLabel }
  ];

  return (
    <section className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl space-y-4">
            <p className="workspace-kicker">Dossie do caso</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {dossierHeaderCards.map((card) => (
                <div key={card.label} className="detail-link-button flex min-h-[74px] min-w-0 flex-col justify-between px-4 py-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</span>
                  <span className="break-words text-sm font-semibold leading-5 text-white">{card.value}</span>
                </div>
              ))}
            </div>
            <p className="text-sm leading-7 text-slate-300">
              {activeCase ? nextStepLabel : "Abra um novo atendimento para iniciar o dossie central do cliente."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link className="detail-link-button px-3 py-2 text-xs font-semibold" href={`/novo-atendimento-bancario?clientId=${client.id}`}>
              Novo caso
            </Link>
            <DeleteClientButton clientId={client.id} clientName={client.fullName} caseCount={clientCaseCount} />
          </div>
        </div>

        <div className="border-b border-white/10">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Abas do dossie do caso">
            {dossierTabs.map((tab) => {
              const active = activePanel === tab.key;

              return (
                <button
                  key={tab.key}
                  id={tabButtonId(tab.key)}
                  aria-controls={tabPanelId(tab.key)}
                  aria-selected={active}
                  className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "border-cyan-300 text-cyan-50"
                      : "border-transparent text-slate-400 hover:border-white/30 hover:text-slate-200"
                  }`}
                  onClick={() => setActivePanel(tab.key)}
                  role="tab"
                  tabIndex={active ? 0 : -1}
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <section aria-labelledby={tabButtonId(activePanel)} className="detail-panel p-6" id={tabPanelId(activePanel)} role="tabpanel">
          {activePanel === "visao-geral" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Visão geral</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Leitura inicial do dossie</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">{overviewReadingStatusLabel}</div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {overviewFields.map((field) => (
                  <div key={field.id} className="detail-subpanel p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{field.label}</p>
                      <span className={`rounded-[4px] border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${overviewStateTone(field.state)}`}>
                        {overviewStateLabel(field.state)}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold leading-6 text-white">{field.value}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{field.detail}</p>
                    <p className="mt-3 text-xs text-slate-500">Origem: {field.sourceLabel}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Origem documental: <span className="font-semibold text-white">{overviewOriginLabel}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Data da leitura: <span className="font-semibold text-white">{overviewReadingDateLabel}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Base do caso: <span className="font-semibold text-white">{workflow?.completionLabel ?? "Sem checklist consolidado"}</span>
                </div>
              </div>

              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Proximos passos</p>
                <div className="mt-4 grid gap-3">
                  {overviewNextSteps.length ? (
                    overviewNextSteps.map((step) => (
                      <div key={step} className="detail-soft-row px-4 py-4 text-sm leading-6 text-slate-200">
                        {step}
                      </div>
                    ))
                  ) : (
                    <div className="detail-soft-row px-4 py-4 text-sm leading-6 text-slate-200">
                      Usar as abas separadas do dossie para aprofundar a leitura e manter a revisao humana no editor e no handoff operacional.
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {baseOverviewDocument ? (
                    <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={baseOverviewDocument.detailHref}>
                      Abrir documento-base
                    </Link>
                  ) : null}
                  {activeCase && actionLinks.attachDocuments ? (
                    <Link
                      className="detail-link-button px-4 py-3 text-sm font-semibold"
                      href={`/documentos/enviar-arquivos?caseId=${activeCase.id}`}
                    >
                      Juntar documentos
                    </Link>
                  ) : null}
                  <button
                    className="detail-link-button px-4 py-3 text-sm font-semibold"
                    onClick={() => setActivePanel(actionLinks.continueClara)}
                    type="button"
                  >
                    Abrir Clara
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {activePanel === "documentos" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Documentos</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Lista de documentos do caso</h3>
                </div>
                {activeCase ? (
                  <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={`/documentos/enviar-arquivos?caseId=${activeCase.id}`}>
                    Inserir documento
                  </Link>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Recebidos: <span className="font-semibold text-white">{documentsReceived}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Pendentes: <span className="font-semibold text-white">{documentsMissing}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Base exigida: <span className="font-semibold text-white">{documentsRequired}</span>
                </div>
              </div>

              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Documentos anexados</p>
                {caseDocuments.length ? (
                  <div className="mt-4 grid gap-3">
                    {caseDocuments.map((document) => (
                      <div key={document.id} className="detail-soft-row flex flex-col gap-3 px-4 py-4 text-sm text-slate-300 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-start gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300/15 text-emerald-200"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
                                <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                              </svg>
                            </span>
                            <p className="font-semibold text-white">{document.documentType}</p>
                          </div>
                          <p className="text-slate-400">{document.fileName}</p>
                          <p className="leading-6">{document.summary}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link className="detail-link-button px-3 py-2 text-xs font-semibold" href={document.detailHref}>
                            Abrir detalhe
                          </Link>
                          {document.pdfHref ? (
                            <a className="detail-link-button px-3 py-2 text-xs font-semibold" href={document.pdfHref} rel="noreferrer" target="_blank">
                              Abrir PDF
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 detail-soft-row px-4 py-4 text-sm text-slate-400">
                    Nenhum documento foi vinculado ao caso ativo ainda.
                  </div>
                )}

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Campos faltantes: <span className="font-semibold text-white">{workflow?.missingDocuments.length ? workflow.missingDocuments.join(" | ") : "Nenhum"}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Insercao: <span className="font-semibold text-white">{activeCase ? "Fluxo de upload vinculado ao caso" : "Fluxo de upload indisponivel"}</span>
                  </div>
                </div>
              </div>

              {generatedDocumentsContent}
            </div>
          ) : null}

          {activePanel === "financeiro" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Calculos</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{activeCaseTitle}</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {activeCase ? `Risco ${activeCaseRisk}` : "Crie um caso para ativar o cockpit"}
                </div>
              </div>

              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Cenario detectado</p>
                <p className="mt-3 text-lg font-semibold text-white">{caseCalculations?.scenarioDetected.label ?? "A definir"}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {caseCalculations?.scenarioDetected.summary ?? "A leitura de calculos ainda nao foi consolidada para este caso."}
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Calculos ativados para o caso</p>
                  {caseCalculations?.activatedCalculations.length ? (
                    <div className="mt-4 grid gap-3">
                      {caseCalculations.activatedCalculations.map((calculation) => (
                        <div key={calculation.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-white">{calculation.label}</p>
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                              Prioridade {calculation.priority}
                            </span>
                          </div>
                          <p className="mt-2 leading-6">{calculation.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 detail-soft-row px-4 py-4 text-sm text-slate-400">
                      Nenhum calculo juridico foi ativado ainda.
                    </div>
                  )}
                </div>

                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Dados de entrada usados</p>
                  <div className="mt-4 grid gap-3">
                    {(caseCalculations?.inputData ?? []).map((item) => (
                      <div key={item.label} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        {item.label}: <span className="font-semibold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Memoria de calculo</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {caseCalculations?.memory.summary ?? "Memoria de calculo indisponivel."}
                </p>
                {caseCalculations?.memory.highlights.length ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {caseCalculations.memory.highlights.map((highlight) => (
                      <div key={highlight} className="detail-soft-row px-4 py-4 text-sm leading-6 text-slate-200">
                        {highlight}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Resultado de cada calculo</p>
                {caseCalculations?.results.length ? (
                  <div className="mt-4 grid gap-3">
                    {caseCalculations.results.map((result) => (
                      <div key={result.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-semibold text-white">{result.label}</p>
                          <span className="text-sm font-semibold text-cyan-50">{result.resultLabel}</span>
                        </div>
                        <p className="mt-2 leading-6">{result.detail}</p>
                        <p className="mt-3 text-cyan-100">{result.legalImpact}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 detail-soft-row px-4 py-4 text-sm text-slate-400">
                    Os resultados dos calculos ainda nao foram materializados.
                  </div>
                )}
              </div>

              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Impacto juridico sugerido</p>
                <div className="mt-4 grid gap-3">
                  {(caseCalculations?.memory.legalImpactSuggestions ?? []).map((impact) => (
                    <div key={impact} className="detail-soft-row px-4 py-4 text-sm leading-6 text-slate-200">
                      {impact}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activePanel === "bacen" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Bacen</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Consulta automatica da taxa media</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {comparison?.classificationLabel ?? "Consulta pendente"}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Contrato detectado: <span className="font-semibold text-white">{bacenDossier?.contractDetectedLabel ?? activeCaseTitle}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Data: <span className="font-semibold text-white">{bacenDossier?.referenceDateLabel ?? comparison?.consultedPeriodLabel ?? "Nao informado"}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Taxa do contrato: <span className="font-semibold text-white">{bacenDossier?.contractRateLabel ?? comparison?.contractRateLabel ?? "Nao informado"}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Modalidade: <span className="font-semibold text-white">{bacenDossier?.modalityLabel ?? comparison?.modalityLabel ?? "Nao informado"}</span>
                </div>
              </div>

              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Como o sistema decide</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {[
                    "Consulta automaticamente a referencia BACEN aplicavel ao contrato.",
                    "Busca a media da modalidade na epoca consultada.",
                    "Compara taxa contratual, media de mercado e diferenca juridicamente relevante."
                  ].map((step) => (
                    <div key={step} className="detail-soft-row px-4 py-4 text-sm leading-6 text-slate-200">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Resultado da comparacao</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Taxa media BACEN: <span className="font-semibold text-white">{bacenDossier?.marketRateLabel ?? "Nao informado"}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Serie consultada: <span className="font-semibold text-white">{bacenDossier?.marketRateSourceLabel ?? comparison?.marketReferenceLabel ?? "Nao informado"}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Diferenca: <span className="font-semibold text-white">{bacenDossier?.differenceLabel ?? comparison?.differencePercentLabel ?? "Nao calculado"}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Classificacao: <span className="font-semibold text-white">{comparison?.classificationLabel ?? "A definir"}</span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {bacenDossier?.comparisonSummary ?? comparison?.summary ?? "Comparacao BACEN indisponivel no momento."}
                </p>
              </div>

              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Alerta juridico</p>
                <p className="mt-3 text-sm leading-7 text-white">
                  {bacenDossier?.legalAlert ?? abusivenessLabel}
                </p>
              </div>
            </div>
          ) : null}

          {activePanel === "estrategico" ? (
            <div className="space-y-5">
              <div>
                <p className="workspace-kicker">Estrategico</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Resumo estrategico do caso</h3>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-sm leading-7 text-slate-200">{strategicSummary}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Tese sugerida: <span className="font-semibold text-white">{strategicThesis}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Risco processual: <span className="font-semibold text-white">{strategicRisk}</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {(contractAnalysis?.analysis.abusivenessSignals ?? []).map((signal) => (
                    <div key={signal} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      - {signal}
                    </div>
                  ))}
                </div>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Pedido sugerido</p>
                <div className="mt-4 grid gap-2">
                  {(contractAnalysis?.analysis.suggestedRequests ?? []).map((request) => (
                    <div key={request} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      {request}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activePanel === "laudo" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Laudo</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Laudo automatico do caso</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {laudoPdfHref ? (
                    <a className="detail-link-button px-4 py-3 text-sm font-semibold" href={laudoPdfHref} target="_blank" rel="noreferrer">
                      Gerar laudo
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-sm leading-7 text-slate-200">{laudoSummary}</p>
                {laudoSources.length ? <p className="mt-3 text-xs text-slate-400">Fontes: {laudoSources.join(" | ")}</p> : null}
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  O advogado revisa o conteudo. O PDF usa a extracao disponivel do contrato/caso, Bacen, calculos e analise do caso.
                </p>
              </div>
              {normalizedCaseInsights.length ? (
                <div className="grid gap-3">
                  {normalizedCaseInsights.slice(0, 3).map((insight) => (
                    <div key={insight} className="detail-soft-row px-4 py-4 text-sm leading-6 text-slate-200">
                      {insight}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {activePanel === "peticoes" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Peticoes</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Peca automatica do caso</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {petitionDraftHref ? (
                    <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={petitionDraftHref}>
                      Abrir peticao para revisar
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-sm leading-7 text-slate-200">{peticoesSummary}</p>
                {peticoesSources.length ? <p className="mt-3 text-xs text-slate-400">Fontes: {peticoesSources.join(" | ")}</p> : null}
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">Fatos: montados automaticamente a partir do caso e dos documentos.</div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">Fundamentos: ancorados em BACEN, abusividades e tese sugerida.</div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">Pedidos: calibrados conforme o nicho e o risco processual.</div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">Tutela e repeticao de indebito: incluidas quando cabiveis.</div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  A minuta abre em superficie de revisao antes da exportacao. Depois da aprovacao, use o handoff de distribuicao para seguir ao fluxo que vira processo.
                </p>
                {nextTaskTitle ? (
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    Proxima tarefa humana: <span className="font-semibold text-white">{nextTaskTitle}</span>
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {activePanel === "clara" ? (
            <div className="space-y-5">
              <div>
                <p className="workspace-kicker">Clara</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Clara dentro do caso</h3>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-sm leading-7 text-slate-200">
                  Voce abre: <span className="font-semibold text-white">Cliente {client.fullName}</span>
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  Caso: <span className="font-semibold text-white">{activeCaseTitle}</span>
                </p>
                <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
                  {["contrato", "calculos", "Bacen", "parcelas", "abusividades"].map((item) => (
                    <div key={item} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Pergunta</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">Clara, explique esse caso.</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Resposta</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{claraResponse}</p>
                {comparison ? (
                  <div className="mt-4 detail-soft-row px-4 py-4 text-sm text-slate-300">
                    O contrato possui taxa {comparison.contractRateLabel} e media BACEN {comparison.marketReferenceLabel}. Diferenca:{" "}
                    <span className="font-semibold text-white">{comparison.differencePercentLabel}</span>.
                  </div>
                ) : null}
                {claraFocusPoints.length ? (
                  <div className="mt-4 grid gap-2">
                    {claraFocusPoints.map((point) => (
                      <div key={point} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                        {point}
                      </div>
                    ))}
                  </div>
                ) : null}
                {normalizedTimeline.length ? (
                  <div className="mt-4 grid gap-2">
                    {normalizedTimeline.slice(0, 3).map((entry) => (
                      <div key={entry} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                        {entry}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              {relatedProcess ? (
                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Processo em contexto</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Processo: <span className="font-semibold text-white">{relatedProcess.processNumber}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Monitoramento: <span className="font-semibold text-white">{relatedProcess.monitoringModeLabel}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {relatedProcess.linkedUpdates.map((update) => (
                      <div key={update.id} className="detail-soft-row flex flex-col gap-3 px-4 py-4 text-sm text-slate-300 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="font-semibold text-white">{update.movementType}</p>
                          <p className="mt-1 text-slate-400">
                            {new Date(update.occurredAt).toLocaleDateString("pt-BR")} | {update.sourceLabel}
                          </p>
                          <p className="mt-3 leading-6">{update.operationalSummary}</p>
                        </div>
                        <span className={`rounded-[4px] border px-3 py-1 text-xs font-semibold ${criticalityTone(update.criticality)}`}>
                          Andamento
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </section>
    </section>
  );
}
