import { ClientRecord } from "@lexia/domain";

export const mockClients: readonly ClientRecord[] = [
  {
    id: "cl-001",
    fullName: "Mariana Torres Lima",
    documentId: "284.115.990-41",
    email: "mariana.torres@cliente.com.br",
    phone: "(11) 98421-1190",
    whatsapp: "(11) 98421-1190",
    address: "Rua Alvorada, 182, Vila Olimpia, Sao Paulo/SP",
    leadSource: "Instagram",
    bankName: "Banco Pan",
    serviceStatus: "active",
    signedContract: true,
    legalViabilityScore: 9.1,
    feesLabel: "R$ 8.500 + 20% sobre exito",
    documentsSent: 12,
    notes:
      "Cliente relata contratacao por correspondente sem explicacao adequada sobre CET e seguro embutido.",
    iaContext:
      "LexIA identificou sinais de venda casada e alta aderencia a tese revisional com pedido de repeticao de indebito.",
    linkedCases: [
      {
        id: "case-101",
        title: "Revisional de financiamento de veiculo",
        status: "Em analise inicial",
        thesis: "Juros abusivos e seguro embutido"
      }
    ],
    linkedDocuments: [
      "Contrato bancario",
      "Planilha de parcelas",
      "Extratos",
      "Comprovante de renda"
    ],
    timeline: [
      "Lead qualificado via Instagram com score inicial 8.8",
      "Contrato e documentos recebidos",
      "Triagem da LexIA concluida com risco processual medio-baixo"
    ]
  },
  {
    id: "cl-002",
    fullName: "Carlos Henrique Duarte",
    documentId: "317.558.120-08",
    email: "carlos.duarte@cliente.com.br",
    phone: "(21) 98810-4422",
    whatsapp: "(21) 98810-4422",
    address: "Av. das Americas, 9600, Barra da Tijuca, Rio de Janeiro/RJ",
    leadSource: "Indicacao",
    bankName: "Itau",
    serviceStatus: "waiting-docs",
    signedContract: false,
    legalViabilityScore: 7.4,
    feesLabel: "Proposta em aprovacao",
    documentsSent: 5,
    notes:
      "Possivel fraude bancaria por PIX. Falta boletim de ocorrencia e comprovantes complementares.",
    iaContext:
      "LexIA recomenda reforcar checklist documental e validar cronologia das transferencias antes da definicao final da tese.",
    linkedCases: [
      {
        id: "case-205",
        title: "Fraude bancaria via PIX",
        status: "Aguardando documentos",
        thesis: "Falha de seguranca e dano moral"
      }
    ],
    linkedDocuments: ["Comprovantes PIX", "Atendimento bancario", "Capturas de tela"],
    timeline: [
      "Cliente entrou por indicacao de ex-cliente",
      "Atendimento inicial realizado pelo time comercial-juridico",
      "Checklist de documentos enviado pelo escritorio"
    ]
  },
  {
    id: "cl-003",
    fullName: "Patricia Gomes Araujo",
    documentId: "44.118.225/0001-10",
    email: "financeiro@araujologistica.com.br",
    phone: "(31) 3339-7788",
    whatsapp: "(31) 99655-1199",
    address: "Rua Paraiba, 455, Funcionarios, Belo Horizonte/MG",
    leadSource: "Google Ads",
    bankName: "Santander",
    serviceStatus: "active",
    signedContract: true,
    legalViabilityScore: 8.6,
    feesLabel: "R$ 14.000 + exito escalonado",
    documentsSent: 18,
    notes:
      "Empresa com contrato de capital de giro e discussao sobre encargos excessivos e capitalizacao mensal.",
    iaContext:
      "LexIA aponta boa aderencia para revisional com estrategia combinada de revisao contratual e pedido de tutela para suspensao de negativacao.",
    linkedCases: [
      {
        id: "case-311",
        title: "Capital de giro com juros abusivos",
        status: "Peca inicial em preparacao",
        thesis: "Capitalizacao mensal indevida"
      },
      {
        id: "case-312",
        title: "Negativacao indevida vinculada ao contrato",
        status: "Documentacao completa",
        thesis: "Suspensao de cobranca e danos"
      }
    ],
    linkedDocuments: [
      "CCB",
      "Extratos da conta",
      "Email de cobranca",
      "Comprovantes bancarios",
      "Contrato social"
    ],
    timeline: [
      "Lead convertido por campanha de alta intencao",
      "Contrato assinado no mesmo dia da proposta",
      "Time recebeu documentacao complementar da empresa"
    ]
  }
];
