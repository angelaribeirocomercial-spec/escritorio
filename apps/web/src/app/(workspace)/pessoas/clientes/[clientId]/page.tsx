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
          label: "Petição inicial em PDF",
          detail: `Minuta assistida do caso ${activeCase.title}.`,
          href: `/api/clientes/${client.id}/documentos-gerados/peticao-inicial/pdf?caseId=${activeCase.id}`,
          statusLabel: "Abrir PDF"
        },
        {
          kind: "procuracao" as const,
          label: "Procuração em PDF",
          detail: `Documento de representação vinculado ao caso ${activeCase.processNumber}.`,
          href: `/api/clientes/${client.id}/documentos-gerados/procuracao/pdf?caseId=${activeCase.id}`,
          statusLabel: "Abrir PDF"
        },
        {
          kind: "contrato-honorarios" as const,
          label: "Contrato de honorários em PDF",
          detail: `Acordo de honorários do fluxo ${getBankingNicheLabel(activeCase.niche).toLowerCase()}.`,
          href: `/api/clientes/${client.id}/documentos-gerados/contrato-honorarios/pdf?caseId=${activeCase.id}`,
          statusLabel: "Abrir PDF"
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
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {client.documentId} | {client.bankName} | Origem {client.leadSource}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            O cliente agora abre direto no cockpit do caso, sem depender de leitura cadastral solta.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {activeCase ? (
            <Link
              className="detail-link-button px-4 py-3 text-sm font-semibold"
              href={`/documentos/enviar-arquivos?caseId=${activeCase.id}`}
            >
              Anexar documentos
            </Link>
          ) : null}
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href={`/clara?tab=proximos-passos&client=${params.clientId}${activeCase ? `&case=${activeCase.id}` : ""}#clara-workbench`}
          >
            Continuar na Clara
          </Link>
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href="/pessoas/clientes"
          >
            Voltar para clientes
          </Link>
        </div>
      </div>

      {claraArtifact ? (
        <WorkspaceStatePanel
          actionHref={`/clara?tab=proximos-passos&client=${params.clientId}${activeCase ? `&case=${activeCase.id}` : ""}#clara-history`}
          actionLabel="Ver historico completo na Clara"
          description={`${normalizedClaraSummary?.title}: ${normalizedClaraSummary?.detail}`}
          footer={`Status ${claraArtifact.statusLabel} | Etapa ${claraArtifact.stageLabel} | Registro ${claraArtifact.recordId}`}
          title="Resumo ativo da Clara para este cliente"
          tone="warning"
        />
      ) : null}

      {searchParams?.onboarding === "1" && activeCase ? (
        <WorkspaceStatePanel
          actionHref={`/pessoas/clientes/${params.clientId}?case=${activeCase.id}`}
          actionLabel="Abrir cockpit do caso"
          description="O onboarding concluiu cliente, caso, documentos essenciais, checklist inicial e tarefas minimas. Este cockpit passa a ser a superficie padrao para continuar a operacao."
          title="Atendimento bancario iniciado com sucesso"
          tone="warning"
        />
      ) : null}

      {searchParams?.uploaded === "1" && activeCase ? (
        <WorkspaceStatePanel
          actionHref={`/pessoas/clientes/${params.clientId}?case=${activeCase.id}`}
          actionLabel="Voltar ao cockpit"
          description="O documento foi vinculado ao caso ativo e o retorno do fluxo documental permanece neste cockpit, com checklist e workflow atualizados."
          title="Documento enviado com sucesso"
          tone="warning"
        />
      ) : null}

      {activeCase ? (
        <section className="detail-panel-accent p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-white">Cockpit inicial do caso</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{activeCase.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Nicho {getBankingNicheLabel(activeCase.niche).toLowerCase()}, fase atual{" "}
                {workflow?.phaseLabel ?? activeCase.stage.toLowerCase()} e proximo passo operacional
                centralizados na area do cliente.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[25rem]">
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Fase atual:{" "}
                <span className="font-semibold text-white">{workflow?.phaseLabel ?? activeCase.stage}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Status do caso: <span className="font-semibold text-white">{activeCase.status}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Risco juridico: <span className="font-semibold text-white">{legalRiskLabel(activeCase.legalRisk)}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Base documental:{" "}
                <span className="font-semibold text-white">{workflow?.completionLabel ?? `${receivedDocuments} arquivo(s)`}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="detail-subpanel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Resumo do caso
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-200">{activeCase.mainThesis}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{activeCase.suggestedStrategy}</p>
            </div>

            <div className="detail-subpanel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Proximo passo recomendado
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-200">{nextStepLabel}</p>
              {nextTask ? (
                <div className="detail-soft-row mt-4 px-4 py-4 text-sm text-slate-300">
                  Tarefa aberta: <span className="font-semibold text-white">{nextTask.title}</span>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : (
        <WorkspaceStatePanel
          actionHref="/novo-atendimento-bancario"
          actionLabel="Abrir novo atendimento bancario"
          description="Ainda nao existe caso ativo para este cliente. O cockpit passa a fazer sentido depois que o onboarding cria cliente, caso, nicho e documentos iniciais."
          title="Cliente sem caso ativo"
          tone="warning"
        />
      )}

      {clientCases.length > 1 ? (
        <section className="detail-panel p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Casos deste cliente</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                O cockpit usa um caso ativo por vez. Troque de contexto sem sair da area do cliente.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {clientCases.map((caseItem) => {
              const isActive = activeCase?.id === caseItem.id;

              return (
                <Link
                  key={caseItem.id}
                  className={`detail-soft-row block px-4 py-4 text-sm transition ${
                    isActive ? "border-cyan-300/20 bg-cyan-300/10" : "hover:bg-white/[0.07]"
                  }`}
                  href={`/pessoas/clientes/${params.clientId}?case=${caseItem.id}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{caseItem.title}</p>
                    <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      {isActive ? "Ativo" : caseItem.status}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-300">{getBankingNicheLabel(caseItem.niche)}</p>
                  <p className="mt-2 text-slate-400">{caseItem.stage}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeCase && workflow ? (
        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="detail-panel p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Workflow do caso</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  O nicho selecionado ja aparece como trilha operacional dentro do cockpit, sem criar uma tela paralela de workflow.
                </p>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                {workflow.phaseLabel}
              </span>
            </div>

            <div className="mt-5 grid gap-3">
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
                      {step.state === "done"
                        ? "Concluida"
                        : step.state === "current"
                          ? "Atual"
                          : "Pendente"}
                    </span>
                  </div>
                  <p className="mt-3 leading-6">{step.detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="detail-panel p-6">
            <p className="text-sm font-semibold text-white">Checklist documental</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              O cockpit mostra o que ja entrou no caso e o que ainda bloqueia a proxima etapa juridica.
            </p>

            <div className="detail-subpanel mt-5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Base documental do caso
              </p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-200">
                {checklistItems.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${item.missing ? "bg-amber-300" : "bg-emerald-300"}`}
                    />
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Recebidos: <span className="font-semibold text-white">{receivedDocuments}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Pendentes:{" "}
                <span className="font-semibold text-white">{workflow.missingDocuments.length}</span>
              </div>
            </div>

            <div className="detail-subpanel mt-4 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Bloqueios atuais do workflow
              </p>
              {workflow.blockers.length ? (
                <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-200">
                  {workflow.blockers.map((blocker) => (
                    <li key={blocker} className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-300" />
                      <span>{blocker}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-6 text-emerald-100">
                  Nenhum bloqueio documental imediato. O caso pode seguir para a proxima leitura juridica.
                </p>
              )}
            </div>

            {caseDocuments.length ? (
              <div className="mt-4 grid gap-3">
                {caseDocuments.slice(0, 4).map((document) => (
                  <div key={document.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    <p className="font-semibold text-white">{document.documentType}</p>
                    <p className="mt-1 text-slate-400">{document.fileName}</p>
                    <p className="mt-2">{document.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="detail-soft-row mt-4 px-4 py-4 text-sm text-slate-400">
                Nenhum documento foi vinculado ao caso ativo ainda.
              </div>
            )}
          </article>
        </section>
      ) : null}

      {activeCase && workflow?.readiness.length ? (
        <section className="detail-panel p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Prontidao juridica inicial</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Esta leitura prepara a proxima fase da Clara e deixa explicito quando o caso ja pode abrir leitura contratual, parecer tecnico e minuta sem suposicoes.
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
              Contrato estrutural para Clara
            </span>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {workflow.readiness.map((item) => (
              <div
                key={item.id}
                className={`rounded-[4px] border px-4 py-4 text-sm ${
                  item.state === "ready"
                    ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-50"
                    : "border-amber-300/20 bg-amber-300/10 text-amber-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.label}</p>
                  <span className="text-[11px] uppercase tracking-[0.16em]">
                    {item.state === "ready" ? "Apta" : "Bloqueada"}
                  </span>
                </div>
                <p className="mt-3 leading-6">{item.detail}</p>
                {item.blockers.length ? (
                  <ul className="mt-3 space-y-2 text-xs leading-5 opacity-90">
                    {item.blockers.map((blocker) => (
                      <li key={blocker}>- {blocker}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Documentos, workflow e Clara no mesmo contexto</p>
          <div className="mt-5 grid gap-3">
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Documentos: <span className="font-semibold text-white">Disponivel agora</span>
              <p className="mt-2 text-slate-400">
                Upload e checklist retornam ao cockpit do cliente e atualizam o caso ativo.
              </p>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Workflow: <span className="font-semibold text-white">Disponivel agora</span>
              <p className="mt-2 text-slate-400">
                Fase atual e proximo passo ficam visiveis no proprio cliente.
              </p>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Clara contextual: <span className="font-semibold text-white">Preparada nesta fase</span>
              <p className="mt-2 text-slate-400">
                A Clara ja recebe contexto do cliente/caso e o historico fica acessivel sem prometer automacao ainda nao entregue.
              </p>
            </div>
          </div>
        </article>

        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Fases seguintes do cockpit</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Estas areas ficam explicitas desde agora, mas sem criar a impressao de que ja estao completas.
          </p>
          <div className="mt-5 grid gap-3">
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Pecas
              <p className="mt-2 text-slate-400">
                Entram quando o pipeline juridico de minutas e revisao humana for instalado.
              </p>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Processo
              <p className="mt-2 text-slate-400">
                Ganha detalhamento completo depois da distribuicao e do vinculo processual real.
              </p>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Andamentos e Diario Oficial
              <p className="mt-2 text-slate-400">
                Passam a aparecer aqui quando houver correlacao processual automatizada por caso.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Contexto operacional do cliente</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Contato</dt>
              <dd className="mt-1 text-slate-200">
                {client.email}
                <br />
                {client.phone}
                <br />
                WhatsApp {client.whatsapp}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Endereco</dt>
              <dd className="mt-1 text-slate-200">{client.address}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Status do atendimento</dt>
              <dd className="mt-1 text-slate-200">{serviceStatusLabel(client.serviceStatus)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Notas internas</dt>
              <dd className="mt-1 text-slate-200">{client.notes}</dd>
            </div>
          </dl>
        </article>

        <article className="detail-panel-accent p-6">
          <p className="text-sm font-semibold text-white">Clara contextual</p>
          <div className="detail-subpanel mt-5 p-5">
            <p className="text-sm leading-7 text-slate-200">{normalizedClientIaContext}</p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Registros da Clara: <span className="font-semibold text-white">{relatedClaraRecords.length}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Insights do caso: <span className="font-semibold text-white">{normalizedCaseInsights.length}</span>
            </div>
          </div>

          {normalizedCaseInsights.length ? (
            <div className="mt-4 grid gap-3">
              {normalizedCaseInsights.slice(0, 3).map((insight) => (
                <div key={insight} className="detail-soft-row px-4 py-4 text-sm leading-6 text-slate-200">
                  {insight}
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="detail-panel p-6 lg:col-span-2">
          <p className="text-sm font-semibold text-white">Historico da Clara neste cliente</p>
          <div className="mt-5 grid gap-3">
            {relatedClaraRecords.length ? (
              relatedClaraRecords.slice(0, 6).map((record) => {
                const display = getClaraRecordDisplay(
                  record,
                  "Resumo de relacionamento registrado",
                  "Sem resumo adicional."
                );

                return (
                  <Link
                    key={record.id}
                    className="detail-soft-row block px-4 py-4 text-sm text-slate-300"
                    href={`/pessoas/clientes/${params.clientId}?record=${record.id}${activeCase ? `&case=${activeCase.id}` : ""}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="rounded-full border border-white/10 px-2 py-1 text-slate-300">
                        {workflowStatusLabel(record.workflowStatus)}
                      </span>
                      <span>{record.id}</span>
                    </div>
                    <p className="mt-3 font-semibold text-white">{display.title}</p>
                    <p className="mt-2 leading-6 text-slate-300">{display.detail}</p>
                  </Link>
                );
              })
            ) : (
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">
                Nenhum registro da Clara foi persistido neste cliente ainda.
              </div>
            )}
          </div>
        </article>

        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Disponivel agora</p>
          <ul className="mt-5 space-y-3">
            {availableNow.map((item) => (
              <li key={item} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm font-semibold text-white">Depende de proximas fases</p>
          <ul className="mt-4 space-y-3">
            {comingNext.map((item) => (
              <li key={item} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="detail-panel p-6">
        <p className="text-sm font-semibold text-white">Timeline de atendimento</p>
        <ol className="mt-5 space-y-3">
          {normalizedTimeline.map((entry, index) => (
            <li
              key={entry}
              className="detail-soft-row flex gap-4 px-4 py-4 text-sm text-slate-300"
            >
              <span className="detail-step-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                {index + 1}
              </span>
              <span>{entry}</span>
            </li>
          ))}
        </ol>
      </section>

      <ClaraContextActions
        actionHref={`/clara?tab=proximos-passos&client=${params.clientId}${activeCase ? `&case=${activeCase.id}` : ""}#clara-workbench`}
        basis={[
          serviceStatusLabel(client.serviceStatus),
          client.bankName,
          workflow?.completionLabel ?? `${client.documentsSent} documentos`,
          activeCase ? getBankingNicheLabel(activeCase.niche) : "Sem caso ativo"
        ]}
        cautionLabel="As orientacoes da Clara seguem dependentes de revisao humana e nao substituem validacao juridica."
        conclusion="O melhor uso da Clara neste ponto e fechar pendencias do caso ativo, reforcar a leitura do nicho e transformar isso em proxima acao objetiva do escritorio."
        eyebrow="Fluxo Clara"
        nextActions={[
          "Listar documentos faltantes do caso ativo",
          "Consolidar o proximo passo do workflow",
          "Preparar contexto para a fase juridica seguinte"
        ]}
        title="Continuar este cliente dentro da Clara"
      />
      </ClientCockpitFrame>
    </WorkspacePage>
  );
}
