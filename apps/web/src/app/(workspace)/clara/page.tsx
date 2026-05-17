import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import { ClaraConversationCard } from "@/components/layout/clara-conversation-card";
import { ClaraLandingHero } from "@/components/layout/clara-landing-hero";
import { WorkspacePage } from "@/components/layout/workspace-page";
import {
  commitClaraExecutionAction,
  updateClaraRecordContentAction,
  updateClaraReviewNoteAction,
  updateClaraWorkflowStatusAction
} from "@/app/(workspace)/clara/actions";
import {
  buildClaraStructuredResponse,
  getClaraLegalModeByTab
} from "@/server/services/clara/clara-legal-modes";
import { buildClaraConsultationLog } from "@/server/services/clara/clara-consultation-log";
import { listClaraRecords } from "@/server/services/clara/clara-record-store";
import type { ClaraRecord } from "@/server/services/clara/clara-record-types";
import {
  getClaraAgendaArtifact,
  getClaraCaseArtifact,
  getClaraClientArtifact,
  getClaraComparisonArtifact,
  getClaraDeadlineArtifact,
  getClaraProcessArtifact,
  getClaraRevisionalFilingPackageArtifact,
  getClaraTaskArtifact,
  getClaraTextDraftArtifact
} from "@/server/services/clara/get-clara-artifacts";
import {
  getClaraContextualAnalysis,
  type ClaraContextualTaskType
} from "@/server/services/clara/get-clara-contextual-analysis";
import { getClaraIntimationAnalysis } from "@/server/services/clara/get-clara-intimation-analysis";
import { getBankingRevisionalWorkspace } from "@/server/services/clara/get-banking-revisional-workspace";
import { getClaraStructuredCore } from "@/server/services/clara/get-clara-structured-core";
import { getClaraWorkspace } from "@/server/services/clara/get-clara-workspace";
import { getJurisprudenceConsultation } from "@/server/services/jurisprudence/get-jurisprudence-consultation";
import type { JudicialProcessWithRelations } from "@/server/services/processes/get-processes";
import type { TaskWithContext } from "@/server/services/tasks/get-tasks";

const tabItems = [
  { id: "analise", label: "Triagem" },
  { id: "intimacao", label: "Intimacao" },
  { id: "pecas", label: "Peca" },
  { id: "jurisprudencia", label: "Jurisprudencia" },
  { id: "checklist", label: "Acompanhamento" },
  { id: "proximos-passos", label: "Estrategia" },
  { id: "comparador", label: "Revisao" }
] as const;

const nicheItems = [
  {
    id: "revisional",
    label: "Revisional de contratos",
    description:
      "Leitura contratual, abusividades, memoria de calculo, minuta assistida e pacote de ajuizamento."
  },
  {
    id: "fraude",
    label: "Fraude bancaria",
    description:
      "Descontos indevidos, contratacao nao autorizada, cartao consignado / RMC, beneficio previdenciario e resposta humana guiada."
  },
  {
    id: "busca-apreensao",
    label: "Busca e apreensao",
    description:
      "Preservacao do veiculo, mora controvertida, defesa urgente e resposta formal alinhada."
  }
] as const;

type TabId = (typeof tabItems)[number]["id"];
type NicheId = (typeof nicheItems)[number]["id"] | "cartao-consignado" | "beneficio-descontos";

type SearchParams = {
  tab?: string;
  niche?: string;
  q?: string;
  client?: string;
  process?: string;
  case?: string;
  document?: string;
  document2?: string;
  task?: string;
  mode?: string;
  objetivo?: string;
  action?: string;
  record?: string;
  financedAmount?: string;
  installmentCount?: string;
  contractedInstallment?: string;
  chargedInstallment?: string;
  targetReductionPercent?: string;
  history_q?: string;
  history_kind?: string;
  selected_record?: string;
};

function isTabId(value: string | undefined): value is TabId {
  return tabItems.some((item) => item.id === value);
}

function isNicheId(value: string | undefined): value is NicheId {
  return nicheItems.some((item) => item.id === value) || value === "cartao-consignado" || value === "beneficio-descontos";
}

function hasOptions(field: { type: string; options?: string[] }): field is { type: string; options: string[] } {
  return Array.isArray(field.options);
}

function getContextualTaskType(tab: TabId): ClaraContextualTaskType {
  switch (tab) {
    case "intimacao":
      return "analisar-intimacao";
    case "pecas":
      return "gerar-peca";
    case "jurisprudencia":
      return "consultar-jurisprudencia";
    case "checklist":
      return "acompanhar-processo";
    case "comparador":
      return "revisar-minuta";
    case "proximos-passos":
      return "sugerir-proximos-passos";
    default:
      return "analisar-caso";
  }
}

function getCustomFieldName(tab: TabId | "revisional", label: string) {
  if (tab === "revisional" && label === "Objetivo") return "objetivo";
  if (tab === "comparador" && label === "Comparar por") return "mode";
  if (tab === "pecas" && label === "Tipo de peca") return "mode";
  if (tab === "checklist" && label === "Prioridade") return "mode";
  if (tab === "proximos-passos" && label === "Janela") return "mode";

  return label.toLowerCase().replace(/\s+/g, "-");
}

function formatClaraContextualTaskType(taskType: ClaraContextualTaskType) {
  switch (taskType) {
    case "analisar-caso":
      return "Analisar caso";
    case "checklist-documental":
      return "Checklist documental";
    case "sugerir-proximos-passos":
      return "Proximos passos";
    case "parecer-tecnico":
      return "Parecer tecnico";
    case "analisar-intimacao":
      return "Analisar intimacao";
    case "gerar-peca":
      return "Gerar peca";
    case "consultar-jurisprudencia":
      return "Jurisprudencia";
    case "acompanhar-processo":
      return "Acompanhar processo";
    case "revisar-minuta":
      return "Revisar minuta";
    default:
      return taskType;
  }
}

