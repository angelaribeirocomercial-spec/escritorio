import { getClaraTextDraftArtifact } from "@/server/services/clara/get-clara-artifacts";

type TextDraftPayload = Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;

type RevisionalDraftBlock = {
  title: string;
  body: string[];
};

function toTitleCaseLabel(pieceLabel: string) {
  return pieceLabel
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatBulletList(items: ReadonlyArray<string>) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function buildTextDraftDefaultTitle(payload: TextDraftPayload) {
  return `${payload.caseLabel} - ${toTitleCaseLabel(payload.pieceLabel)}`.replace(/\s+/g, " ").trim();
}

export function buildRevisionalDraftBlocks(payload: TextDraftPayload): RevisionalDraftBlock[] | null {
  if (!payload.revisionalMemory) {
    return null;
  }

  const processNumber = payload.processLabel || "[PENDENTE: processo de referencia]";
  const bankName = payload.bankLabel || "[PENDENTE: banco]";
  const scenarioLabel = payload.revisionalMemory.scenarioLabel;
  const objectiveLabel = payload.revisionalMemory.objectiveLabel;
  const urgencyLabel = payload.revisionalMemory.urgencyLabel;
  const isCcbScenario = scenarioLabel.toLowerCase().includes("ccb");
  const hasNegativationUrgency = urgencyLabel.toLowerCase().includes("negativacao");
  const isCalculationObjective = objectiveLabel === "Montar memoria de calculo";
  const isFullActionObjective = objectiveLabel === "Preparar acao revisional";
  const priorityThesisTitles = payload.revisionalMemory.priorityTheses.map((item) => item.title);

  return [
    {
      title: "Dos fatos",
      body: [
        `Trata-se de minuta inicial para acao revisional de contrato bancario vinculada ao caso "${payload.caseLabel}", relacionada ao documento-base "${payload.documentLabel}" e ao processo de referencia ${processNumber}.`,
        hasNegativationUrgency
          ? "A parte autora relata agravamento progressivo do custo contratual, acompanhado de pressao concreta de restricao crediticia, o que torna imediata a intervencao judicial para impedir dano continuado."
          : "A parte autora relata agravamento progressivo do custo contratual, com cobranca acima do patamar inicialmente compreendido e impacto direto sobre sua capacidade de adimplemento regular."
      ]
    },
    {
      title: "Da relacao contratual",
      body: [
        isCcbScenario
          ? `A relacao juridica mantida com ${bankName} decorre de operacao bancaria formalizada em CCB, exigindo controle judicial sobre a engenharia financeira do titulo, a transparencia do custo efetivo e o equilibrio material da cobranca.`
          : `A relacao juridica mantida com ${bankName} esta submetida ao regime protetivo do consumidor, impondo controle de transparencia, boa-fe objetiva e equilibrio material das clausulas remuneratorias e acessorias.`,
        `A leitura juridico-economica consolidada pela Clara aponta como tese central ${payload.revisionalMemory.thesis.toLowerCase()}.`,
        `O enquadramento atual do caso foi tratado como ${scenarioLabel.toLowerCase()}, com objetivo operacional de ${objectiveLabel.toLowerCase()} e ${urgencyLabel.toLowerCase()}.`
      ]
    },
    {
      title: "Das abusividades identificadas",
      body: [
        "A narrativa revisional deve destacar a incidencia de encargos potencialmente excessivos, capitalizacao e composicao financeira aptas a produzir desequilibrio contratual e onerosidade excessiva.",
        `No estado atual da leitura, a Clara sugere sustentar especialmente: ${payload.revisionalMemory.legalGrounds.join("; ")}.`,
        priorityThesisTitles.length
          ? `Como linha mestra da inicial, recomenda-se abrir a fundamentacao com ${priorityThesisTitles.join("; ")}, em ordem de prioridade compativel com a prova ja indicada.`
          : "A ordem final das teses deve seguir a combinacao entre abusividade contratual, memoria economica e urgencia comprovada."
      ]
    },
    {
      title: "Da memoria de calculo revisional",
      body: [
        `No plano economico inicial, a parcela contratada foi identificada em ${payload.revisionalMemory.contractedInstallment}, ao passo que a parcela atualmente exigida alcanca ${payload.revisionalMemory.chargedInstallment}.`,
        isCalculationObjective
          ? `Como o objetivo central do fluxo e consolidar a memoria de calculo, a narrativa deve privilegiar o comparativo economico entre parcela revisada em ${payload.revisionalMemory.revisedInstallment} e excesso estimado de ${payload.revisionalMemory.estimatedTotalExcess}, com indicacao clara da metodologia de recalcule.`
          : `Pela memoria revisional preliminar, a parcela readequada seria de ${payload.revisionalMemory.revisedInstallment}, com excesso estimado de ${payload.revisionalMemory.estimatedTotalExcess}, sujeito a refinamento por pericia ou planilha detalhada.`,
        `Para sustentar essa frente, a Clara considera como prova critica: ${payload.revisionalMemory.evidenceFocus.join("; ")}.`
      ]
    },
    {
      title: "Da tutela de urgencia",
      body: [
        hasNegativationUrgency
          ? "A tutela de urgencia deve priorizar a suspensao imediata da negativacao ou da ameaca de restricao, demonstrando que a manutencao da medida gera dano operacional e reputacional superior ao risco processual da reversibilidade."
          : "A depender da prova documental final, a minuta comporta pedido de tutela para conter cobranca excessiva, impedir agravamento do debito e resguardar a parte autora contra medidas restritivas enquanto se discute a legalidade das clausulas.",
        isFullActionObjective
          ? "Como o objetivo operacional atual e preparar a acao revisional completa, a urgencia deve ser apresentada como instrumento de estabilizacao contratual desde o ajuizamento, inclusive para autorizar pagamento do valor incontroverso."
          : "O fundamento de urgencia deve ser construido sobre o risco de dano financeiro continuado e sobre a plausibilidade tecnica da revisao ja indicada pela leitura contratual preliminar."
      ]
    },
    {
      title: "Dos pedidos",
      body: [
        `Em sede de pedidos, a minuta ja considera como eixo revisional: ${payload.revisionalMemory.requests.join("; ")}.`,
        isFullActionObjective
          ? "A versao final deve individualizar pedidos principais, tutela, pedidos sucessivos e repeticao de indebito de modo articulado, ja em formato de inicial pronta para protocolo."
          : "A versao final ainda deve individualizar provas, definir pedidos sucessivos e ajustar a estrategia de repeticao de indebito, compensacao e encargos conforme a documentacao completa do contrato."
      ]
    }
  ];
}

function buildStructuredSectionList(payload: TextDraftPayload) {
  return payload.sections.map((section) => `- ${section}`).join("\n");
}

function buildProcuracaoBody(payload: TextDraftPayload) {
  const clientLabel = payload.clientLabel || "[PENDENTE: cliente]";
  const processLabel = payload.processLabel || "[PENDENTE: processo de referencia]";

  return [
    "PROCURACAO",
    "",
    `Outorgante: ${clientLabel}.`,
    `Caso de referencia: ${payload.caseLabel}.`,
    `Documento base conferido: ${payload.documentLabel}.`,
    `Processo de referencia: ${processLabel}.`,
    "",
    `${clientLabel} nomeia e constitui como seus procuradores os advogados do escritorio, com conferencia humana obrigatoria antes da assinatura, para representacao judicial e extrajudicial no caso acima indicado.`,
    "",
    "Poderes sugeridos para revisao:",
    "1. Propor a medida judicial cabivel e acompanhar o feito ate seu encerramento.",
    "2. Firmar declaracoes, requerimentos, substabelecimentos e demais atos ordinarios de representacao.",
    "3. Receber citacao, notificacao, intimacao e demais comunicacoes processuais, conforme revisao final do advogado responsavel.",
    "",
    "Campos pendentes para conferencia final:",
    "- advogado responsavel e OAB",
    "- cidade e data da assinatura",
    "- qualificacao completa do outorgante",
    "- poderes especiais que exijam redacao complementar",
    "",
    "Checklist de revisao humana:",
    buildStructuredSectionList(payload)
  ].join("\n");
}

function buildHonorariosBody(payload: TextDraftPayload) {
  const clientLabel = payload.clientLabel || "[PENDENTE: cliente]";

  return [
    "CONTRATO DE HONORARIOS ADVOCATICIOS",
    "",
    `Contratante: ${clientLabel}.`,
    `Caso de referencia: ${payload.caseLabel}.`,
    `Documento base conferido: ${payload.documentLabel}.`,
    "",
    `As partes ajustam a prestacao de servicos advocaticios voltados ao caso "${payload.caseLabel}", com revisao humana obrigatoria antes da assinatura e sem fechamento automatico de clausulas financeiras.`,
    "",
    "Clausulas-base para revisao:",
    "1. Objeto: atuacao juridica vinculada ao caso e aos desdobramentos necessarios.",
    "2. Escopo: analise, estrategia, peticao, distribuicao e acompanhamento inicial, conforme contratacao final.",
    "3. Honorarios e despesas: preencher manualmente valores, forma de pagamento, gatilhos de exito e custas reembolsaveis.",
    "4. Vigencia e rescisao: revisar hipoteses de encerramento, renuncia e obrigacoes pendentes.",
    "",
    "Campos obrigatorios pendentes para fechamento humano:",
    "- qualificacao completa das partes",
    "- endereco profissional do escritorio",
    "- honorarios fixos, de exito e politica de reembolso",
    "- regras de assinatura e foro",
    "",
    "Checklist de revisao humana:",
    buildStructuredSectionList(payload)
  ].join("\n");
}

function buildPetitionBody(payload: TextDraftPayload) {
  const revisionalBlocks = buildRevisionalDraftBlocks(payload);

  if (revisionalBlocks?.length) {
    return [
      "MINUTA PARA REVISAO HUMANA",
      "",
      `Cliente: ${payload.clientLabel || "[PENDENTE: cliente]"}.`,
      `Caso: ${payload.caseLabel}.`,
      `Banco: ${payload.bankLabel || "[PENDENTE: banco]"}.`,
      `Documento base: ${payload.documentLabel}.`,
      `Processo de referencia: ${payload.processLabel || "[PENDENTE: processo de referencia]"}.`,
      "",
      payload.preview,
      "",
      ...revisionalBlocks.flatMap((block) => [
        block.title.toUpperCase(),
        "",
        ...block.body,
        ""
      ]),
      "Checklist de revisao humana:",
      buildStructuredSectionList(payload)
    ]
      .join("\n")
      .trim();
  }

  return [
    "MINUTA PARA REVISAO HUMANA",
    "",
    `Cliente: ${payload.clientLabel || "[PENDENTE: cliente]"}.`,
    `Caso: ${payload.caseLabel}.`,
    `Banco: ${payload.bankLabel || "[PENDENTE: banco]"}.`,
    `Documento base: ${payload.documentLabel}.`,
    "",
    payload.preview,
    "",
    "Estrutura sugerida:",
    buildStructuredSectionList(payload)
  ].join("\n");
}

export function buildTextDraftDefaultBody(payload: TextDraftPayload) {
  switch (payload.pieceLabel) {
    case "procuracao":
      return buildProcuracaoBody(payload);
    case "contrato-honorarios":
      return buildHonorariosBody(payload);
    default:
      return buildPetitionBody(payload);
  }
}

export function buildTextDraftExportLines(
  payload: TextDraftPayload,
  editedDetail?: string | null
) {
  const body = editedDetail?.trim() || buildTextDraftDefaultBody(payload);

  const exportLines = [
    `Caso: ${payload.caseLabel}`,
    `Cliente: ${payload.clientLabel || "Nao informado"}`,
    `Peca: ${payload.pieceLabel}`,
    `Documento base: ${payload.documentLabel}`,
    `Processo: ${payload.processLabel || "Nao informado"}`,
    `Banco: ${payload.bankLabel || "Nao informado"}`,
    `Status: ${payload.statusLabel} | Etapa: ${payload.stageLabel}`,
    "",
    body
  ];

  if (payload.revisionalMemory) {
    exportLines.push("");
    exportLines.push("Memoria revisional:");
    exportLines.push(`Parcela contratada: ${payload.revisionalMemory.contractedInstallment}`);
    exportLines.push(`Parcela cobrada: ${payload.revisionalMemory.chargedInstallment}`);
    exportLines.push(`Parcela revisada: ${payload.revisionalMemory.revisedInstallment}`);
    exportLines.push(`Excesso estimado: ${payload.revisionalMemory.estimatedTotalExcess}`);
    exportLines.push(`Tese central: ${payload.revisionalMemory.thesis}`);
    exportLines.push(
      `Objetivo: ${payload.revisionalMemory.objectiveLabel} | Urgencia: ${payload.revisionalMemory.urgencyLabel}`
    );
    if (payload.revisionalMemory.priorityTheses.length) {
      exportLines.push("Teses priorizadas:");
      exportLines.push(formatBulletList(payload.revisionalMemory.priorityTheses.map((item) => item.title)));
    }
  }

  exportLines.push("");
  exportLines.push("Documento gerado para demonstracao interna com revisao humana obrigatoria.");

  return exportLines;
}
