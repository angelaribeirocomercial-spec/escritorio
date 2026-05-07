import type { ContractAnalysisRecord } from "@lexia/domain";

import { getBankingRevisionalCalculation } from "@/server/services/clara/get-banking-revisional-calculation";
import { getContractAnalysisByDocumentId } from "@/server/services/contract-analysis/get-contract-analysis";
import { getCaseById, getCases } from "@/server/services/cases/get-cases";
import { getClientById, getClients } from "@/server/services/clients/get-clients";
import { getDocumentById, getDocuments } from "@/server/services/documents/get-documents";
import { getProcessById, getProcesses } from "@/server/services/processes/get-processes";

type ClientData = Awaited<ReturnType<typeof getClients>>[number];
type BankingCaseData = Awaited<ReturnType<typeof getCases>>[number];
type DocumentData = Awaited<ReturnType<typeof getDocuments>>[number];

function getRiskLabel(risk: "low" | "medium" | "high") {
  if (risk === "low") return "Baixo";
  if (risk === "high") return "Alto";
  return "Medio";
}

function getScenarioProfile(params: {
  documentType: string;
  caseTitle: string;
  bankName: string;
}) {
  if (params.documentType === "CCB") {
    return {
      key: "ccb-capital-giro",
      label: "CCB com foco em capitalizacao",
      summary: `Leitura revisional orientada para cedula de credito bancario com enfase em capitalizacao mensal, CET elevado e encargos agregados na relacao com ${params.bankName}.`,
      thesisFocus: [
        "capitalizacao mensal com reflexo direto no custo efetivo",
        "revisao do CET e dos custos operacionais agregados",
        "controle de permanencia, multa e outros cumulos de encargos"
      ],
      requestFocus: [
        "recalculo do saldo e das parcelas sem capitalizacao abusiva",
        "afastamento de encargos agregados sem transparencia suficiente",
        "tutela para estabilizar a cobranca durante a discussao judicial"
      ],
      evidenceFocus: [
        "CCB integral com destaque das clausulas financeiras",
        "extratos da conta vinculada e historico de amortizacao",
        "planilha de encargos e demonstrativo do CET"
      ]
    };
  }

  return {
    key: "financiamento-consumidor",
    label: "Financiamento ao consumidor",
    summary: `Leitura revisional voltada a financiamento bancario com enfase em seguro embutido, venda casada, CET e composicao real da parcela na relacao com ${params.bankName}.`,
    thesisFocus: [
      "venda casada e opcionalidade insuficiente do seguro embutido",
      "transparencia deficiente na composicao do CET e da parcela",
      "onerosidade excessiva pelo distanciamento entre parcela prometida e cobrada"
    ],
    requestFocus: [
      "exclusao do seguro embutido e recalcule do financiamento",
      "readequacao das parcelas a patamar revisado",
      "tutela para impedir cobranca excessiva e restricoes indevidas"
    ],
    evidenceFocus: [
      "contrato principal e proposta comercial da operacao",
      "comprovacao do seguro, servico agregado ou venda casada",
      "historico das parcelas pagas e boletos cobrados"
    ]
  };
}

