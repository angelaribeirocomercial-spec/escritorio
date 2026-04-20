import { OfficialDiaryPublicationRecord } from "@lexia/domain";

export const mockOfficialDiaryPublications: readonly OfficialDiaryPublicationRecord[] = [
  {
    id: "pub-101",
    processId: "proc-101",
    caseId: "case-101",
    clientId: "cl-001",
    publishedAt: "2026-04-08",
    sourceCourt: "TJSP",
    sourceLabel: "DJE TJSP",
    title: "Intimacao para complemento da memoria de calculo",
    rawContext:
      "Fica a parte autora intimada para, no prazo legal, complementar memoria discriminada do calculo e esclarecer a composicao dos encargos cobrados no contrato.",
    bankingSummary:
      "A publicacao reforca a necessidade de consolidar CET, parcelas efetivas e venda casada para sustentar a revisional com maior seguranca.",
    requiredAction:
      "Juntar planilha revisional consolidada e revisar a narrativa de encargos abusivos antes da proxima manifestacao.",
    urgency: "high",
    responsibleLawyer: "Dra. Helena Siqueira",
    suggestedTaskTitle: "Responder intimacao sobre memoria de calculo",
    suggestedTaskDescription:
      "Preparar resposta com memoria de calculo detalhada, CET, seguro embutido e demonstrativo dos encargos questionados."
  },
  {
    id: "pub-205",
    processId: "proc-205",
    caseId: "case-205",
    clientId: "cl-002",
    publishedAt: "2026-04-09",
    sourceCourt: "TJRJ",
    sourceLabel: "DJE TJRJ",
    title: "Certidao de pendencia documental para distribuicao",
    rawContext:
      "Certifico que a inicial depende da juntada de documento complementar para regular prosseguimento do pedido apresentado pela parte autora.",
    bankingSummary:
      "No contexto de fraude PIX, a falta de documento formal ainda enfraquece a linha probatoria e impede o ingresso seguro da acao.",
    requiredAction:
      "Cobrar documento pendente do cliente e validar se a narrativa cronologica esta pronta para protocolo.",
    urgency: "medium",
    responsibleLawyer: "Dr. Caio Nascimento",
    suggestedTaskTitle: "Destravar documento pendente para fraude PIX",
    suggestedTaskDescription:
      "Acionar o cliente, receber o documento complementar e liberar a estrutura final da inicial."
  },
  {
    id: "pub-311",
    processId: "proc-311",
    caseId: "case-311",
    clientId: "cl-003",
    publishedAt: "2026-04-07",
    sourceCourt: "TJMG",
    sourceLabel: "DJE TJMG",
    title: "Ato ordinatorio para conferencia de anexos empresariais",
    rawContext:
      "Intime-se a parte autora para confirmar regularidade dos anexos empresariais e eventual representacao da pessoa juridica nos autos.",
    bankingSummary:
      "A publicacao nao altera a tese de capitalizacao mensal, mas exige saneamento documental antes do protocolo ou da continuidade da medida.",
    requiredAction:
      "Conferir contrato social, poderes e anexos empresariais antes do proximo movimento da equipe.",
    urgency: "medium",
    responsibleLawyer: "Dra. Julia Ramalho",
    suggestedTaskTitle: "Conferir anexos empresariais do capital de giro",
    suggestedTaskDescription:
      "Validar representacao da empresa e anexos obrigatorios para manter o caso apto ao protocolo."
  },
  {
    id: "pub-312",
    processId: "proc-312",
    caseId: "case-312",
    clientId: "cl-003",
    publishedAt: "2026-04-07",
    sourceCourt: "TJMG",
    sourceLabel: "DJE TJMG",
    title: "Despacho exigindo prova complementar da negativacao",
    rawContext:
      "Intime-se a parte autora para apresentar prova documental complementar acerca da inscricao restritiva e do impacto alegado, no prazo assinalado.",
    bankingSummary:
      "A tese permanece boa, mas a tutela depende de prova objetiva da restricao e do dano operacional causado pela cobranca indevida.",
    requiredAction:
      "Separar notificacao de negativacao, comprovantes e demonstracao do impacto comercial para reforcar a urgencia.",
    urgency: "high",
    responsibleLawyer: "Dra. Julia Ramalho",
    suggestedTaskTitle: "Montar prova complementar da negativacao",
    suggestedTaskDescription:
      "Reunir prova da restricao crediticia e do impacto comercial para sustentar tutela e danos."
  }
];
