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
  summary: string;
  detailHref: string;
  pdfHref: string | null;
};

type ClientCockpitGeneratedDocument = {
  kind: "peticao-inicial" | "procuracao" | "contrato-honorarios";
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

type DossierTabKey = "documentos" | "financeiro" | "estrategico" | "laudo" | "peticoes" | "clara";

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

function statusTone(state: "ready" | "blocked" | "done" | "current" | "pending" | "received" | "missing") {
  switch (state) {
    case "ready":
    case "done":
    case "received":
      return "text-emerald-200";
    case "current":
      return "text-cyan-100";
    case "blocked":
    case "missing":
      return "text-amber-200";
    default:
      return "text-slate-300";
  }
}

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
  nextStepLabel,
  nextTaskTitle,
  relatedClaraRecordsCount,
  relatedProcess,
  normalizedCaseInsights,
  normalizedClientIaContext,
  normalizedTimeline,
  clientCaseCount,
  dossierTabs,
  contractAnalysis,
  actionLinks
}: ClientCockpitFrameProps) {
  const [activePanel, setActivePanel] = useState<DossierTabKey>(dossierTabs[0]?.key ?? "documentos");
  const attachDocumentsTab = actionLinks.attachDocuments;

  const documentsRequired = workflow?.requiredDocuments.length ?? 0;
  const documentsReceived = caseDocuments.length;
  const documentsMissing = workflow?.missingDocuments.length ?? 0;
  const workflowProgress = workflow
    ? `${workflow.steps.filter((step) => step.state === "done").length}/${workflow.steps.length}`
    : "0/0";
  const workflowCurrentStep =
    workflow?.steps.find((step) => step.state === "current")?.title ?? workflow?.phaseLabel ?? "Sem workflow";
  const chanceOfSuccessLabel =
    client.legalViabilityScore > 0 ? `${client.legalViabilityScore}%` : "Não calculada";
  const abusivenessLabel =
    contractAnalysis?.bacenComparison.classificationLabel ??
    (contractAnalysis ? `${contractAnalysis.analysis.abusivenessSignals.length} sinal(is)` : "A definir");
  const comparison = contractAnalysis?.bacenComparison;
  const calibration = contractAnalysis?.calculationMemory;
  const strategicSummary =
    contractAnalysis?.analysis.executiveSummary ?? activeCase?.mainThesis ?? "Resumo executivo indisponível";
  const strategicThesis = contractAnalysis?.analysis.suggestedThesis ?? activeCase?.suggestedStrategy ?? "A definir";
  const strategicRisk = contractAnalysis?.analysis.proceduralRisk ?? "medium";
  const claraStatus = relatedClaraRecordsCount > 0 ? "Pronta" : activeCase ? "Pendente" : "Bloqueada";
  const claraResponse =
    contractAnalysis?.caseDossier.clara.summary ??
    normalizedClientIaContext ??
    "A Clara ainda não consolidou um resumo contextual para este caso.";
  const claraFocusPoints = contractAnalysis?.caseDossier.clara.focusPoints ?? [];
  const laudoSummary =
    contractAnalysis?.caseDossier.laudo.summary ?? "Laudo automático indisponível no momento.";
  const laudoSources = contractAnalysis?.caseDossier.laudo.sources ?? [];
  const peticoesSummary =
    contractAnalysis?.caseDossier.peticoes.summary ?? "Petições automáticas indisponíveis no momento.";
  const peticoesSources = contractAnalysis?.caseDossier.peticoes.sources ?? [];
  const financeCoverageLabels = [
    "Juros abusivos",
    "Price",
    "SAC",
    "Saldo devedor",
    "BACEN",
    "Repetição de indébito",
    "Liquidação antecipada",
    "Consignado / RMC / RCC",
    "Evolução da dívida",
    "Correção monetária",
    "Danos materiais",
    "Danos morais",
    "Cenários",
    "CET",
    "Superendividamento"
  ];
  const laudoPdfHref = activeCase ? `/api/clientes/${client.id}/documentos-gerados/laudo/pdf?caseId=${activeCase.id}` : null;
  const peticoesPdfHref = activeCase ? `/api/clientes/${client.id}/documentos-gerados/peticoes/pdf?caseId=${activeCase.id}` : null;

  const generatedDocumentsContent = generatedDocuments.length ? (
    <div className="mt-4 flex flex-wrap gap-3">
      {generatedDocuments.map((document) => (
        <Link key={document.kind} className="detail-link-button px-4 py-3 text-sm font-semibold" href={document.href}>
          {document.label}
        </Link>
      ))}
    </div>
  ) : (
    <div className="mt-4 detail-soft-row px-4 py-4 text-sm text-slate-300">
      Nenhum PDF do pacote documental foi gerado para este cliente ainda.
    </div>
  );

  const activeCaseTitle = activeCase?.title ?? "Sem caso ativo";
  const activeCaseClaim = activeCase?.claimType ?? activeCase?.title ?? "A definir";
  const activeCaseRisk = activeCase?.legalRiskLabel ?? "A definir";

  return (
    <section className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl space-y-4">
            <p className="workspace-kicker">Dossiê do caso</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{client.fullName}</h2>
            <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-[4px] border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
              <span>
                <span className="font-semibold text-white">Banco:</span> {client.bankName || "Não informado"}
              </span>
              <span>
                <span className="font-semibold text-white">Tipo de ação:</span> {activeCaseClaim}
              </span>
              <span>
                <span className="font-semibold text-white">Risco:</span> {activeCaseRisk}
              </span>
              <span>
                <span className="font-semibold text-white">Chance de êxito:</span> {chanceOfSuccessLabel}
              </span>
              <span>
                <span className="font-semibold text-white">Abusividade:</span> {abusivenessLabel}
              </span>
            </div>
            <p className="text-sm leading-7 text-slate-300">{activeCase ? nextStepLabel : "Abra um novo atendimento para iniciar o dossiê central do cliente."}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <DeleteClientButton clientId={client.id} clientName={client.fullName} caseCount={clientCaseCount} />
          </div>
        </div>

        <div className="border-b border-white/10">
          <div className="flex min-w-max gap-2 overflow-x-auto" role="tablist" aria-label="Abas do dossiê do caso">
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
                      <div
                        key={document.id}
                        className="detail-soft-row flex flex-col gap-3 px-4 py-4 text-sm text-slate-300 lg:flex-row lg:items-start lg:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="font-semibold text-white">{document.documentType}</p>
                          <p className="text-slate-400">{document.fileName}</p>
                          <p className="leading-6">{document.summary}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link className="detail-link-button px-3 py-2 text-xs font-semibold" href={document.detailHref}>
                            Abrir detalhe
                          </Link>
                          {document.pdfHref ? (
                            <a
                              className="detail-link-button px-3 py-2 text-xs font-semibold"
                              href={document.pdfHref}
                              rel="noreferrer"
                              target="_blank"
                            >
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
                    Campos faltantes:{" "}
                    <span className="font-semibold text-white">
                      {workflow?.missingDocuments.length ? workflow.missingDocuments.join(" | ") : "Nenhum"}
                    </span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Inserção:{" "}
                    <span className="font-semibold text-white">
                      {activeCase ? "Fluxo de upload vinculado ao caso" : "Fluxo de upload indisponível"}
                    </span>
                  </div>
                </div>
              </div>

              {workflow ? (
                <div className="grid gap-3">
                  {workflow.requiredDocuments.map((label) => {
                    const missing = workflow.missingDocuments.includes(label);

                    return (
                      <div key={label} className="detail-soft-row flex items-center justify-between gap-3 px-4 py-4 text-sm text-slate-300">
                        <span>{label}</span>
                        <span className={missing ? "text-amber-200" : "text-emerald-200"}>{missing ? "Pendente" : "Recebido"}</span>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {generatedDocumentsContent}
            </div>
          ) : null}

          {activePanel === "financeiro" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Financeiro</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{activeCaseTitle}</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {activeCase ? `Risco ${activeCaseRisk}` : "Crie um caso para ativar o cockpit"}
                </div>
              </div>

              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Contrato detectado</p>
                <div className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
                  <p>
                    Contrato detectado: <span className="font-semibold text-white">{activeCaseTitle}</span>
                  </p>
                  <p>data: {comparison?.consultedPeriodLabel ?? "Não informado"}</p>
                  <p>taxa: {comparison?.contractRateLabel ?? "Não informado"}</p>
                  <p>O sistema:</p>
                  <p>- consulta BACEN</p>
                  <p>- busca média daquela modalidade na época</p>
                  <p>- compara automaticamente</p>
                  <p>
                    Resultado: <span className="font-semibold text-white">{comparison?.summary ?? "Comparação BACEN indisponível"}</span>
                  </p>
                  <p>
                    Taxa do contrato: <span className="font-semibold text-white">{comparison?.contractRateLabel ?? "Não informado"}</span>
                  </p>
                  <p>
                    Taxa média BACEN: <span className="font-semibold text-white">{comparison?.marketReferenceLabel ?? "Não informado"}</span>
                  </p>
                  <p>
                    Diferença: <span className="font-semibold text-white">{comparison?.differencePercentLabel ?? "Não informado"}</span>
                  </p>
                  <p className="text-amber-200">
                    ALERTA: <span className="font-semibold text-white">{abusivenessLabel}</span>
                  </p>
                </div>
              </div>

              {calibration ? (
                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Detalhes do cálculo</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Valor financiado: <span className="font-semibold text-white">{calibration.labels.financedAmount}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Número de parcelas: <span className="font-semibold text-white">{calibration.labels.installmentCount}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Parcela contratada: <span className="font-semibold text-white">{calibration.labels.contractedInstallment}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Parcela cobrada: <span className="font-semibold text-white">{calibration.labels.chargedInstallment}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Redução estimada: <span className="font-semibold text-white">{calibration.labels.targetReductionPercent}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{calibration.basis}</p>
                </div>
              ) : null}

              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Escopo do financeiro</p>
                <div className="mt-4 grid gap-2 md:grid-cols-3 xl:grid-cols-5">
                  {financeCoverageLabels.map((label) => (
                    <div key={label} className="detail-soft-row px-3 py-2 text-xs font-semibold text-slate-200">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activePanel === "estrategico" ? (
            <div className="space-y-5">
              <div>
                <p className="workspace-kicker">Estratégico</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Resumo Estratégico do Caso</h3>
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
                  <h3 className="mt-2 text-2xl font-semibold text-white">Laudo automático do caso</h3>
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
                  O advogado revisa o conteúdo. O PDF já sai montado com OCR, BACEN, cálculos e análise do caso.
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
                  <p className="workspace-kicker">Petições</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Peça automática do caso</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {peticoesPdfHref ? (
                    <a className="detail-link-button px-4 py-3 text-sm font-semibold" href={peticoesPdfHref} target="_blank" rel="noreferrer">
                      Gerar petição
                    </a>
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
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">Tutela e repetição de indébito: incluídas quando cabíveis.</div>
                </div>
                {nextTaskTitle ? (
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    Próxima tarefa humana: <span className="font-semibold text-white">{nextTaskTitle}</span>
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
                  Você abre: <span className="font-semibold text-white">Cliente {client.fullName}</span>
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  Caso: <span className="font-semibold text-white">{activeCaseTitle}</span>
                </p>
                <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
                  {["contrato", "cálculos", "BACEN", "parcelas", "abusividades"].map((item) => (
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
                    O contrato possui taxa {comparison.contractRateLabel} e média BACEN {comparison.marketReferenceLabel}. Diferença:
                    {" "}
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
            </div>
          ) : null}
        </section>
      </section>
    </section>
  );
}
