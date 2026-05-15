"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ProcessCockpitFrameProps = {
  process: {
    id: string;
    processNumber: string;
    clientName: string;
    clientDocumentId: string;
    tribunal: string;
    courtDistrict: string;
    courtName: string;
    proceduralPhase: string;
    statusLabel: string;
    monitoringModeLabel: string;
    responsibleLawyer: string;
  };
  bankingCase: {
    title: string;
    bankName: string;
    claimType: string;
    nicheLabel: string;
    status: string;
    stage: string;
    legalRiskLabel: string;
    amountInDispute: number;
    estimatedValue: number;
    mainThesis: string;
    suggestedStrategy: string;
    ownerLabel: string;
    workflowPhaseLabel: string;
    workflowCompletionLabel: string;
    workflowCurrentStep: string;
    workflowSteps: ReadonlyArray<{
      id: string;
      title: string;
      detail: string;
      state: "done" | "current" | "pending";
    }>;
    workflowReadiness: ReadonlyArray<{
      id: string;
      label: string;
      state: "ready" | "blocked";
      detail: string;
      blockers: ReadonlyArray<string>;
    }>;
    checklistCompletionLabel: string;
    requiredDocuments: ReadonlyArray<string>;
    missingDocuments: ReadonlyArray<string>;
    checklistItems: ReadonlyArray<{
      id: string;
      label: string;
      state: "received" | "missing";
      required: boolean;
    }>;
    linkedDocuments: ReadonlyArray<string>;
    linkedTasks: ReadonlyArray<string>;
    linkedDeadlines: ReadonlyArray<string>;
    lexiaInsights: ReadonlyArray<string>;
  };
  latestTimeline: ReadonlyArray<{
    id: string;
    occurredAt: string;
    title: string;
    description: string;
    source: string;
    criticality: "low" | "medium" | "high";
  }>;
  relatedClaraRecordsCount: number;
  claraSummary: {
    title: string;
    detail: string;
    footer?: string;
  } | null;
  claraHistoryItems: ReadonlyArray<{
    id: string;
    title: string;
    detail: string;
    workflowStatusLabel: string;
  }>;
  linkedUpdates: ReadonlyArray<{
    id: string;
    movementType: string;
    sourceLabel: string;
    occurredAt: string;
    operationalSummary: string;
    criticality: "low" | "medium" | "high";
  }>;
  actionLinks: {
    continueClara: string;
    backToProcesses: string;
    openDataJud: string;
    openClaraHistory: string;
    openOabMonitoring: string;
    uploadOfficialReceipt: string;
    openOfficialSystem?: string;
  };
  dataJudLabel: string;
  distributionSummary: {
    adversePartyLabel: string;
    processClassLabel: string;
    suggestedCnjSubjectLabel: string;
    competenceLabel: string;
    valueInCauseLabel: string;
    actionTypeLabel: string;
    urgencyLabel: string;
    localReferenceNumber: string;
    distributedProcessNumber: string;
    distributionDateLabel: string;
    officialSourceLabel: string;
    protocolReceiptLabel: string;
    protocolReceiptHref: string | null;
    distributionStatusLabel: string;
    integrationStatusLabel: string;
    officialSystemLabel: string | null;
    auditTrail: ReadonlyArray<{
      id: string;
      occurredAt: string;
      title: string;
      detail: string;
      statusLabel: string;
      sourceLabel: string;
    }>;
  };
  officialRegistration: {
    readOnly?: boolean;
    formAction: string;
    processId: string;
    localReferenceNumber: string;
    officialProcessNumber: string;
    officialDistributionDate: string;
    officialSource: "manual_confirmed" | "official_import";
    officialDistributionStatus:
      | "preparatory_local"
      | "attempt_failed"
      | "official_confirmed";
    protocolReceiptDocumentId: string;
    receiptCandidates: ReadonlyArray<{
      id: string;
      label: string;
    }>;
    successLabel?: string;
    errorLabel?: string;
  };
  processFilings: {
    formAction: string;
    processId: string;
    caseId: string;
    clientId: string;
    successLabel?: string;
    errorLabel?: string;
    records: ReadonlyArray<{
      id: string;
      kind:
        | "peticao_inicial"
        | "contestacao"
        | "replica"
        | "manifestacao"
        | "recurso"
        | "cumprimento_sentenca"
        | "peticao_intercorrente";
      title: string;
      status: "draft" | "in_review" | "approved" | "filed" | "fulfilled";
      summary: string;
      nextAction: string;
      updatedAt: string;
    }>;
  };
};

