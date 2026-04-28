import { BANKING_NICHES, getBankingNicheLabel, type LexiaResponseFixture } from "@lexia/domain";

import { getCases } from "@/server/services/cases/get-cases";
import { getClients } from "@/server/services/clients/get-clients";
import { getClaraStructuredCore } from "@/server/services/clara/get-clara-structured-core";
import { getContractAnalyses } from "@/server/services/contract-analysis/get-contract-analysis";
import { getDocuments } from "@/server/services/documents/get-documents";
import { getProcesses } from "@/server/services/processes/get-processes";
import { getTasks } from "@/server/services/tasks/get-tasks";

const modeLabels = {
  atendimento: "Atendimento",
  analise: "Analise",
  producao_juridica: "Producao Juridica",
  operacional: "Operacional"
} as const;

const claraResponseTemplates: readonly LexiaResponseFixture[] = [
  {
    id: "clara-dashboard",
    contextKey: "dashboard",
    title: "Leitura executiva da carteira",
    mode: "operacional",
    prompt: "Clara, resuma os gargalos mais urgentes da operacao bancaria desta semana.",
    contextBasis: [
      "clientes em espera documental",
      "tarefas urgentes da carteira",
      "contratos ja analisados",
      "prazos internos proximos"
    ],
    mainConclusion:
      "A operacao esta concentrada em pendencias documentais e tarefas urgentes ligadas a tutela e definicao de tese.",
    facts: [
      "Existem clientes aguardando documentacao complementar.",
      "As tarefas mais sensiveis estao ligadas a revisional e negativacao indevida.",
      "Os contratos mais relevantes ja possuem leitura juridica inicial."
    ],
    recommendations: [
      "Priorizar a fila urgente antes de abrir novos fluxos.",
      "Usar a base documental analisada para acelerar pecas e atualizacoes.",
      "Acionar o time para reduzir casos travados por documento faltante."
    ],
    nextActions: [
      "Abrir tarefas urgentes",
      "Revisar clientes sem atualizacao",
      "Gerar resumo executivo da semana"
    ],
    cautionLabel: "Sugestoes operacionais devem ser validadas pelo responsavel do escritorio."
  },
  {
    id: "clara-workspace",
    contextKey: "clara",
    title: "Workspace dedicado da Clara",
    mode: "producao_juridica",
    prompt: "Clara, consolide analise, estrategia e proximas acoes do escritorio bancario.",
    contextBasis: [
      "tenant atual",
      "objetos juridicos ativos",
      "modos de atuacao",
      "historico recente"
    ],
    mainConclusion:
      "A Clara opera como camada de apoio contextual, conectando atendimento, analise, producao e operacao sem perder rastreabilidade.",
    facts: [
      "Os modulos do sistema ja fornecem contexto suficiente para respostas ancoradas.",
      "A mesma base pode gerar resumo, tese sugerida, tarefa e atualizacao ao cliente."
    ],
    recommendations: [
      "Acionar primeiro o modo mais aderente ao tipo de trabalho.",
      "Transformar respostas importantes em objetos reaproveitaveis do escritorio."
    ],
    nextActions: [
      "Escolher modo de atuacao",
      "Comparar documentos",
      "Gerar minuta assistida"
    ],
    cautionLabel: "Toda recomendacao juridica da IA deve ser conferida pelo advogado responsavel."
  },
];

