import Link from "next/link";
import { notFound } from "next/navigation";
import { getBankingNicheLabel } from "@lexia/domain";
import { WorkspaceStatePanel } from "@lexia/ui";

import { ClientCockpitFrame } from "@/components/layout/client-cockpit-frame";
import { ClaraContextActions } from "@/components/layout/clara-context-actions";
import { WorkspacePage } from "@/components/layout/workspace-page";
import {
  normalizeVisibleCopy,
  normalizeVisibleCopyList
} from "@/lib/branding/normalize-visible-copy";
import {
  getClaraRecord,
  getClaraRecordDisplay,
  listClaraRecords
} from "@/server/services/clara/clara-record-store";
import { getClaraClientArtifact } from "@/server/services/clara/get-clara-artifacts";
import { getBankingCaseWorkflow } from "@/server/services/cases/get-banking-case-workflow";
import { getCases } from "@/server/services/cases/get-cases";
import { getClientById } from "@/server/services/clients/get-clients";
import { getDocumentsByCaseId } from "@/server/services/documents/get-documents";
import { getTasks } from "@/server/services/tasks/get-tasks";

const CASE_STATUS_PRIORITY = {
  active: 0,
  "awaiting-action": 1,
  draft: 2,
  closed: 3
} as const;

function workflowStatusLabel(status: "created" | "reviewed" | "completed") {
  switch (status) {
    case "reviewed":
      return "Revisado";
    case "completed":
      return "Concluido";
    default:
      return "Criado";
  }
}

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
    client = await getClientById(params.clientId);
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

  const [clientCases, claraRecord, claraRecords] = await Promise.all([
    getCases({ clientId: params.clientId }),
    getClaraRecord(searchParams?.record),
    listClaraRecords(80)
  ]);
  const activeCase = resolveCanonicalActiveCase(clientCases, client.linkedCases, searchParams?.case);
  const [caseDocuments, activeCaseTasks] = activeCase
    ? await Promise.all([
        getDocumentsByCaseId(activeCase.id),
        getTasks({ caseId: activeCase.id })
      ])
    : [[], []];
  const workflow = activeCase
    ? getBankingCaseWorkflow(activeCase, {
        documentLabels: caseDocuments.map((document) => document.documentType)
      })
    : null;
  const nextTask =
    activeCaseTasks.find((task) => task.status !== "done") ?? activeCaseTasks[0] ?? null;
  const relatedClaraRecords = claraRecords.filter((record) => {
    if (record.kind !== "client") {
      return false;
    }

    const payload = record.payload as Awaited<ReturnType<typeof getClaraClientArtifact>>;
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
  const claraArtifact =
    claraRecord?.kind === "client"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraClientArtifact>>)
      : searchParams?.clara
        ? await getClaraClientArtifact(params.clientId, activeCase?.id, false)
        : null;
  const claraDisplay = claraArtifact
    ? getClaraRecordDisplay(claraRecord, "Resumo contextual da Clara carregado", claraArtifact.summary)
    : null;
  const nextStepLabel = activeCase
    ? normalizeVisibleCopy(
        nextTask?.lexiaNextStep ?? workflow?.nextStep ?? activeCase.suggestedStrategy
      )
    : "Abrir o primeiro caso bancario deste cliente pela entrada de Novo atendimento bancario.";
  const generatedDocuments = activeCase
    ? [
        {
          kind: "peticao-inicial" as const,
          label: "Gerar modelo PDF da peticao inicial",
          detail: `Rascunho interno do caso ${activeCase.title}, gerado sob demanda para revisao humana.`,
          href: `/api/clientes/${client.id}/documentos-gerados/peticao-inicial/pdf?caseId=${activeCase.id}`,
          statusLabel: "Abrir modelo"
        },
        {
          kind: "procuracao" as const,
          label: "Gerar modelo PDF da procuracao",
          detail: `Rascunho interno de representacao vinculado ao caso ${activeCase.processNumber}.`,
          href: `/api/clientes/${client.id}/documentos-gerados/procuracao/pdf?caseId=${activeCase.id}`,
          statusLabel: "Abrir modelo"
        },
        {
          kind: "contrato-honorarios" as const,
          label: "Gerar modelo PDF do contrato de honorarios",
          detail: `Rascunho interno de honorarios do fluxo ${getBankingNicheLabel(activeCase.niche).toLowerCase()}.`,
          href: `/api/clientes/${client.id}/documentos-gerados/contrato-honorarios/pdf?caseId=${activeCase.id}`,
          statusLabel: "Abrir modelo"
        }
      ]
    : [];
  const normalizedClaraSummary = claraDisplay
    ? {
      title: normalizeVisibleCopy(claraDisplay.title),
        detail: normalizeVisibleCopy(claraDisplay.detail)
      }
    : null;
  const normalizedClientIaContext = normalizeVisibleCopy(client.iaContext);
  const normalizedTimeline = normalizeVisibleCopyList(client.timeline);
  const normalizedCaseInsights = normalizeVisibleCopyList(activeCase?.lexiaInsights ?? []);
  const checklistItems = workflow?.requiredDocuments.map((label) => ({
    label,
    missing: workflow.missingDocuments.includes(label)
  })) ?? [];
  const receivedDocuments = caseDocuments.length;
  const availableNow = [
    "Cockpit do caso ativo",
    "Checklist documental inicial",
    "Workflow visivel do nicho",
    "Retorno do onboarding e do upload documental"
  ];
  const comingNext = [
    "Pecas e minutas com revisao humana",
    "Processo judicial completo apos distribuicao",
    "Andamentos e Diario Oficial correlacionados ao caso",
    "Clara executora com historico operacional ampliado"
  ];
  const metrics = [
    {
      label: "Caso Ativo",
      value: activeCase ? "Resolvido" : "Pendente"
    },
    {
      label: "Nicho",
      value: activeCase ? getBankingNicheLabel(activeCase.niche) : "Nao iniciado"
    },
    {
      label: "Documentos",
      value: workflow?.completionLabel ?? `${client.documentsSent} enviados`
    },
    {
      label: "Proximo passo",
      value: nextTask ? "Com tarefa aberta" : "A definir"
    }
  ];

  const cockpitFrameActiveCase = activeCase
    ? {
        id: activeCase.id,
        title: activeCase.title,
        nicheLabel: getBankingNicheLabel(activeCase.niche),
        status: activeCase.status,
        stage: workflow?.phaseLabel ?? activeCase.stage,
        legalRiskLabel: legalRiskLabel(activeCase.legalRisk),
        mainThesis: activeCase.mainThesis,
        suggestedStrategy: activeCase.suggestedStrategy
      }
    : null;

  const cockpitFrameWorkflow = workflow
    ? {
        phaseLabel: workflow.phaseLabel,
        completionLabel: workflow.completionLabel,
        requiredDocuments: workflow.requiredDocuments,
        missingDocuments: workflow.missingDocuments,
        blockers: workflow.blockers,
        steps: workflow.steps,
        readiness: workflow.readiness
      }
    : null;

  return (
    <WorkspacePage
      description="Cockpit inicial do cliente orientado pelo caso ativo, com contexto juridico, base documental e proximo passo operacional no mesmo lugar."
      eyebrow="Clientes"
      metrics={metrics}
      title={client.fullName}
    >
      <ClientCockpitFrame
        actionLinks={{
          attachDocuments: activeCase ? `/documentos/enviar-arquivos?caseId=${activeCase.id}` : undefined,
          continueClara: `/clara?tab=proximos-passos&client=${params.clientId}${activeCase ? `&case=${activeCase.id}` : ""}#clara-workbench`,
          backToClients: "/pessoas/clientes",
          openEditor: activeCase
            ? `/editor-de-texto/meus-textos?draft=1&case=${activeCase.id}&client=${params.clientId}&piece=peticao-inicial`
            : "/editor-de-texto/meus-textos",
          hubClara: "/clara",
          prepareContext: `/clara?tab=proximos-passos&client=${params.clientId}${activeCase ? `&case=${activeCase.id}` : ""}#clara-workbench`
        }}
        activeCase={cockpitFrameActiveCase}
        caseDocuments={caseDocuments}
        generatedDocuments={generatedDocuments}
        client={{
          id: client.id,
          fullName: client.fullName,
          documentId: client.documentId,
          bankName: client.bankName,
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
        relatedClaraRecordsCount={relatedClaraRecords.length}
        workflow={cockpitFrameWorkflow}
      />
    </WorkspacePage>
  );
}
