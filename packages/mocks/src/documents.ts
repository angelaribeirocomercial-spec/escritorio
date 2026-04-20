import { DocumentRecord } from "@lexia/domain";

export const mockDocuments: readonly DocumentRecord[] = [
  {
    id: "doc-001",
    clientId: "cl-001",
    caseId: "case-101",
    fileName: "contrato-financiamento-veiculo-mariana.pdf",
    documentType: "Contrato bancario",
    category: "contrato",
    tags: ["revisional", "seguro", "CET"],
    aiStatus: "analyzed",
    summary:
      "Contrato com indicios de seguro embutido e clausulas com impacto no CET total.",
    pageCount: 18,
    uploadedAt: "2026-04-02",
    previewLabel: "Preview mockado do contrato com clausulas destacadas.",
    actions: [
      "Analisar com IA",
      "Resumir",
      "Extrair tese",
      "Gerar peca",
      "Buscar jurisprudencia"
    ]
  },
  {
    id: "doc-002",
    clientId: "cl-001",
    caseId: "case-101",
    fileName: "planilha-parcelas-mariana.xlsx",
    documentType: "Planilha",
    category: "financeiro",
    tags: ["parcelas", "juros", "memoria-calculo"],
    aiStatus: "needs_review",
    summary:
      "Planilha utilizada para comparar parcelas contratadas e encargos efetivamente pagos.",
    pageCount: 4,
    uploadedAt: "2026-04-03",
    previewLabel: "Preview mockado da memoria de calculo e das parcelas.",
    actions: ["Analisar com IA", "Resumir", "Extrair tese"]
  },
  {
    id: "doc-003",
    clientId: "cl-002",
    caseId: "case-205",
    fileName: "comprovantes-pix-carlos.pdf",
    documentType: "Comprovante bancario",
    category: "fraude",
    tags: ["pix", "fraude", "comprovantes"],
    aiStatus: "analyzed",
    summary:
      "Comprovantes das transferencias e registros de movimentacao vinculados ao golpe via PIX.",
    pageCount: 9,
    uploadedAt: "2026-04-04",
    previewLabel: "Preview mockado dos comprovantes e da cronologia do evento.",
    actions: ["Analisar com IA", "Resumir", "Buscar jurisprudencia"]
  },
  {
    id: "doc-004",
    clientId: "cl-003",
    caseId: "case-311",
    fileName: "ccb-capital-giro-araujo.pdf",
    documentType: "CCB",
    category: "contrato",
    tags: ["capital-giro", "ccb", "capitalizacao"],
    aiStatus: "analyzed",
    summary:
      "Cedula de credito bancario com pontos sensiveis sobre capitalizacao mensal e encargos remuneratorios.",
    pageCount: 22,
    uploadedAt: "2026-04-01",
    previewLabel: "Preview mockado da CCB com clausulas sensiveis destacadas.",
    actions: [
      "Analisar com IA",
      "Resumir",
      "Extrair tese",
      "Gerar peca",
      "Buscar jurisprudencia"
    ]
  },
  {
    id: "doc-005",
    clientId: "cl-003",
    caseId: "case-312",
    fileName: "notificacao-negativacao-araujo.pdf",
    documentType: "Intimacao",
    category: "cobranca",
    tags: ["negativacao", "urgencia", "cobranca"],
    aiStatus: "not_analyzed",
    summary:
      "Notificacao de negativacao vinculada ao contrato principal com potencial para pedido urgente.",
    pageCount: 3,
    uploadedAt: "2026-04-05",
    previewLabel: "Preview mockado da notificacao de negativacao.",
    actions: ["Analisar com IA", "Resumir", "Gerar peca"]
  }
];
