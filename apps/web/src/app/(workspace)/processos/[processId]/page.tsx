import { notFound } from "next/navigation";
import { WorkspaceStatePanel } from "@lexia/ui";
import { getBankingNicheLabel } from "@lexia/domain";

import { ClaraContextActions } from "@/components/layout/clara-context-actions";
import { ProcessCockpitFrame } from "@/components/layout/process-cockpit-frame";
import { WorkspacePage } from "@/components/layout/workspace-page";
import {
  getClaraRecord,
  getClaraRecordDisplay,
  listClaraRecords
} from "@/server/services/clara/clara-record-store";
import { getClaraProcessArtifact } from "@/server/services/clara/get-clara-artifacts";
import { getProcessById } from "@/server/services/processes/get-processes";
import { getProceduralUpdatesByProcessId } from "@/server/services/procedural-updates/get-procedural-updates";

function statusLabel(status: string) {
  switch (status) {
    case "monitoring":
      return "Em monitoramento";
    case "awaiting-filing":
      return "Aguardando protocolo";
    case "active":
      return "Ativo";
    case "stayed":
      return "Suspenso";
    default:
      return "Encerrado";
  }
}

function monitoringModeLabel(mode: string) {
  switch (mode) {
    case "oab":
      return "Monitoramento por OAB";
    case "court":
      return "Monitoramento por tribunal";
    default:
      return "Monitoramento manual";
  }
}

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

