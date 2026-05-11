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
  const continueClaraTab = actionLinks.continueClara;

  const activatePanel = (tabKey: DossierTabKey) => {
    setActivePanel(tabKey);
  };

  const documentsRequired = workflow?.requiredDocuments.length ?? 0;
  const documentsReceived = caseDocuments.length;
  const documentsMissing = workflow?.missingDocuments.length ?? 0;
  const workflowProgress = workflow
    ? `${workflow.steps.filter((step) => step.state === "done").length}/${workflow.steps.length}`
    : "0/0";
  const workflowCurrentStep =
    workflow?.steps.find((step) => step.state === "current")?.title ?? workflow?.phaseLabel ?? "Sem workflow";
  const chanceOfSuccessLabel =
    client.legalViabilityScore > 0 ? `${client.legalViabilityScore}%` : "Nao calculada";
  const abusivenessLabel =
    contractAnalysis?.bacenComparison.classificationLabel ??
    (contractAnalysis ? `${contractAnalysis.analysis.abusivenessSignals.length} sinal(is)` : "A definir");
  const contractRateLabel = contractAnalysis?.bacenComparison.contractRateLabel ?? "Nao informado";
  const marketReferenceLabel = contractAnalysis?.bacenComparison.marketReferenceLabel ?? "Nao informado";
  const selectedPeriodLabel = contractAnalysis?.bacenComparison.consultedPeriodLabel ?? "Nao informado";
  const comparisonSummary = contractAnalysis?.bacenComparison.summary ?? "Comparacao BACEN indisponivel";
  const strategyExecutiveSummary =
    contractAnalysis?.analysis.executiveSummary ?? activeCase?.mainThesis ?? "Resumo executivo indisponivel";
  const strategicThesis = contractAnalysis?.analysis.suggestedThesis ?? activeCase?.suggestedStrategy ?? "A definir";
  const strategicRisk = contractAnalysis?.analysis.proceduralRisk ?? "medium";
  const claraStatus =
    relatedClaraRecordsCount > 0 ? "Pronta" : activeCase ? "Pendente" : "Bloqueada";
  const claraAction =
    relatedClaraRecordsCount > 0
      ? nextStepLabel
      : relatedProcess
        ? `Processo ${relatedProcess.processNumber} pronto para leitura contextual`
        : "Preparar contexto para a proxima tarefa juridica";
  const piecesReady =
    Boolean(workflow) &&
    (workflow?.readiness.length ?? 0) > 0 &&
    workflow?.readiness.every((item) => item.state === "ready");
  const piecesStatus = piecesReady ? "Pronta" : "Bloqueada";
  const piecesActionLabel = piecesReady
    ? "A peca esta liberada para o handoff de distribuicao"
    : "A peca fica retida ate o caso fechar";
  const latestProcessUpdate =
    relatedProcess?.linkedUpdates[0]?.operationalSummary ?? "Nenhum andamento oficial consolidado";
  const financeCoverageLabels = [
    "Juros abusivos",
    "Price",
    "SAC",
    "Saldo devedor",
    "BACEN",
    "Repeticao de indébito",
    "Liquidacao antecipada",
    "Consignado / RMC / RCC",
    "Evolucao da divida",
    "Correcao monetaria",
    "Danos materiais",
    "Danos morais",
    "Cenarios",
    "CET",
    "Superendividamento"
  ];

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

  const totalTimelineEvents = normalizedTimeline.length + (relatedProcess?.officialTimeline.length ?? 0);

  return (
    <section className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl space-y-4">
            <p className="workspace-kicker">Dossie do caso</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{client.fullName}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Cliente: <span className="font-semibold text-white">{client.fullName}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Banco: <span className="font-semibold text-white">{client.bankName || "Nao informado"}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Tipo de ação:{" "}
                <span className="font-semibold text-white">
                  {activeCase?.claimType ?? activeCase?.title ?? "A definir"}
                </span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Risco: <span className="font-semibold text-white">{activeCase?.legalRiskLabel ?? "A definir"}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Chance de êxito: <span className="font-semibold text-white">{chanceOfSuccessLabel}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Abusividade: <span className="font-semibold text-white">{abusivenessLabel}</span>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              {activeCase ? nextStepLabel : "Abra um novo atendimento para iniciar o dossie central do cliente."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <button className="detail-link-button px-4 py-3 text-sm font-semibold" onClick={() => activatePanel(actionLinks.continueClara)} type="button">
              Abrir na Clara
            </button>
            <DeleteClientButton clientId={client.id} clientName={client.fullName} caseCount={clientCaseCount} />
          </div>
        </div>

        <div className="border-b border-white/10">
          <div className="flex min-w-max gap-2 overflow-x-auto" role="tablist" aria-label="Abas do dossie do caso">
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
                  onClick={() => activatePanel(tab.key)}
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

        <section
          aria-labelledby={tabButtonId(activePanel)}
          className="detail-panel p-6"
          id={tabPanelId(activePanel)}
          role="tabpanel"
        >
          {activePanel === "documentos" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Documentos</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Checklist documental do caso</h3>
                </div>
                <div className="flex gap-2">
                  {attachDocumentsTab ? (
                    <button className="detail-link-button px-4 py-3 text-sm font-semibold" onClick={() => activatePanel(attachDocumentsTab)} type="button">
                      Anexar documentos
                    </button>
                  ) : null}
                  <button className="detail-link-button px-4 py-3 text-sm font-semibold" onClick={() => activatePanel(continueClaraTab)} type="button">
                    Atualizar checklist
                  </button>
                </div>
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
              {workflow ? (
                <div className="grid gap-3">
                  {workflow.requiredDocuments.map((label) => {
                    const missing = workflow.missingDocuments.includes(label);

                    return (
                      <div
                        key={label}
                        className="detail-soft-row flex items-center justify-between gap-3 px-4 py-4 text-sm text-slate-300"
                      >
                        <span>{label}</span>
                        <span className={missing ? "text-amber-200" : "text-emerald-200"}>
                          {missing ? "Pendente" : "Recebido"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {caseDocuments.length ? (
                <div className="grid gap-3">
                  {caseDocuments.map((document) => (
                    <div key={document.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      <p className="font-semibold text-white">{document.documentType}</p>
                      <p className="mt-1 text-slate-400">{document.fileName}</p>
                      <p className="mt-2">{document.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">
                  Nenhum documento foi vinculado ao caso ativo ainda.
                </div>
              )}
              <div className="detail-subpanel p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Pacote documental do cliente</p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      Gere e abra os PDFs de petição inicial, procuração e contrato de honorários sob demanda para revisão
                      humana.
                    </p>
                  </div>
                </div>
                {generatedDocumentsContent}
              </div>
              {relatedProcess ? (
                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Vinculo pos-distribuicao</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Processo oficial: <span className="font-semibold text-white">{relatedProcess.processNumber}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Comprovante: <span className="font-semibold text-white">{relatedProcess.protocolReceiptLabel}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {activePanel === "financeiro" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Financeiro</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{activeCase?.title ?? "Sem caso ativo"}</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {activeCase ? `Risco ${activeCase.legalRiskLabel}` : "Crie um caso para ativar o cockpit"}
                </div>
              </div>
              {contractAnalysis ? (
                <div className="detail-subpanel p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                        Motor financeiro automatico
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        O financeiro calcula a partir do nicho bancario do caso, da leitura do contrato e da comparacao BACEN.
                      </p>
                    </div>
                    <div className="text-xs text-slate-400">{selectedPeriodLabel}</div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Taxa contratual: <span className="font-semibold text-white">{contractRateLabel}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Referencia BACEN: <span className="font-semibold text-white">{marketReferenceLabel}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      BACEN: <span className="font-semibold text-white">{comparisonSummary}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Parcela contratada:{" "}
                      <span className="font-semibold text-white">{contractAnalysis.calculationMemory.labels.contractedInstallment}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Parcela cobrada:{" "}
                      <span className="font-semibold text-white">{contractAnalysis.calculationMemory.labels.chargedInstallment}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Reducao estimada:{" "}
                      <span className="font-semibold text-white">
                        {contractAnalysis.calculationMemory.labels.targetReductionPercent}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 md:grid-cols-3 xl:grid-cols-5">
                    {financeCoverageLabels.map((label) => (
                      <div key={label} className="detail-soft-row px-3 py-2 text-xs font-semibold text-slate-200">
                        {label}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{contractAnalysis.calculationMemory.basis}</p>
                </div>
              ) : null}
              {activeCase ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Nicho: <span className="font-semibold text-white">{activeCase.nicheLabel}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Status: <span className="font-semibold text-white">{activeCase.status}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Fase atual: <span className="font-semibold text-white">{activeCase.stage}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Proximo passo: <span className="font-semibold text-white">{nextStepLabel}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Valor da causa:{" "}
                    <span className="font-semibold text-white">{relatedProcess?.valueInCauseLabel ?? "Nao informado"}</span>
                  </div>
                  <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    Classe judicial:{" "}
                    <span className="font-semibold text-white">{relatedProcess?.processClassLabel ?? "Nao informada"}</span>
                  </div>
                </div>
              ) : null}
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Resumo do caso</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {activeCase?.mainThesis ?? "A Area do Cliente ativa quando houver um caso vinculado."}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {activeCase?.suggestedStrategy ?? "Abra um novo atendimento para iniciar o fluxo bancario."}
                </p>
              </div>
              {relatedProcess ? (
                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Processo oficial vinculado</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Numero: <span className="font-semibold text-white">{relatedProcess.processNumber}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Tribunal: <span className="font-semibold text-white">{relatedProcess.tribunal}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Comarca: <span className="font-semibold text-white">{relatedProcess.courtDistrict}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Classe judicial: <span className="font-semibold text-white">{relatedProcess.processClassLabel}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Assunto CNJ: <span className="font-semibold text-white">{relatedProcess.suggestedCnjSubjectLabel}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Valor da causa: <span className="font-semibold text-white">{relatedProcess.valueInCauseLabel}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Tipo de acao: <span className="font-semibold text-white">{relatedProcess.actionTypeLabel}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Urgencia: <span className="font-semibold text-white">{relatedProcess.urgencyLabel}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Distribuicao: <span className="font-semibold text-white">{relatedProcess.distributionDateLabel}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {activePanel === "estrategico" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Estratégico</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Trilha operacional do caso</h3>
                </div>
                <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {workflow?.completionLabel ?? "Sem workflow"}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Chance de êxito: <span className="font-semibold text-white">{chanceOfSuccessLabel}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Risco: <span className="font-semibold text-white">{activeCase?.legalRiskLabel ?? "A definir"}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Tese sugerida: <span className="font-semibold text-white">{strategicThesis}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  BACEN: <span className="font-semibold text-white">{contractAnalysis?.bacenComparison.classificationLabel ?? "A definir"}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300 xl:col-span-2">
                  Risco do motor:{" "}
                  <span className="font-semibold text-white">
                    {strategicRisk === "high" ? "Alto" : strategicRisk === "medium" ? "Medio" : "Baixo"}
                  </span>
                </div>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Resumo executivo</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{strategyExecutiveSummary}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{contractAnalysis?.analysis.executiveSummary ?? activeCase?.mainThesis}</p>
              </div>
              {workflow ? (
                <div className="grid gap-3">
                  {workflow.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`rounded-[4px] border px-4 py-4 text-sm ${
                        step.state === "done"
                          ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-50"
                          : step.state === "current"
                            ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-50"
                            : "border-white/10 bg-white/[0.03] text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current/20 text-xs font-semibold">
                            {index + 1}
                          </span>
                          <p className="font-semibold">{step.title}</p>
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.16em] opacity-80">
                          {step.state === "done" ? "Concluida" : step.state === "current" ? "Atual" : "Pendente"}
                        </span>
                      </div>
                      <p className="mt-3 leading-6">{step.detail}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Status do workflow: <span className="font-semibold text-white">{workflowCurrentStep}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Progresso: <span className="font-semibold text-white">{workflowProgress}</span>
                </div>
              </div>
              {relatedProcess ? (
                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Pos-distribuicao</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Status do processo: <span className="font-semibold text-white">{relatedProcess.statusLabel}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Andamentos oficiais: <span className="font-semibold text-white">{relatedProcess.linkedUpdates.length}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{relatedProcess.integrationStatusLabel}</p>
                </div>
              ) : null}
              {workflow?.readiness.length ? (
                <div className="grid gap-3">
                  {workflow.readiness.map((item) => (
                    <div key={item.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">{item.label}</p>
                        <span className={statusTone(item.state)}>{item.state === "ready" ? "Pronta" : "Bloqueada"}</span>
                      </div>
                      <p className="mt-2 leading-6">{item.detail}</p>
                      {item.blockers.length ? <p className="mt-2 text-slate-400">Bloqueios: {item.blockers.join(" | ")}</p> : null}
                    </div>
                  ))}
                </div>
              ) : null}
              {contractAnalysis ? (
                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Fontes estrategicas</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Taxa: <span className="font-semibold text-white">{contractAnalysis.analysis.rateLabel}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      CET: <span className="font-semibold text-white">{contractAnalysis.analysis.cetLabel}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Capitalizacao:{" "}
                      <span className="font-semibold text-white">{contractAnalysis.analysis.capitalizationLabel}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Abusividades:{" "}
                      <span className="font-semibold text-white">{contractAnalysis.analysis.abusivenessSignals.length}</span>
                    </div>
                  </div>
                  {contractAnalysis.thesisFrames.length ? (
                    <div className="mt-4 grid gap-3">
                      {contractAnalysis.thesisFrames.map((frame) => (
                        <div key={frame.title} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                          <p className="font-semibold text-white">{frame.title}</p>
                          <p className="mt-2 leading-6">{frame.detail}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {activePanel === "laudo" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Laudo</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Leitura consolidada do caso</h3>
                </div>
                <button className="detail-link-button px-4 py-3 text-sm font-semibold" onClick={() => activatePanel("laudo")} type="button">
                  Gerar laudo
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Registros da Clara: <span className="font-semibold text-white">{relatedClaraRecordsCount}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Insights do caso: <span className="font-semibold text-white">{normalizedCaseInsights.length}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Status da Clara: <span className="font-semibold text-white">{claraStatus}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Proxima leitura: <span className="font-semibold text-white">{claraAction}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Eventos consolidados: <span className="font-semibold text-white">{totalTimelineEvents}</span>
                </div>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Artefato gerado</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {contractAnalysis?.caseDossier.laudo.summary ?? normalizedClientIaContext}
                </p>
                {contractAnalysis?.caseDossier.laudo.sources.length ? (
                  <p className="mt-3 text-xs text-slate-400">
                    Fontes: {contractAnalysis.caseDossier.laudo.sources.join(" | ")}
                  </p>
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
                  <p className="mt-4 text-sm leading-6 text-slate-300">{latestProcessUpdate}</p>
                </div>
              ) : null}
              {normalizedCaseInsights.length ? (
                <div className="grid gap-3">
                  {normalizedCaseInsights.slice(0, 3).map((insight) => (
                    <div key={insight} className="detail-soft-row px-4 py-4 text-sm leading-6 text-slate-200">
                      {insight}
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Historico</p>
                <ol className="mt-4 space-y-3">
                  {normalizedTimeline.map((entry, index) => (
                    <li key={`${entry}-${index}`} className="detail-soft-row flex gap-4 px-4 py-4 text-sm text-slate-300">
                      <span className="detail-step-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span>{entry}</span>
                    </li>
                  ))}
                  {relatedProcess?.officialTimeline.map((entry, index) => (
                    <li key={entry.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-4">
                          <span className="detail-step-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                            {normalizedTimeline.length + index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-white">{entry.title}</p>
                            <p className="mt-1 text-slate-400">
                              {entry.occurredAt} | {entry.source}
                            </p>
                            <p className="mt-3 leading-6 text-slate-300">{entry.description}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                  {relatedProcess?.linkedUpdates.map((update) => (
                    <li key={update.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-white">{update.movementType}</p>
                          <p className="mt-1 text-slate-400">
                            {new Date(update.occurredAt).toLocaleDateString("pt-BR")} | {update.sourceLabel}
                          </p>
                          <p className="mt-3 leading-6 text-slate-300">{update.operationalSummary}</p>
                        </div>
                        <span className={`rounded-[4px] border px-3 py-1 text-xs font-semibold ${criticalityTone(update.criticality)}`}>
                          Andamento
                        </span>
                      </div>
                    </li>
                  ))}
                  {normalizedTimeline.length === 0 &&
                  (relatedProcess?.officialTimeline.length ?? 0) === 0 &&
                  (relatedProcess?.linkedUpdates.length ?? 0) === 0 ? (
                    <li className="detail-soft-row px-4 py-4 text-sm text-slate-400">Nenhum evento registrado ainda.</li>
                  ) : null}
                </ol>
              </div>
            </div>
          ) : null}

          {activePanel === "peticoes" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Petições</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Minuta e revisão humana</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="detail-link-button px-4 py-3 text-sm font-semibold" onClick={() => activatePanel("peticoes")} type="button">
                    Gerar minuta da peca
                  </button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Status: <span className="font-semibold text-white">{piecesStatus}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Motivo: <span className="font-semibold text-white">{nextTaskTitle ?? piecesActionLabel}</span>
                </div>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Artefato gerado</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {contractAnalysis?.caseDossier.peticoes.summary ??
                    "A peça permanece no cockpit do cliente ate a revisão humana."}
                </p>
                {contractAnalysis?.caseDossier.peticoes.sources.length ? (
                  <p className="mt-3 text-xs text-slate-400">
                    Fontes: {contractAnalysis.caseDossier.peticoes.sources.join(" | ")}
                  </p>
                ) : null}
              </div>
              {relatedProcess ? (
                <div className="detail-subpanel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Resultado da distribuicao</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Fase processual: <span className="font-semibold text-white">{relatedProcess.proceduralPhase}</span>
                    </div>
                    <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      Comprovante oficial: <span className="font-semibold text-white">{relatedProcess.protocolReceiptLabel}</span>
                    </div>
                  </div>
                </div>
              ) : null}
              {workflow?.readiness.length ? (
                <div className="grid gap-3">
                  {workflow.readiness.map((item) => (
                    <div key={item.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">{item.label}</p>
                        <span className={statusTone(item.state)}>{item.state === "ready" ? "Pronta" : "Bloqueada"}</span>
                      </div>
                      <p className="mt-2 leading-6">{item.detail}</p>
                      {item.blockers.length ? <p className="mt-2 text-slate-400">Bloqueios: {item.blockers.join(" | ")}</p> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {activePanel === "clara" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="workspace-kicker">Clara</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Contexto e historico da agente</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="detail-link-button px-4 py-3 text-sm font-semibold" onClick={() => activatePanel("clara")} type="button">
                    Abrir na Clara
                  </button>
                  <button className="detail-link-button px-4 py-3 text-sm font-semibold" onClick={() => activatePanel("clara")} type="button">
                    Atualizar na Clara
                  </button>
                  <button className="detail-link-button px-4 py-3 text-sm font-semibold" onClick={() => activatePanel("clara")} type="button">
                    Preparar contexto
                  </button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Registros da Clara: <span className="font-semibold text-white">{relatedClaraRecordsCount}</span>
                </div>
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                  Insights do caso: <span className="font-semibold text-white">{normalizedCaseInsights.length}</span>
                </div>
              </div>
              <div className="detail-subpanel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Contexto do caso</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {contractAnalysis?.caseDossier.clara.summary ?? normalizedClientIaContext}
                </p>
                {contractAnalysis?.caseDossier.clara.focusPoints.length ? (
                  <div className="mt-4 grid gap-2">
                    {contractAnalysis.caseDossier.clara.focusPoints.map((point) => (
                      <div key={point} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                        {point}
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
                  <p className="mt-4 text-sm leading-6 text-slate-300">{latestProcessUpdate}</p>
                </div>
              ) : null}
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
        </section>
      </section>
    </section>
  );
}