function getProductProfile(params: {
  documentType: string;
  caseTitle: string;
  documentTags: readonly string[];
  claimType: string;
}) {
  const normalizedText = [
    params.documentType,
    params.caseTitle,
    params.claimType,
    ...params.documentTags
  ]
    .join(" ")
    .toLowerCase();

  if (params.documentType === "CCB" || normalizedText.includes("capital-giro")) {
    return {
      key: "ccb-capital-giro",
      label: "Cedula de credito bancario",
      thesisDriver:
        "priorizar capitalizacao, CET, encargos agregados e formula de amortizacao do titulo bancario",
      proofDriver: [
        "cedula completa com clausulas financeiras legiveis",
        "extratos da conta vinculada e demonstrativo de evolucao do saldo",
        "planilha tecnica com memoria de amortizacao da operacao"
      ],
      strategyDriver:
        "trabalhar a revisional como controle da engenharia financeira da ccb, com narrativa economica mais tecnica"
    };
  }

  if (normalizedText.includes("negativacao")) {
    return {
      key: "cobranca-restricao",
      label: "Cobranca com restricao crediticia",
      thesisDriver:
        "ligar a abusividade contratual ao excesso de cobranca e ao risco imediato de restricao crediticia",
      proofDriver: [
        "notificacao de negativacao ou comunicacao de cobranca",
        "documentos do contrato-base vinculados a restricao",
        "comprovacao do impacto operacional ou reputacional ao cliente"
      ],
      strategyDriver:
        "combinar narrativa revisional com tutela de urgencia para sustar ou retirar a restricao crediticia"
    };
  }

  if (normalizedText.includes("renegoci")) {
    return {
      key: "renegociacao-bancaria",
      label: "Renegociacao bancaria",
      thesisDriver:
        "comparar contrato originario e renegociacao para localizar repactuacao opaca, novacao desfavoravel e saldo artificialmente inflado",
      proofDriver: [
        "instrumento original e termo de renegociacao",
        "historico de saldo anterior e saldo repactuado",
        "simulacoes ou propostas comerciais da renegociacao"
      ],
      strategyDriver:
        "atacar a transicao entre o contrato originario e a renegociacao, mostrando absorcao opaca de encargos e recomposicao artificial do saldo"
    };
  }

  return {
    key: "financiamento-consumidor",
    label: "Financiamento ao consumidor",
    thesisDriver:
      "priorizar seguro embutido, venda casada, CET e distancia entre parcela prometida e parcela cobrada",
    proofDriver: [
      "contrato principal com quadro-resumo e proposta comercial",
      "comprovacao do seguro ou servico agregado",
      "historico das parcelas cobradas e pagas"
    ],
    strategyDriver:
      "trabalhar a revisional com linguagem de protecao do consumidor, transparencia e readequacao da parcela mensal"
  };
}

function getObjectiveProfile(objective?: string) {
  switch (objective) {
    case "Rediscutir CET e encargos":
      return {
        key: "cet-encargos",
        label: "Rediscutir CET e encargos",
        strategyFocus:
          "Concentrar a narrativa na formacao do custo efetivo, nas rubricas acessorias e no reflexo financeiro acumulado do contrato.",
        urgencyFocus:
          "A tutela deve enfatizar a continuidade da cobranca em base possivelmente inflada e o risco de agravamento artificial do saldo.",
        requestFocus: [
          "revisao do CET e expurgo de encargos agregados",
          "recomposicao do saldo contratual em base transparente",
          "vedacao de cobranca sobre rubricas controvertidas enquanto durar a acao"
        ]
      };
    case "Montar memoria de calculo":
      return {
        key: "memoria-calculo",
        label: "Montar memoria de calculo",
        strategyFocus:
          "Priorizar robustez economica e fechamento do comparativo entre parcela contratada, parcela cobrada e saldo projetado sem abusividades.",
        urgencyFocus:
          "A urgencia, se usada, deve se apoiar na demonstracao objetiva do excesso e no impacto financeiro atual da cobranca.",
        requestFocus: [
          "producao e homologacao de memoria revisional",
          "recalculo das parcelas e do saldo em base revisada",
          "eventual compensacao do excesso apurado"
        ]
      };
    case "Preparar acao revisional":
      return {
        key: "acao-revisional",
        label: "Preparar acao revisional",
        strategyFocus:
          "Fechar a inicial com articulacao completa entre fatos, clausulas abusivas, memoria de calculo, tutela e pedidos principais.",
        urgencyFocus:
          "A tutela deve ser desenhada para estabilizar a relacao contratual desde o ajuizamento, com foco em cobranca e restricoes.",
        requestFocus: [
          "ajuizamento da revisional com tutela de urgencia",
          "readequacao das parcelas e revisao do saldo",
          "compensacao ou repeticao do indebito quando a prova estiver madura"
        ]
      };
    default:
      return {
        key: "parcelas",
        label: "Revisar clausulas e parcelas",
        strategyFocus:
          "Direcionar a revisional para reduzir a parcela praticada e reorganizar a leitura das clausulas que ampliaram o custo do contrato.",
        urgencyFocus:
          "A tutela deve focar na contencao da cobranca excessiva e na preservacao da capacidade de pagamento do cliente.",
        requestFocus: [
          "readequacao das parcelas ao patamar revisado",
          "revisao das clausulas que inflaram a cobranca",
          "suspensao de cobranca excessiva e de medidas restritivas"
        ]
      };
  }
}

