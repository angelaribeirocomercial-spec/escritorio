import { BankingCaseRecord } from "@lexia/domain";

export const mockCases: readonly BankingCaseRecord[] = [
  {
    id: "case-101",
    clientId: "cl-001",
    title: "Revisional de financiamento de veiculo",
    bankName: "Banco Pan",
    processNumber: "1008421-19.2026.8.26.0100",
    contractNumber: "PAN-44-99281",
    claimType: "acao_revisional",
    stage: "Analise inicial",
    status: "active",
    amountInDispute: 68400,
    estimatedValue: 32200,
    mainThesis: "Juros abusivos e seguro embutido",
    legalRisk: "medium",
    suggestedStrategy:
      "Consolidar memoria de calculo, destacar venda casada e estruturar pedido de revisao contratual com tutela para suspensao de cobranca excessiva.",
    ownerLabel: "Dra. Helena Siqueira",
    linkedDocuments: [
      "Contrato bancario",
      "Planilha de parcelas",
      "Extratos",
      "Comprovante de renda"
    ],
    linkedTasks: [
      "Revisar memoria de calculo",
      "Validar clausula de seguro embutido",
      "Preparar peticao inicial"
    ],
    linkedDeadlines: [
      "Coletar documentos complementares ate 14/04/2026",
      "Aprovar estrategia interna ate 16/04/2026"
    ],
    lexiaInsights: [
      "Boa aderencia a tese revisional com foco em venda casada.",
      "Ha espaco para pedido cumulativo de repeticao de indebito.",
      "Cliente tem documentacao suficiente para primeira peca."
    ]
  },
  {
    id: "case-205",
    clientId: "cl-002",
    title: "Fraude bancaria via PIX",
    bankName: "Itau",
    processNumber: "5011274-65.2026.8.19.0001",
    contractNumber: "PIX-FRD-1180",
    claimType: "fraude_bancaria",
    stage: "Aguardando documentos",
    status: "awaiting-action",
    amountInDispute: 18750,
    estimatedValue: 41000,
    mainThesis: "Falha de seguranca e dano moral",
    legalRisk: "medium",
    suggestedStrategy:
      "Fechar cronologia do evento, reforcar prova documental e estruturar narrativa de falha na seguranca da operacao PIX.",
    ownerLabel: "Dr. Caio Nascimento",
    linkedDocuments: [
      "Comprovantes PIX",
      "Atendimento bancario",
      "Capturas de tela"
    ],
    linkedTasks: [
      "Cobrar boletim de ocorrencia",
      "Solicitar comprovante bancario detalhado",
      "Montar cronologia do golpe"
    ],
    linkedDeadlines: [
      "Revisar pendencias documentais em 11/04/2026"
    ],
    lexiaInsights: [
      "Sem boletim de ocorrencia, a narrativa probatoria fica fragil.",
      "A tese principal permanece viavel se a cronologia for bem consolidada."
    ]
  },
  {
    id: "case-311",
    clientId: "cl-003",
    title: "Capital de giro com juros abusivos",
    bankName: "Santander",
    processNumber: "7012844-11.2026.8.13.0024",
    contractNumber: "CCB-88372",
    claimType: "juros_abusivos",
    stage: "Peca inicial em preparacao",
    status: "active",
    amountInDispute: 248000,
    estimatedValue: 118000,
    mainThesis: "Capitalizacao mensal indevida",
    legalRisk: "low",
    suggestedStrategy:
      "Combinar revisao contratual com pedido de tutela para limitar cobranca e reforcar a leitura economica do capital de giro.",
    ownerLabel: "Dra. Julia Ramalho",
    linkedDocuments: [
      "CCB",
      "Extratos da conta",
      "Email de cobranca",
      "Comprovantes bancarios",
      "Contrato social"
    ],
    linkedTasks: [
      "Finalizar fatos resumidos",
      "Conferir planilha de encargos",
      "Revisar fundamentos da inicial"
    ],
    linkedDeadlines: [
      "Submeter minuta para revisao em 15/04/2026",
      "Validar anexos ate 17/04/2026"
    ],
    lexiaInsights: [
      "Caso com boa combinacao entre tese economica e prova documental.",
      "Recomendavel destacar capitalizacao mensal e CET total no resumo executivo."
    ]
  },
  {
    id: "case-312",
    clientId: "cl-003",
    title: "Negativacao indevida vinculada ao contrato",
    bankName: "Santander",
    processNumber: "7012855-49.2026.8.13.0024",
    contractNumber: "NEG-55210",
    claimType: "negativacao_indevida",
    stage: "Documentacao completa",
    status: "active",
    amountInDispute: 32000,
    estimatedValue: 24000,
    mainThesis: "Suspensao de cobranca e danos",
    legalRisk: "low",
    suggestedStrategy:
      "Estruturar urgencia na retirada da restricao e combinar pedido declaratorio com danos morais bancarios.",
    ownerLabel: "Dra. Julia Ramalho",
    linkedDocuments: [
      "Email de cobranca",
      "Comprovantes bancarios",
      "Notificacao de negativacao"
    ],
    linkedTasks: [
      "Validar prova da negativacao",
      "Fechar pedido de tutela",
      "Revisar danos morais"
    ],
    linkedDeadlines: [
      "Consolidar anexos ate 13/04/2026"
    ],
    lexiaInsights: [
      "Caso apto para narrativa objetiva com pedido urgente.",
      "Documentacao completa melhora o potencial de tutela."
    ]
  }
];