export default async function ProcessDetailPage({
  params,
  searchParams
}: {
  params: { processId: string };
  searchParams?: {
    clara?: string;
    record?: string;
    action?: string;
    document?: string;
    client?: string;
    case_context?: string;
  };
}) {
  let processItem = null;

  try {
    processItem = await getProcessById(params.processId);
  } catch {
    return (
      <WorkspacePage
        description="Nao foi possivel abrir o detalhe do processo na base real."
        eyebrow="Processo Judicial"
        metrics={[
          { label: "Estado", value: "Indisponivel" },
          { label: "Fonte", value: "Supabase" },
          { label: "Tenant", value: "Nao resolvido" },
          { label: "Acao", value: "Validar vertical" }
        ]}
        title="Detalhe indisponivel"
      >
        <WorkspaceStatePanel
          actionHref="/processos"
          actionLabel="Voltar para processos"
          description="Valide a configuracao do Supabase, as migrations da vertical de processos e a seed do tenant ativo."
          title="Falha ao carregar processo"
          tone="danger"
        />
      </WorkspacePage>
    );
  }

  if (!processItem) {
    notFound();
  }

  const linkedUpdates = await getProceduralUpdatesByProcessId(params.processId);
  const claraRecord = await getClaraRecord(searchParams?.record);
  const relatedClaraRecords = (await listClaraRecords(80)).filter((record) => {
    if (record.kind !== "process") {
      return false;
    }

    const payload = record.payload as Awaited<ReturnType<typeof getClaraProcessArtifact>>;
    return payload.processLabel === processItem.processNumber;
  });

  const claraArtifact =
    claraRecord?.kind === "process"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraProcessArtifact>>)
      : searchParams?.clara
        ? await getClaraProcessArtifact(
            params.processId,
            searchParams.client,
            searchParams.document,
            false
          )
        : null;

  const claraDisplay = claraArtifact
    ? getClaraRecordDisplay(claraRecord, "Analise carregada nesta tela", claraArtifact.summary)
    : null;

  const claraHistoryItems = relatedClaraRecords.slice(0, 5).map((record) => {
    const display = getClaraRecordDisplay(record, "Analise registrada pela Clara", "Sem resumo adicional.");
    return {
      id: record.id,
      title: display.title,
      detail: display.detail,
      workflowStatusLabel: workflowStatusLabel(record.workflowStatus)
    };
  });

  return (
    <div className="space-y-6">
      <ProcessCockpitFrame
        actionLinks={{
          continueClara: `/clara?tab=analise&process=${params.processId}&client=${processItem.client.id}#clara-workbench`,
          backToProcesses: "/processos",
          openClaraHistory: `/clara?tab=analise&process=${params.processId}&client=${processItem.client.id}#clara-history`,
          openDataJud: `/api/processos/${encodeURIComponent(processItem.processNumber)}/datajud`,
          openOabMonitoring: `/processos/importar-oab?process=${encodeURIComponent(processItem.id)}`
        }}
        dataJudLabel="Consultar DataJud"
        bankingCase={{
          amountInDispute: processItem.bankingCase.amountInDispute,
          bankName: processItem.bankingCase.bankName,
          checklistCompletionLabel: processItem.bankingCase.checklistState.completionLabel,
          checklistItems: processItem.bankingCase.checklistState.items,
          claimType: processItem.bankingCase.claimType,
          estimatedValue: processItem.bankingCase.estimatedValue,
          legalRiskLabel:
            processItem.bankingCase.legalRisk === "low"
              ? "Baixa"
              : processItem.bankingCase.legalRisk === "medium"
                ? "Media"
                : "Alta",
          linkedDeadlines: processItem.bankingCase.linkedDeadlines,
          linkedDocuments: processItem.bankingCase.linkedDocuments,
          missingDocuments: processItem.bankingCase.checklistState.missingDocuments,
          linkedTasks: processItem.bankingCase.linkedTasks,
          lexiaInsights: processItem.bankingCase.lexiaInsights,
          mainThesis: processItem.bankingCase.mainThesis,
          nicheLabel: getBankingNicheLabel(processItem.bankingCase.niche),
          ownerLabel: processItem.bankingCase.ownerLabel,
          requiredDocuments: processItem.bankingCase.checklistState.requiredDocuments,
          stage: processItem.bankingCase.stage,
          status: processItem.bankingCase.status,
          suggestedStrategy: processItem.bankingCase.suggestedStrategy,
          title: processItem.bankingCase.title,
          workflowCompletionLabel: processItem.bankingCase.workflowState.completionLabel,
          workflowCurrentStep:
            processItem.bankingCase.workflowState.steps.find((step) => step.state === "current")?.title ??
            processItem.bankingCase.workflowState.nextStep,
          workflowPhaseLabel: processItem.bankingCase.workflowState.phaseLabel,
          workflowReadiness: processItem.bankingCase.workflowState.readiness ?? [],
          workflowSteps: processItem.bankingCase.workflowState.steps
        }}
        claraHistoryItems={claraHistoryItems}
        claraSummary={
          claraArtifact
            ? {
                title: claraDisplay?.title ?? "Resumo ativo da Clara para este processo",
                detail: claraDisplay?.detail ?? claraArtifact.summary,
                footer: `Status ${claraArtifact.statusLabel} | Etapa ${claraArtifact.stageLabel} | Registro ${claraArtifact.recordId}`
              }
            : null
        }
        latestTimeline={processItem.latestTimeline}
        linkedUpdates={linkedUpdates}
        process={{
          clientName: processItem.client.fullName,
          courtDistrict: processItem.courtDistrict,
          courtName: processItem.courtName,
          id: processItem.id,
          monitoringModeLabel: monitoringModeLabel(processItem.monitoringMode),
          proceduralPhase: processItem.proceduralPhase,
          processNumber: processItem.processNumber,
          responsibleLawyer: processItem.responsibleLawyer,
          statusLabel: statusLabel(processItem.status),
          tribunal: processItem.tribunal
        }}
        relatedClaraRecordsCount={relatedClaraRecords.length}
      />

      <ClaraContextActions
        actionHref={`/clara?tab=analise&process=${params.processId}&client=${processItem.client.id}#clara-workbench`}
        basis={[
          processItem.tribunal,
          processItem.proceduralPhase,
          processItem.bankingCase.mainThesis,
          `${processItem.latestTimeline.length} eventos recentes`,
          monitoringModeLabel(processItem.monitoringMode)
        ]}
        cautionLabel="A leitura da Clara organiza impacto e proxima medida, mas a decisao processual continua sob revisao do advogado responsavel."
        conclusion="Este processo ja tem dados suficientes para leitura contextual da Clara sobre risco imediato, proxima medida e pontos que precisam ser reforcados na conducao juridica."
        eyebrow="Fluxo Clara"
        nextActions={[
          "Resumir impacto do ultimo andamento",
          "Priorizar proxima medida juridica",
          "Cruzar processo com estrategia do caso"
        ]}
        title="Continuar este processo dentro da Clara"
      />
    </div>
  );
}