function getUrgencyProfile(params: {
  claimType: string;
  caseTitle: string;
  objectiveLabel: string;
}) {
  const caseText = `${params.claimType} ${params.caseTitle}`.toLowerCase();

  if (caseText.includes("negativacao")) {
    return {
      key: "negativacao",
      label: "Tutela com foco em negativacao",
      summary:
        "A narrativa de urgencia deve priorizar retirada ou bloqueio de restricao crediticia, demonstrando impacto operacional e risco atual ao cliente.",
      urgencyRequests: [
        "suspensao imediata da negativacao ou da ameaca de restricao",
        "proibicao de novas medidas restritivas enquanto durar a discussao",
        "intimacao para preservacao do status contratual ate reavaliacao judicial"
      ],
      urgencyEvidence: [
        "notificacao de negativacao ou comprovacao da restricao",
        "comunicacoes de cobranca com ameaca de inscricao",
        "elementos que demonstrem impacto comercial, financeiro ou reputacional"
      ]
    };
  }

  if (params.objectiveLabel === "Preparar acao revisional") {
    return {
      key: "ajuizamento-completo",
      label: "Tutela de estabilizacao contratual",
      summary:
        "A urgencia deve estabilizar a relacao contratual desde o ajuizamento, impedindo agravamento do saldo, cobranca excessiva e medidas coercitivas.",
      urgencyRequests: [
        "autorizacao para deposito ou pagamento do valor incontroverso",
        "suspensao de cobranca excessiva",
        "vedacao de medidas restritivas ligadas ao contrato controvertido"
      ],
      urgencyEvidence: [
        "memoria revisional minima do excesso",
        "historico de parcelas cobradas",
        "documentos que demonstrem risco financeiro atual"
      ]
    };
  }

  return {
    key: "economica",
    label: "Tutela economica de cobranca",
    summary:
      "A urgencia se concentra em conter a continuidade da cobranca excessiva e preservar a capacidade de pagamento ate a revisao judicial do contrato.",
    urgencyRequests: [
      "limitacao da cobranca ao valor incontroverso",
      "suspensao do excesso mensal controvertido",
      "impedimento de agravamento artificial da mora"
    ],
    urgencyEvidence: [
      "comparativo entre parcela contratada, cobrada e revisada",
      "boletos, extratos ou cobrancas recentes",
      "demonstracao do comprometimento financeiro atual"
    ]
  };
}

