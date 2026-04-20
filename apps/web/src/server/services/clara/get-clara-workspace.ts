import {
  lexiaFixtures,
  mockCases,
  mockClients,
  mockContractAnalyses,
  mockDocuments,
  mockProcesses,
  mockTasks
} from "@lexia/mocks";
import { BANKING_NICHES, getBankingNicheLabel } from "@lexia/domain";

import { getClaraStructuredCore } from "@/server/services/clara/get-clara-structured-core";

const modeLabels = {
  atendimento: "Atendimento",
  analise: "Analise",
  producao_juridica: "Producao Juridica",
  operacional: "Operacional"
} as const;

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
  const responsesToday = mockTasks.length + mockDocuments.length + mockCases.length;
  const primaryCase = mockCases[0];
  const secondaryCase = mockCases[2];
  const primaryDocument = mockDocuments[0];
  const primaryRevisionAnalysis = mockContractAnalyses[0];
  const comparisonDocuments = [mockDocuments[0], mockDocuments[3]];
  const urgentTasks = mockTasks.filter((task) => task.priority === "urgent" || task.priority === "high");
  const structuredCore = getClaraStructuredCore({
    clientId: params?.clientId,
    caseId: params?.caseId,
    processId: params?.processId,
    documentId: params?.documentId,
    niche: params?.niche,
    tab: params?.tab
  });

  return {
    metrics: {
      contextualActions: "Cliente, Caso, Documento, Tarefa",
      activeMode: modeLabels.analise,
      responsesToday,
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
    featuredResponse:
      lexiaFixtures.find((fixture) => fixture.contextKey === "clara") ??
      lexiaFixtures.find((fixture) => fixture.contextKey === "lexia")!,
    structuredCore,
    recentThreads: [
      {
        id: "thread-1",
        label: "Revisional de financiamento de veiculo",
        detail: `Cliente ${mockClients[0].fullName} com foco em juros abusivos e seguro embutido.`
      },
      {
        id: "thread-2",
        label: mockCases[1].title,
        detail: `Caso ${mockCases[1].processNumber} aguardando robustez documental antes da proxima peca.`
      },
      {
        id: "thread-3",
        label: "CCB com capitalizacao mensal",
        detail: `Documento ${mockDocuments[3].documentType} pronto para aprofundamento juridico e producao.`
      }
    ],
    selectors: {
      clients: mockClients.map((client) => ({
        id: client.id,
        label: `${client.fullName} · ${client.bankName}`
      })),
      processes: mockProcesses.map((processItem) => ({
        id: processItem.id,
        clientId: processItem.clientId,
        caseId: processItem.caseId,
        label: `${processItem.processNumber} · ${processItem.tribunal}`
      })),
      cases: mockCases.map((caseItem) => ({
        id: caseItem.id,
        clientId: caseItem.clientId,
        label: `${caseItem.processNumber} · ${caseItem.title}`
      })),
      documents: mockDocuments.map((document) => ({
        id: document.id,
        clientId: document.clientId,
        caseId: document.caseId,
        label: `${document.documentType} · ${document.fileName}`
      })),
      tasks: mockTasks.map((task) => ({
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
        highlights: [...primaryCase.lexiaInsights, structuredCore.nextStep],
        cards: [
          { label: "Caso em foco", value: primaryCase.title },
          { label: "Banco", value: primaryCase.bankName },
          { label: "Fase", value: primaryCase.stage },
          { label: "Risco", value: primaryCase.legalRisk },
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
        subtitle: "Leitura objetiva de intimações para extrair prazo, ato e próxima providência.",
        summary:
          `Clara organiza a intimação do processo ${primaryCase.processNumber} para destacar o prazo, o ato exigido e a resposta humana ou automatica que precisa sair agora.`,
        highlights: [
          "Extrair o ato intimado e a data limite de resposta.",
          "Separar o que exige revisao humana antes do protocolo.",
          "Transformar a leitura em proxima providencia operacional."
        ],
        cards: [
          { label: "Ato", value: "Intimacao recebida" },
          { label: "Prazo", value: "Controlado pela Clara" },
          { label: "Resposta", value: "A definir" },
          { label: "Saida", value: "Checklist e minuta" }
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
          `Clara consolida a revisional a partir de ${primaryDocument.documentType.toLowerCase()}, memoria de calculo e sinais de abusividade para decidir se vale entrar com acao, quais clausulas atacar e qual minuta abrir primeiro.`,
        highlights: [
          `Tese sugerida: ${primaryRevisionAnalysis.suggestedThesis}.`,
          `CET identificado: ${primaryRevisionAnalysis.cetLabel}.`,
          primaryRevisionAnalysis.abusivenessSignals[0],
          "Fluxo proprio para prova, calculo revisional e estrutura de inicial."
        ],
        cards: [
          { label: "Contrato foco", value: primaryDocument.documentType },
          { label: "Tese revisional", value: primaryRevisionAnalysis.suggestedThesis },
          { label: "Risco processual", value: primaryRevisionAnalysis.proceduralRisk === "low" ? "Baixo" : "Medio" },
          { label: "Saida", value: "Estrategia + minuta inicial" }
        ],
        workflow: {
          fields: [
            { label: "Cliente", type: "client" },
            { label: "Processo", type: "process" },
            { label: "Contrato base", type: "document" },
            { label: "Objetivo", type: "custom", options: ["Revisar clausulas e parcelas", "Rediscutir CET e encargos", "Preparar acao revisional", "Montar memoria de calculo"] }
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
          `Peca prioritaria: inicial de ${secondaryCase.title.toLowerCase()}.`,
          `Fundamento central: ${secondaryCase.mainThesis}.`,
          "Priorizar tutela para limitar cobranca ou retirar restricao quando houver urgencia."
        ],
        cards: [
          { label: "Minuta sugerida", value: "Peticao inicial revisional" },
          { label: "Nicho", value: getBankingNicheLabel(secondaryCase.niche) },
          { label: "Responsavel", value: secondaryCase.ownerLabel },
          { label: "Status", value: "Pronta para rascunho" }
        ],
        workflow: {
          fields: [
            { label: "Caso", type: "case" },
            { label: "Documento principal", type: "document" },
            { label: "Tipo de peca", type: "custom", options: ["Peticao inicial", "Contestacao", "Manifestacao", "Recurso", "Pedido de tutela"] }
          ],
          actions: ["Redigir peticao inicial", "Montar fundamentos", "Abrir minuta assistida"]
        }
      },
      jurisprudencia: {
        title: "Jurisprudencia",
        subtitle: "Pesquisa guiada por tese, tribunal e tipo de demanda. Em direito bancario, o STJ costuma ser o eixo principal; o STF entra quando houver debate constitucional real.",
        summary:
          "A Clara filtra precedentes por tese bancaria, tribunal competente e recorte do caso para acelerar a fundamentacao. A prioridade pratica fica no STJ; o STF entra apenas quando a tese precisar de recorte constitucional.",
        highlights: [
          "Buscar julgados sobre juros abusivos, capitalizacao e encargos no STJ.",
          "Separar precedentes sobre consignado nao autorizado, falha de contratacao e tutela no STJ.",
          "Usar o STF apenas quando a discussao exigir recorte constitucional."
        ],
        cards: [
          { label: "Tema principal", value: primaryCase.mainThesis },
          { label: "Tribunal alvo", value: "STJ em primeiro plano" },
          { label: "Recorte", value: "Contratos bancarios" },
          { label: "Modo", value: "Pesquisa assistida" }
        ],
        workflow: {
          fields: [
            { label: "Caso", type: "case" },
            { label: "Nicho de atuacao", type: "custom", options: BANKING_NICHES.map((entry) => entry.label) },
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
        highlights: urgentTasks.flatMap((task) =>
          task.checklist.filter((item) => !item.done).slice(0, 2).map((item) => `${task.title}: ${item.label}`)
        ),
        cards: [
          { label: "Tarefas urgentes", value: `${urgentTasks.length}` },
          { label: "Checklist aberto", value: `${urgentTasks.reduce((sum, task) => sum + task.checklist.filter((item) => !item.done).length, 0)}` },
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
        subtitle: "Prioridade pratica do escritorio com base no contexto mais sensivel, fechando distribuicao e acompanhamento depois da producao do documento.",
        summary:
          "A Clara ordena o que deve acontecer agora, depois e em seguida, para evitar dispersao operacional na carteira bancaria. Depois da minuta, o foco passa a ser distribuicao e acompanhamento da acao.",
        highlights: urgentTasks.slice(0, 3).map((task) => task.lexiaNextStep),
        cards: [
          { label: "Agora", value: urgentTasks[0]?.title ?? "Sem urgencia critica" },
          { label: "Depois", value: urgentTasks[1]?.title ?? "Sem etapa secundaria" },
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
          "O comparador ajuda a cruzar clausulas, encargos e sinais juridicos entre documentos bancarios do mesmo caso ou de casos semelhantes.",
        highlights: [
          `Documento 1: ${comparisonDocuments[0].fileName}`,
          `Documento 2: ${comparisonDocuments[1].fileName}`,
          "Comparar clausulas sensiveis, encargos, capitalizacao e pedidos possiveis."
        ],
        cards: [
          { label: "Documento base", value: primaryDocument.documentType },
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
    lexiaFixtures.find((fixture) => fixture.contextKey === contextKey) ??
    lexiaFixtures.find((fixture) => fixture.contextKey === "clara") ??
    lexiaFixtures.find((fixture) => fixture.contextKey === "lexia")!
  );
}
