import {
  lexiaFixtures,
  mockCases,
  mockClients,
  mockContractAnalyses,
  mockDocuments,
  mockProcesses,
  mockTasks
} from "@lexia/mocks";

const modeLabels = {
  atendimento: "Atendimento",
  analise: "Analise",
  producao_juridica: "Producao Juridica",
  operacional: "Operacional"
} as const;

export async function getClaraWorkspace() {
  const responsesToday = mockTasks.length + mockDocuments.length + mockCases.length;
  const primaryCase = mockCases[0];
  const secondaryCase = mockCases[2];
  const primaryDocument = mockDocuments[0];
  const primaryRevisionAnalysis = mockContractAnalyses[0];
  const comparisonDocuments = [mockDocuments[0], mockDocuments[3]];
  const urgentTasks = mockTasks.filter((task) => task.priority === "urgent" || task.priority === "high");

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
    recentThreads: [
      {
        id: "thread-1",
        label: "Revisional de financiamento de veiculo",
        detail: `Cliente ${mockClients[0].fullName} com foco em juros abusivos e seguro embutido.`
      },
      {
        id: "thread-2",
        label: "Fraude bancaria via PIX",
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
        label: `${processItem.processNumber} · ${processItem.tribunal}`
      })),
      cases: mockCases.map((caseItem) => ({
        id: caseItem.id,
        label: `${caseItem.processNumber} · ${caseItem.title}`
      })),
      documents: mockDocuments.map((document) => ({
        id: document.id,
        label: `${document.documentType} · ${document.fileName}`
      })),
      tasks: mockTasks.map((task) => ({
        id: task.id,
        label: `${task.title} · ${task.assigneeLabel}`
      }))
    },
    tabs: {
      analise: {
        title: "Analise",
        subtitle: "Leitura juridica de processo, prazo e tese no contexto bancario.",
        summary:
          `Processo ${primaryCase.processNumber} com aderencia forte a ${primaryCase.mainThesis.toLowerCase()} e necessidade de consolidar memoria de calculo antes da peca.`,
        highlights: primaryCase.lexiaInsights,
        cards: [
          { label: "Caso em foco", value: primaryCase.title },
          { label: "Banco", value: primaryCase.bankName },
          { label: "Fase", value: primaryCase.stage },
          { label: "Risco", value: primaryCase.legalRisk }
        ],
        workflow: {
          fields: [
            { label: "Processo", type: "process" },
            { label: "Documento base", type: "document" },
            { label: "Cliente", type: "client" }
          ],
          actions: ["Analisar processo", "Calcular prazo", "Gerar resumo executivo"]
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
          { label: "Base", value: secondaryCase.claimType },
          { label: "Responsavel", value: secondaryCase.ownerLabel },
          { label: "Status", value: "Pronta para rascunho" }
        ],
        workflow: {
          fields: [
            { label: "Caso", type: "case" },
            { label: "Documento principal", type: "document" },
            { label: "Tipo de peca", type: "custom", options: ["Peticao inicial", "Contestacao", "Manifestacao", "Recurso", "Pedido de tutela"] }
          ],
          actions: ["Gerar estrutura", "Montar fundamentos", "Abrir minuta assistida"]
        }
      },
      jurisprudencia: {
        title: "Jurisprudencia",
        subtitle: "Pesquisa guiada por tese, tribunal e tipo de demanda.",
        summary:
          "A Clara filtra precedentes por tese bancaria, tribunal competente e recorte do caso para acelerar a fundamentacao.",
        highlights: [
          "Buscar julgados sobre juros abusivos e capitalizacao mensal.",
          "Separar precedentes sobre fraude PIX com falha de seguranca.",
          "Priorizar recortes por tribunal e fase processual."
        ],
        cards: [
          { label: "Tema principal", value: primaryCase.mainThesis },
          { label: "Tribunal alvo", value: "TJSP e STJ" },
          { label: "Recorte", value: "Contratos bancarios" },
          { label: "Modo", value: "Pesquisa assistida" }
        ],
        workflow: {
          fields: [
            { label: "Caso", type: "case" },
            { label: "Tema juridico", type: "custom", options: ["Juros abusivos", "Capitalizacao mensal", "Fraude PIX", "Negativacao indevida"] },
            { label: "Tribunal", type: "custom", options: ["TJSP", "TJRJ", "TJMG", "STJ", "STF"] }
          ],
          actions: ["Pesquisar precedentes", "Separar julgados lideres", "Montar base jurisprudencial"]
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
        subtitle: "Prioridade pratica do escritorio com base no contexto mais sensivel.",
        summary:
          "A Clara ordena o que deve acontecer agora, depois e em seguida, para evitar dispersao operacional na carteira bancaria.",
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
          actions: ["Sugerir ordem de ataque", "Montar proxima acao", "Gerar atualizacao ao cliente"]
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