function getPriorityTheses(params: {
  analysis: ContractAnalysisRecord;
  bankingCase: BankingCaseData;
  productProfile: ReturnType<typeof getProductProfile>;
  scenarioProfile: ReturnType<typeof getScenarioProfile>;
  objectiveProfile: ReturnType<typeof getObjectiveProfile>;
  urgencyProfile: ReturnType<typeof getUrgencyProfile>;
}) {
  const theses = [
    {
      title: params.bankingCase.mainThesis,
      rationale: `Tese-matriz do caso, coerente com o cenario ${params.scenarioProfile.label.toLowerCase()} e com o produto ${params.productProfile.label.toLowerCase()}.`,
      proof: params.productProfile.proofDriver[0] ?? params.scenarioProfile.evidenceFocus[0],
      request: params.objectiveProfile.requestFocus[0]
    },
    {
      title: "Transparencia do custo efetivo e da parcela",
      rationale: `A analise destaca ${params.analysis.cetLabel.toLowerCase()} e sustenta controle sobre a formacao real do custo total.`,
      proof: params.productProfile.proofDriver[1] ?? "proposta comercial, demonstrativo do CET e historico das parcelas cobradas",
      request: "readequacao do saldo e das parcelas em base transparente"
    },
    {
      title: "Controle dos encargos e da cobranca mensal",
      rationale: `A urgencia ${params.urgencyProfile.label.toLowerCase()} exige ligar a abusividade ao excesso concreto da cobranca atual, conforme a estrategia do produto bancario analisado.`,
      proof: params.urgencyProfile.urgencyEvidence[0],
      request: params.urgencyProfile.urgencyRequests[0]
    }
  ];

  if (params.analysis.capitalizationLabel !== "Nao identificada") {
    theses[1] = {
      title: "Capitalizacao e reflexo no saldo devedor",
      rationale: `A leitura contratual indica ${params.analysis.capitalizationLabel.toLowerCase()}, com impacto direto na progressao do debito.`,
      proof: "contrato com clausula financeira, extratos e memoria de amortizacao",
      request: "recalculo do saldo e das parcelas sem capitalizacao abusiva"
    };
  }

  if (params.analysis.bundledInsuranceLabel !== "Nao identificado") {
    theses.push({
      title: "Seguro embutido e venda casada",
      rationale:
        "A composicao do contrato indica item acessorio potencialmente agregado sem opcionalidade suficientemente demonstrada.",
      proof: "apolice, proposta comercial e quadro de evolucao das parcelas",
      request: "expurgo do seguro embutido e recomposicao do financiamento"
    });
  }

  return theses.slice(0, 4);
}

function getDocumentReadiness(params: {
  selectedDocument: DocumentData;
  productProfile: ReturnType<typeof getProductProfile>;
  urgencyProfile: ReturnType<typeof getUrgencyProfile>;
}) {
  const contractStatus =
    params.selectedDocument.documentType === "CCB" || params.selectedDocument.documentType === "Contrato bancario"
      ? "ok"
      : "missing";

  return [
    {
      title: "Contrato base legivel",
      status: contractStatus,
      detail:
        contractStatus === "ok"
          ? `Documento principal localizado: ${params.selectedDocument.fileName}.`
          : "Ainda falta o contrato-base legivel para abrir a revisional com seguranca."
    },
    {
      title: "Historico de parcelas e cobrancas",
      status: "warning",
      detail: "A Clara recomenda juntar boletos, extratos e cobrancas recentes para sustentar excesso mensal."
    },
    {
      title: "Memoria de calculo revisional",
      status: "warning",
      detail: "Ja existe narrativa economica preliminar, mas ainda e desejavel planilha fechada para robustez do pedido."
    },
    {
      title: "Prova especifica do produto",
      status: "ok",
      detail: `Driver atual: ${params.productProfile.proofDriver[0]}.`
    },
    {
      title: "Prova de urgencia",
      status: params.urgencyProfile.key === "economica" ? "warning" : "ok",
      detail:
        params.urgencyProfile.key === "economica"
          ? "A tutela economica pede demonstracao financeira atual mais objetiva."
          : `Base de urgencia alinhada com ${params.urgencyProfile.urgencyEvidence[0]}.`
    }
  ] as const;
}

function getFilingChecklist(params: {
  objectiveProfile: ReturnType<typeof getObjectiveProfile>;
  urgencyProfile: ReturnType<typeof getUrgencyProfile>;
  priorityTheses: ReturnType<typeof getPriorityTheses>;
}) {
  const checklist = [
    {
      title: "Fechar tese de abertura da inicial",
      status: "ready",
      detail: `Usar ${params.priorityTheses[0]?.title ?? "a tese principal"} como eixo de abertura da narrativa.`
    },
    {
      title: "Validar prova minima do contrato e da cobranca",
      status: "attention",
      detail: "Confirmar contrato legivel, historico das parcelas e memoria minima antes do protocolo."
    },
    {
      title: "Travar pedido de tutela",
      status: params.urgencyProfile.key === "economica" ? "attention" : "ready",
      detail: `Pedido urgente atual: ${params.urgencyProfile.urgencyRequests[0]}.`
    },
    {
      title: "Ajustar pedidos finais da revisional",
      status: params.objectiveProfile.key === "acao-revisional" ? "ready" : "attention",
      detail: `Objetivo operacional corrente: ${params.objectiveProfile.label}.`
    }
  ];

  return checklist;
}

