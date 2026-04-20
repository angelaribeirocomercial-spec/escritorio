import { ProceduralUpdateRecord } from "@lexia/domain";

export const mockProceduralUpdates: readonly ProceduralUpdateRecord[] = [
  {
    id: "upd-101",
    processId: "proc-101",
    caseId: "case-101",
    clientId: "cl-001",
    occurredAt: "2026-04-09",
    movementType: "Despacho",
    sourceCourt: "TJSP",
    sourceLabel: "Portal TJSP",
    rawMovement:
      "Vistos. Intime-se a parte autora para complementar memoria discriminada do calculo e esclarecer composicao dos encargos impugnados.",
    operationalSummary:
      "O juizo cobrou detalhamento tecnico da planilha revisional antes de avancar na apreciacao.",
    criticality: "high",
    claraImpactSummary:
      "O caso continua bem posicionado, mas a forca da tese depende agora de uma memoria de calculo mais didatica e tecnicamente robusta.",
    claraCaution:
      "Se a resposta sair genérica, o pedido liminar pode perder tração logo no primeiro filtro do juizo.",
    claraNextActions: [
      "Revisar memoria de calculo",
      "Evidenciar CET e seguro embutido",
      "Preparar resposta objetiva ao despacho"
    ]
  },
  {
    id: "upd-205",
    processId: "proc-205",
    caseId: "case-205",
    clientId: "cl-002",
    occurredAt: "2026-04-09",
    movementType: "Certidao",
    sourceCourt: "TJRJ",
    sourceLabel: "Portal TJRJ",
    rawMovement:
      "Certifico a ausencia de documento complementar indispensavel ao regular prosseguimento da demanda.",
    operationalSummary:
      "Ainda falta prova essencial para liberar o protocolo do caso de fraude PIX.",
    criticality: "medium",
    claraImpactSummary:
      "O impacto juridico ainda e controlavel, mas o caso segue travado enquanto a prova faltante nao entrar.",
    claraCaution:
      "Nao vale sofisticar a narrativa agora; o gargalo segue sendo documental.",
    claraNextActions: [
      "Cobrar documento complementar",
      "Atualizar cronologia do golpe",
      "Checar prontidao da inicial"
    ]
  },
  {
    id: "upd-311",
    processId: "proc-311",
    caseId: "case-311",
    clientId: "cl-003",
    occurredAt: "2026-04-10",
    movementType: "Ato ordinatorio",
    sourceCourt: "TJMG",
    sourceLabel: "Portal TJMG",
    rawMovement:
      "Intime-se a parte autora para conferencia dos anexos empresariais e regularidade da representacao documental.",
    operationalSummary:
      "A movimentacao nao muda a tese, mas exige saneamento de anexos antes do protocolo final.",
    criticality: "low",
    claraImpactSummary:
      "O caso segue forte. O risco imediato nao e juridico, e sim operacional por eventual erro documental.",
    claraCaution:
      "Um detalhe societario mal anexado pode atrasar um caso que ja esta maduro para ingresso.",
    claraNextActions: [
      "Conferir contrato social",
      "Validar poderes de representacao",
      "Liberar protocolo apos saneamento"
    ]
  },
  {
    id: "upd-312",
    processId: "proc-312",
    caseId: "case-312",
    clientId: "cl-003",
    occurredAt: "2026-04-08",
    movementType: "Despacho",
    sourceCourt: "TJMG",
    sourceLabel: "Portal TJMG",
    rawMovement:
      "Intime-se a parte autora para apresentar prova complementar da negativacao e do dano operacional alegado.",
    operationalSummary:
      "A tutela depende agora de prova objetiva da restricao e do impacto concreto na operacao da empresa.",
    criticality: "high",
    claraImpactSummary:
      "A tese continua boa, mas o caso pede prova mais incisiva para sustentar urgencia e dano moral empresarial.",
    claraCaution:
      "Sem prova forte da restricao, o pedido de urgencia pode perder aderencia.",
    claraNextActions: [
      "Reunir prova da negativacao",
      "Documentar impacto comercial",
      "Reforcar pedido de tutela"
    ]
  }
];