function renderClaraContextualAnalysis(
  contextualAnalysis: Awaited<ReturnType<typeof getClaraContextualAnalysis>> | null
) {
  if (!contextualAnalysis) {
    return null;
  }

  return (
    <section className="detail-panel-accent workspace-panel p-6" id="clara-contextual-minima">
      <div className="rounded-[4px] border border-cyan-300/20 bg-cyan-300/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              Resumo contextual do caso
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              Execucao {contextualAnalysis.executionId}
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-cyan-50">
            {formatClaraContextualTaskType(contextualAnalysis.taskType)}
          </span>
        </div>
        <p className="mt-3 text-sm leading-7 text-cyan-50">{contextualAnalysis.summary}</p>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-[4px] border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Context Snapshot
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>clientId: {contextualAnalysis.contextSnapshot.clientId}</li>
              <li>caseId: {contextualAnalysis.contextSnapshot.caseId}</li>
              <li>processId: {contextualAnalysis.contextSnapshot.processId}</li>
              <li>documentId: {contextualAnalysis.contextSnapshot.documentId}</li>
              <li>workflowStep: {contextualAnalysis.contextSnapshot.workflowStep}</li>
            </ul>
          </div>

          <div className="rounded-[4px] border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Source Trace
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>origem_interna: {contextualAnalysis.sourceTrace.origem_interna.length}</li>
              <li>origem_documental: {contextualAnalysis.sourceTrace.origem_documental.length}</li>
              <li>origem_api: {contextualAnalysis.sourceTrace.origem_api.length}</li>
              <li>inferencia_controlada: {contextualAnalysis.sourceTrace.inferencia_controlada.length}</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="rounded-[4px] border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Fatos confirmados
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {contextualAnalysis.caseAnalysis.confirmedFacts.slice(0, 4).map((fact) => (
                <li key={fact}>- {fact}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[4px] border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Checklist documental
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {contextualAnalysis.caseAnalysis.documentsFound.slice(0, 3).map((document) => (
                <li key={document.id}>- {document.label}</li>
              ))}
              {contextualAnalysis.caseAnalysis.documentsMissing.slice(0, 3).map((document) => (
                <li key={document}>- Faltante: {document}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[4px] border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Riscos e sugestoes
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {contextualAnalysis.caseAnalysis.risks.slice(0, 2).map((risk) => (
                <li key={risk}>- {risk}</li>
              ))}
              {contextualAnalysis.caseAnalysis.suggestions.slice(0, 2).map((suggestion) => (
                <li key={suggestion}>- {suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function buildFallbackClaraContextualAnalysis(params: {
  clientId: string;
  caseId: string;
  processId?: string;
  documentId?: string;
  taskType: ClaraContextualTaskType;
}) {
  return {
    executionId: `clara-exec-fallback-${Date.now()}`,
    taskType: params.taskType,
    contextSnapshot: {
      clientId: params.clientId,
      caseId: params.caseId,
      processId: params.processId ?? null,
      documentId: params.documentId ?? null,
      niche: "contexto-controlado",
      stage: "estado-controlado",
      workflowStep: "resolucao-minima"
    },
    sourceTrace: {
      origem_interna: [
        `Cliente resolvido pela rota: ${params.clientId}`,
        `Caso resolvido pela rota: ${params.caseId}`
      ],
      origem_documental: params.documentId ? [`Documento informado: ${params.documentId}`] : [],
      origem_api: [],
      inferencia_controlada: [
        "Fallback controlado ativado porque a resolucao server-side nao conseguiu fechar o workspace completo.",
        "A Clara continua observavel com contexto minimo resolvido pela rota."
      ]
    },
    summary:
      "Clara em estado controlado com cliente e caso resolvidos pela rota, aguardando a resolucao completa do workspace para aprofundar a analise.",
    caseAnalysis: {
      confirmedFacts: [
        `clientId: ${params.clientId}`,
        `caseId: ${params.caseId}`,
        `taskType: ${params.taskType}`
      ],
      documentsFound: params.documentId
        ? [
            {
              id: params.documentId,
              label: "Documento informado na rota",
              detail: `Documento vinculado via query string: ${params.documentId}`
            }
          ]
        : [],
      documentsMissing: [
        "Documento base ainda nao vinculado",
        "Processo ainda nao vinculado ao contexto minimo"
      ],
      risks: [
        "Workspace completo indisponivel; seguir pelo cockpit do cliente ate a resolucao final.",
        "A Clara opera em modo controlado ate o processo e o documento entrarem no caso."
      ],
      suggestions: [
        "Continuar a conversa contextual pela aba Clara do dossie.",
        "Anexar documentos do caso antes de abrir a saida formal."
      ]
    }
  };
}

function buildStructuredCoreFallbackContextualAnalysis(params: {
  structuredCore: Awaited<ReturnType<typeof getClaraStructuredCore>>;
  taskType: ClaraContextualTaskType;
}) {
  const { structuredCore, taskType } = params;

  return {
    executionId: `clara-exec-fallback-${Date.now()}`,
    taskType,
    contextSnapshot: {
      clientId: structuredCore.context.client.id,
      caseId: structuredCore.context.bankingCase.id,
      processId: structuredCore.context.process?.id ?? null,
      documentId: structuredCore.context.selectedDocument?.id ?? null,
      niche: structuredCore.classification.nicheLabel,
      stage: structuredCore.context.bankingCase.stage,
      workflowStep: structuredCore.context.bankingCase.workflowState.currentStepId
    },
    sourceTrace: structuredCore.classification.sourceTrail,
    summary: structuredCore.summary,
    caseAnalysis: {
      confirmedFacts: structuredCore.confirmedFacts,
      documentsFound: structuredCore.documentsFound,
      documentsMissing: structuredCore.documentsMissing,
      risks: structuredCore.risks,
      suggestions: [
        structuredCore.nextStep,
        structuredCore.recommendation,
        ...structuredCore.checklist.slice(0, 2)
      ]
    }
  };
}

function buildControlledModeConversationHref(params: {
  clientId: string;
  caseId: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("case", params.caseId);
  searchParams.set("panel", "clara");

  return `/pessoas/clientes/${params.clientId}?${searchParams.toString()}#client-dossier-tab-trigger-clara`;
}

function renderControlledModeConversationGuide(params: {
  clientId: string;
  caseId: string;
  clientName?: string;
  caseTitle?: string;
}) {
  return (
    <section className="workspace-panel p-6">
      <div className="rounded-[4px] border border-cyan-300/20 bg-cyan-300/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          Conversa do caso
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">
          Esta tela mostra o estado tecnico/controlado da Clara
        </h2>
        <p className="mt-3 text-sm leading-7 text-cyan-50">
          Use esta pagina para validar o contexto minimo preservado e o resumo tecnico do caso. A
          conversa operacional acontece na aba <strong>Clara</strong> do dossie de
          {params.clientName ? ` ${params.clientName}` : " cliente"}
          {params.caseTitle ? `, no caso ${params.caseTitle}` : ""}.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            className="inline-flex rounded-[4px] bg-[linear-gradient(90deg,#22c55e,#4ade80)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft"
            href={buildControlledModeConversationHref({
              clientId: params.clientId,
              caseId: params.caseId
            })}
          >
            Continuar conversa no dossie
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function ClaraPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const activeNiche = isNicheId(searchParams?.niche)
    ? searchParams.niche
    : searchParams?.tab
      ? "revisional"
      : null;
  const activeTab = isTabId(searchParams?.tab) ? searchParams.tab : "analise";

  if (activeNiche && (!searchParams?.client || !searchParams?.case)) {
    return (
      <WorkspacePage
        description="A Clara contextual minima agora exige cliente e caso resolvidos antes de executar qualquer analise."
        eyebrow="Clara"
        metrics={[
          { label: "Contexto", value: "Obrigatorio" },
          { label: "clientId", value: searchParams?.client ? "OK" : "Pendente" },
          { label: "caseId", value: searchParams?.case ? "OK" : "Pendente" },
          { label: "Modo", value: activeTab }
        ]}
        title="Contexto minimo obrigatorio"
      >
        <WorkspaceStatePanel
          actionHref="/pessoas/clientes"
          actionLabel="Abrir cockpit do cliente"
          description="Abra a Clara a partir do cockpit do cliente ou de um caso real. Sem clientId e caseId resolvidos, a Clara nao executa analise, checklist nem proximos passos."
          title="Clara protegida contra contexto incompleto"
          tone="warning"
        />
      </WorkspacePage>
    );
  }

  let clara: Awaited<ReturnType<typeof getClaraWorkspace>>;
  let recentRecords: Awaited<ReturnType<typeof listClaraRecords>>;
  let revisionalWorkspace: Awaited<ReturnType<typeof getBankingRevisionalWorkspace>> | null;
  let contextualAnalysis: Awaited<ReturnType<typeof getClaraContextualAnalysis>> | null;
  let intimationAnalysis: Awaited<ReturnType<typeof getClaraIntimationAnalysis>> | null = null;
  let jurisprudenceConsultation: Awaited<ReturnType<typeof getJurisprudenceConsultation>> | null = null;
  let hasResolvedProcess = false;
  let hasResolvedDocument = false;
  const contextualTaskType = getContextualTaskType(activeTab);

  try {
    contextualAnalysis =
      activeNiche && searchParams?.client && searchParams?.case
        ? await getClaraContextualAnalysis({
            clientId: searchParams.client,
            caseId: searchParams.case,
            processId: searchParams?.process,
            documentId: searchParams?.document,
            taskType: contextualTaskType
          })
        : null;
  } catch {
    contextualAnalysis = null;
  }

  try {
    clara = await getClaraWorkspace({
      clientId: searchParams?.client,
      caseId: searchParams?.case,
      processId: searchParams?.process,
      documentId: searchParams?.document,
      documentId2: searchParams?.document2,
      niche: activeNiche ?? undefined,
      tab: activeTab,
      objective: searchParams?.objetivo
    });
    recentRecords = await listClaraRecords(24);
    hasResolvedProcess = Boolean(clara.structuredCore.context.process);
    hasResolvedDocument = Boolean(clara.structuredCore.context.selectedDocument);
    revisionalWorkspace =
      activeNiche === "revisional" && hasResolvedProcess && hasResolvedDocument
        ? await getBankingRevisionalWorkspace({
            clientId: searchParams?.client,
            documentId: searchParams?.document,
            processId: searchParams?.process,
            objective: searchParams?.objetivo,
            financedAmount: searchParams?.financedAmount,
            installmentCount: searchParams?.installmentCount,
            contractedInstallment: searchParams?.contractedInstallment,
            chargedInstallment: searchParams?.chargedInstallment,
            targetReductionPercent: searchParams?.targetReductionPercent
          })
        : null;
    if (activeTab === "intimacao") {
      intimationAnalysis = await getClaraIntimationAnalysis({
        clientId: searchParams?.client ?? clara.structuredCore.context.client.id,
        caseId: searchParams?.case ?? clara.structuredCore.context.bankingCase.id,
        processId: searchParams?.process ?? clara.structuredCore.context.process?.id,
        documentId: searchParams?.document ?? clara.structuredCore.context.selectedDocument?.id
      }).catch(() => null);
    }
    if (activeTab === "jurisprudencia") {
      jurisprudenceConsultation = await getJurisprudenceConsultation(
        "stj",
        `${clara.structuredCore.context.bankingCase.title} ${clara.structuredCore.context.bankingCase.mainThesis}`
      ).catch(() => null);
    }
  } catch {
    const structuredCoreFallback = await getClaraStructuredCore({
      clientId: searchParams?.client,
      caseId: searchParams?.case,
      processId: searchParams?.process,
      documentId: searchParams?.document,
      niche: activeNiche ?? undefined,
      tab: activeTab
    }).catch(() => null);

    if (structuredCoreFallback) {
      const fallbackStructuredAnalysis = buildStructuredCoreFallbackContextualAnalysis({
        structuredCore: structuredCoreFallback,
        taskType: contextualTaskType
      });
      return (
        <WorkspacePage
          description="A Clara nao fechou o workspace completo, mas manteve cliente e caso resolvidos com seguranca."
          eyebrow="Clara"
          metrics={[
            { label: "Cliente", value: structuredCoreFallback.context.client.fullName },
            { label: "Caso", value: structuredCoreFallback.context.bankingCase.title },
            { label: "Processo", value: structuredCoreFallback.context.process?.processNumber ?? "Pendente" },
            {
              label: "Documento",
              value: structuredCoreFallback.context.selectedDocument?.fileName ?? "Pendente"
            }
          ]}
          title="Clara em estado controlado"
        >
          {renderControlledModeConversationGuide({
            clientId: structuredCoreFallback.context.client.id,
            caseId: structuredCoreFallback.context.bankingCase.id,
            clientName: structuredCoreFallback.context.client.fullName,
            caseTitle: structuredCoreFallback.context.bankingCase.title
          })}

          {renderClaraContextualAnalysis(fallbackStructuredAnalysis)}
        </WorkspacePage>
      );
    }

    const fallbackContextualAnalysis =
      contextualAnalysis ??
      (searchParams?.client && searchParams?.case
        ? buildFallbackClaraContextualAnalysis({
            clientId: searchParams.client,
            caseId: searchParams.case,
            processId: searchParams?.process,
            documentId: searchParams?.document,
            taskType: contextualTaskType
          })
        : null);

    if (fallbackContextualAnalysis) {
      return (
        <WorkspacePage
          description="A Clara contextual minima resolveu cliente e caso, mas o workspace completo nao abriu. O bloco contextual segue visivel para manter o fluxo rastreavel."
          eyebrow="Clara"
          metrics={[
            { label: "Cliente", value: fallbackContextualAnalysis.contextSnapshot.clientId },
            { label: "Caso", value: fallbackContextualAnalysis.contextSnapshot.caseId },
            { label: "Processo", value: fallbackContextualAnalysis.contextSnapshot.processId ?? "Pendente" },
            { label: "Documento", value: fallbackContextualAnalysis.contextSnapshot.documentId ?? "Pendente" }
          ]}
          title="Clara em estado controlado"
        >
          {renderControlledModeConversationGuide({
            clientId: fallbackContextualAnalysis.contextSnapshot.clientId,
            caseId: fallbackContextualAnalysis.contextSnapshot.caseId
          })}

          {renderClaraContextualAnalysis(fallbackContextualAnalysis)}
        </WorkspacePage>
      );
    }

    return (
      <WorkspacePage
        description="A Clara nao conseguiu resolver contexto suficiente para abrir a sessao com seguranca."
        eyebrow="Clara"
        metrics={[
          { label: "Estado", value: "Indisponivel" },
          { label: "Fonte", value: "Workspace real" },
          { label: "Acao", value: "Validar contexto" },
          { label: "Fallback", value: "Protegido" }
        ]}
        title="Clara indisponivel no momento"
      >
        <WorkspaceStatePanel
          actionHref="/novo-atendimento-bancario"
          actionLabel="Abrir novo atendimento bancario"
          description="Faltou contexto real suficiente para a Clara montar cliente, caso, processo e documento com seguranca. Continue pelo atendimento bancario ou valide a base do tenant ativo."
          title="Falha ao montar o contexto da Clara"
          tone="danger"
        />
      </WorkspacePage>
    );
  }
  const activeWorkspace = clara.tabs[activeTab];

  if (activeNiche && (!hasResolvedProcess || !hasResolvedDocument)) {
    return (
      <WorkspacePage
        description="A Clara contextual minima segue operando com clientId e caseId resolvidos, mas sem fingir que processo ou documento ja existem quando o caso ainda esta em fase inicial."
        eyebrow="Clara"
        metrics={[
          { label: "Cliente", value: clara.structuredCore.context.client.fullName },
          { label: "Caso", value: clara.structuredCore.context.bankingCase.title },
          { label: "Processo", value: hasResolvedProcess ? "Resolvido" : "Pendente" },
          { label: "Documento", value: hasResolvedDocument ? "Resolvido" : "Pendente" }
        ]}
        title="Clara em estado controlado"
        >
          {renderControlledModeConversationGuide({
            clientId: clara.structuredCore.context.client.id,
            caseId: clara.structuredCore.context.bankingCase.id,
            clientName: clara.structuredCore.context.client.fullName,
            caseTitle: clara.structuredCore.context.bankingCase.title
          })}

          {!hasResolvedDocument ? (
            <WorkspaceStatePanel
              actionHref={`/documentos/enviar-arquivos?caseId=${clara.structuredCore.context.bankingCase.id}`}
              actionLabel="Anexar documento ao caso"
              description="Sem documento base, a Clara registra fatos e bloqueios do caso, mas nao abre leitura contratual nem minuta assistida."
            title="Documento base ainda pendente"
            tone="warning"
          />
        ) : null}

        {!hasResolvedProcess ? (
          <WorkspaceStatePanel
            actionHref={`/pessoas/clientes/${clara.structuredCore.context.client.id}?case=${clara.structuredCore.context.bankingCase.id}`}
            actionLabel="Continuar pelo cockpit do caso"
            description="O handoff arquitetural permite que o processo nasca vazio no onboarding. A Clara nao trava por isso, mas tambem nao promete acompanhamento processual antes do vinculo real."
            title="Processo ainda nao vinculado"
            tone="warning"
          />
        ) : null}

        {renderClaraContextualAnalysis(contextualAnalysis)}
      </WorkspacePage>
    );
  }

  const nicheConfig = activeNiche
    ? {
        revisional: {
          title: "Revisional de contratos",
          summary:
            revisionalWorkspace?.analysis.executiveSummary ??
            "Leitura contratual, abusividades, memoria de calculo e minuta assistida em um unico fluxo."
        },
        "cartao-consignado": {
          title: "Cartao consignado / RMC",
          summary:
            "Leitura do contrato, extrato e desconto para localizar cobrancas controvertidas, validar prova e abrir a resposta operacional."
        },
        "beneficio-descontos": {
          title: "Descontos indevidos em beneficio previdenciario",
          summary:
            "Leitura do extrato do beneficio, das comunicacoes e do desconto controvertido para montar a resposta operacional com prova minima."
        },
        fraude: {
          title: "Fraude bancaria",
          summary:
            "Descontos indevidos, contratacao nao autorizada, cartao consignado / RMC, beneficio previdenciario e resposta humana guiada dentro do fluxo bancario."
        },
        "busca-apreensao": {
          title: "Busca e apreensao",
          summary:
            "Preservacao do veiculo, mora controvertida, defesa urgente e saida formal para resposta do caso."
        }
      }[activeNiche]
    : null;
  const nicheFlow = activeNiche
    ? {
        revisional: {
          steps: [
            {
              title: "Analise",
              detail: "Confirma contrato, parcelas, CET, encargos e viabilidade inicial da revisional."
            },
            {
              title: "Intimacao",
              detail: "Extrai prazo, ato exigido e necessidade de resposta humana antes do protocolo."
            },
            {
              title: "Pecas",
              detail: "Estrutura a minuta assistida com fatos, fundamentos, memoria de calculo e pedidos."
            },
            {
              title: "Jurisprudencia",
              detail: "Prioriza STJ e separa STF apenas quando houver recorte constitucional real."
            },
            {
              title: "Saida operacional",
              detail: "Abre minuta, pacote revisional e editor formal para salvar, revisar e imprimir."
            }
          ]
        },
        "cartao-consignado": {
          steps: [
            {
              title: "Analise",
              detail: "Confirma contrato, extratos, descontos e o desenho do consignado antes de abrir a resposta."
            },
            {
              title: "Intimacao",
              detail: "Extrai prazo e providencia urgente quando houver cobranca ativa ou resposta administrativa a fazer."
            },
            {
              title: "Pecas",
              detail: "Estrutura a minuta assistida com fatos, prova do desconto e tese de RMC ou cartao consignado."
            },
            {
              title: "Jurisprudencia",
              detail: "Prioriza STJ e separa STF apenas quando houver debate constitucional real."
            },
            {
              title: "Saida operacional",
              detail: "Abre minuta assistida e editor formal para salvar, revisar, aprovar e seguir para uso."
            }
          ]
        },
        "beneficio-descontos": {
          steps: [
            {
              title: "Analise",
              detail: "Confirma beneficio, extratos, comunicacoes e o recorte do desconto previdenciario antes da resposta."
            },
            {
              title: "Intimacao",
              detail: "Extrai prazo e providencia urgente quando houver resposta administrativa ou judicial a fazer."
            },
            {
              title: "Pecas",
              detail: "Estrutura a minuta assistida com fatos, prova do desconto e tese de desconto previdenciario indevido."
            },
            {
              title: "Jurisprudencia",
              detail: "Prioriza STJ e separa STF apenas quando houver debate constitucional real."
            },
            {
              title: "Saida operacional",
              detail: "Abre minuta assistida e editor formal para salvar, revisar, aprovar e seguir para uso."
            }
          ]
        },
        fraude: {
          steps: [
            {
              title: "Analise",
              detail:
                "Leitura do cliente, do processo e do documento para localizar fraude, desconto indevido ou contratacao nao autorizada."
            },
            {
              title: "Intimacao",
              detail: "Identifica prazo e providencia urgente quando houver resposta administrativa ou judicial a ser feita."
            },
            {
              title: "Pecas",
              detail:
                "Redige contestacao, peticao inicial ou resposta humana com foco em fraude bancaria e protecao do consumidor."
            },
            {
              title: "Jurisprudencia",
              detail: "Busca precedentes do STJ em fraude bancaria e usa STF apenas se existir debate constitucional real."
            },
            {
              title: "Saida operacional",
              detail: "Abre minuta assistida e editor formal para revisar, salvar, aprovar e seguir para uso."
            }
          ]
        },
        "busca-apreensao": {
          steps: [
            {
              title: "Analise",
              detail: "Identifica risco de apreensao, mora controvertida, contrato do veiculo e preservacao possivel."
            },
            {
              title: "Intimacao",
              detail: "Extrai o prazo e a medida exigida para resposta ou defesa urgente."
            },
            {
              title: "Pecas",
              detail: "Prepara a peticao de defesa com urgencia, prova da posse e narrativa para preservacao do bem."
            },
            {
              title: "Jurisprudencia",
              detail: "Prioriza STJ em busca e apreensao e deixa STF apenas como excecao constitucional."
            },
            {
              title: "Saida operacional",
              detail: "Abre a minuta assistida e o editor formal para salvar, revisar, aprovar e imprimir."
            }
          ]
        }
      }[activeNiche]
    : null;
  const canonicalClientOptions = clara.selectors.clients;
  const filteredCanonicalClientOptions = canonicalClientOptions.filter(
    (client) => clara.selectors.cases.filter((caseItem) => caseItem.clientId === client.id).length <= 1
  );
  const visibleClientOptions = filteredCanonicalClientOptions.length > 0 ? filteredCanonicalClientOptions : canonicalClientOptions;
  const selectedClientFromParam = visibleClientOptions.find((item) => item.id === searchParams?.client);
  const selectedProcessFromParam = clara.selectors.processes.find((item) => item.id === searchParams?.process);
  const selectedClient =
    selectedProcessFromParam
      ? visibleClientOptions.find((item) => item.id === selectedProcessFromParam.clientId) ??
        selectedClientFromParam ??
        visibleClientOptions[0]
      : selectedClientFromParam ?? visibleClientOptions[0];

  if (!selectedClient) {
    return (
      <WorkspacePage
        description="A Clara precisa de pelo menos um cliente real para abrir a bancada de trabalho sem inventar contexto."
        eyebrow="Clara"
        metrics={[
          { label: "Clientes", value: `${visibleClientOptions.length}` },
          { label: "Casos", value: `${clara.selectors.cases.length}` },
          { label: "Processos", value: `${clara.selectors.processes.length}` },
          { label: "Documentos", value: `${clara.selectors.documents.length}` }
        ]}
        title="Workspace da Clara ainda sem cliente selecionavel"
      >
        <WorkspaceStatePanel
          actionHref="/novo-atendimento-bancario"
          actionLabel="Abrir novo atendimento"
          description="Nao ha clientes carregados para alimentar os seletores da Clara. Continue pelo atendimento bancario ou cadastre o primeiro cliente do tenant antes de tentar novamente."
          title="Nenhum cliente disponivel para a Clara"
          tone="warning"
        />
      </WorkspacePage>
    );
  }

  const processOptions = clara.selectors.processes.filter((processItem) => processItem.clientId === selectedClient.id);
  let selectedProcess =
    selectedProcessFromParam && selectedProcessFromParam.clientId === selectedClient.id
      ? selectedProcessFromParam
      : processOptions[0] ?? selectedProcessFromParam ?? clara.selectors.processes[0];
  const caseOptions = clara.selectors.cases.filter((caseItem) => caseItem.clientId === selectedClient.id);
  const selectedCaseFromParam = clara.selectors.cases.find((item) => item.id === searchParams?.case);
  const selectedCase =
    (selectedProcess && caseOptions.find((item) => item.id === selectedProcess.caseId)) ??
    (selectedCaseFromParam && selectedCaseFromParam.clientId === selectedClient.id ? selectedCaseFromParam : null) ??
    caseOptions[0] ??
    selectedCaseFromParam ??
    clara.selectors.cases[0];
  const documentOptions = clara.selectors.documents.filter((document) => {
    if (selectedCase) return document.caseId === selectedCase.id;
    return document.clientId === selectedClient.id;
  });
  const selectedDocumentFromParam = clara.selectors.documents.find((item) => item.id === searchParams?.document);
  let selectedDocument =
    documentOptions.find((item) => item.id === selectedDocumentFromParam?.id) ??
    selectedDocumentFromParam ??
    documentOptions[0] ??
    clara.selectors.documents[0];
  const selectedDocument2FromParam = clara.selectors.documents.find((item) => item.id === searchParams?.document2);
  const selectedDocument2 =
    documentOptions.find((item) => item.id === selectedDocument2FromParam?.id) ??
    selectedDocument2FromParam ??
    documentOptions[1] ??
    documentOptions[0] ??
    clara.selectors.documents[1];
  const taskOptions = clara.selectors.tasks.filter((task) => {
    if (selectedCase) return task.caseId === selectedCase.id;
    return task.clientId === selectedClient.id;
  });
  const selectedTaskFromParam = clara.selectors.tasks.find((item) => item.id === searchParams?.task);
  const workspaceContext = clara.structuredCore.context;
  const workspaceClient = workspaceContext.client;
  const workspaceCase = workspaceContext.bankingCase;
  const workspaceProcess = workspaceContext.process;
  const resolvedDemoDocument = selectedDocument ?? workspaceContext.selectedDocument ?? selectedDocument2;
  selectedDocument = resolvedDemoDocument;
  const virtualProcess = {
    id: `virtual-process-${workspaceCase.id}`,
    caseId: workspaceCase.id,
    clientId: workspaceClient.id,
    label: `Processo operacional · ${workspaceCase.processNumber}`,
    processNumber: `Processo operacional · ${workspaceCase.processNumber}`,
    localReferenceNumber: workspaceCase.processNumber,
    officialProcessNumber: workspaceProcess?.officialProcessNumber,
    officialDistributionDate: workspaceProcess?.officialDistributionDate,
    officialSource: workspaceProcess?.officialSource,
    officialDistributionStatus: workspaceProcess?.officialDistributionStatus ?? "preparatory_local",
    protocolReceiptDocumentId: workspaceProcess?.protocolReceiptDocumentId,
    distributionAuditTrail: workspaceProcess?.distributionAuditTrail ?? [],
    tribunal: workspaceCase.ownerLabel ?? "Tribunal nao vinculado",
    courtDistrict: workspaceCase.ownerLabel ?? "Distrito nao vinculado",
    courtName: workspaceCase.ownerLabel ?? "Juizo em construcao",
    proceduralPhase: workspaceCase.stage,
    status: workspaceProcess?.status ?? "awaiting-filing",
    responsibleLawyer: workspaceProcess?.responsibleLawyer ?? "Clara",
    monitoringMode: workspaceProcess?.monitoringMode ?? "manual",
    latestTimeline: [],
    client: workspaceClient,
    bankingCase: workspaceCase
  } as JudicialProcessWithRelations & { label: string };
  const virtualTask = {
    id: `virtual-task-${workspaceCase.id}`,
    clientId: workspaceClient.id,
    caseId: workspaceCase.id,
    label: `Pauta operacional de ${workspaceCase.title}`,
    title: `Pauta operacional de ${workspaceCase.title}`,
    description:
      "Tarefa operacional para a Clara em estado inicial quando o tenant ainda nao vinculou processo.",
    assigneeLabel: workspaceProcess?.responsibleLawyer ?? "Clara",
    dueDate: new Date().toISOString(),
    priority: "medium",
    status: "todo",
    notes: "Gerada para continuidade operacional.",
    checklist: [],
    suggestedByClaimType: workspaceCase.claimType,
    lexiaNextStep: clara.structuredCore.nextStep,
    client: workspaceClient,
    bankingCase: workspaceCase,
    completedChecklistCount: 0
  } as TaskWithContext & { label: string };
  let selectedTask = 
    taskOptions.find((item) => item.id === selectedTaskFromParam?.id) ??
    selectedTaskFromParam ??
    taskOptions[0] ??
    clara.selectors.tasks[0] ??
    virtualTask;
  if (!selectedProcess) {
    selectedProcess = virtualProcess;
  }
  if (!selectedTask) {
    selectedTask = virtualTask;
  }

  if (!selectedClient || !selectedProcess || !selectedCase || !resolvedDemoDocument || !selectedTask) {
    return (
      <WorkspacePage
        description="A Clara exige pelo menos um cliente, caso, processo, documento e tarefa para abrir a sessao operacional completa."
        eyebrow="Clara"
        metrics={[
          { label: "Clientes", value: `${visibleClientOptions.length}` },
          { label: "Casos", value: `${clara.selectors.cases.length}` },
          { label: "Processos", value: `${clara.selectors.processes.length}` },
          { label: "Documentos", value: `${clara.selectors.documents.length}` }
        ]}
        title="Contexto insuficiente para abrir a Clara"
      >
        <WorkspaceStatePanel
          actionHref="/novo-atendimento-bancario"
          actionLabel="Abrir novo atendimento"
          description="A base atual ainda nao fornece todos os objetos minimos para a Clara operar com seguranca. Cadastre ou complete cliente, caso, processo, documento e tarefa antes de voltar."
          title="Workspace minimo ainda incompleto"
          tone="warning"
        />
      </WorkspacePage>
    );
  }
  const nicheOperational = activeNiche
    ? {
      revisional: null,
      "cartao-consignado": {
        title: "Motor de cartao consignado / RMC",
        summary:
          "A Clara cruza contrato, extrato e desconto do cartao consignado para decidir viabilidade, tese e minuta inicial.",
        cards: [
          {
            label: "Leitura central",
            value: "Contrato, extrato e desconto controvertido"
          },
          {
            label: "Tese pratica",
            value: "RMC ou cartao consignado com desconto indevido"
          },
          {
            label: "Prova essencial",
            value: "Extratos, contrato e reclamacao administrativa"
          },
          {
            label: "Saida formal",
            value: "Resposta assistida, inicial ou revisao humana"
          }
        ],
        links: [
          {
            label: "Abrir resposta assistida",
            href: `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=peticao-inicial&objetivo=cartao-consignado-rmc`
          },
          {
            label: "Abrir processo",
            href: `/processos/${selectedProcess.id}?clara=1&action=cartao-consignado-rmc&client=${selectedClient.id}&document=${selectedDocument.id}`
          },
          {
            label: "Abrir documento base",
            href: `/documentos/${selectedDocument.id}`
          }
        ]
      },
      "beneficio-descontos": {
        title: "Motor de descontos indevidos em beneficio previdenciario",
        summary:
          "A Clara cruza beneficio, extrato e comunicacoes para decidir viabilidade, tese e minuta inicial no recorte previdenciario.",
        cards: [
          {
            label: "Leitura central",
            value: "Beneficio, extrato e desconto controvertido"
          },
          {
            label: "Tese pratica",
            value: "Desconto previdenciario indevido com prova documental"
          },
          {
            label: "Prova essencial",
            value: "Extratos, beneficio e comunicacoes com o banco ou INSS"
          },
          {
            label: "Saida formal",
            value: "Resposta assistida, inicial ou revisao humana"
          }
        ],
        links: [
          {
            label: "Abrir resposta assistida",
            href: `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=peticao-inicial&objetivo=descontos-beneficio-previdenciario`
          },
          {
            label: "Abrir processo",
            href: `/processos/${selectedProcess.id}?clara=1&action=descontos-beneficio-previdenciario&client=${selectedClient.id}&document=${selectedDocument.id}`
          },
          {
            label: "Abrir documento base",
            href: `/documentos/${selectedDocument.id}`
          }
        ]
      },
      fraude: {
        title: "Motor de defesa por fraude bancaria",
        summary:
          "A Clara le o caso como defesa por consignado nao autorizado, desconto indevido ou contratacao nao reconhecida, com saida formal pronta para revisao humana.",
          cards: [
            {
              label: "Leitura central",
              value: "Consignado nao autorizado, fraude ou desconto indevido"
            },
            {
              label: "Tese pratica",
              value: "Inexistencia de contratacao valida e protecao imediata da renda"
            },
            {
              label: "Prova essencial",
              value: "Extratos, identificacao e comunicacoes bancarias"
            },
            {
              label: "Saida formal",
              value: "Resposta assistida, contestacao ou inicial revisavel"
            }
          ],
          links: [
            {
              label: "Abrir resposta assistida",
              href: `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=peticao-inicial&objetivo=fraude-bancaria`
            },
            {
              label: "Abrir processo",
              href: `/processos/${selectedProcess.id}?clara=1&action=fraude-bancaria&client=${selectedClient.id}&document=${selectedDocument.id}`
            },
            {
              label: "Abrir documento base",
              href: `/documentos/${selectedDocument.id}`
            }
          ]
        },
        "busca-apreensao": {
          title: "Motor de defesa em busca e apreensao",
          summary:
            "A Clara organiza a defesa com foco em preservacao do veiculo, mora controvertida e resposta urgente antes da constricao.",
          cards: [
            {
              label: "Leitura central",
              value: "Risco de apreensao e preservacao da posse"
            },
            {
              label: "Tese pratica",
              value: "Mora controvertida e defesa urgente do bem"
            },
            {
              label: "Prova essencial",
              value: "Contrato, posse, pagamentos e notificacao"
            },
            {
              label: "Saida formal",
              value: "Defesa urgente, liminar e minuta pronta para revisao"
            }
          ],
          links: [
            {
              label: "Abrir defesa assistida",
              href: `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=peticao-inicial&objetivo=busca-apreensao`
            },
            {
              label: "Abrir processo",
              href: `/processos/${selectedProcess.id}?clara=1&action=busca-apreensao&client=${selectedClient.id}&document=${selectedDocument.id}`
            },
            {
              label: "Abrir documento base",
              href: `/documentos/${selectedDocument.id}`
            }
          ]
        }
      }[activeNiche]
    : null;
  const nicheExecutionBlocks = activeNiche
    ? {
        revisional: null,
        "cartao-consignado": {
          title: "Fluxo de cartao consignado",
          steps: [
            "Triagem do contrato, do extrato e do desconto controvertido.",
            "Leitura do ato ou da reclamacao que exige resposta urgente.",
            "Preparacao da minuta assistida para revisao humana.",
            "Fechamento da tese com prova minima e jurisprudencia util."
          ]
        },
        "beneficio-descontos": {
          title: "Fluxo de descontos indevidos em beneficio previdenciario",
          steps: [
            "Triagem do beneficio, do extrato e do desconto controvertido.",
            "Leitura do ato ou da reclamacao que exige resposta urgente.",
            "Preparacao da minuta assistida para revisao humana.",
            "Fechamento da tese com prova minima e jurisprudencia util."
          ]
        },
        fraude: {
          title: "Fluxo de fraude bancaria",
          steps: [
            "Triagem da contratacao e do desconto indevido.",
            "Leitura da intencao de resposta ou contestacao imediata.",
            "Montagem da peca assistida para revisao humana.",
            "Fechamento da tese com prova minima e jurispudencia util."
          ]
        },
        "busca-apreensao": {
          title: "Fluxo de busca e apreensao",
          steps: [
            "Triagem do risco de apreensao e da posse atual do veiculo.",
            "Leitura da intimacao ou da medida urgente.",
            "Preparacao da defesa e da minuta assistida.",
            "Fechamento da tese com preservacao do bem e resposta formal."
          ]
        }
      }[activeNiche]
    : null;
  const selectedAction = searchParams?.action;
  const workflowFields = [...activeWorkspace.workflow.fields];
  const globalSearchQuery = searchParams?.q?.trim() ?? "";

  function getFieldWeight(fieldType: string) {
    if (fieldType === "client") return 0;
    if (fieldType === "process") return 1;
    if (fieldType === "document") return 2;
    if (fieldType === "case") return 3;
    if (fieldType === "task") return 4;
    return 5;
  }

  const visibleWorkflowFields = workflowFields
    .filter((field) => field.type !== "client")
    .sort((left, right) => getFieldWeight(left.type) - getFieldWeight(right.type))
    .slice(0, 2);
  const extraWorkflowFields = workflowFields
    .filter((field) => field.type !== "client")
    .sort((left, right) => getFieldWeight(left.type) - getFieldWeight(right.type))
    .slice(2);

  function getOptions(type: string) {
    if (type === "client") return visibleClientOptions;
    if (type === "process") return processOptions;
    if (type === "case") return caseOptions;
    if (type === "document") return documentOptions;
    if (type === "task") return taskOptions;
    return [];
  }

  const operationalByTab: Record<
    TabId | "revisional",
    {
      title: string;
      summary: string;
      links: { label: string; href: string }[];
    }
  > = {
    analise: {
      title: "Analise pronta para aprofundamento",
      summary: `${clara.structuredCore.classification.scenarioLabel} em leitura estruturada: ${clara.structuredCore.nextStep}`,
      links: [
        { label: "Abrir processo", href: `/processos/${selectedProcess.id}` },
        { label: "Abrir documento", href: `/documentos/${selectedDocument.id}` },
        { label: "Abrir cliente", href: `/pessoas/clientes/${selectedClient.id}` }
      ]
    },
    intimacao: {
      title: "Intimacao pronta para resposta",
      summary: `Clara organizou a intimacao vinculada a ${selectedProcess.label} para destacar prazo, ato processual e a resposta humana ou automatica que precisa sair agora.`,
      links: [
        { label: "Abrir processo", href: `/processos/${selectedProcess.id}` },
        { label: "Abrir documento", href: `/documentos/${selectedDocument.id}` },
        { label: "Abrir cliente", href: `/pessoas/clientes/${selectedClient.id}` }
      ]
    },
    revisional: {
      title: "Fluxo revisional pronto para execucao",
      summary: `Clara cruza ${selectedDocument.label}, ${selectedProcess.label} e ${selectedClient.label} para decidir viabilidade, abusividades, prova financeira e minuta inicial da revisional bancaria.`,
      links: [
        { label: "Abrir contrato", href: `/documentos/${selectedDocument.id}` },
        { label: "Abrir analise contratual", href: `/analise-contrato?documentId=${selectedDocument.id}` },
        { label: "Abrir editor da inicial", href: `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=acao-revisional` }
      ]
    },
    pecas: {
      title: "Base de peca organizada",
      summary: `Clara preparou a base de trabalho de ${selectedCase.label} usando ${selectedDocument.label}, pronta para estrutura de minuta assistida.`,
      links: [
        { label: "Abrir processo", href: `/processos/${selectedProcess.id}?case_context=1` },
        { label: "Ver documento base", href: `/documentos/${selectedDocument.id}` },
        { label: "Abrir analise premium", href: `/analise-contrato?documentId=${selectedDocument.id}` }
      ]
    },
    jurisprudencia: {
      title: "Pesquisa orientada por tese",
      summary: `Clara preparou um recorte de pesquisa para ${selectedCase.label}, organizando o tema juridico e o tribunal alvo antes da consulta jurisprudencial. O STJ fica em primeiro plano e o STF entra apenas quando houver recorte constitucional.`,
      links: [
        { label: "Abrir processo", href: `/processos/${selectedProcess.id}?case_context=1` },
        { label: "Ir para relatorios", href: "/relatorios/processos" },
        { label: "Ver processo", href: `/processos/${selectedProcess.id}` }
      ]
    },
    checklist: {
      title: "Checklist operacional montado",
      summary: `A tarefa ${selectedTask.label} foi transformada em frente operacional vinculada a ${selectedCase.label}, pronta para execucao do escritorio.`,
      links: [
        { label: "Abrir tarefa", href: `/tarefas/${selectedTask.id}` },
        { label: "Abrir processo", href: `/processos/${selectedProcess.id}?case_context=1` },
        { label: "Ir para tarefas", href: "/agenda/tarefas" }
      ]
    },
    "proximos-passos": {
      title: "Ordem de ataque definida",
      summary: `Clara priorizou os proximos passos de ${selectedClient.label} em torno de ${selectedCase.label}, com foco em entrega operacional, distribuicao da acao e acompanhamento apos a saida do editor.`,
      links: [
        { label: "Abrir cliente", href: `/pessoas/clientes/${selectedClient.id}` },
        { label: "Abrir processo", href: `/processos/${selectedProcess.id}?case_context=1` },
        { label: "Abrir agenda", href: "/agenda/compromissos" }
      ]
    },
    comparador: {
      title: "Quadro comparativo preparado",
      summary: `Clara cruzou ${selectedDocument.label} com ${selectedDocument2.label} para localizar divergencias, reforcos de tese e pontos aproveitaveis em peca.`,
      links: [
        { label: "Abrir documento 1", href: `/documentos/${selectedDocument.id}` },
        { label: "Abrir documento 2", href: `/documentos/${selectedDocument2.id}` },
        { label: "Ir para arquivos", href: "/documentos/meus-arquivos" }
      ]
    }
  };

  const operational = operationalByTab[activeTab];
  const revisionalWorkspaceResolved = revisionalWorkspace as NonNullable<typeof revisionalWorkspace>;
  const executedByTab: Record<
    TabId | "revisional",
    Partial<Record<string, { title: string; body: string[]; cta: { label: string; href: string } }>>
  > = {
    analise: {
      "Analisar processo": {
        title: "Leitura executiva pronta",
        body: [
          `${selectedProcess.label} foi lido com base em ${selectedDocument.label}.`,
          clara.structuredCore.summary,
          `Lacunas documentais: ${clara.structuredCore.documentsMissing.length > 0 ? clara.structuredCore.documentsMissing.join(", ") : "nenhuma lacuna essencial"}.`,
          `Cliente vinculado: ${selectedClient.label}.`
        ],
        cta: {
          label: "Abrir processo para revisar",
          href: `/processos/${selectedProcess.id}?clara=1&action=analisar-processo&document=${selectedDocument.id}&client=${selectedClient.id}`
        }
      },
      "Analisar Caso com Clara": {
        title: "Caso analisado com Clara",
        body: [
          `A Clara consolidou o dossie real de ${selectedCase.label} usando ${selectedDocument.label}, ${selectedProcess.label} e o contexto do cliente ${selectedClient.label}.`,
          `Fontes e rastreio ficam ancorados em cliente, caso, documento e processo, sem descolar do fluxo juridico do caso.`,
          activeNiche === "revisional" && revisionalWorkspaceResolved
            ? revisionalWorkspaceResolved.decisionSummary
            : clara.structuredCore.summary,
          activeNiche === "revisional" && revisionalWorkspaceResolved
            ? `Estrategia consolidada: ${revisionalWorkspaceResolved.strategySummary.mainThesis}.`
            : "A Clara segue operando como camada contextual do caso, nao como superficie paralela."
        ],
        cta: {
          label: "Abrir trilha do caso",
          href: `/clara?tab=${activeTab}&client=${selectedClient.id}&case=${selectedCase.id}&process=${selectedProcess.id}&document=${selectedDocument.id}#clara-history`
        }
      },
      "Abrir prazo calculado": {
        title: "Prazo operacional estimado",
        body: [
          "A Clara estimou uma janela util de preparo considerando citacao, memoria de calculo e revisao documental.",
          "O proximo passo e validar a data exata no andamento e travar checklist interno.",
          "Recomendacao: alinhar responsabilidade com a equipe antes de protocolar."
        ],
        cta: {
          label: "Abrir calculadora de prazo",
          href: `/agenda/prazos/calcular?clara=1&created=1&action=abrir-prazo-calculado&client=${selectedClient.id}&case=${selectedCase.id}&process=${selectedProcess.id}&document=${selectedDocument.id}`
        }
      },
      "Gerar resumo executivo": {
        title: "Resumo executivo gerado",
        body: [
          `Caso central: ${selectedCase.label}.`,
          "Tese principal, risco, urgencia e proxima medida foram condensados em formato para repasse interno.",
          "Esse resumo ja pode orientar reuniao, atendimento ao cliente e abertura de minuta."
        ],
        cta: {
          label: "Abrir resumo no editor",
          href: `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=resumo-executivo&source=clara`
        }
      }
    },
    intimacao: {
      "Analisar intimacao": {
        title: "Intimacao lida",
        body: [
          `${selectedProcess.label} recebeu uma intima��o que precisa ser tratada com aten��o ao prazo e ao ato exigido.`,
          "A Clara separou o que exige confer�ncia humana antes da resposta ou da juntada.",
          `Cliente vinculado: ${selectedClient.label}.`
        ],
        cta: {
          label: "Abrir processo para revisar",
          href: `/processos/${selectedProcess.id}?clara=1&action=analisar-intimacao&document=${selectedDocument.id}&client=${selectedClient.id}`
        }
      },
      "Extrair prazo": {
        title: "Prazo extraido",
        body: [
          "A Clara destacou o prazo da intimacao e orientou a janela util para resposta.",
          "A etapa seguinte e confirmar a data com o andamento mais recente e travar a estrategia de saida.",
          "Se houver duvida, a revisao humana entra antes do protocolo."
        ],
        cta: {
          label: "Ir para agenda",
          href: "/agenda/prazos?clara=1&created=1&action=extrair-prazo"
        }
      },
      "Gerar resposta a intimacao": {
        title: "Resposta a intima��o preparada",
        body: [
          `A Clara estruturou a resposta a intima��o de ${selectedProcess.label} em formato pronto para revis�o humana.`,
          "O texto pode seguir para o editor, receber ajuste do advogado e depois ser usado no fluxo operacional.",
          "A decis�o final permanece sob aprova��o humana antes do uso."
        ],
        cta: {
          label: "Abrir minuta",
          href: `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=resposta-intimacao`
        }
      }
    },
    revisional: {
      "Triar viabilidade revisional": {
        title: "Viabilidade revisional triada",
        body: [
          `${selectedDocument.label} apresenta sinais compativeis com revisional bancaria e conversa com o contexto de ${selectedClient.label}.`,
          "A Clara sugere seguir quando houver contrato, memoria de calculo basica, historico das parcelas e identificacao clara do ponto de abusividade.",
          "O caso deve priorizar clausulas remuneratorias, CET, capitalizacao, seguro embutido e encargos cumulativos."
        ],
        cta: {
          label: "Abrir analise contratual",
          href: `/analise-contrato?documentId=${selectedDocument.id}&clara=1&action=triagem-revisional&client=${selectedClient.id}&process=${selectedProcess.id}`
        }
      },
      "Mapear abusividades": {
        title: "Abusividades mapeadas",
        body: [
          "A Clara separou os sinais de abusividade mais relevantes para a narrativa revisional: juros, CET, capitalizacao, seguro embutido e cobrancas acessorias.",
          "Esse mapeamento ja serve como ponte entre leitura contratual, memoria de calculo e estrutura de fundamentos.",
          "O proximo passo e validar quais pontos entram na inicial e quais ficam como reforco probatorio."
        ],
        cta: {
          label: "Abrir comparador documental",
          href: `/documentos/meus-arquivos?clara=1&created=1&document=${selectedDocument.id}&document2=${selectedDocument2.id}`
        }
      },
      "Montar estrategia revisional": {
        title: "Estrategia revisional pronta",
        body: [
          `A Clara consolidou a estrategia do processo ${selectedProcess.label} com foco em rediscutir clausulas, limitar cobranca e revisar o valor das parcelas.`,
          "A ordem sugerida e: tese economica, prova documental, tutela para suspensao de excesso e memoria de calculo revisional.",
          "A estrategia ja esta pronta para virar resumo executivo, checklist e minuta inicial."
        ],
        cta: {
          label: "Abrir processo",
          href: `/processos/${selectedProcess.id}?clara=1&action=estrategia-revisional&document=${selectedDocument.id}&client=${selectedClient.id}`
        }
      },
      "Organizar provas e calculos": {
        title: "Provas e calculos organizados",
        body: [
          "A Clara converteu a revisional em frente operacional com checklist de contrato, parcelas, historico de pagamento, calculo revisional e anexos essenciais.",
          "O escritorio pode usar esse bloco para nao ajuizar sem memoria minima ou sem prova da cobranca excessiva.",
          "O resultado ja pode ser acompanhado como tarefa interna da carteira."
        ],
        cta: {
          label: "Criar tarefa revisional",
          href: `/agenda/tarefas?clara=1&created=1&task=${selectedTask.id}&case=${selectedCase.id}&client=${selectedClient.id}&process=${selectedProcess.id}&document=${selectedDocument.id}&focus=revisional${searchParams?.objetivo ? `&objetivo=${encodeURIComponent(searchParams.objetivo)}` : ""}`
        }
      },
      "Gerar minuta inicial revisional": {
        title: "Minuta inicial revisional preparada",
        body: [
          "A Clara abriu a estrutura base da acao revisional para rediscutir clausulas e readequar o valor das parcelas.",
          "A minuta sai organizada em fatos contratuais, abusividades, memoria de calculo, tutela e pedidos revisionais.",
          "A revisao humana ainda precisa definir a calibragem final dos pedidos e da estrategia probatoria."
        ],
        cta: {
          label: "Abrir editor da inicial",
          href: `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=acao-revisional`
        }
      }
    },
    pecas: {
      "Redigir peticao inicial": {
        title: "Peticao inicial pronta para revisao",
        body: [
          "A Clara separou fatos, fundamentos bancarios, pedidos e urgencia em uma ordem de redacao inicial.",
          `Documento base usado: ${selectedDocument.label}.`,
          "A revisao humana deve ajustar o enquadramento final e a dosimetria dos pedidos."
        ],
        cta: {
          label: "Abrir minuta assistida",
          href: `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=peticao-inicial`
        }
      },
      "Montar fundamentos": {
        title: "Fundamentos sugeridos",
        body: [
          "Foram destacados pontos de juros abusivos, capitalizacao, falha de informacao e reflexo no CET.",
          "A Clara organizou a base para encaixe de jurisprudencia e narrativa probatoria.",
          `Caso de referencia: ${selectedCase.label}.`
        ],
        cta: {
          label: "Abrir documento base",
          href: `/documentos/${selectedDocument.id}?clara=1&action=fundamentos`
        }
      },
      "Abrir minuta assistida": {
        title: "Minuta assistida pronta para revisao",
        body: [
          "A minuta inicial foi preparada em modo assistido para aprofundamento pela equipe.",
          "O texto base esta pronto para virar peticao inicial, contestacao ou manifestacao.",
          "A recomendacao e revisar pedidos urgentes antes de exportar."
        ],
        cta: {
          label: "Ir para editor de texto",
          href: `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=peticao-inicial`
        }
      }
    },
    jurisprudencia: {
      "Pesquisar STJ": {
        title: "Pesquisa no STJ organizada",
        body: [
          "A Clara preparou o recorte jurisprudencial por tema, tribunal e tipo de demanda bancaria.",
          "A busca prioriza julgados do STJ, que costuma concentrar a leitura mais util em direito bancario.",
          `Tema em foco vinculado a ${selectedCase.label}.`
        ],
        cta: {
          label: "Abrir relatorios",
          href: "/relatorios/processos?clara=1&action=precedentes-stj"
        }
      },
      "Pesquisar STF": {
        title: "Pesquisa no STF preparada",
        body: [
          "Foram separados os julgados do STF que fazem sentido quando a tese bancaria precisa de recorte constitucional.",
          "Esse caminho e secundario no banking, mas util quando a discussao extrapola o contrato e toca materia constitucional.",
          "A Clara deixa o STF como camada de excecao, nao como trilha principal."
        ],
        cta: { label: "Abrir relatorios", href: "/relatorios/processos?clara=1&action=precedentes-stf" }
      },
      "Montar base jurisprudencial": {
        title: "Base jurisprudencial pronta",
        body: [
          "A Clara organizou a base de julgados para reaproveitamento em minuta e revisao de tese.",
          "O material esta pronto para ser convertido em fundamento de peca ou resumo interno.",
          "Proximo passo: conectar a base ao documento central do caso."
        ],
        cta: {
          label: "Abrir documento",
          href: `/documentos/${selectedDocument.id}?clara=1&action=base-jurisprudencial`
        }
      }
    },
    checklist: {
      "Gerar checklist": {
        title: "Checklist operacional gerado",
        body: [
          `A tarefa ${selectedTask.label} recebeu uma lista de execucao derivada do contexto do caso.`,
          "Itens de prova, revisao e protocolo foram separados por ordem de ataque.",
          "A equipe pode usar esse checklist como trilha de execucao imediata."
        ],
        cta: {
          label: "Criar na mesa de tarefas",
          href: `/agenda/tarefas?clara=1&created=1&task=${selectedTask.id}&case=${selectedCase.id}`
        }
      },
      "Reordenar execucao": {
        title: "Execucao repriorizada",
        body: [
          "A Clara reorganizou a ordem do trabalho para focar primeiro no que destrava prazo, prova e peca.",
          "Itens de manutencao ficam depois da etapa critica.",
          `Caso usado como base: ${selectedCase.label}.`
        ],
        cta: { label: "Ir para tarefas", href: `/agenda/tarefas?clara=1&created=1&task=${selectedTask.id}&case=${selectedCase.id}` }
      },
      "Transformar em tarefa operacional": {
        title: "Acao convertida em tarefa",
        body: [
          "A recomendacao da Clara foi preparada para virar item operacional do escritorio.",
          "O objetivo e reduzir a distancia entre insight e execucao.",
          "A revisao humana continua sendo a ultima camada antes de assumir compromisso formal."
        ],
        cta: {
          label: "Abrir tarefas",
          href: `/agenda/tarefas?clara=1&created=1&task=${selectedTask.id}&case=${selectedCase.id}`
        }
      }
    },
    "proximos-passos": {
      "Distribuir acao": {
        title: "Acao pronta para distribuicao",
        body: [
          `Cliente priorizado: ${selectedClient.label}.`,
          "A Clara definiu agora, depois e em seguida para reduzir dispersao da equipe.",
          "Depois da minuta, este passo leva ao encaminhamento formal da acao."
        ],
        cta: {
          label: "Abrir processo",
          href: `/processos/${selectedProcess.id}?clara=1&action=distribuir-acao&case_context=1`
        }
      },
      "Acompanhar acao": {
        title: "Acompanhamento iniciado",
        body: [
          `Caso base: ${selectedCase.label}.`,
          "A Clara converteu a distribuicao em acompanhamento operacional com marcos, tarefas e proximas verificacoes.",
          "Esse passo serve para monitorar protocolo, andamento e resposta do cliente."
        ],
        cta: {
          label: "Ir para tarefas",
          href: `/agenda/tarefas?clara=1&created=1&task=${selectedTask.id}&case=${selectedCase.id}&client=${selectedClient.id}&process=${selectedProcess.id}&document=${selectedDocument.id}&focus=acompanhamento`
        }
      },
      "Gerar atualizacao ao cliente": {
        title: "Atualizacao ao cliente preparada",
        body: [
          "A Clara resumiu status, proxima medida e expectativa de andamento em linguagem de atendimento.",
          "A recomendacao e enviar apenas apos revisar o marco interno mais recente.",
          `Cliente alvo: ${selectedClient.label}.`
        ],
        cta: {
          label: "Ir para agenda",
          href: `/agenda/compromissos?clara=1&created=1&client=${selectedClient.id}&case=${selectedCase.id}`
        }
      }
    },
    comparador: {
      "Comparar documentos": {
        title: "Comparacao concluida",
        body: [
          `${selectedDocument.label} foi comparado com ${selectedDocument2.label}.`,
          "A Clara destacou divergencias de clausula, encargos e aderencia de tese.",
          "O quadro resultante pode alimentar peca, resumo ou revisao interna."
        ],
        cta: {
          label: "Abrir quadro nos arquivos",
          href: `/documentos/meus-arquivos?clara=1&created=1&document=${selectedDocument.id}&document2=${selectedDocument2.id}`
        }
      },
      "Apontar divergencias": {
        title: "Divergencias destacadas",
        body: [
          "Foram marcadas clausulas e sinais juridicos que diferenciam os dois documentos.",
          "A leitura ajuda a explicar excesso, incoerencia contratual ou reforco probatorio.",
          "Esse resultado e util para tese e para narrativa da peca."
        ],
        cta: {
          label: "Abrir documento 2",
          href: `/documentos/${selectedDocument2.id}?clara=1&action=comparacao`
        }
      },
      "Gerar quadro comparativo": {
        title: "Quadro comparativo montado",
        body: [
          "A Clara preparou uma visao lado a lado para reaproveitamento em analise e producao juridica.",
          "O quadro sintetiza convergencias, divergencias e impacto na tese.",
          "Proximo passo: converter isso em minuta ou fundamento."
        ],
        cta: {
          label: "Ir para arquivos",
          href: `/documentos/meus-arquivos?clara=1&created=1&document=${selectedDocument.id}&document2=${selectedDocument2.id}`
        }
      }
    }
  };

  const executedResult =
    selectedAction && executedByTab[activeTab][selectedAction]
      ? executedByTab[activeTab][selectedAction]
      : null;
  const recordKindByTab: Partial<
    Record<
      TabId | "revisional",
      "task" | "agenda" | "deadline" | "text-draft" | "comparison" | "filing-package" | "process" | "client"
    >
  > = {
    checklist: "task",
    "proximos-passos": "agenda",
    comparador: "comparison",
    intimacao:
      selectedAction === "Extrair prazo"
        ? "deadline"
        : selectedAction === "Gerar resposta a intimacao"
          ? "text-draft"
          : "process",
    revisional:
      selectedAction === "Gerar minuta inicial revisional"
        ? "text-draft"
        : selectedAction === "Montar estrategia revisional"
          ? "filing-package"
        : selectedAction === "Mapear abusividades"
          ? "comparison"
        : selectedAction === "Organizar provas e calculos"
          ? "task"
          : "process",
    pecas:
      selectedAction === "Redigir peticao inicial" || selectedAction === "Abrir minuta assistida"
        ? "text-draft"
        : undefined,
    analise:
      selectedAction === "Abrir prazo calculado"
        ? "deadline"
        : selectedAction === "Analisar processo"
          ? "process"
          : selectedAction === "Analisar Caso com Clara"
            ? "filing-package"
          : selectedAction === "Gerar resumo executivo"
            ? "text-draft"
            : undefined
  };
  if (activeTab === "proximos-passos" && selectedAction === "Distribuir acao") {
    recordKindByTab["proximos-passos"] = "process";
  }
  if (activeTab === "proximos-passos" && selectedAction === "Acompanhar acao") {
    recordKindByTab["proximos-passos"] = "task";
  }
  if (activeTab === "proximos-passos" && selectedAction === "Gerar atualizacao ao cliente") {
    recordKindByTab["proximos-passos"] = "agenda";
  }
  const recordKind = recordKindByTab[activeTab];
  const recordPiece =
    activeNiche === "revisional" && selectedAction === "Gerar minuta inicial revisional"
      ? "acao-revisional"
      : activeTab === "analise" && selectedAction === "Analisar Caso com Clara"
        ? "resumo-executivo"
      : activeTab === "analise" && selectedAction === "Gerar resumo executivo"
        ? "resumo-executivo"
        : activeTab === "intimacao" && selectedAction === "Gerar resposta a intimacao"
          ? "resposta-intimacao"
          : "peticao-inicial";
  const recordObjective =
    activeNiche === "revisional"
      ? searchParams?.objetivo ?? revisionalWorkspace?.objectiveProfile.label ?? ""
      : searchParams?.objetivo ?? "";
  const recordOwnerType =
    recordKind === "agenda" || recordKind === "deadline" || recordKind === "task"
      ? "agenda-item"
      : recordKind === "text-draft"
        ? "draft-workspace"
        : recordKind === "comparison"
          ? "document-workspace"
          : recordKind === "client"
            ? "client"
            : recordKind
              ? "process"
              : "";
  const recordOwnerId =
    recordKind === "client"
      ? selectedClient.id
      : recordKind === "comparison"
        ? selectedDocument.id
        : recordKind === "text-draft"
          ? selectedProcess.id
          : recordKind
            ? selectedProcess.id
            : "";
  const historyQuery = searchParams?.history_q?.trim().toLowerCase() ?? "";
  const historyKindFilter = searchParams?.history_kind?.trim() ?? "";

  function summarizeRecord(record: ClaraRecord) {
    if (record.editedTitle || record.editedDetail) {
      return {
        title: record.editedTitle || "Registro ajustado pela revisao humana",
        detail: record.editedDetail || `Ajuste manual aplicado ao registro ${record.id}`
      };
    }

    switch (record.kind) {
      case "agenda": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraAgendaArtifact>>;
        return {
          title: payload.clientLabel,
          detail: `${payload.statusLabel} ? ${payload.caseLabel}`
        };
      }
      case "deadline": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraDeadlineArtifact>>;
        return {
          title: payload.statusLabel,
          detail: `${payload.stageLabel} ? ${payload.actionLabel}`
        };
      }
      case "task": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraTaskArtifact>>;
        return {
          title: payload.title,
          detail: `${payload.statusLabel} ? ${payload.caseLabel}`
        };
      }
      case "text-draft": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;
        return {
          title: payload.pieceLabel,
          detail: `${payload.statusLabel} ? ${payload.caseLabel}`
        };
      }
      case "comparison": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraComparisonArtifact>>;
        return {
          title: payload.firstLabel,
          detail: `${payload.statusLabel} ? ${payload.secondLabel}`
        };
      }
      case "filing-package": {
        const payload =
          record.payload as Awaited<ReturnType<typeof getClaraRevisionalFilingPackageArtifact>>;
        return {
          title: payload.title,
          detail: `${payload.statusLabel} ? ${payload.caseLabel}`
        };
      }
      case "process": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraProcessArtifact>>;
        return {
          title: payload.processLabel,
          detail: `${payload.statusLabel} ? ${payload.clientLabel}`
        };
      }
      case "case": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraCaseArtifact>>;
        return {
          title: payload.caseLabel,
          detail: `${payload.statusLabel} ? ${payload.bankLabel}`
        };
      }
      case "client": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraClientArtifact>>;
        return {
          title: payload.clientLabel,
          detail: `${payload.statusLabel} ? ${payload.bankLabel}`
        };
      }
    }
  }

  const filteredRecords = recentRecords.filter((record) => {
    if (historyKindFilter && record.kind !== historyKindFilter) {
      return false;
    }

    if (!historyQuery) {
      return true;
    }

    const summary = summarizeRecord(record)!;
    return [record.id, record.kind, record.sourceAction, summary.title, summary.detail]
      .join(" ")
      .toLowerCase()
      .includes(historyQuery);
  });
  const selectedHistoryRecord =
    filteredRecords.find((record) => record.id === searchParams?.selected_record) ??
    filteredRecords[0] ??
    null;
  const selectedHistorySummary = selectedHistoryRecord
    ? summarizeRecord(selectedHistoryRecord)!
    : null;
  const executionRecord = searchParams?.record
    ? recentRecords.find((record) => record.id === searchParams.record) ?? null
    : null;

  const historyReturnPath = `/clara?tab=${activeTab}${
    searchParams?.history_q ? `&history_q=${encodeURIComponent(searchParams.history_q)}` : ""
  }${searchParams?.history_kind ? `&history_kind=${encodeURIComponent(searchParams.history_kind)}` : ""}${
    selectedHistoryRecord ? `&selected_record=${encodeURIComponent(selectedHistoryRecord.id)}` : ""
  }#clara-history`;
  const executionReturnPath = `/clara?tab=${activeTab}${
    searchParams?.record ? `&record=${encodeURIComponent(searchParams.record)}` : ""
  }#clara-execucao`;
  const filingPackageEditorHref = `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=acao-revisional&objetivo=${encodeURIComponent(revisionalWorkspace?.objectiveProfile.label ?? activeWorkspace.title)}`;
  const workbenchActionHref = (action: string) =>
    `/clara?tab=${activeTab}${
      searchParams?.client ? `&client=${encodeURIComponent(searchParams.client)}` : `&client=${encodeURIComponent(selectedClient.id)}`
    }${
      searchParams?.process ? `&process=${encodeURIComponent(searchParams.process)}` : `&process=${encodeURIComponent(selectedProcess.id)}`
    }${
      searchParams?.case ? `&case=${encodeURIComponent(searchParams.case)}` : `&case=${encodeURIComponent(selectedCase.id)}`
    }${
      searchParams?.document ? `&document=${encodeURIComponent(searchParams.document)}` : `&document=${encodeURIComponent(selectedDocument.id)}`
    }${action ? `&action=${encodeURIComponent(action)}` : ""}#clara-execucao`;
  const workbenchActionTargetHref = (action: string) =>
    executedByTab[activeTab][action]?.cta.href ?? workbenchActionHref(action);
  const workbenchActions = activeWorkspace.workflow.actions.filter(
    (action) => !(activeTab === "analise" && action === "Analisar processo")
  );
  const quickActionLinks = [
    ...operational.links,
    ...(activeNiche && nicheOperational ? nicheOperational.links : []),
    ...workbenchActions.map((action) => ({
      label: action,
      href: workbenchActionTargetHref(action)
    }))
  ];
  const revisionalFlowCards =
    activeNiche === "revisional" && revisionalWorkspace
      ? [
          {
            step: "01",
            title: "Triagem",
            detail: revisionalWorkspaceResolved.analysis.executiveSummary,
            href: `/analise-contrato?documentId=${revisionalWorkspaceResolved.selectedDocument.id}&client=${selectedClient.id}&process=${selectedProcess.id}&objetivo=${encodeURIComponent(revisionalWorkspaceResolved.objectiveProfile.label)}`
          },
          {
            step: "02",
            title: "Abusividades",
            detail: revisionalWorkspaceResolved.analysis.abusivenessSignals[0] ?? "Abrir o documento para verificar as clausulas abusivas.",
            href: `/documentos/${selectedDocument.id}`
          },
          {
            step: "03",
            title: "Estrategia",
            detail: revisionalWorkspaceResolved.decisionSummary,
            href: `/processos/${selectedProcess.id}?record_tab=revisional-package&client=${selectedClient.id}&document=${selectedDocument.id}${searchParams?.objetivo ? `&objetivo=${encodeURIComponent(searchParams.objetivo)}` : ""}`
          },
          {
            step: "04",
            title: "Prova e calculo",
            detail: `${revisionalWorkspaceResolved.calculationMemory.basis} O botao de impressao fica na pagina de destino.`,
            href: `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=acao-revisional&objetivo=${encodeURIComponent("Montar memoria de calculo")}&contractedInstallment=${encodeURIComponent(revisionalWorkspaceResolved.calculationMemory.labels.contractedInstallment)}&chargedInstallment=${encodeURIComponent(revisionalWorkspaceResolved.calculationMemory.labels.chargedInstallment)}&revisedInstallment=${encodeURIComponent(revisionalWorkspaceResolved.calculationMemory.labels.revisedInstallment)}&estimatedTotalExcess=${encodeURIComponent(revisionalWorkspaceResolved.calculationMemory.labels.estimatedTotalExcess)}`
          },
          {
            step: "05",
            title: "Minuta inicial",
            detail: revisionalWorkspaceResolved.filingPackage.summary,
            href: `/editor-de-texto/meus-textos?draft=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=acao-revisional&objetivo=${encodeURIComponent(revisionalWorkspaceResolved.objectiveProfile.label)}&contractedInstallment=${encodeURIComponent(revisionalWorkspaceResolved.calculationMemory.labels.contractedInstallment)}&chargedInstallment=${encodeURIComponent(revisionalWorkspaceResolved.calculationMemory.labels.chargedInstallment)}&revisedInstallment=${encodeURIComponent(revisionalWorkspaceResolved.calculationMemory.labels.revisedInstallment)}&estimatedTotalExcess=${encodeURIComponent(revisionalWorkspaceResolved.calculationMemory.labels.estimatedTotalExcess)}`
          }
        ]
      : null;

  function workflowStatusLabel(record: ClaraRecord) {
    switch (record.workflowStatus) {
      case "reviewed":
        return "Revisado";
      case "completed":
        return "Concluido";
      default:
        return "Criado";
    }
  }

  function nextWorkflowActions(record: ClaraRecord) {
    if (record.workflowStatus === "created") {
      return ["reviewed", "completed"] as const;
    }

    if (record.workflowStatus === "reviewed") {
      return ["completed", "created"] as const;
    }

    return ["reviewed", "created"] as const;
  }

  function workflowActionLabel(status: "created" | "reviewed" | "completed") {
    switch (status) {
      case "reviewed":
        return "Marcar revisado";
      case "completed":
        return "Marcar concluido";
      default:
        return "Reabrir";
    }
  }

  function detailLines(record: ClaraRecord) {
    switch (record.kind) {
      case "agenda": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraAgendaArtifact>>;
        return payload.talkingPoints;
      }
      case "deadline": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraDeadlineArtifact>>;
        return payload.steps;
      }
      case "task": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraTaskArtifact>>;
        return payload.checklistPreview;
      }
      case "text-draft": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;
        return payload.sections;
      }
      case "comparison": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraComparisonArtifact>>;
        return payload.findings;
      }
      case "filing-package": {
        const payload =
          record.payload as Awaited<ReturnType<typeof getClaraRevisionalFilingPackageArtifact>>;
        return [...payload.packageItems, payload.nextStep];
      }
      case "process": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraProcessArtifact>>;
        return payload.highlights;
      }
      case "case": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraCaseArtifact>>;
        return payload.highlights;
      }
      case "client": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraClientArtifact>>;
        return payload.highlights;
      }
      default:
        return [];
    }
  }

  function confidenceLabel(level: "high" | "medium" | "low") {
    switch (level) {
      case "high":
        return "Confianca alta";
      case "medium":
        return "Confianca media";
      default:
        return "Confianca baixa";
    }
  }

  function historyEventLabel(record: ClaraRecord["history"][number]) {
    switch (record.event) {
      case "workflow-transition":
        return "Transicao de status";
      case "review-note-updated":
        return "Observacao de revisao";
      case "content-updated":
        return "Conteudo revisado";
      default:
        return "Criacao do registro";
    }
  }

  const claraPageBaseHref = `/clara?niche=${encodeURIComponent(activeNiche ?? "revisional")}&client=${encodeURIComponent(selectedClient.id)}&case=${encodeURIComponent(selectedCase.id)}&process=${encodeURIComponent(selectedProcess.id)}&document=${encodeURIComponent(selectedDocument.id)}&task=${encodeURIComponent(selectedTask.id)}`;
  const activeModeLabel = tabItems.find((item) => item.id === activeTab)?.label ?? "Triagem";
  const activeLegalMode = getClaraLegalModeByTab(activeTab);
  const documentsFoundItems = clara.structuredCore.documentsFound.slice(0, 4);
  const pendingItems = clara.structuredCore.documentsMissing.slice(0, 4);
  const pieceRecords = filteredRecords.filter((record) => record.kind === "text-draft" || record.kind === "filing-package");
  const sourceItems = clara.structuredCore.sourceAdapters.slice(0, 4);
  const sidebarAlerts = clara.structuredCore.risks.slice(0, 3);
  const structuredResponse = buildClaraStructuredResponse({
    tab: activeTab,
    structuredCore: clara.structuredCore,
    sourceTrace: contextualAnalysis?.sourceTrace
  });
  const consultationLog = buildClaraConsultationLog({
    sourceAdapters: clara.structuredCore.sourceAdapters,
    jurisprudence: jurisprudenceConsultation
  });

  if (!activeNiche) {
    return (
      <div className="space-y-6">
        <ClaraLandingHero
          activeModeLabel={tabItems.find((item) => item.id === activeTab)?.label ?? "Triagem"}
          caseLabel={clara.structuredCore.context.bankingCase.title}
          clientLabel={clara.structuredCore.context.client.fullName}
          documentsMissing={clara.structuredCore.documentsMissing}
          factsConfirmed={clara.structuredCore.confirmedFacts}
          processLabel={clara.structuredCore.context.process?.processNumber ?? "Processo pendente"}
          risks={clara.structuredCore.risks}
          summary={clara.structuredCore.summary}
          tabs={tabItems}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="workspace-panel scroll-mt-40 p-6" id="clara-nicho-ativo">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="workspace-kicker">CLARA</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Advogada Digital IA
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Workspace juridico profissional para triagem, estrategia, intimacao, peca, jurisprudencia e revisao,
              sem poluir as paginas de cliente e processo.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Cliente: <span className="font-semibold text-white">{selectedClient.label.split(" · ")[0]}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Caso: <span className="font-semibold text-white">{workspaceCase.title}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Processo: <span className="font-semibold text-white">{workspaceProcess?.processNumber ?? selectedProcess.label}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Modo: <span className="font-semibold text-white">{activeModeLabel}</span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {tabItems.map((item) => {
            const active = item.id === activeTab;

            return (
              <Link
                key={item.id}
                className={`rounded-[4px] px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-[linear-gradient(90deg,#22c55e,#4ade80)] text-slate-950 shadow-soft"
                    : "clara-secondary-button border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                }`}
                href={`${claraPageBaseHref}&tab=${item.id}#clara-workbench`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <p className="mt-4 text-xs leading-6 text-slate-400">
          {nicheConfig?.summary ??
            "Escolha um nicho para abrir a sequencia operacional dentro do contexto correto."}
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_22rem]">
        <div className="space-y-4">
          <ClaraConversationCard
            badgeLabel="CLARA"
            badgeSubtitle={`${nicheConfig?.title ?? "Workspace juridico"} · ${activeModeLabel}`}
            responseDetail={activeWorkspace.summary}
            composerHint="Pressione Enter para enviar. Use Shift+Enter para quebrar linha."
            composerPlaceholder="Ex.: Analise a prova, diga o risco e monte a proxima acao juridica."
            clientOptions={visibleClientOptions}
          />

          <section className="workspace-panel p-5">
            <div className="flex flex-col gap-2">
              <p className="workspace-kicker">Resposta estruturada</p>
              <h3 className="text-lg font-semibold text-white">{activeLegalMode.label}</h3>
              <p className="text-sm leading-6 text-slate-300">{activeLegalMode.summary}</p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="workspace-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">Fatos confirmados</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  {structuredResponse.factsConfirmed.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div className="workspace-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">Pendencias</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  {structuredResponse.pendingItems.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div className="workspace-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-100">Riscos</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  {structuredResponse.risks.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div className="workspace-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Sugestao juridica</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{structuredResponse.legalSuggestion}</p>
              </div>
              <div className="workspace-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Proxima acao</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{structuredResponse.nextAction}</p>
              </div>
              <div className="workspace-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Fontes e revisao</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Banco interno: {structuredResponse.sourceBuckets.origem_interna.length} | API: {structuredResponse.sourceBuckets.origem_api.length} | Inferencia: {structuredResponse.sourceBuckets.inferencia_controlada.length}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{structuredResponse.reviewStatus}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="workspace-panel p-5">
            <p className="workspace-kicker">Resumo do caso</p>
            <p className="mt-3 text-sm font-semibold text-white">{clara.structuredCore.classification.scenarioLabel}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{clara.structuredCore.summary}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <div className="detail-soft-row px-3 py-3">
                Fase: <span className="font-semibold text-white">{workspaceCase.stage}</span>
              </div>
              <div className="detail-soft-row px-3 py-3">
                Risco: <span className="font-semibold text-white">{clara.structuredCore.classification.decisionLabel}</span>
              </div>
              <div className="detail-soft-row px-3 py-3">
                Proxima acao: <span className="font-semibold text-white">{clara.structuredCore.nextStep}</span>
              </div>
            </div>
          </section>

          <section className="workspace-panel p-5">
            <p className="workspace-kicker">Documentos e pendencias</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">Presentes</p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
                  {documentsFoundItems.length > 0 ? (
                    documentsFoundItems.map((document) => <li key={document.id}>- {document.label}</li>)
                  ) : (
                    <li>- Nenhum documento base confirmado.</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">Pendentes</p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
                  {pendingItems.length > 0 ? (
                    pendingItems.map((item) => <li key={item}>- {item}</li>)
                  ) : (
                    <li>- Nenhuma pendencia essencial aberta.</li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          <section className="workspace-panel p-5">
            <p className="workspace-kicker">Pecas e revisao</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="detail-soft-row px-3 py-3">
                Registros prontos: <span className="font-semibold text-white">{pieceRecords.length}</span>
              </div>
              <div className="detail-soft-row px-3 py-3">
                Historico da Clara: <span className="font-semibold text-white">{filteredRecords.length}</span>
              </div>
              <div className="detail-soft-row px-3 py-3">
                Revisao final: <span className="font-semibold text-white">Humana obrigatoria</span>
              </div>
            </div>
          </section>

          <section className="workspace-panel p-5">
            <p className="workspace-kicker">Fontes e alertas</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Consultas preparadas</p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
                  {sourceItems.map((adapter) => (
                    <li key={adapter.sourceId}>
                      - {adapter.sourceLabel}: {adapter.status === "consulted" ? "consultada" : adapter.status === "not_consulted" ? "preparada" : adapter.status === "failed" ? "falha" : "indisponivel"}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-100">Alertas</p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
                  {sidebarAlerts.length > 0 ? (
                    sidebarAlerts.map((alert) => <li key={alert}>- {alert}</li>)
                  ) : (
                    <li>- Nenhum alerta critico adicional aberto.</li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          {activeTab === "intimacao" && intimationAnalysis ? (
            <section className="workspace-panel p-5">
              <p className="workspace-kicker">Analise de intimacao</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="detail-soft-row px-3 py-3">
                  Prazo: <span className="font-semibold text-white">{intimationAnalysis.deadlineLabel}</span>
                </div>
                <div className="detail-soft-row px-3 py-3">
                  Ato exigido: <span className="font-semibold text-white">{intimationAnalysis.actionRequired}</span>
                </div>
                <div className="detail-soft-row px-3 py-3">
                  Risco: <span className="font-semibold text-white">{intimationAnalysis.riskLabel}</span>
                </div>
                <p className="text-xs leading-6 text-slate-400">Fonte: {intimationAnalysis.sourceLabel}</p>
              </div>
            </section>
          ) : null}

          {activeTab === "jurisprudencia" && jurisprudenceConsultation ? (
            <section className="workspace-panel p-5">
              <p className="workspace-kicker">Jurisprudencia rastreavel</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{jurisprudenceConsultation.summary}</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="detail-soft-row px-3 py-3">
                  Status: <span className="font-semibold text-white">{jurisprudenceConsultation.consulted ? "Consultada" : "Sugestao de pesquisa"}</span>
                </div>
                <div className="detail-soft-row px-3 py-3">
                  Citar precedente: <span className="font-semibold text-white">{jurisprudenceConsultation.canCitePrecedent ? "Sim" : "Nao"}</span>
                </div>
              </div>
            </section>
          ) : null}

          <section className="workspace-panel p-5">
            <p className="workspace-kicker">Log de consultas</p>
            <div className="mt-4 space-y-3">
              {consultationLog.map((entry) => (
                <div key={entry.id} className="detail-soft-row px-3 py-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-white">{entry.sourceLabel}</span>
                    <span className="text-xs text-slate-400">{new Date(entry.loggedAt).toLocaleString("pt-BR")}</span>
                  </div>
                  <p className="mt-2 leading-6">{entry.queryHint}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Status: {entry.status} | Confianca: {entry.confidenceLabel}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      {renderClaraContextualAnalysis(contextualAnalysis)}

      <section className="workspace-panel scroll-mt-96 p-5" id="clara-workbench">
        <div className="flex flex-col gap-2">
          <p className="workspace-kicker">Bancada de trabalho</p>
          <p className="text-sm leading-6 text-slate-300">
            Ajuste o contexto antes da execucao. O cliente filtra os processos; o restante abre com mais contexto sob demanda.
          </p>
        </div>

        <div className="mt-4 rounded-[4px] border border-white/10 bg-white/[0.04] p-4">
          <form method="get">
            <input name="tab" type="hidden" value={activeTab} />
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Cliente
                </label>
                <select
                  className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                  defaultValue={selectedClient.id}
                  name="client"
                >
                  {visibleClientOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {visibleWorkflowFields.map((field, index) => {
                  const name =
                    field.type === "document" && activeTab === "comparador" && index === 1
                      ? "document2"
                      : field.type;

                  return (
                    <div key={`${field.label}-${name}`}>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {field.label}
                      </label>
                      {field.type === "custom" && hasOptions(field) ? (
                        <select
                          className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                          name={getCustomFieldName(activeTab, field.label)}
                        >
                          {field.options.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <select
                          className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                          defaultValue={(searchParams as Record<string, string | undefined> | undefined)?.[name]}
                          name={name}
                        >
                          {(() => {
                            const options =
                              field.type === "process"
                                ? processOptions
                                : getOptions(field.type);

                            if (!options.length) {
                              return (
                                <option disabled value="">
                                  Nenhuma opcao disponivel
                                </option>
                              );
                            }

                            return options.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ));
                          })()}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {extraWorkflowFields.length > 0 ? (
              <details className="mt-4 rounded-[4px] border border-white/10 bg-black/10 px-4 py-3">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-200">
                  Mais contexto
                </summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {extraWorkflowFields.map((field, sliceIndex) => {
                    const index = sliceIndex + 2;
                    const name =
                      field.type === "document" && activeTab === "comparador" && index === 1
                        ? "document2"
                        : field.type;

                    return (
                      <div key={`${field.label}-${name}`}>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {field.label}
                        </label>
                        {field.type === "custom" && hasOptions(field) ? (
                          <select
                            className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                            name={getCustomFieldName(activeTab, field.label)}
                          >
                            {field.options.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                        <select
                          className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                          defaultValue={(searchParams as Record<string, string | undefined> | undefined)?.[name]}
                          name={name}
                        >
                          {(() => {
                            const options =
                              field.type === "process"
                                ? processOptions
                                : getOptions(field.type);

                            if (!options.length) {
                              return (
                                <option disabled value="">
                                  Nenhuma opcao disponivel
                                </option>
                              );
                            }

                            return options.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ));
                          })()}
                        </select>
                      )}
                    </div>
                    );
                  })}
                </div>
              </details>
            ) : null}

            {quickActionLinks.length > 0 ? (
              <div className="mt-4 rounded-[4px] border border-white/10 bg-black/10 p-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Acoes rapidas
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {quickActionLinks.map((link, index) => (
                    <Link
                      key={`${link.label}-${link.href}`}
                      className="clara-secondary-button flex items-center gap-3 rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
                      href={link.href}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-xs font-semibold text-slate-100">
                        {index + 1}
                      </span>
                      <span className="min-w-0">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

          </form>
        </div>
      </section>

      {activeNiche && nicheOperational ? (
      <section className="workspace-panel p-5">
        <div className="flex flex-col gap-2">
          <p className="workspace-kicker">Motor do nicho</p>
          <p className="text-xs leading-5 text-slate-400">{nicheOperational.summary}</p>
        </div>
        <div className="mt-4 space-y-3">
          {nicheOperational.cards.map((card, index) => (
            <div key={card.label} className="workspace-soft-card flex items-start gap-3 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-xs font-semibold text-slate-100">
                {index + 1}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {card.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      ) : null}

      {activeNiche && nicheExecutionBlocks ? (
      <section className="workspace-panel p-5">
        <div className="flex flex-col gap-2">
          <p className="workspace-kicker">{nicheExecutionBlocks.title}</p>
          <p className="text-xs leading-5 text-slate-400">
            A Clara usa esta trilha para manter o trabalho dentro do nicho escolhido antes de abrir a saida formal.
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {nicheExecutionBlocks.steps.map((step, index) => (
            <div key={step} className="workspace-soft-card flex items-start gap-3 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-xs font-semibold text-slate-100">
                {index + 1}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Passo {index + 1}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-300">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      ) : null}

      {activeTab === "analise" ? (
        <section className="workspace-panel p-5">
          <div className="flex flex-col gap-2">
            <p className="workspace-kicker">Nucleo juridico estruturado</p>
            <p className="text-xs leading-5 text-slate-400">{clara.structuredCore.summary}</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="workspace-soft-card p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Classificacao
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {clara.structuredCore.classification.scenarioLabel}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {clara.structuredCore.classification.decisionLabel}
              </p>
            </div>
            <div className="workspace-soft-card p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Fatos confirmados
              </p>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-200">
                {clara.structuredCore.confirmedFacts.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="workspace-soft-card p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Lacunas documentais
              </p>
              {clara.structuredCore.documentsMissing.length > 0 ? (
                <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-200">
                  {clara.structuredCore.documentsMissing.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs leading-5 text-emerald-100">
                  Nenhuma lacuna essencial identificada.
                </p>
              )}
            </div>
            <div className="workspace-soft-card p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Proxima decisao
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-200">{clara.structuredCore.nextStep}</p>
              <p className="mt-2 text-[11px] leading-5 text-slate-400">{clara.structuredCore.recommendation}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="workspace-soft-card p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Documentos encontrados
              </p>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-200">
                {clara.structuredCore.documentsFound.map((document) => (
                  <li key={document.id}>{document.detail}</li>
                ))}
              </ul>
            </div>
            <div className="workspace-soft-card p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Riscos e consistencia
              </p>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-200">
                {clara.structuredCore.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 workspace-soft-card p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Fontes externas preparadas
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {clara.structuredCore.sourceAdapters.map((adapter) => (
                <div key={adapter.sourceId} className="rounded-[4px] border border-white/10 bg-black/10 p-3">
                  <p className="text-sm font-semibold text-white">{adapter.sourceLabel}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    {adapter.status === "failed"
                      ? "Falhou"
                      : adapter.status === "unavailable"
                        ? "Indisponivel"
                        : adapter.status === "consulted"
                          ? "Consultado"
                          : "Nao consultado"}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{adapter.scope}</p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-400">{adapter.queryHint}</p>
                  {adapter.failureReason ? (
                    <p className="mt-2 text-[11px] leading-5 text-rose-200">{adapter.failureReason}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 workspace-soft-card p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Trilha de auditoria
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{clara.structuredCore.auditTrail.summary}</p>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              {Object.entries(clara.structuredCore.auditTrail.originCounts).map(([origin, count]) => (
                <div key={origin} className="rounded-[4px] border border-white/10 bg-black/10 p-2">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{origin}</p>
                  <p className="mt-1 text-base font-semibold text-white">{count}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-[4px] border border-white/10 bg-black/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Entradas de origem
                </p>
                <div className="mt-3 space-y-3">
                  {clara.structuredCore.auditTrail.entries.slice(0, 10).map((entry) => (
                    <div key={`${entry.origin}-${entry.label}`} className="rounded-[4px] border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-white">{entry.label}</p>
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">
                          {entry.origin}
                        </span>
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">
                          {entry.confirmed ? "confirmado" : "inferencia"}
                        </span>
                        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-cyan-100">
                          {confidenceLabel(entry.confidence)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{entry.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[4px] border border-white/10 bg-black/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Alertas de consistencia
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                  {clara.structuredCore.auditTrail.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
                {clara.structuredCore.auditTrail.failures.length > 0 ? (
                  <div className="mt-4 rounded-[4px] border border-rose-300/20 bg-rose-300/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-100">
                      Fontes com falha
                    </p>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-rose-50">
                      {clara.structuredCore.auditTrail.failures.map((failure) => (
                        <li key={failure}>{failure}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {clara.structuredCore.auditTrail.unavailableSources.length > 0 ? (
                  <div className="mt-4 rounded-[4px] border border-amber-300/20 bg-amber-300/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">
                      Fontes indisponiveis
                    </p>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-amber-50">
                      {clara.structuredCore.auditTrail.unavailableSources.map((source) => (
                        <li key={source}>{source}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {revisionalFlowCards ? (
        <section className="workspace-panel p-6">
          <div className="flex flex-col gap-2">
            <p className="workspace-kicker">Fluxo revisional bancario</p>
            <p className="text-sm leading-6 text-slate-300">
              Cada etapa abre a pagina certa. A leitura detalhada e a impressao ficam dentro do destino correspondente.
            </p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {revisionalFlowCards.map((card) => (
              <Link
                key={card.step}
                className="workspace-soft-card flex h-full flex-col justify-between rounded-[4px] border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]"
                href={card.href}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">{card.step}</p>
                  <p className="mt-3 text-sm font-semibold text-white">{card.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{card.detail}</p>
                </div>
                <span className="mt-4 inline-flex w-fit rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  Abrir etapa
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <div className="rounded-[4px] border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="workspace-kicker">Estrategia consolidada</p>
              <p className="mt-2 text-sm leading-6 text-cyan-50">
                {revisionalWorkspaceResolved.strategySummary.mainThesis}
              </p>
              <p className="mt-3 text-sm leading-6 text-cyan-50/90">
                Tese alternativa: {revisionalWorkspaceResolved.strategySummary.alternativeThesis}
              </p>
              <p className="mt-3 text-sm leading-6 text-cyan-50/90">
                Tipo de acao sugerida: {revisionalWorkspaceResolved.strategySummary.actionType}
              </p>
              <p className="mt-3 text-sm leading-6 text-cyan-50/90">
                Risco processual: {revisionalWorkspaceResolved.strategySummary.riskLabel}
              </p>
              <div className="mt-3 space-y-2">
                {revisionalWorkspaceResolved.strategySummary.recommendedRequests.map((request) => (
                  <div
                    key={request}
                    className="rounded-[4px] border border-white/10 bg-black/20 px-3 py-2 text-sm text-cyan-50"
                  >
                    {request}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-6 text-cyan-50/80">
                Sugestao de acordo: {revisionalWorkspaceResolved.strategySummary.agreementSuggestion}
              </p>
            </div>
            <div className="rounded-[4px] border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="workspace-kicker">Laudo revisional</p>
              <p className="mt-2 text-sm leading-6 text-amber-50">
                Cliente: {revisionalWorkspaceResolved.reportSummary.clientLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-50">
                Caso: {revisionalWorkspaceResolved.reportSummary.caseLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-50">
                Banco: {revisionalWorkspaceResolved.reportSummary.bankLabel}
              </p>
              <p className="mt-3 text-sm leading-6 text-amber-50/90">
                Metodologia: {revisionalWorkspaceResolved.reportSummary.methodology}
              </p>
              <div className="mt-3 space-y-2">
                {revisionalWorkspaceResolved.reportSummary.originalVsRevised.map((item) => (
                  <div
                    key={item}
                    className="rounded-[4px] border border-white/10 bg-black/20 px-3 py-2 text-sm text-amber-50"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm leading-6 text-amber-50/90">
                Encargos sensiveis: {revisionalWorkspaceResolved.reportSummary.improperCharges.join(" · ")}
              </p>
              <p className="mt-3 text-xs leading-6 text-amber-50/80">
                {revisionalWorkspaceResolved.reportSummary.conclusion}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-400">
            Triagem, abusividades, estrategia, laudo, prova e minuta ja levam a paginas que contem o botao de imprimir.
          </p>
        </section>
      ) : null}

      <section className="space-y-4">
      <article className="workspace-panel scroll-mt-96 p-6" id="clara-execucao">
          {executedResult ? (
            <div className="mt-5 rounded-[4px] border border-amber-300/20 bg-amber-300/10 p-5">
              <p className="workspace-kicker">Execucao da Clara</p>
              <p className="mt-3 text-lg font-semibold text-white">{executedResult.title}</p>
              <div className="mt-4 space-y-2">
                {executedResult.body.map((line) => (
                  <p key={line} className="text-sm leading-7 text-slate-200">
                    {line}
                  </p>
                ))}
              </div>
              <Link
                className="mt-5 inline-flex rounded-[4px] bg-[linear-gradient(90deg,#22c55e,#4ade80)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft"
                href={executedResult.cta.href}
              >
                {executedResult.cta.label}
              </Link>
              {recordKind ? (
                // @ts-expect-error Next server action form binding
                <form action={commitClaraExecutionAction} className="mt-3">
                  <input name="targetPath" type="hidden" value={executedResult.cta.href} />
                  <input name="recordKind" type="hidden" value={recordKind} />
                  <input name="ownerType" type="hidden" value={recordOwnerType} />
                  <input name="ownerId" type="hidden" value={recordOwnerId} />
                  <input name="sourceAction" type="hidden" value={selectedAction} />
                  <input name="client" type="hidden" value={selectedClient.id} />
                  <input name="case" type="hidden" value={selectedCase.id} />
                  <input name="document" type="hidden" value={selectedDocument.id} />
                  <input name="document2" type="hidden" value={selectedDocument2.id} />
                  <input name="process" type="hidden" value={selectedProcess.id} />
                  <input name="task" type="hidden" value={selectedTask.id} />
                  <input name="piece" type="hidden" value={recordPiece} />
                  <input name="deadlineAction" type="hidden" value={selectedAction} />
                  <input name="focus" type="hidden" value={activeNiche === "revisional" && selectedAction === "Organizar provas e calculos" ? "revisional" : ""} />
                  <input name="objective" type="hidden" value={recordObjective} />
                  <button
                    className="clara-secondary-button inline-flex rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                    type="submit"
                  >
                    Criar registro no ERP
                  </button>
                </form>
              ) : null}
              {recordKind === "text-draft" && executionRecord ? (
                <div className="mt-4 rounded-[4px] border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                    Rascunho com revisao da advogada
                  </p>
                  <p className="mt-2 text-sm leading-6 text-cyan-50">
                    Este resultado pode ser editado no editor, revisado pela advogada e aprovado antes de entrar em uso.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      className="clara-secondary-button inline-flex rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                      href={`/editor-de-texto/meus-textos?record=${executionRecord.id}`}
                    >
                      Editar rascunho
                    </Link>
                    {
                      // @ts-expect-error Next server action form binding
                      <form action={updateClaraWorkflowStatusAction}>
                      <input name="recordId" type="hidden" value={executionRecord.id} />
                      <input name="workflowStatus" type="hidden" value="reviewed" />
                      <input name="returnPath" type="hidden" value={executionReturnPath} />
                      <button
                        className="clara-secondary-button inline-flex rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                        type="submit"
                      >
                        Enviar para revisao da advogada
                      </button>
                      </form>
                    }
                    {
                      // @ts-expect-error Next server action form binding
                      <form action={updateClaraWorkflowStatusAction}>
                      <input name="recordId" type="hidden" value={executionRecord.id} />
                      <input name="workflowStatus" type="hidden" value="completed" />
                      <input name="returnPath" type="hidden" value={executionReturnPath} />
                      <button
                        className="mj-model-button-green inline-flex items-center justify-center px-4 py-3 text-sm font-semibold"
                        type="submit"
                      >
                        Aprovar e usar
                      </button>
                      </form>
                    }
                  </div>
                </div>
              ) : null}
              {recordKind === "filing-package" && executionRecord ? (
                <div className="mt-4 rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                    Pacote operacional com revisao da advogada
                  </p>
                  <p className="mt-2 text-sm leading-6 text-emerald-50">
                    Este pacote pode ser aberto no editor como minuta formal, revisado pela advogada e aprovado antes do uso no processo.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      className="clara-secondary-button inline-flex rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                      href={filingPackageEditorHref}
                    >
                      Editar pacote
                    </Link>
                    {
                      // @ts-expect-error Next server action form binding
                      <form action={updateClaraWorkflowStatusAction}>
                      <input name="recordId" type="hidden" value={executionRecord.id} />
                      <input name="workflowStatus" type="hidden" value="reviewed" />
                      <input name="returnPath" type="hidden" value={executionReturnPath} />
                      <button
                        className="clara-secondary-button inline-flex rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                        type="submit"
                      >
                        Enviar para revisao da advogada
                      </button>
                      </form>
                    }
                    {
                      // @ts-expect-error Next server action form binding
                      <form action={updateClaraWorkflowStatusAction}>
                      <input name="recordId" type="hidden" value={executionRecord.id} />
                      <input name="workflowStatus" type="hidden" value="completed" />
                      <input name="returnPath" type="hidden" value={executionReturnPath} />
                      <button
                        className="mj-model-button-green inline-flex items-center justify-center px-4 py-3 text-sm font-semibold"
                        type="submit"
                      >
                        Aprovar e usar
                      </button>
                      </form>
                    }
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div
            className="clara-secondary-surface mt-5 rounded-[4px] border border-white/10 bg-white/[0.04] p-5"
            id="clara-history"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Historico da Clara
              </p>
              <span className="text-xs text-slate-500">{filteredRecords.length} registro(s)</span>
            </div>
            <form className="mt-4 grid gap-3 md:grid-cols-[1fr_12rem_auto]" method="get">
              <input name="tab" type="hidden" value={activeTab} />
              <input
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                defaultValue={searchParams?.history_q ?? ""}
                name="history_q"
                placeholder="Buscar por id, acao ou contexto"
                type="search"
              />
              <select
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                defaultValue={historyKindFilter}
                name="history_kind"
              >
                <option value="">Todos os tipos</option>
                <option value="agenda">Agenda</option>
                <option value="deadline">Prazos</option>
                <option value="task">Tarefas</option>
                <option value="text-draft">Minutas</option>
                <option value="comparison">Comparacoes</option>
                <option value="filing-package">Pacotes</option>
                <option value="process">Processos</option>
                <option value="case">Casos</option>
                <option value="client">Clientes</option>
              </select>
              <button
                className="clara-secondary-button rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                type="submit"
              >
                Filtrar
              </button>
            </form>
            <div className="mt-4 space-y-3">
              {filteredRecords.length ? (
                filteredRecords.map((record) => {
                  const summary = summarizeRecord(record)!;

                  return (
                    <div key={record.id}>
                      <Link
                        className="clara-tertiary-surface block rounded-[4px] border border-white/10 bg-black/20 px-4 py-4 transition hover:bg-white/[0.06]"
                        href={`/clara?tab=${activeTab}${searchParams?.history_q ? `&history_q=${encodeURIComponent(searchParams.history_q)}` : ""}${searchParams?.history_kind ? `&history_kind=${encodeURIComponent(searchParams.history_kind)}` : ""}&selected_record=${record.id}#clara-history`}
                      >
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span className="rounded-full border border-white/10 px-2 py-1 text-slate-300">
                            {record.kind}
                          </span>
                          <span className="rounded-full border border-white/10 px-2 py-1 text-slate-300">
                            {workflowStatusLabel(record)}
                          </span>
                          <span>{record.id}</span>
                          <span>{new Date(record.createdAt).toLocaleString("pt-BR")}</span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-white">{summary.title}</p>
                        <p className="mt-2 text-sm text-slate-300">{summary.detail}</p>
                        <p className="mt-2 text-xs text-slate-500">Acao: {record.sourceAction}</p>
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {nextWorkflowActions(record).map((status) => (
                          // @ts-expect-error Next server action form binding
                          <form action={updateClaraWorkflowStatusAction} key={status}>
                            <input name="recordId" type="hidden" value={record.id} />
                            <input name="workflowStatus" type="hidden" value={status} />
                            <input name="returnPath" type="hidden" value={historyReturnPath} />
                            <button
                              className="clara-secondary-button rounded-[4px] border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
                              type="submit"
                            >
                              {workflowActionLabel(status)}
                            </button>
                          </form>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="clara-tertiary-surface rounded-[4px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-slate-400">
                  Nenhum registro da Clara foi criado ainda.
                </div>
              )}
            </div>
            {selectedHistoryRecord ? (
              <div className="clara-tertiary-surface mt-5 rounded-[4px] border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Revisao do registro
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {selectedHistorySummary?.title}
                    </p>
                  </div>
                  <Link
                    className="clara-secondary-button rounded-[4px] border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
                    href={`${selectedHistoryRecord.targetPath}${selectedHistoryRecord.targetPath.includes("?") ? "&" : "?"}record=${selectedHistoryRecord.id}`}
                  >
                    Abrir no ERP
                  </Link>
                </div>
                <div className="mt-4 space-y-2">
                  {detailLines(selectedHistoryRecord).map((line) => (
                    <p key={line} className="text-sm leading-7 text-slate-300">
                      {line}
                    </p>
                  ))}
                </div>
                {
                  // @ts-expect-error Next server action form binding
                  <form action={updateClaraRecordContentAction} className="mt-4">
                    <input name="recordId" type="hidden" value={selectedHistoryRecord.id} />
                    <input name="returnPath" type="hidden" value={historyReturnPath} />
                    <div className="grid gap-3">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Titulo revisado
                        </label>
                        <input
                          className="reference-search-input w-full px-3 py-3 text-sm outline-none"
                          defaultValue={selectedHistoryRecord.editedTitle ?? selectedHistorySummary?.title ?? ""}
                          name="editedTitle"
                          placeholder="Ajuste o titulo final do registro"
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Resumo revisado
                        </label>
                        <textarea
                          className="reference-search-input min-h-[6.5rem] w-full px-3 py-3 text-sm outline-none"
                          defaultValue={selectedHistoryRecord.editedDetail ?? selectedHistorySummary?.detail ?? ""}
                          name="editedDetail"
                          placeholder="Consolide aqui a versao final revisada pelo advogado."
                        />
                      </div>
                    </div>
                    <button
                      className="clara-secondary-button mt-3 rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                      type="submit"
                    >
                      Salvar conteudo revisado
                    </button>
                  </form>
                }
                <p className="mt-4 text-xs text-slate-500">
                  Ultima atualizacao: {new Date(selectedHistoryRecord.updatedAt).toLocaleString("pt-BR")}
                </p>
                <div className="mt-4 rounded-[4px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Historico de execucao
                  </p>
                  <div className="mt-3 space-y-3">
                    {selectedHistoryRecord.history
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-[4px] border border-white/10 bg-black/20 px-3 py-3"
                        >
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                            <span className="rounded-full border border-white/10 px-2 py-1 text-slate-300">
                              {historyEventLabel(entry)}
                            </span>
                            <span>{new Date(entry.at).toLocaleString("pt-BR")}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-200">{entry.detail}</p>
                        </div>
                      ))}
                  </div>
                </div>
                {
                  // @ts-expect-error Next server action form binding
                  <form action={updateClaraReviewNoteAction} className="mt-4">
                    <input name="recordId" type="hidden" value={selectedHistoryRecord.id} />
                    <input name="returnPath" type="hidden" value={historyReturnPath} />
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Observacao da revisao humana
                    </label>
                    <textarea
                      className="reference-search-input min-h-[7rem] w-full px-3 py-3 text-sm outline-none"
                      defaultValue={selectedHistoryRecord.reviewNote ?? ""}
                      name="reviewNote"
                      placeholder="Registre ajuste, cautela juridica, pendencia ou validacao humana."
                    />
                    <button
                      className="clara-secondary-button mt-3 rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                      type="submit"
                    >
                      Salvar observacao
                    </button>
                  </form>
                }
              </div>
            ) : null}
          </div>

        </article>
      </section>
    </div>
  );
}