function getFilingPackage(params: {
  client: ClientData;
  bankingCase: BankingCaseData;
  objectiveProfile: ReturnType<typeof getObjectiveProfile>;
  documentReadiness: ReturnType<typeof getDocumentReadiness>;
  filingChecklist: ReturnType<typeof getFilingChecklist>;
  priorityTheses: ReturnType<typeof getPriorityTheses>;
}) {
  const pendingDocuments = params.documentReadiness.filter((item) => item.status !== "ok").length;
  const pendingActions = params.filingChecklist.filter((item) => item.status !== "ready").length;

  return {
    title: `Pacote de ajuizamento de ${params.client.fullName}`,
    summary:
      pendingDocuments > 0 || pendingActions > 0
        ? `Pacote pronto com pendencias controladas: ${pendingDocuments} frente(s) documentais e ${pendingActions} ajuste(s) de ajuizamento antes do protocolo.`
        : "Pacote pronto para protocolo, com tese, agenda de retorno e minuta inicial alinhadas.",
    items: [
      {
        kind: "task",
        title: "Tarefa operacional",
        detail: `Fechar ${params.filingChecklist[0]?.title.toLowerCase() ?? "o ajuizamento"} com foco em ${params.priorityTheses[0]?.title.toLowerCase() ?? "tese principal"}.`
      },
      {
        kind: "agenda",
        title: "Retorno ao cliente",
        detail: `Atualizar ${params.client.fullName} sobre ${params.bankingCase.title.toLowerCase()} e alinhar a proxima entrega do escritorio.`
      },
      {
        kind: "draft",
        title: "Minuta inicial",
        detail: `Abrir a peticao com base em ${params.objectiveProfile.label.toLowerCase()} e narrativa central da revisional.`
      }
    ] as const
  };
}

