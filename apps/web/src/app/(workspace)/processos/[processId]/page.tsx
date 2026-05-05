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
      return "Boundary OAB";
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

function distributionStatusLabel(status: string) {
  switch (status) {
    case "awaiting-filing":
      return "Aguardando protocolo interno";
    case "active":
      return "Distribuido e ativo";
    case "monitoring":
      return "Em monitoramento";
    case "stayed":
      return "Distribuido e suspenso";
    default:
      return "Encerrado";
  }
}

function getOfficialSystemLink(tribunal: string) {
  if (tribunal === "TJMG") {
    return {
      href: "https://pje.tjmg.jus.br/pje/",
      label: "Abrir PJe/TJMG"
    };
  }

  return null;
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
  const officialSystemLink = getOfficialSystemLink(processItem.tribunal);
  const distributedProcessNumber =
    processItem.status === "awaiting-filing" ? "Nao distribuido" : processItem.processNumber;

  return (
    <div className="space-y-6">
      <ProcessCockpitFrame
        actionLinks={{
          continueClara: `/clara?tab=analise&process=${params.processId}&client=${processItem.client.id}#clara-workbench`,
          backToProcesses: "/processos",
          openClaraHistory: `/clara?tab=analise&process=${params.processId}&client=${processItem.client.id}#clara-history`,
          openDataJud: `/api/processos/${encodeURIComponent(processItem.processNumber)}/datajud`,
          openOabMonitoring: `/processos/importar-oab?process=${encodeURIComponent(processItem.id)}`,
          openOfficialSystem: officialSystemLink?.href
        }}
        dataJudLabel="Consultar DataJud (CNJ)"
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
          clientDocumentId: processItem.client.documentId,
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
        distributionSummary={{
          actionTypeLabel: actionTypeLabel(processItem.bankingCase.niche),
          adversePartyLabel: processItem.bankingCase.bankName,
          competenceLabel: processItem.courtName,
          distributedProcessNumber,
          distributionDateLabel: distributionDateLabel(processItem.latestTimeline),
          distributionStatusLabel: distributionStatusLabel(processItem.status),
          integrationStatusLabel: officialSystemLink
            ? "Acesso externo oficial disponivel; protocolo automatico nao implementado."
            : "Sem link oficial configurado neste tribunal e sem integracao automatica.",
          officialSystemLabel: officialSystemLink?.label ?? null,
          processClassLabel: suggestedJudicialClass(processItem.bankingCase.niche),
          protocolReceiptLabel: "Nao registrado no workspace",
          suggestedCnjSubjectLabel: suggestedCnjSubject(
            processItem.bankingCase.niche,
            processItem.bankingCase.claimType
          ),
          urgencyLabel: suggestedUrgencyLabel({
            title: processItem.bankingCase.title,
            claimType: processItem.bankingCase.claimType,
            mainThesis: processItem.bankingCase.mainThesis,
            suggestedStrategy: processItem.bankingCase.suggestedStrategy
          }),
          valueInCauseLabel: `R$ ${processItem.bankingCase.estimatedValue.toLocaleString("pt-BR")}`
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
