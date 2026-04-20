import { TaskRecord } from "@lexia/domain";

export const mockTasks: readonly TaskRecord[] = [
  {
    id: "task-001",
    clientId: "cl-001",
    caseId: "case-101",
    title: "Conferir memoria de calculo revisional",
    description:
      "Validar divergencia entre CET contratado, parcelas efetivas e seguro embutido antes da peca inicial.",
    assigneeLabel: "Dra. Helena Siqueira",
    dueDate: "2026-04-11",
    priority: "urgent",
    status: "in_progress",
    notes:
      "Necessario fechar memoria com base na planilha e destacar venda casada no resumo executivo.",
    checklist: [
      { id: "task-001-1", label: "Conferir documentos", done: true },
      { id: "task-001-2", label: "Solicitar contrato completo", done: true },
      { id: "task-001-3", label: "Analisar abusividades", done: true },
      { id: "task-001-4", label: "Definir tese", done: false },
      { id: "task-001-5", label: "Gerar peticao inicial", done: false }
    ],
    suggestedByClaimType: "Checklist sugerido para acao revisional.",
    lexiaNextStep:
      "Fechar a comparacao entre parcelas e CET para sustentar a tese de juros abusivos com seguro embutido."
  },
  {
    id: "task-002",
    clientId: "cl-002",
    caseId: "case-205",
    title: "Cobrar boletim de ocorrencia do cliente",
    description:
      "Formalizar a pendencia documental indispensavel para robustecer a tese de fraude bancaria via PIX.",
    assigneeLabel: "Dr. Caio Nascimento",
    dueDate: "2026-04-10",
    priority: "high",
    status: "todo",
    notes:
      "Sem o boletim, a narrativa de seguranca e responsabilidade do banco perde forca probatoria.",
    checklist: [
      { id: "task-002-1", label: "Listar documentos faltantes", done: true },
      { id: "task-002-2", label: "Enviar checklist ao cliente", done: true },
      { id: "task-002-3", label: "Receber boletim de ocorrencia", done: false },
      { id: "task-002-4", label: "Atualizar cronologia do golpe", done: false }
    ],
    suggestedByClaimType: "Checklist sugerido para fraude bancaria PIX.",
    lexiaNextStep:
      "Assim que o boletim entrar, consolidar cronologia e revisar pedido de dano moral."
  },
  {
    id: "task-003",
    clientId: "cl-003",
    caseId: "case-311",
    title: "Revisar fundamentos da inicial de capital de giro",
    description:
      "Revisao final dos fundamentos sobre capitalizacao mensal, CET e encargos remuneratorios.",
    assigneeLabel: "Dra. Julia Ramalho",
    dueDate: "2026-04-15",
    priority: "medium",
    status: "in_progress",
    notes:
      "A peca esta bem encaminhada; falta amarrar com mais clareza o pedido de tutela para limitacao de cobranca.",
    checklist: [
      { id: "task-003-1", label: "Finalizar fatos resumidos", done: true },
      { id: "task-003-2", label: "Conferir planilha de encargos", done: true },
      { id: "task-003-3", label: "Revisar fundamentos da inicial", done: false },
      { id: "task-003-4", label: "Submeter minuta para revisao", done: false }
    ],
    suggestedByClaimType: "Checklist sugerido para juros abusivos em CCB.",
    lexiaNextStep:
      "Enfatizar capitalizacao mensal e pedido de limitacao de cobranca no topico de urgencia."
  },
  {
    id: "task-004",
    clientId: "cl-003",
    caseId: "case-312",
    title: "Fechar pedido de tutela para retirada da negativacao",
    description:
      "Consolidar os argumentos de urgencia e a prova da restricao crediticia indevida.",
    assigneeLabel: "Dra. Julia Ramalho",
    dueDate: "2026-04-12",
    priority: "urgent",
    status: "todo",
    notes:
      "Caso apto para narrativa enxuta, com foco em urgencia e impacto operacional na empresa cliente.",
    checklist: [
      { id: "task-004-1", label: "Validar prova da negativacao", done: true },
      { id: "task-004-2", label: "Fechar pedido de tutela", done: false },
      { id: "task-004-3", label: "Revisar danos morais", done: false }
    ],
    suggestedByClaimType: "Checklist sugerido para negativacao indevida.",
    lexiaNextStep:
      "Priorizar o pedido liminar e anexar prova objetiva do impacto comercial da restricao."
  },
  {
    id: "task-005",
    clientId: "cl-001",
    caseId: "case-101",
    title: "Atualizar cliente sobre estrategia revisional",
    description:
      "Enviar resumo claro com status do caso, documentos utilizados e proximos passos da peca inicial.",
    assigneeLabel: "Time de Atendimento",
    dueDate: "2026-04-13",
    priority: "low",
    status: "done",
    notes:
      "Atualizacao deve reforcar seguranca do cliente e alinhar expectativa sobre o tempo de ajuizamento.",
    checklist: [
      { id: "task-005-1", label: "Consolidar status interno", done: true },
      { id: "task-005-2", label: "Montar resumo ao cliente", done: true },
      { id: "task-005-3", label: "Registrar envio no historico", done: true }
    ],
    suggestedByClaimType: "Checklist sugerido para atualizacao de cliente em revisional.",
    lexiaNextStep:
      "Usar linguagem objetiva e reforcar que a estrategia esta baseada em seguro embutido e CET elevado."
  }
];