type PanelKey = "updates";

function panelTone(active: boolean) {
  return active
    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
    : "border-white/10 bg-white/[0.04] text-slate-200";
}

function criticalityTone(criticality: string) {
  switch (criticality) {
    case "high":
      return "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100";
    case "medium":
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
    default:
      return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  }
}

function filingKindLabel(kind: string) {
  switch (kind) {
    case "peticao_inicial":
      return "Peticao inicial";
    case "contestacao":
      return "Contestacao";
    case "replica":
      return "Replica";
    case "manifestacao":
      return "Manifestacao";
    case "recurso":
      return "Recurso";
    case "cumprimento_sentenca":
      return "Cumprimento de sentenca";
    default:
      return "Peticao intercorrente";
  }
}

function filingStatusLabel(status: string) {
  switch (status) {
    case "in_review":
      return "Em revisao";
    case "approved":
      return "Aprovado";
    case "filed":
      return "Protocolado";
    case "fulfilled":
      return "Cumprido";
    default:
      return "Rascunho";
  }
}

export function ProcessCockpitFrame({
  process,
  linkedUpdates,
  actionLinks,
  dataJudLabel,
  distributionSummary,
  officialRegistration,
  processFilings
}: ProcessCockpitFrameProps) {
  const [activePanel, setActivePanel] = useState<PanelKey | null>("updates");
  const latestUpdate = linkedUpdates[0]?.operationalSummary ?? "Nenhum andamento recente consolidado";

  const cards = useMemo(
    () => [
      {
        key: "updates" as const,
        title: "Andamentos",
        summary: `${linkedUpdates.length} registro(s)`,
        detail: latestUpdate
      }
    ],
    [latestUpdate, linkedUpdates.length]
  );

  return (
    <section className="space-y-6">
      <section className="workspace-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="workspace-kicker">Processo Judicial</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {process.processNumber}
            </h2>
            <p className="text-sm text-slate-400">
              {process.clientName} | {process.tribunal} | {process.courtDistrict}
            </p>
            <p className="text-sm leading-7 text-slate-300">
              Status: {process.statusLabel} | Fase: {process.proceduralPhase} | Monitoramento:{" "}
              {process.monitoringModeLabel}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.continueClara}>
              Abrir na Clara
            </Link>
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.openDataJud}>
              {dataJudLabel}
            </Link>
            {actionLinks.openOfficialSystem ? (
              <a
                className="detail-link-button px-4 py-3 text-sm font-semibold"
                href={actionLinks.openOfficialSystem}
                rel="noreferrer"
                target="_blank"
              >
                {distributionSummary.officialSystemLabel ?? "Abrir portal oficial"}
              </a>
            ) : null}
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.openOabMonitoring}>
              Boundary OAB
            </Link>
            <Link className="detail-link-button px-4 py-3 text-sm font-semibold" href={actionLinks.backToProcesses}>
              Voltar para processos
            </Link>
          </div>
        </div>
      </section>

      <section className="detail-panel p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="workspace-kicker">Dossie processual</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Dados oficiais do processo</h3>
          </div>
          <div className="max-w-xl text-sm leading-7 text-slate-300">
            Quadro operacional montado com base oficial do processo. Esta superficie acompanha o processo ja nascido
            dentro do dossie central do caso e concentra apenas seu acompanhamento posterior.
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Cliente: <span className="font-semibold text-white">{process.clientName}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            CPF/CNPJ: <span className="font-semibold text-white">{process.clientDocumentId}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Parte contraria: <span className="font-semibold text-white">{distributionSummary.adversePartyLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Classe judicial: <span className="font-semibold text-white">{distributionSummary.processClassLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Assunto CNJ: <span className="font-semibold text-white">{distributionSummary.suggestedCnjSubjectLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Competencia: <span className="font-semibold text-white">{distributionSummary.competenceLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Valor da causa: <span className="font-semibold text-white">{distributionSummary.valueInCauseLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Tipo de acao: <span className="font-semibold text-white">{distributionSummary.actionTypeLabel}</span>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Urgencia: <span className="font-semibold text-white">{distributionSummary.urgencyLabel}</span>
          </div>
        </div>

        <div className="mt-5 detail-subpanel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Registro oficial do processo
            </p>
            <span className="text-xs text-slate-400">{distributionSummary.integrationStatusLabel}</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Referencia local:{" "}
              <span className="font-semibold text-white">{distributionSummary.localReferenceNumber}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Numero oficial:{" "}
              <span className="font-semibold text-white">{distributionSummary.distributedProcessNumber}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Data oficial:{" "}
              <span className="font-semibold text-white">{distributionSummary.distributionDateLabel}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Origem oficial:{" "}
              <span className="font-semibold text-white">{distributionSummary.officialSourceLabel}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Status do registro:{" "}
              <span className="font-semibold text-white">{distributionSummary.distributionStatusLabel}</span>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Comprovante oficial:{" "}
              {distributionSummary.protocolReceiptHref ? (
                <Link className="font-semibold text-white underline-offset-4 hover:underline" href={distributionSummary.protocolReceiptHref}>
                  {distributionSummary.protocolReceiptLabel}
                </Link>
              ) : (
                <span className="font-semibold text-white">{distributionSummary.protocolReceiptLabel}</span>
              )}
            </div>
            <Link className="detail-link-button px-4 py-4 text-sm font-semibold" href={actionLinks.uploadOfficialReceipt}>
              Anexar comprovante
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="detail-subpanel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Historico auditavel
              </p>
              <span className="text-xs text-slate-400">{distributionSummary.auditTrail.length} evento(s)</span>
            </div>
            <div className="mt-4 grid gap-3">
              {distributionSummary.auditTrail.length ? (
                distributionSummary.auditTrail.map((event) => (
                  <div key={event.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{event.title}</p>
                        <p className="mt-1 text-slate-400">
                          {new Date(event.occurredAt).toLocaleDateString("pt-BR")} | {event.sourceLabel}
                        </p>
                        <p className="mt-2 leading-6 text-slate-300">{event.detail}</p>
                      </div>
                      <span className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-200">
                        {event.statusLabel}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">
                  Nenhum evento auditavel registrado. O processo ainda nao consolidou retorno oficial nesta superficie.
                </div>
              )}
            </div>
          </div>

          <div className="detail-subpanel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Registrar retorno oficial
              </p>
              <span className="text-xs text-slate-400">Sem automacao de protocolo</span>
            </div>
            {officialRegistration.successLabel ? (
              <div className="mt-4 rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
                {officialRegistration.successLabel}
              </div>
            ) : null}
            {officialRegistration.errorLabel ? (
              <div className="mt-4 rounded-[4px] border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-3 text-sm text-fuchsia-100">
                {officialRegistration.errorLabel}
              </div>
            ) : null}
            {officialRegistration.readOnly ? (
              <div className="mt-4 rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-6 text-slate-300">
                Este exemplo canonico apenas demonstra o estado final do processo. O registro oficial editavel fica disponivel no processo real do tenant.
              </div>
            ) : null}
            <form action={officialRegistration.formAction as unknown as string} className="mt-4 space-y-4">
              <input name="processId" type="hidden" value={officialRegistration.processId} />

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor="localReferenceNumber">
                  Referencia local
                </label>
                <input
                  className="mj-model-input mt-2 w-full px-3 py-2 text-sm outline-none"
                  defaultValue={officialRegistration.localReferenceNumber}
                  disabled={officialRegistration.readOnly}
                  id="localReferenceNumber"
                  name="localReferenceNumber"
                  required
                  type="text"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor="officialProcessNumber">
                  Numero oficial
                </label>
                <input
                  className="mj-model-input mt-2 w-full px-3 py-2 text-sm outline-none"
                  defaultValue={officialRegistration.officialProcessNumber}
                  disabled={officialRegistration.readOnly}
                  id="officialProcessNumber"
                  name="officialProcessNumber"
                  required
                  type="text"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor="officialDistributionDate">
                    Data oficial
                  </label>
                  <input
                    className="mj-model-input mt-2 w-full px-3 py-2 text-sm outline-none"
                  defaultValue={officialRegistration.officialDistributionDate}
                  disabled={officialRegistration.readOnly}
                  id="officialDistributionDate"
                    name="officialDistributionDate"
                    required
                    type="date"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor="officialSource">
                    Origem
                  </label>
                  <select
                    className="mj-model-input mt-2 w-full px-3 py-2 text-sm outline-none"
                    defaultValue={officialRegistration.officialSource}
                    disabled={officialRegistration.readOnly}
                    id="officialSource"
                    name="officialSource"
                  >
                    <option value="manual_confirmed">Manual confirmada</option>
                    <option value="official_import">Importador oficial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor="officialDistributionStatus">
                  Status auditavel
                </label>
                <select
                  className="mj-model-input mt-2 w-full px-3 py-2 text-sm outline-none"
                  defaultValue={officialRegistration.officialDistributionStatus}
                  disabled={officialRegistration.readOnly}
                  id="officialDistributionStatus"
                  name="officialDistributionStatus"
                >
                  <option value="preparatory_local">Estado local preparatorio</option>
                  <option value="attempt_failed">Tentativa frustrada</option>
                  <option value="official_confirmed">Retorno oficial confirmado</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor="protocolReceiptDocumentId">
                  Comprovante vinculado
                </label>
                <select
                  className="mj-model-input mt-2 w-full px-3 py-2 text-sm outline-none"
                  defaultValue={officialRegistration.protocolReceiptDocumentId}
                  disabled={officialRegistration.readOnly}
                  id="protocolReceiptDocumentId"
                  name="protocolReceiptDocumentId"
                >
                  <option value="">Sem comprovante vinculado</option>
                  {officialRegistration.receiptCandidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor="auditDetail">
                  Nota auditavel
                </label>
                <textarea
                  className="mj-model-input mt-2 min-h-[8rem] w-full px-3 py-2 text-sm outline-none"
                  disabled={officialRegistration.readOnly}
                  id="auditDetail"
                  name="auditDetail"
                  placeholder="Descreva o que foi confirmado manualmente ou importado nesta etapa."
                />
              </div>

              <button className="detail-link-button w-full justify-center px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50" disabled={officialRegistration.readOnly} type="submit">
                Salvar retorno oficial
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="detail-panel p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="workspace-kicker">Acompanhamento processual</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Pecas supervenientes e proximos passos</h3>
          </div>
          <div className="max-w-xl text-sm leading-7 text-slate-300">
            O processo segue acompanhado por fases, andamentos e pecas cabiveis, sem prometer automacao oficial de protocolo.
          </div>
        </div>

        {processFilings.successLabel ? (
          <div className="mt-4 rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
            {processFilings.successLabel}
          </div>
        ) : null}
        {processFilings.errorLabel ? (
          <div className="mt-4 rounded-[4px] border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-3 text-sm text-fuchsia-100">
            {processFilings.errorLabel}
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="detail-subpanel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Carteira de pecas do processo
              </p>
              <span className="text-xs text-slate-400">{processFilings.records.length} registro(s)</span>
            </div>
            <div className="mt-4 grid gap-3">
              {processFilings.records.length ? (
                processFilings.records.map((record) => (
                  <div key={record.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="font-semibold text-white">{record.title}</p>
                        <p className="mt-1 text-slate-400">
                          {filingKindLabel(record.kind)} | {new Date(record.updatedAt).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="mt-2 leading-6 text-slate-300">{record.summary}</p>
                        <p className="mt-2 text-slate-400">Proximo passo: {record.nextAction}</p>
                      </div>
                      <span className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-200">
                        {filingStatusLabel(record.status)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">
                  Nenhuma peca superveniente registrada. Use o formulario ao lado para abrir contestacao, manifestacao, recurso ou outro ciclo cabivel.
                </div>
              )}
            </div>
          </div>

          <div className="detail-subpanel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Registrar peca superveniente
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Quando um andamento relevante indicar contestacao, intimacao, decisao ou fase executiva, o sistema pode
              pre-registrar automaticamente a proxima peca cabivel nesta carteira. O protocolo oficial continua externo.
            </p>
            <form action={processFilings.formAction as unknown as string} className="mt-4 space-y-4">
              <input name="processId" type="hidden" value={processFilings.processId} />
              <input name="caseId" type="hidden" value={processFilings.caseId} />
              <input name="clientId" type="hidden" value={processFilings.clientId} />

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor="kind">
                  Tipo de peca
                </label>
                <select className="mj-model-input mt-2 w-full px-3 py-2 text-sm outline-none" defaultValue="manifestacao" id="kind" name="kind">
                  <option value="contestacao">Contestacao</option>
                  <option value="replica">Replica</option>
                  <option value="manifestacao">Manifestacao</option>
                  <option value="recurso">Recurso</option>
                  <option value="cumprimento_sentenca">Cumprimento de sentenca</option>
                  <option value="peticao_intercorrente">Peticao intercorrente</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor="title">
                  Titulo
                </label>
                <input className="mj-model-input mt-2 w-full px-3 py-2 text-sm outline-none" id="title" name="title" required type="text" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor="status">
                  Status
                </label>
                <select className="mj-model-input mt-2 w-full px-3 py-2 text-sm outline-none" defaultValue="draft" id="status" name="status">
                  <option value="draft">Rascunho</option>
                  <option value="in_review">Em revisao</option>
                  <option value="approved">Aprovado</option>
                  <option value="filed">Protocolado</option>
                  <option value="fulfilled">Cumprido</option>
                </select>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Resumo</span>
                <textarea className="mj-model-input mt-2 min-h-[6rem] w-full px-3 py-2 text-sm outline-none" name="summary" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Proximo passo</span>
                <textarea className="mj-model-input mt-2 min-h-[5rem] w-full px-3 py-2 text-sm outline-none" name="nextAction" />
              </label>

              <button className="detail-link-button px-4 py-3 text-sm font-semibold" type="submit">
                Registrar peca no acompanhamento
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const active = activePanel === card.key;
          return (
            <button
              key={card.key}
              className={`workspace-soft-card rounded-[4px] border p-4 text-left transition hover:bg-white/[0.06] ${panelTone(
                active
              )}`}
              onClick={() => setActivePanel(active ? null : card.key)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">{card.title}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{card.summary}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{card.detail}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                  {active ? "Aberto" : "Abrir"}
                </span>
              </div>
            </button>
          );
        })}
      </section>

      {activePanel === "updates" ? (
        <section className="detail-panel p-6">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="workspace-kicker">Andamentos</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Leitura recente do monitoramento processual</h3>
              </div>
              <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                {linkedUpdates.length} registro(s)
              </div>
            </div>
            <div className="grid gap-3">
              {linkedUpdates.length ? (
                linkedUpdates.map((update) => (
                  <div key={update.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{update.movementType}</p>
                        <p className="mt-1 text-slate-400">
                          {new Date(update.occurredAt).toLocaleDateString("pt-BR")} | {update.sourceLabel}
                        </p>
                        <p className="mt-3 leading-6 text-slate-300">{update.operationalSummary}</p>
                      </div>
                      <span
                        className={`rounded-[4px] border px-3 py-1 text-xs font-semibold ${criticalityTone(update.criticality)}`}
                      >
                        Andamento
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">
                  Nenhum andamento recente consolidado para este processo.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </section>
  );
}
