import { notFound } from "next/navigation";
import { getBankingNicheLabel } from "@lexia/domain";
import { WorkspaceStatePanel } from "@lexia/ui";

import { ClientCockpitFrame } from "@/components/layout/client-dossier-frame";
import { WorkspacePage } from "@/components/layout/workspace-page";
import {
  normalizeVisibleCopy,
  normalizeVisibleCopyList
} from "@/lib/branding/normalize-visible-copy";
import {
  listClaraRecords
} from "@/server/services/clara/clara-record-store";
import { getContractAnalysisWorkspace } from "@/server/services/contract-analysis/get-contract-analysis";
import { getBankingCaseWorkflow } from "@/server/services/cases/get-banking-case-workflow";
import { getCases } from "@/server/services/cases/get-cases";
import { getClientById } from "@/server/services/clients/get-clients";
import { getDocumentFileSignedUrl } from "@/server/services/documents/get-document-file-url";
import { getDocumentsByCaseId } from "@/server/services/documents/get-documents";
import { getProcessByCaseId } from "@/server/services/processes/get-processes";
import { getProceduralUpdatesByProcessId } from "@/server/services/procedural-updates/get-procedural-updates";
import { getTasks } from "@/server/services/tasks/get-tasks";

const CASE_STATUS_PRIORITY = {
  active: 0,
  "awaiting-action": 1,
  draft: 2,
  closed: 3
} as const;

const CONTRACT_ANALYSIS_DOCUMENT_TYPES = new Set(["Contrato bancario", "CCB"]);

function serviceStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Caso em andamento";
    case "triage":
      return "Triagem";
    default:
      return status;
  }
}

function legalRiskLabel(risk: "low" | "medium" | "high") {
  switch (risk) {
    case "low":
      return "Baixo";
    case "high":
      return "Alto";
    default:
      return "Medio";
  }
}

function getClientCaseOrderIndex(
  linkedCases: ReadonlyArray<{ id: string }>,
  caseId: string
) {
  const linkedCaseIndex = linkedCases.findIndex((caseSummary) => caseSummary.id === caseId);

  return linkedCaseIndex === -1 ? Number.POSITIVE_INFINITY : linkedCaseIndex;
}

function resolveCanonicalActiveCase(
  clientCases: Awaited<ReturnType<typeof getCases>>,
  linkedCases: ReadonlyArray<{ id: string }>,
  requestedCaseId?: string
) {
  if (requestedCaseId) {
    const requestedCase = clientCases.find((caseItem) => caseItem.id === requestedCaseId);

    if (requestedCase) {
      return requestedCase;
    }
  }

  return (
    [...clientCases].sort((left, right) => {
      const statusPriorityDiff =
        CASE_STATUS_PRIORITY[left.status] - CASE_STATUS_PRIORITY[right.status];

      if (statusPriorityDiff !== 0) {
        return statusPriorityDiff;
      }

      const leftCaseOrder = getClientCaseOrderIndex(linkedCases, left.id);
      const rightCaseOrder = getClientCaseOrderIndex(linkedCases, right.id);

      if (leftCaseOrder !== rightCaseOrder) {
        return leftCaseOrder - rightCaseOrder;
      }

      const processNumberDiff = left.processNumber.localeCompare(right.processNumber);

      if (processNumberDiff !== 0) {
        return processNumberDiff;
      }

      return left.id.localeCompare(right.id);
    })[0] ?? null
  );
}

function readClaraRecordContext(targetPath: string) {
  const url = new URL(targetPath, "http://localhost");

  return {
    clientId: url.searchParams.get("client"),
    caseId: url.searchParams.get("case")
  };
}

function monitoringModeLabel(mode: string) {
  switch (mode) {
    case "oab":
      return "Boundary OAB";
    case "court":
      return "Monitoramento por tribunal";
    default:
      return "Monitoramento manual";
  }
}

function actionTypeLabel(niche: string) {
  switch (niche) {
    case "fraude":
      return "Fraude bancaria";
    case "busca-apreensao":
      return "Busca e apreensao";
    default:
      return "Revisional";
  }
}

function suggestedJudicialClass(niche: string) {
  switch (niche) {
    case "busca-apreensao":
      return "Busca e apreensao";
    default:
      return "Procedimento comum civel";
  }
}

function suggestedCnjSubject(niche: string, claimType: string) {
  const normalizedClaimType = claimType.toLowerCase();

  if (niche === "fraude" || normalizedClaimType.includes("fraude")) {
    return "Falha na prestacao do servico bancario / fraude";
  }

  if (niche === "busca-apreensao" || normalizedClaimType.includes("busca")) {
    return "Alienacao fiduciaria / busca e apreensao";
  }

  return "Contratos bancarios / revisao de clausulas";
}