export async function getBankingRevisionalWorkspace(params?: {
  clientId?: string;
  processId?: string;
  documentId?: string;
  objective?: string;
  financedAmount?: string;
  installmentCount?: string;
  contractedInstallment?: string;
  chargedInstallment?: string;
  targetReductionPercent?: string;
}) {
  const allDocuments = await getDocuments();
  const contractDocuments = allDocuments.filter((document) =>
    ["Contrato bancario", "CCB"].includes(document.documentType)
  );

  if (!contractDocuments.length) {
    throw new Error("No contract documents are available to build the Clara revisional workspace.");
  }

  const selectedDocument =
    (params?.documentId ? await getDocumentById(params.documentId) : null) ??
    contractDocuments.find((document) => document.id === params?.documentId) ??
    contractDocuments[0];
  const analysis = (await getContractAnalysisByDocumentId(selectedDocument.id)) ?? {
    id: `virtual-analysis-${selectedDocument.id}`,
    documentId: selectedDocument.id,
    rateLabel: "Taxa contratual sem consolidacao automatica",
    cetLabel: "CET sem leitura estruturada disponivel",
    capitalizationLabel: "Capitalizacao a confirmar",
    feesLabel: "Tarifas e encargos a confirmar",
    bundledInsuranceLabel: "Seguro embutido nao confirmado",
    permanenceCommissionLabel: "Comissao de permanencia a confirmar",
    penaltyLabel: "Multa a confirmar",
    sensitiveClauses: [],
    abusivenessSignals: [],
    suggestedThesis: "Revisao contratual com base na documentacao minima disponivel",
    proceduralRisk: "medium" as const,
    suggestedRequests: [
      "confirmar contrato base e quadro-resumo",
      "localizar demonstrativos de parcela e saldo",
      "validar pontos de abusividade com revisao humana"
    ],
    executiveSummary:
      "A analise contratual nao foi carregada do tenant, mas o workspace segue com base minima controlada para nao bloquear a Clara."
  };

  const documentCase = await getCaseById(selectedDocument.caseId);
  const bankingCase =
    documentCase ??
    (await getCases())[0];

  if (!bankingCase) {
    throw new Error("No case is available to build the Clara revisional workspace.");
  }

  const client =
    (params?.clientId ? await getClientById(params.clientId) : null) ??
    selectedDocument.client ??
    (await getClientById(bankingCase.clientId)) ??
    (await getClients())[0];

  if (!client) {
    throw new Error("No client is available to build the Clara revisional workspace.");
  }

  const allProcesses = await getProcesses();
  const process =
    (params?.processId ? await getProcessById(params.processId) : null) ??
    allProcesses.find((item) => item.caseId === bankingCase.id) ??
    allProcesses[0];
  const resolvedProcess =
    process ?? {
      id: `virtual-process-${bankingCase.id}`,
      caseId: bankingCase.id,
      clientId: client.id,
      processNumber: `PROCESSO PENDENTE DE VINCULO - ${bankingCase.id.toUpperCase()}`,
      tribunal: "A definir",
      courtDistrict: "Vinculo processual pendente",
      courtName: "Processo ainda nao vinculado",
      proceduralPhase: "Sem processo vinculado",
      status: "awaiting-filing" as const,
      responsibleLawyer: "A definir",
      monitoringMode: "manual" as const,
      latestTimeline: [],
      client,
      bankingCase
    };
  const scenarioProfile = getScenarioProfile({
    bankName: bankingCase.bankName,
    caseTitle: bankingCase.title,
    documentType: selectedDocument.documentType
  });
  const productProfile = getProductProfile({
    caseTitle: bankingCase.title,
    claimType: bankingCase.claimType,
    documentTags: selectedDocument.tags,
    documentType: selectedDocument.documentType
  });
  const objectiveProfile = getObjectiveProfile(params?.objective);
  const urgencyProfile = getUrgencyProfile({
    caseTitle: bankingCase.title,
    claimType: bankingCase.claimType,
    objectiveLabel: objectiveProfile.label
  });
  const priorityTheses = getPriorityTheses({
    analysis,
    bankingCase,
    objectiveProfile,
    productProfile,
    scenarioProfile,
    urgencyProfile
  });

  const clauseMap = [
    {
      title: "Juros remuneratorios",
      detail: analysis.rateLabel,
      impact: "Serve de base para a tese economica e para o recalculo das parcelas."
    },
    {
      title: "CET",
      detail: analysis.cetLabel,
      impact: "Ajuda a demonstrar custo efetivo superior ao esperado pelo cliente."
    },
    {
      title: "Capitalizacao",
      detail: analysis.capitalizationLabel,
      impact: "Ponto recorrente para revisao da formula de cobranca e do saldo."
    },
    {
      title: "Tarifas e encargos",
      detail: analysis.feesLabel,
      impact: "Importante para discutir transparencia, onerosidade e cumulo indevido."
    },
    {
      title: "Seguro embutido",
      detail: analysis.bundledInsuranceLabel,
      impact: "Pode sustentar venda casada e recalcule do financiamento."
    },
    {
      title: "Permanencia e multa",
      detail: `${analysis.permanenceCommissionLabel}. ${analysis.penaltyLabel}`,
      impact: "Relevante para atacar cumulo de encargos e excesso na mora."
    }
  ];

  const missingEvidence = [
    "Planilha ou memoria de calculo revisional",
    "Historico completo das parcelas pagas e vencidas",
    "Comprovacao comercial sobre seguro ou servico agregado",
    "Extratos ou comprovantes que demonstrem a evolucao da cobranca"
  ];

  const strategySteps = [
    "Consolidar o quadro economico do contrato e da cobranca atual",
    "Delimitar as clausulas abusivas que sustentam a revisional",
    productProfile.strategyDriver,
    objectiveProfile.strategyFocus,
    objectiveProfile.urgencyFocus
  ];

  const legalGrounds = [
    {
      title: "Boa-fe e transparencia contratual",
      detail:
        "Usar quando a composicao do custo total, CET, seguros ou tarifas nao estiver apresentada de forma clara ao consumidor."
    },
    {
      title: "Onerosidade excessiva e equilibrio da relacao",
      detail:
        "Serve para sustentar a necessidade de revisao quando a cobranca real se afasta do patamar inicialmente esperado e pressiona a capacidade de pagamento."
    },
    {
      title: "Controle de encargos, capitalizacao e cumulos indevidos",
      detail:
        "Enquadra a discussao sobre juros, capitalizacao, permanencia, multa e outros agregados que ampliem artificialmente o saldo ou a parcela."
    },
    {
      title: "Foco principal deste cenario",
      detail: `Neste enquadramento revisional, a Clara prioriza ${scenarioProfile.thesisFocus.join(", ")}.`
    },
    {
      title: "Leitura do produto bancario",
      detail: `Para ${productProfile.label.toLowerCase()}, a Clara conduz a estrategia para ${productProfile.thesisDriver}.`
    }
  ];

  const petitionRequests = [
    {
      title: "Tutela de urgencia",
      detail: `Pedir ${urgencyProfile.urgencyRequests.join(", ")}.`
    },
    {
      title: "Pedido revisional principal",
      detail:
        `Requerer ${objectiveProfile.requestFocus[0]}, conectando a revisao das clausulas ao impacto direto nas parcelas e no saldo devedor.`
    },
    {
      title: "Pedido economico acessorio",
      detail:
        `Quando a prova permitir, pedir ${objectiveProfile.requestFocus.slice(1).join(" e ")}.`
    }
  ];

  const evidenceTracks = [
    {
      title: "Prova contratual",
      items: [
        "Contrato completo e legivel",
        "Condicoes gerais e eventuais aditivos",
        ...productProfile.proofDriver
      ]
    },
    {
      title: "Prova economica",
      items: [
        "Historico de parcelas pagas e vencidas",
        "Planilha ou memoria revisional minima",
        "Extratos com a evolucao da cobranca"
      ]
    },
    {
      title: "Prova de urgencia",
      items: urgencyProfile.urgencyEvidence
    }
  ];

  const calculationFront = [
    "Conferir taxa contratada, CET e forma de capitalizacao",
    "Comparar parcela prometida com a parcela efetivamente cobrada",
    "Projetar parcela sem encargos abusivos ou sem itens embutidos",
    "Preparar resumo simples do recalculo para apoiar a inicial"
  ];

  const initialStructure = [
    "Sintese contratual e historico da contratacao",
    `Leitura juridica especifica do produto: ${productProfile.label}`,
    "Clausulas abusivas e onerosidade excessiva",
    "Demonstracao do impacto nas parcelas e no saldo",
    "Pedido revisional com tutela e eventual repeticao de indebito",
    "Requerimentos probatorios e documentos essenciais"
  ];
  const criticalProof = [
    priorityTheses[0]?.proof,
    priorityTheses[1]?.proof,
    ...productProfile.proofDriver,
    ...urgencyProfile.urgencyEvidence
  ].filter((item, index, array): item is string => Boolean(item) && array.indexOf(item) === index);
  const documentReadiness = getDocumentReadiness({
    productProfile,
    selectedDocument,
    urgencyProfile
  });
  const filingChecklist = getFilingChecklist({
    objectiveProfile,
    priorityTheses,
    urgencyProfile
  });
  const filingPackage = getFilingPackage({
    bankingCase,
    client,
    documentReadiness,
    filingChecklist,
    objectiveProfile,
    priorityTheses
  });
  const decisionSummary = `A Clara recomenda sustentar prioritariamente ${priorityTheses
    .slice(0, 3)
    .map((item) => item.title.toLowerCase())
    .join(", ")}, conectando a prova minima ao pedido de ${priorityTheses[0]?.request.toLowerCase()} no contexto de ${productProfile.label.toLowerCase()}.`;

  const viabilityScore =
    analysis.proceduralRisk === "low" ? 86 : analysis.proceduralRisk === "medium" ? 72 : 58;
  const calculationMemory = getBankingRevisionalCalculation(
    {
      financedAmount: params?.financedAmount,
      installmentCount: params?.installmentCount,
      contractedInstallment: params?.contractedInstallment,
      chargedInstallment: params?.chargedInstallment,
      targetReductionPercent: params?.targetReductionPercent
    },
    selectedDocument.id === "doc-004"
      ? {
          financedAmount: 248000,
          installmentCount: 21,
          contractedInstallment: 8420,
          chargedInstallment: 10185,
          targetReductionPercent: 21.8,
          basis:
            "Estimativa preliminar considerando expurgo de capitalizacao abusiva, tarifas agregadas e recalibragem do CET."
        }
      : {
          financedAmount: 68400,
          installmentCount: 29,
          contractedInstallment: 1842,
          chargedInstallment: 2214,
          targetReductionPercent: 27.8,
          basis:
            "Estimativa preliminar considerando exclusao de seguro embutido, encargos cumulativos e revisao do custo efetivo."
      }
  );
  const strategySummary = {
    mainThesis: priorityTheses[0]?.title ?? analysis.suggestedThesis,
    alternativeThesis: priorityTheses[1]?.title ?? productProfile.label,
    riskLabel: getRiskLabel(analysis.proceduralRisk),
    recommendedRequests: [
      ...priorityTheses.slice(0, 2).map((item) => item.request),
      ...objectiveProfile.requestFocus.slice(0, 2)
    ],
    actionType: objectiveProfile.label,
    agreementSuggestion:
      analysis.proceduralRisk === "high"
        ? "Buscar acordo apenas com seguranca economica minima e conferencia da memoria revisional."
        : "Negociar apenas apos validar a memoria de calculo e a coerencia da tese revisional.",
    nextSteps: [
      "Fechar a memoria de calculo revisional",
      "Conferir prova documental faltante",
      "Escolher a tese principal e a tese de apoio",
      "Converter o resumo em minuta revisional"
    ]
  };
  const reportSummary = {
    clientLabel: client.fullName,
    caseLabel: bankingCase.title,
    bankLabel: bankingCase.bankName,
    methodology:
      "Comparativo entre taxa contratada, CET, encargos agregados, memoria de calculo e leitura documental assistida pela Clara.",
    originalVsRevised: [
      `Parcela contratada: ${calculationMemory.labels.contractedInstallment}`,
      `Parcela cobrada: ${calculationMemory.labels.chargedInstallment}`,
      `Parcela revisada: ${calculationMemory.labels.revisedInstallment}`,
      `Excesso estimado: ${calculationMemory.labels.estimatedTotalExcess}`
    ],
    improperCharges: [
      analysis.rateLabel,
      analysis.cetLabel,
      analysis.capitalizationLabel,
      analysis.feesLabel
    ],
    conclusion:
      "O laudo consolidado serve como base tecnica para revisao humana antes da peticao, sem substituir a validacao final do advogado."
  };

  return {
    client,
    bankingCase,
    process: resolvedProcess,
    selectedDocument,
    analysis,
    productProfile,
    scenarioProfile,
    objectiveProfile,
    urgencyProfile,
    viabilityScore,
    riskLabel: getRiskLabel(analysis.proceduralRisk),
    clauseMap,
    missingEvidence,
    strategySteps,
    legalGrounds,
    petitionRequests,
    evidenceTracks,
    calculationFront,
    initialStructure,
    calculationMemory,
    priorityTheses,
    criticalProof,
    documentReadiness,
    filingChecklist,
    filingPackage,
    decisionSummary,
    strategySummary,
    reportSummary
  };
}