export async function getClaraWorkspace(params?: {
  clientId?: string;
  caseId?: string;
  processId?: string;
  documentId?: string;
  documentId2?: string;
  niche?: string;
  tab?: string;
  objective?: string;
}) {
  const [clients, cases, documents, processes, tasks, contractAnalyses] = await Promise.all([
    getClients(),
    getCases(),
    getDocuments(),
    getProcesses(),
    getTasks(),
    getContractAnalyses()
  ]);
  const structuredCore = await getClaraStructuredCore({
    clientId: params?.clientId,
    caseId: params?.caseId,
    processId: params?.processId,
    documentId: params?.documentId,
    niche: params?.niche,
    tab: params?.tab
  });
  const workspaceClient = structuredCore.context.client;
  const workspaceCase = structuredCore.context.bankingCase;
  const workspaceProcess = structuredCore.context.process;
  const selectedDocument = structuredCore.context.selectedDocument;
  const caseDocuments = structuredCore.context.caseDocuments;
  const primaryRevisionAnalysis =
    structuredCore.context.primaryAnalysis ??
    (selectedDocument
      ? contractAnalyses.find((analysis) => analysis.documentId === selectedDocument.id) ?? null
      : null) ??
    contractAnalyses.find((analysis) => caseDocuments.some((document) => document.id === analysis.documentId)) ??
    null;
  const fallbackDocument = {
    id: "no-document",
    clientId: workspaceClient.id,
    caseId: workspaceCase.id,
    fileName: "Nenhum documento vinculado",
    originalFileName: null,
    documentType: "Sem documento",
    category: "pendencia",
    summary: "A Clara segue em estado controlado ate o primeiro documento ser anexado ao caso.",
    tags: [] as string[],
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    uploadedBy: "Sistema",
    source: "internal" as const,
    storagePath: null,
    mimeType: null,
    sizeInBytes: 0,
    client: workspaceClient,
    bankingCase: workspaceCase,
    lexiaInsights: []
  };
  const resolvedSelectedDocument = selectedDocument ?? fallbackDocument;
  const comparisonDocuments = [
    resolvedSelectedDocument,
    caseDocuments.find((document) => document.id !== resolvedSelectedDocument.id) ?? resolvedSelectedDocument
  ];
  const processLabel = workspaceProcess?.processNumber ?? "Processo ainda nao vinculado";
  const urgentTasks = tasks.filter((task) => task.priority === "urgent" || task.priority === "high");
  const caseTasks = tasks.filter((task) => task.caseId === workspaceCase.id);
  const caseUrgentTasks = caseTasks.filter((task) => task.priority === "urgent" || task.priority === "high");
  const highlightedTasks = caseUrgentTasks.length > 0 ? caseUrgentTasks : urgentTasks;
  const missingDocumentsLabel =
    structuredCore.documentsMissing.length > 0
      ? structuredCore.documentsMissing.join(", ")
      : "nenhuma lacuna essencial";
  const defaultRevisionalHighlight =
    structuredCore.classification.nicheId === BANKING_NICHES[0].value
      ? "Fluxo revisional conectado ao contrato, memoria de calculo e saida formal da mesma pasta do caso."
      : "Fluxo juridico ancorado no caso, sem abrir superficie paralela ao workspace selecionado.";

  return {
    metrics: {
      contextualActions: "Cliente, Caso, Documento, Tarefa",
      activeMode: modeLabels.analise,
      responsesToday: tasks.length + documents.length + cases.length,
      confidenceLabel: "Assistida"
    },
    modes: [
      {
        id: "atendimento",
        title: "Atendimento",
        description:
          "Triagem inicial, score de viabilidade, checklist documental e orientacao de onboarding juridico."
      },
      {
        id: "analise",
        title: "Analise",
        description:
          "Resumo de processo, leitura contratual, indicios de abusividade e tese sugerida."
      },
      {
        id: "producao_juridica",
        title: "Producao Juridica",
        description:
          "Estrutura de peca, fundamentos, pedidos e organizacao de narrativa para minuta assistida."
      },
      {
        id: "operacional",
        title: "Operacional",
        description:
          "Tarefas, prioridades, atualizacao ao cliente e proximos passos com contexto real do escritorio."
      }
    ],
    featuredResponse: claraResponseTemplates.find((fixture) => fixture.contextKey === "clara")!,
    structuredCore,
    recentThreads: [
      {
        id: "thread-1",
        label: workspaceCase.title,
        detail: `Cliente ${workspaceClient.fullName} com foco em ${workspaceCase.mainThesis.toLowerCase()}.`
      },
      {
        id: "thread-2",
        label: processLabel,
        detail: `${structuredCore.classification.scenarioLabel} com proximo passo de ${structuredCore.nextStep.toLowerCase()}.`
      },
      {
        id: "thread-3",
        label: "Contrato em leitura",
        detail: `Documento ${resolvedSelectedDocument.documentType} pronto para aprofundamento juridico e producao dentro do caso selecionado.`
      }
    ],
    selectors: {
      clients: clients.map((client) => ({
        id: client.id,
        label: `${client.fullName} · ${client.bankName}`
      })),
      processes: processes.map((processItem) => ({
        id: processItem.id,
        clientId: processItem.clientId,
        caseId: processItem.caseId,
        label: `${processItem.processNumber} · ${processItem.tribunal}`
      })),
      cases: cases.map((caseItem) => ({
        id: caseItem.id,
        clientId: caseItem.clientId,
        label: `${caseItem.processNumber} · ${caseItem.title}`
      })),
      documents: documents.map((document) => ({
        id: document.id,
        clientId: document.clientId,
        caseId: document.caseId,
        label: `${document.documentType} · ${document.fileName}`
      })),
      tasks: tasks.map((task) => ({
        id: task.id,
        clientId: task.clientId,
        caseId: task.caseId,
        label: `${task.title} · ${task.assigneeLabel}`
      }))
    },
    tabs: {
      analise: {
        title: "Analise",
        subtitle: "Leitura juridica de processo, prazo e tese no contexto bancario.",
        summary:
          `${structuredCore.classification.scenarioLabel} em ${structuredCore.classification.nicheLabel.toLowerCase()} com decisao orientada para ${structuredCore.classification.decisionLabel.toLowerCase()}.`,
        highlights: [...workspaceCase.lexiaInsights, structuredCore.nextStep],
        cards: [
          { label: "Caso em foco", value: workspaceCase.title },
          { label: "Banco", value: workspaceCase.bankName },
          { label: "Fase", value: workspaceCase.stage },
          { label: "Risco", value: workspaceCase.legalRisk },
          { label: "Classificacao", value: structuredCore.classification.scenarioLabel },
          { label: "Lacunas", value: `${structuredCore.documentsMissing.length}` }
        ],
        workflow: {
          fields: [
            { label: "Processo", type: "process" },
            { label: "Documento base", type: "document" },
            { label: "Cliente", type: "client" }
          ],
          actions: ["Analisar processo", "Abrir prazo calculado", "Gerar resumo executivo"]
        }
      },
      intimacao: {
        title: "Intimacao",
        subtitle: "Leitura objetiva de intimacoes para extrair prazo, ato e proxima providencia.",
        summary:
          `Clara organiza a intimacao do processo ${processLabel.toLowerCase()} para destacar o prazo, o ato exigido e a resposta humana ou automatica que precisa sair agora.`,
        highlights: [
          "Extrair o ato intimado e a data limite de resposta.",
          "Separar o que exige revisao humana antes do protocolo.",
          structuredCore.nextStep
        ],
        cards: [
          { label: "Ato", value: workspaceCase.stage },
          { label: "Prazo", value: "Controlado pela Clara" },
          { label: "Resposta", value: structuredCore.classification.decisionLabel },
          { label: "Saida", value: structuredCore.recommendation }
        ],
        workflow: {
          fields: [
            { label: "Processo", type: "process" },
            { label: "Documento base", type: "document" },
            { label: "Cliente", type: "client" }
          ],
          actions: ["Analisar intimacao", "Extrair prazo", "Gerar resposta a intimacao"]
        }
      },
      revisional: {
        title: "Motor revisional bancario",
        subtitle: "Viabilidade, abusividades, estrategia, prova e minuta no mesmo fluxo.",
        summary:
          `Clara consolida a leitura a partir de ${resolvedSelectedDocument.documentType.toLowerCase()}, memoria de calculo e sinais do caso ${workspaceCase.title.toLowerCase()} para decidir se vale entrar com acao, quais clausulas atacar e qual minuta abrir primeiro.`,
        highlights: [
          primaryRevisionAnalysis
            ? `Tese sugerida: ${primaryRevisionAnalysis.suggestedThesis}.`
            : structuredCore.classification.rationale,
          primaryRevisionAnalysis
            ? `CET identificado: ${primaryRevisionAnalysis.cetLabel}.`
            : `Lacunas documentais: ${missingDocumentsLabel}.`,
          primaryRevisionAnalysis?.abusivenessSignals[0] ?? structuredCore.risks[0],
          defaultRevisionalHighlight
        ],
        cards: [
          { label: "Contrato foco", value: resolvedSelectedDocument.documentType },
          {
            label: "Tese revisional",
            value:
              primaryRevisionAnalysis?.suggestedThesis ?? structuredCore.classification.decisionLabel
          },
          {
            label: "Risco processual",
            value:
              primaryRevisionAnalysis?.proceduralRisk === "low"
                ? "Baixo"
                : primaryRevisionAnalysis?.proceduralRisk === "high"
                  ? "Alto"
                  : "Medio"
          },
          { label: "Saida", value: "Estrategia + minuta inicial" }
        ],
        workflow: {
          fields: [
            { label: "Cliente", type: "client" },
            { label: "Processo", type: "process" },
            { label: "Contrato base", type: "document" },
            {
              label: "Objetivo",
              type: "custom",
              options: [
                "Revisar clausulas e parcelas",
                "Rediscutir CET e encargos",
                "Preparar acao revisional",
                "Montar memoria de calculo"
              ]
            }
          ],
          actions: [
            "Triar viabilidade revisional",
            "Mapear abusividades",
            "Montar estrategia revisional",
            "Organizar provas e calculos",
            "Gerar minuta inicial revisional"
          ]
        }
      },
      pecas: {
        title: "Pecas",
        subtitle: "Estruturacao assistida de minuta, fundamentos e pedidos.",
        summary:
          "A Clara organiza a narrativa inicial, separa fundamentos bancarios, orienta pedidos e prepara a minuta para revisao humana.",
        highlights: [
          `Peca prioritaria: ${structuredCore.classification.decisionLabel.toLowerCase()}.`,
          `Fundamento central: ${workspaceCase.mainThesis}.`,
          structuredCore.nextStep
        ],
        cards: [
          { label: "Minuta sugerida", value: structuredCore.classification.decisionLabel },
          {
            label: "Nicho",
            value: getBankingNicheLabel(workspaceCase.niche)
          },
          {
            label: "Responsavel",
            value: workspaceCase.ownerLabel
          },
          { label: "Status", value: "Pronta para rascunho" }
        ],
        workflow: {
          fields: [
            { label: "Caso", type: "case" },
            { label: "Documento principal", type: "document" },
            {
              label: "Tipo de peca",
              type: "custom",
              options: ["Peticao inicial", "Contestacao", "Manifestacao", "Recurso", "Pedido de tutela"]
            }
          ],
          actions: ["Redigir peticao inicial", "Montar fundamentos", "Abrir minuta assistida"]
        }
      },
      jurisprudencia: {
        title: "Jurisprudencia",
        subtitle:
          "Pesquisa guiada por tese, tribunal e tipo de demanda. Em direito bancario, o STJ costuma ser o eixo principal; o STF entra quando houver debate constitucional real.",
        summary:
          "A Clara filtra precedentes por tese bancaria, tribunal competente e recorte do caso para acelerar a fundamentacao. A prioridade pratica fica no STJ; o STF entra apenas quando a tese precisar de recorte constitucional.",
        highlights: [
          `Buscar julgados coerentes com a tese ${workspaceCase.mainThesis.toLowerCase()} no STJ.`,
          `Separar precedentes aderentes ao nicho ${structuredCore.classification.nicheLabel.toLowerCase()}.`,
          "Usar o STF apenas quando a discussao exigir recorte constitucional."
        ],
        cards: [
          { label: "Tema principal", value: workspaceCase.mainThesis },
          { label: "Tribunal alvo", value: "STJ em primeiro plano" },
          { label: "Recorte", value: structuredCore.classification.scenarioLabel },
          { label: "Modo", value: "Pesquisa assistida" }
        ],
        workflow: {
          fields: [
            { label: "Caso", type: "case" },
            {
              label: "Nicho de atuacao",
              type: "custom",
              options: BANKING_NICHES.map((entry) => entry.label)
            },
            { label: "Tribunal", type: "custom", options: ["TJSP", "TJRJ", "TJMG", "STJ", "STF"] }
          ],
          actions: ["Pesquisar STJ", "Pesquisar STF", "Montar base jurisprudencial"]
        }
      },
      checklist: {
        title: "Checklist",
        subtitle: "Execucao operacional com itens pendentes do caso e da carteira.",
        summary:
          "A Clara converte leitura juridica em lista operacional para evitar que o escritorio perca prova, prazo ou etapa de preparacao.",
        highlights: highlightedTasks.flatMap((task) =>
          task.checklist
            .filter((item) => !item.done)
            .slice(0, 2)
            .map((item) => `${task.title}: ${item.label}`)
        ),
        cards: [
          { label: "Tarefas urgentes", value: `${highlightedTasks.length}` },
          {
            label: "Checklist aberto",
            value: `${highlightedTasks.reduce(
              (sum, task) => sum + task.checklist.filter((item) => !item.done).length,
              0
            )}`
          },
          { label: "Foco", value: "Prova e tutela" },
          { label: "Acionamento", value: "No fluxo do caso" }
        ],
        workflow: {
          fields: [
            { label: "Tarefa", type: "task" },
            { label: "Caso", type: "case" },
            { label: "Prioridade", type: "custom", options: ["Urgente", "Alta", "Media", "Baixa"] }
          ],
          actions: ["Gerar checklist", "Reordenar execucao", "Transformar em tarefa operacional"]
        }
      },
      "proximos-passos": {
        title: "Proximos passos",
        subtitle:
          "Prioridade pratica do escritorio com base no contexto mais sensivel, fechando distribuicao e acompanhamento depois da producao do documento.",
        summary:
          "A Clara ordena o que deve acontecer agora, depois e em seguida, para evitar dispersao operacional na carteira bancaria. Depois da minuta, o foco passa a ser distribuicao e acompanhamento da acao.",
        highlights:
          highlightedTasks.length > 0
            ? highlightedTasks.slice(0, 3).map((task) => task.lexiaNextStep)
            : [structuredCore.nextStep, structuredCore.recommendation],
        cards: [
          { label: "Agora", value: highlightedTasks[0]?.title ?? structuredCore.nextStep },
          { label: "Depois", value: highlightedTasks[1]?.title ?? structuredCore.recommendation },
          { label: "Atualizacao", value: "Cliente apos marco interno" },
          { label: "Ritmo", value: "Operacional" }
        ],
        workflow: {
          fields: [
            { label: "Cliente", type: "client" },
            { label: "Caso", type: "case" },
            { label: "Janela", type: "custom", options: ["Hoje", "48 horas", "Esta semana"] }
          ],
          actions: ["Distribuir acao", "Acompanhar acao", "Gerar atualizacao ao cliente"]
        }
      },
      comparador: {
        title: "Comparador de documentos",
        subtitle: "Leitura paralela de contratos e anexos para localizar divergencias e reforcos de tese.",
        summary:
          `O comparador ajuda a cruzar clausulas, encargos e sinais juridicos entre documentos bancarios do caso ${workspaceCase.title}.`,
        highlights: [
          `Documento 1: ${comparisonDocuments[0].fileName}`,
          `Documento 2: ${comparisonDocuments[1].fileName}`,
          "Comparar clausulas sensiveis, encargos, capitalizacao e pedidos possiveis."
        ],
        cards: [
          { label: "Documento base", value: resolvedSelectedDocument.documentType },
          { label: "Comparado com", value: comparisonDocuments[1].documentType },
          { label: "Objetivo", value: "Divergencias e tese" },
          { label: "Saida", value: "Resumo comparativo" }
        ],
        workflow: {
          fields: [
            { label: "Documento 1", type: "document" },
            { label: "Documento 2", type: "document" },
            { label: "Comparar por", type: "custom", options: ["Clausulas", "Encargos", "Tese", "Pedidos"] }
          ],
          actions: ["Comparar documentos", "Apontar divergencias", "Gerar quadro comparativo"]
        }
      }
    }
  };
}

export function getClaraFixtureByContextKey(contextKey: string) {
  return (
    claraResponseTemplates.find((fixture) => fixture.contextKey === contextKey) ??
    claraResponseTemplates.find((fixture) => fixture.contextKey === "clara")!
  );
}
