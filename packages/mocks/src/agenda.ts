import { AgendaCommitmentRecord, ProceduralDeadlineRecord } from "@lexia/domain";

export const mockAgendaCommitments: readonly AgendaCommitmentRecord[] = [
  {
    id: "commitment-001",
    clientId: "cl-001",
    caseId: "case-101",
    processId: "proc-101",
    title: "Call com cliente sobre memoria revisional",
    description:
      "Alinhar com a cliente o racional da planilha e preparar envio da resposta ao despacho.",
    scheduledFor: "2026-04-09T10:00:00-03:00",
    responsibleLabel: "Dra. Helena Siqueira",
    locationLabel: "Google Meet",
    category: "client-follow-up"
  },
  {
    id: "commitment-002",
    clientId: "cl-003",
    caseId: "case-311",
    processId: "proc-311",
    title: "Revisao interna da inicial de capital de giro",
    description:
      "Conferir tese economica, anexos empresariais e pedido de tutela antes do protocolo.",
    scheduledFor: "2026-04-10T14:30:00-03:00",
    responsibleLabel: "Dra. Julia Ramalho",
    locationLabel: "Sala de estrategia",
    category: "internal-review"
  },
  {
    id: "commitment-003",
    clientId: "cl-002",
    caseId: "case-205",
    processId: "proc-205",
    title: "Follow-up documental de fraude PIX",
    description:
      "Cobrar documento pendente e revalidar prontidao do caso para protocolo.",
    scheduledFor: "2026-04-11T09:30:00-03:00",
    responsibleLabel: "Dr. Caio Nascimento",
    locationLabel: "WhatsApp / telefone",
    category: "client-follow-up"
  }
];

export const mockProceduralDeadlines: readonly ProceduralDeadlineRecord[] = [
  {
    id: "deadline-001",
    clientId: "cl-001",
    caseId: "case-101",
    processId: "proc-101",
    title: "Responder intimacao sobre memoria de calculo",
    description:
      "Protocolar complemento tecnico da memoria discriminada e reforcar encargos abusivos.",
    dueDate: "2026-04-10",
    responsibleLabel: "Dra. Helena Siqueira",
    sourceLabel: "Diario Oficial",
    severity: "high"
  },
  {
    id: "deadline-002",
    clientId: "cl-003",
    caseId: "case-312",
    processId: "proc-312",
    title: "Juntar prova complementar da negativacao",
    description:
      "Anexar evidencia da restricao e do impacto operacional para sustentar tutela.",
    dueDate: "2026-04-12",
    responsibleLabel: "Dra. Julia Ramalho",
    sourceLabel: "Andamento processual",
    severity: "high"
  },
  {
    id: "deadline-003",
    clientId: "cl-003",
    caseId: "case-311",
    processId: "proc-311",
    title: "Conferir representacao societaria antes do protocolo",
    description:
      "Validar anexos empresariais e contrato social antes da movimentacao final.",
    dueDate: "2026-04-15",
    responsibleLabel: "Dra. Julia Ramalho",
    sourceLabel: "Ato ordinatorio",
    severity: "medium"
  }
];