function suggestedUrgencyLabel(input: {
  title: string;
  claimType: string;
  mainThesis: string;
  suggestedStrategy: string;
}) {
  const evidence = [input.title, input.claimType, input.mainThesis, input.suggestedStrategy]
    .join(" ")
    .toLowerCase();

  return /urg|tutela|negativ|busca|apreens|fraude/.test(evidence) ? "Sim" : "Nao";
}

function distributionDateLabel(
  timeline: ReadonlyArray<{
    occurredAt: string;
    title: string;
    description: string;
  }>
) {
  const distributionEvent = timeline.find((item) =>
    /distribu/i.test(`${item.title} ${item.description}`)
  );

  return distributionEvent?.occurredAt ?? "Nao registrada";
}

function isContractAnalysisDocument(documentType: string) {
  return CONTRACT_ANALYSIS_DOCUMENT_TYPES.has(documentType);
}

function buildTextDraftEditorHref(input: {
  clientId: string;
  caseId: string;
  documentId: string;
  piece: "acao-revisional" | "peticao-inicial" | "procuracao" | "contrato-honorarios";
  objective: string;
  niche: string;
  processId?: string | null;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("draft", "1");
  searchParams.set("niche", input.niche);
  searchParams.set("client", input.clientId);
  searchParams.set("case", input.caseId);
  searchParams.set("document", input.documentId);
  searchParams.set("piece", input.piece);
  searchParams.set("objetivo", input.objective);

  if (input.processId) {
    searchParams.set("process", input.processId);
  }

  return `/editor-de-texto/meus-textos?${searchParams.toString()}`;
}

export default async function ClientDetailPage({
  params,
  searchParams
}: {
  params: { clientId: string };
  searchParams?: {
    clara?: string;
    record?: string;
    action?: string;
    case?: string;
    onboarding?: string;
    workflow?: string;
    uploaded?: string;
  };
}) {
  let client = null;

  try {
    client = await getClientById(params.clientId, { failOnError: true });
  } catch {
    return (
      <WorkspacePage
        description="Nao foi possivel abrir o cockpit do cliente na base real."
        eyebrow="Clientes"
        metrics={[
          { label: "Estado", value: "Indisponivel" },
          { label: "Fonte", value: "Supabase" },
          { label: "Tenant", value: "Nao resolvido" },
          { label: "Acao", value: "Validar vertical" }
        ]}
        title="Cockpit indisponivel"
      >
        <WorkspaceStatePanel
          actionHref="/pessoas/clientes"
          actionLabel="Voltar para clientes"
          description="Valide a configuracao do Supabase, as migrations da vertical de clientes e a seed do tenant ativo."
          title="Falha ao carregar cliente"
          tone="danger"
        />
      </WorkspacePage>
    );
  }

  if (!client) {
    notFound();
  }

  const [clientCases, claraRecords] = await Promise.all([
    getCases({ clientId: params.clientId }),
    listClaraRecords(80)
  ]);
  const activeCase = resolveCanonicalActiveCase(clientCases, client.linkedCases, searchParams?.case);
  const [caseDocuments, activeCaseTasks, relatedProcess] = activeCase
    ? await Promise.all([
        getDocumentsByCaseId(activeCase.id),
        getTasks({ caseId: activeCase.id }),
        getProcessByCaseId(activeCase.id)
      ])
    : [[], [], null];
  const relatedProcessUpdates = relatedProcess
    ? await getProceduralUpdatesByProcessId(relatedProcess.id)
    : [];
  const workflow = activeCase
    ? getBankingCaseWorkflow(activeCase, {
        documentLabels: caseDocuments.map((document) => document.documentType)
      })
    : null;
  const canonicalWorkflow = workflow;
  const nextTask =
    activeCaseTasks.find((task) => task.status !== "done") ?? activeCaseTasks[0] ?? null;
  const relatedClaraRecords = claraRecords.filter((record) => {
    if (record.kind !== "client") {
      return false;
    }

    const payload = record.payload as { recordId?: string };
    const recordContext = readClaraRecordContext(record.targetPath);
    const matchesClient =
      recordContext.clientId === client.id || payload.recordId === `CLI-${client.id.toUpperCase()}`;

    if (!matchesClient) {
      return false;
    }

    if (!activeCase) {
      return true;
    }

    return !recordContext.caseId || recordContext.caseId === activeCase.id;
  });
  const nextStepLabel = activeCase
    ? normalizeVisibleCopy(nextTask?.lexiaNextStep ?? workflow?.nextStep ?? activeCase.suggestedStrategy)
    : "Abrir o primeiro caso bancario deste cliente pela entrada de Iniciar caso.";
  const normalizedClientIaContext = normalizeVisibleCopy(client.iaContext);
  const normalizedTimeline = normalizeVisibleCopyList(client.timeline);
  const normalizedCaseInsights = normalizeVisibleCopyList(activeCase?.lexiaInsights ?? []);
  const contractAnalysisDocumentId =
    caseDocuments.find((document) => isContractAnalysisDocument(document.documentType))?.id ?? null;
  const activeCaseDraftDocumentId = contractAnalysisDocumentId ?? caseDocuments[0]?.id ?? null;
  let contractAnalysisWorkspace = null;

  if (contractAnalysisDocumentId) {
    try {
      contractAnalysisWorkspace = await getContractAnalysisWorkspace(contractAnalysisDocumentId);
    } catch (error) {
      console.warn(
        `Contract analysis workspace unavailable for client dossier document ${contractAnalysisDocumentId}.`,
        error
      );
    }
  }
  const generatedDocuments =
    activeCase && activeCaseDraftDocumentId
      ? [
          {
            kind: "procuracao" as const,
            label: "Gerar procuracao",
            detail:
              "Abre a minuta de procuracao para revisar, editar e depois gerar PDF para impressao.",
            href: buildTextDraftEditorHref({
              clientId: client.id,
              caseId: activeCase.id,
              documentId: activeCaseDraftDocumentId,
              piece: "procuracao",
              niche: activeCase.niche,
              objective: "Preparar procuracao",
              processId: relatedProcess?.id ?? null
            }),
            statusLabel: "Abrir para revisar"
          },
          {
            kind: "contrato-honorarios" as const,
            label: "Gerar contrato de honorarios",
            detail:
              "Abre a minuta do contrato de honorarios para revisar, editar e depois gerar PDF para impressao.",
            href: buildTextDraftEditorHref({
              clientId: client.id,
              caseId: activeCase.id,
              documentId: activeCaseDraftDocumentId,
              piece: "contrato-honorarios",
              niche: activeCase.niche,
              objective: "Preparar contrato de honorarios",
              processId: relatedProcess?.id ?? null
            }),
            statusLabel: "Abrir para revisar"
          }
        ]
      : [];
  const petitionDraftHref =
    activeCase && activeCaseDraftDocumentId
          ? buildTextDraftEditorHref({
              clientId: client.id,
              caseId: activeCase.id,
              documentId: activeCaseDraftDocumentId,
              piece: activeCase.niche === "revisional" ? "acao-revisional" : "peticao-inicial",
              niche: activeCase.niche,
              objective: "Preparar acao revisional",
              processId: relatedProcess?.id ?? null
            })
      : null;
  const caseDocumentsForFrame = await Promise.all(
    caseDocuments.map(async (document) => ({
      id: document.id,
      documentType: document.documentType,
      fileName: document.fileName,
      aiStatus: document.aiStatus,
      summary: document.summary,
      uploadedAt: document.uploadedAt,
      previewLabel: document.previewLabel,
      actions: document.actions,
      detailHref: `/documentos/${document.id}`,
      pdfHref: await getDocumentFileSignedUrl({
        bucket: document.storageBucket,
        path: document.storagePath
      })
    }))
  );
  const metrics: Array<{ label: string; value: string }> = [];

  const cockpitFrameActiveCase = activeCase
    ? {
        id: activeCase.id,
        title: activeCase.title,
        claimType: activeCase.claimType,
        nicheLabel: getBankingNicheLabel(activeCase.niche),
        status: activeCase.status,
        stage: workflow?.phaseLabel ?? activeCase.stage,
        legalRiskLabel: legalRiskLabel(activeCase.legalRisk),
        mainThesis: activeCase.mainThesis,
        suggestedStrategy: activeCase.suggestedStrategy
      }
    : null;

  const cockpitFrameWorkflow = canonicalWorkflow
    ? {
        phaseLabel: canonicalWorkflow.phaseLabel,
        completionLabel: canonicalWorkflow.completionLabel,
        requiredDocuments: canonicalWorkflow.requiredDocuments,
        missingDocuments: canonicalWorkflow.missingDocuments,
        blockers: canonicalWorkflow.blockers,
        steps: canonicalWorkflow.steps,
        readiness: canonicalWorkflow.readiness
      }
    : null;
  const dossierTabs = [
    { key: "visao-geral", label: "Visao geral" },
    { key: "documentos", label: "Documentos" },
    { key: "financeiro", label: "Calculos" },
    { key: "bacen", label: "Bacen" },
    { key: "estrategico", label: "Estrategico" },
    { key: "laudo", label: "Pericial (Laudo)" },
    { key: "peticoes", label: "Peticoes" },
    { key: "clara", label: "Clara" }
  ] as const;
  return (
    <WorkspacePage
      description="Dossie central do cliente orientado pelo caso ativo, com contexto juridico, base documental e a peça mantida bloqueada ate o fechamento humano."
      eyebrow="Dossie do caso"
      metrics={metrics}
      title={client.fullName}
    >
      <ClientCockpitFrame
        actionLinks={{
          attachDocuments: "documentos",
          continueClaraHref: `/clara?niche=revisional&client=${client.id}&case=${activeCase?.id ?? ""}&process=${relatedProcess?.id ?? ""}&document=${activeCaseDraftDocumentId ?? ""}&tab=analise`
        }}
        activeCase={cockpitFrameActiveCase}
        caseDocuments={caseDocumentsForFrame}
        generatedDocuments={generatedDocuments}
        petitionDraftHref={petitionDraftHref}
        client={{
          id: client.id,
          fullName: client.fullName,
          documentId: client.documentId,
          bankName: client.bankName,
          legalViabilityScore: client.legalViabilityScore,
          leadSource: client.leadSource,
          serviceStatusLabel: serviceStatusLabel(client.serviceStatus),
          address: client.address,
          notes: client.notes,
          email: client.email,
          phone: client.phone,
          whatsapp: client.whatsapp
        }}
        nextStepLabel={nextStepLabel}
        nextTaskTitle={nextTask?.title ?? null}
        normalizedCaseInsights={normalizedCaseInsights}
        normalizedClientIaContext={normalizedClientIaContext}
        normalizedTimeline={normalizedTimeline}
        clientCaseCount={clientCases.length}
        dossierTabs={dossierTabs}
        contractAnalysis={
          contractAnalysisWorkspace
            ? {
                analysis: contractAnalysisWorkspace.analysis,
                bacenComparison: contractAnalysisWorkspace.bacenComparison,
                caseCalculations: contractAnalysisWorkspace.caseCalculations,
                bacenDossier: contractAnalysisWorkspace.bacenDossier,
                calculationMemory: contractAnalysisWorkspace.calculationMemory,
                detectedAbuses: contractAnalysisWorkspace.detectedAbuses,
                caseDossier: contractAnalysisWorkspace.caseDossier,
                revisionalChecklist: contractAnalysisWorkspace.revisionalChecklist,
                thesisFrames: contractAnalysisWorkspace.thesisFrames,
                revisionalRequests: contractAnalysisWorkspace.revisionalRequests,
                proofStrategy: contractAnalysisWorkspace.proofStrategy,
                revisionalStructure: contractAnalysisWorkspace.revisionalStructure
              }
            : null
        }
        claraChatContext={
          activeCase
            ? {
                clientId: client.id,
                caseId: activeCase.id,
                processId: relatedProcess?.id ?? null,
                documentId: activeCaseDraftDocumentId,
                source: "dossie"
              }
            : null
        }
        relatedClaraRecordsCount={relatedClaraRecords.length}
        relatedProcess={
          relatedProcess
            ? {
                processNumber: relatedProcess.processNumber,
                tribunal: relatedProcess.tribunal,
                courtDistrict: relatedProcess.courtDistrict,
                courtName: relatedProcess.courtName,
                statusLabel: relatedProcess.status,
                proceduralPhase: relatedProcess.proceduralPhase,
                monitoringModeLabel: monitoringModeLabel(relatedProcess.monitoringMode),
                processClassLabel: suggestedJudicialClass(relatedProcess.bankingCase.niche),
                suggestedCnjSubjectLabel: suggestedCnjSubject(
                  relatedProcess.bankingCase.niche,
                  relatedProcess.bankingCase.claimType
                ),
                urgencyLabel: suggestedUrgencyLabel({
                  title: relatedProcess.bankingCase.title,
                  claimType: relatedProcess.bankingCase.claimType,
                  mainThesis: relatedProcess.bankingCase.mainThesis,
                  suggestedStrategy: relatedProcess.bankingCase.suggestedStrategy
                }),
                actionTypeLabel: actionTypeLabel(relatedProcess.bankingCase.niche),
                valueInCauseLabel: `R$ ${relatedProcess.bankingCase.estimatedValue.toLocaleString("pt-BR")}`,
                distributionDateLabel: distributionDateLabel(relatedProcess.latestTimeline),
                protocolReceiptLabel: "Comprovante oficial anexado",
                integrationStatusLabel: "Processo oficial consolidado a partir da distribuicao manual.",
                officialTimeline: relatedProcess.latestTimeline,
                linkedUpdates: relatedProcessUpdates
              }
            : null
        }
        workflow={cockpitFrameWorkflow}
      />
    </WorkspacePage>
  );
}
