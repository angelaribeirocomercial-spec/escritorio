import { getCaseById, getCases } from "@/server/services/cases/get-cases";
import { getClientById, getClients } from "@/server/services/clients/get-clients";
import { getBankingRevisionalWorkspace } from "@/server/services/clara/get-banking-revisional-workspace";
import {
  getDocumentById,
  getDocuments,
  getDocumentsByCaseId
} from "@/server/services/documents/get-documents";
import { getProcessById, getProcesses } from "@/server/services/processes/get-processes";
import { getTaskById, getTasks } from "@/server/services/tasks/get-tasks";

async function findCase(caseId?: string | null) {
  if (caseId) {
    const bankingCase = await getCaseById(caseId);
    if (bankingCase) {
      return bankingCase;
    }
  }

  return (await getCases())[0];
}

async function findClient(clientId?: string | null) {
  if (clientId) {
    const client = await getClientById(clientId);
    if (client) {
      return client;
    }
  }

  return (await getClients())[0];
}

async function findDocument(documentId?: string | null, fallbackIndex = 0) {
  if (documentId) {
    const document = await getDocumentById(documentId);
    if (document) {
      return document;
    }
  }

  const documents = await getDocuments();
  return documents[fallbackIndex] ?? documents[0];
}

async function findCaseDocument(params: {
  caseId?: string | null;
  documentId?: string | null;
}) {
  if (params.documentId) {
    const document = await getDocumentById(params.documentId);

    if (document && (!params.caseId || document.caseId === params.caseId)) {
      return document;
    }
  }

  if (params.caseId) {
    const caseDocuments = await getDocumentsByCaseId(params.caseId);

    if (caseDocuments.length > 0) {
      return caseDocuments[0];
    }

    return null;
  }

  return findDocument(params.documentId);
}

async function findTask(taskId?: string | null) {
  if (taskId) {
    const task = await getTaskById(taskId);
    if (task) {
      return task;
    }
  }

  const tasks = await getTasks();
  const fallbackTask = tasks[0];

  if (!fallbackTask) {
    throw new Error("No tasks available to build Clara task artifacts.");
  }

  return fallbackTask;
}

async function findProcess(processId?: string | null) {
  if (processId) {
    const process = await getProcessById(processId);
    if (process) {
      return process;
    }
  }

  return (await getProcesses())[0];
}

function getRevisionalScenario(caseTitle: string, documentType: string, bankName: string) {
  if (documentType === "CCB" || caseTitle.toLowerCase().includes("capital de giro")) {
    return {
      label: "CCB com foco em capitalizacao",
      thesisFocus: [
        "capitalizacao mensal com impacto direto no custo efetivo",
        "CET elevado e custos operacionais agregados",
        `cumulo de encargos financeiros na relacao com ${bankName}`
      ],
      evidenceFocus: [
        "CCB integral com clausulas financeiras destacadas",
        "extratos e historico de amortizacao da operacao",
        "planilha de encargos e demonstrativo do CET"
      ],
      requests: [
        "recalculo do saldo e das parcelas sem capitalizacao abusiva",
        "afastamento de encargos agregados sem transparencia suficiente",
        "tutela para estabilizar a cobranca durante a discussao judicial"
      ]
    };
  }

  return {
    label: "Financiamento ao consumidor",
    thesisFocus: [
      "seguro embutido e possivel venda casada",
      "transparencia deficiente na composicao do CET e da parcela",
      `onerosidade excessiva no financiamento mantido com ${bankName}`
    ],
    evidenceFocus: [
      "contrato principal e proposta comercial da operacao",
      "comprovacao do seguro ou servico agregado",
      "historico das parcelas pagas e cobradas"
    ],
    requests: [
      "exclusao do seguro embutido e recalcule do financiamento",
      "readequacao das parcelas a patamar revisado",
      "tutela para impedir cobranca excessiva e restricoes indevidas"
    ]
  };
}

function getRevisionalUrgency(caseTitle: string, objectiveLabel: string) {
  if (caseTitle.toLowerCase().includes("negativacao")) {
    return {
      label: "Tutela com foco em negativacao",
      requests: [
        "suspensao imediata da negativacao ou da ameaca de restricao",
        "proibicao de novas medidas restritivas durante a revisional",
        "preservacao do status contratual ate reavaliacao judicial"
      ]
    };
  }

  if (objectiveLabel === "Preparar acao revisional") {
    return {
      label: "Tutela de estabilizacao contratual",
      requests: [
        "autorizacao para deposito ou pagamento do valor incontroverso",
        "suspensao de cobranca excessiva",
        "vedacao de medidas restritivas ligadas ao contrato controvertido"
      ]
    };
  }

  return {
    label: "Tutela economica de cobranca",
    requests: [
      "limitacao da cobranca ao valor incontroverso",
      "suspensao do excesso mensal controvertido",
      "impedimento de agravamento artificial da mora"
    ]
  };
}

function normalizeTextDraftPieceKey(pieceLabel: string) {
  return pieceLabel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
}

function buildTextDraftArtifactId(input: {
  caseId: string;
  documentId: string;
  pieceLabel: string;
}) {
  return `TXT-${input.caseId.toUpperCase()}-${input.documentId.toUpperCase()}-${normalizeTextDraftPieceKey(
    input.pieceLabel
  )}`;
}

export async function getClaraProcessArtifact(
  processId?: string | null,
  clientId?: string | null,
  documentId?: string | null,
  committed?: boolean
) {
  const process = await findProcess(processId);
  const client = await findClient(clientId ?? process.clientId);
  const document = await findDocument(documentId);

  return {
    recordId: `PRC-${process.id.toUpperCase()}`,
    statusLabel: committed ? "Analise registrada" : "Analise preparada",
    stageLabel: committed ? "Registrada no processo" : "Aguardando confirmacao",
    processLabel: process.processNumber,
    clientLabel: client.fullName,
    documentLabel: document.fileName,
    summary:
      "Leitura executiva do processo organizada pela Clara com foco em prazo, risco, prova e proxima medida juridica.",
    highlights: [
      "Prazo sensivel identificado na fase atual",
      "Necessidade de reforco documental antes da proxima peca",
      "Contexto do cliente preservado para continuidade do trabalho"
    ]
  };
}

export async function getClaraCaseArtifact(caseId?: string | null, committed?: boolean) {
  const bankingCase = await findCase(caseId);

  return {
    recordId: `CAS-${bankingCase.id.toUpperCase()}`,
    statusLabel: committed ? "Resumo do caso criado" : "Resumo do caso preparado",
    stageLabel: committed ? "Registrado no caso" : "Aguardando confirmacao",
    caseLabel: bankingCase.title,
    bankLabel: bankingCase.bankName,
    phaseLabel: bankingCase.stage,
    summary:
      "Resumo executivo do caso consolidado pela Clara com tese, risco, fase processual e proxima medida recomendada.",
    highlights: [
      bankingCase.mainThesis,
      bankingCase.suggestedStrategy,
      "Prioridade definida para a proxima frente operacional"
    ]
  };
}

export async function getClaraClientArtifact(clientId?: string | null, caseId?: string | null, committed?: boolean) {
  const client = await findClient(clientId);
  const bankingCase = await findCase(caseId);

  return {
    recordId: `CLI-${client.id.toUpperCase()}`,
    statusLabel: committed ? "Relacionamento atualizado" : "Relacionamento preparado",
    stageLabel: committed ? "Registrado no cliente" : "Aguardando confirmacao",
    clientLabel: client.fullName,
    bankLabel: client.bankName,
    caseLabel: bankingCase.title,
    summary:
      "Contexto de atendimento consolidado pela Clara para orientar mensagem ao cliente, pendencias documentais e proxima acao do escritorio.",
    highlights: [
      `Origem: ${client.leadSource}`,
      `Status do atendimento: ${client.serviceStatus}`,
      "Proxima abordagem pronta para envio interno ou ao cliente"
    ]
  };
}

export async function getClaraTaskArtifact(
  taskId?: string | null,
  caseId?: string | null,
  committed?: boolean
) {
  const task = await findTask(taskId);
  const bankingCase = await findCase(caseId ?? task.caseId);
  const client = await findClient(task.clientId);

  return {
    recordId: `CLT-${task.id.toUpperCase()}`,
    statusLabel: committed ? "Tarefa criada" : "Preparada pela Clara",
    stageLabel: committed ? "Registrada na mesa operacional" : "Aguardando confirmacao",
    title: task.title,
    summary: task.lexiaNextStep,
    ownerLabel: task.assigneeLabel,
    priorityLabel: task.priority,
    clientLabel: client.fullName,
    caseLabel: bankingCase.title,
    checklistPreview: task.checklist.slice(0, 3).map((item) => item.label),
    nextStep:
      "Converter o insight da Clara em tarefa de execucao, validar dono e travar o primeiro item do checklist."
  };
}

export async function getClaraRevisionalTaskArtifact(params: {
  clientId?: string | null;
  caseId?: string | null;
  processId?: string | null;
  documentId?: string | null;
  objective?: string | null;
  committed?: boolean;
}) {
  const revisionalWorkspace = await getBankingRevisionalWorkspace({
    clientId: params.clientId ?? undefined,
    documentId: params.documentId ?? undefined,
    objective: params.objective ?? undefined,
    processId: params.processId ?? undefined
  });

  const pendingDocuments = revisionalWorkspace.documentReadiness
    .filter((item) => item.status !== "ok")
    .map((item) => item.title);
  const pendingChecklist = revisionalWorkspace.filingChecklist
    .filter((item) => item.status !== "ready")
    .map((item) => item.title);
  const mergedChecklist = [
    ...pendingDocuments,
    ...pendingChecklist,
    "Abrir minuta inicial revisional"
  ].slice(0, 5);

  return {
    recordId: `CLT-REV-${revisionalWorkspace.process.id.toUpperCase()}`,
    statusLabel: params.committed ? "Tarefa criada" : "Preparada pela Clara",
    stageLabel: params.committed ? "Registrada na mesa operacional" : "Aguardando confirmacao",
    title: `Fechar ajuizamento revisional de ${revisionalWorkspace.client.fullName}`,
    summary: revisionalWorkspace.decisionSummary,
    ownerLabel: revisionalWorkspace.bankingCase.ownerLabel,
    priorityLabel: revisionalWorkspace.urgencyProfile.key === "economica" ? "high" : "urgent",
    clientLabel: revisionalWorkspace.client.fullName,
    caseLabel: revisionalWorkspace.bankingCase.title,
    checklistPreview: mergedChecklist,
    nextStep:
      pendingDocuments.length > 0
        ? `Priorizar ${pendingDocuments[0].toLowerCase()} antes de fechar a inicial revisional.`
        : `Priorizar ${pendingChecklist[0]?.toLowerCase() ?? "a revisao final da inicial"} para protocolo.`
  };
}

export async function getClaraAgendaArtifact(
  clientId?: string | null,
  caseId?: string | null,
  committed?: boolean
) {
  const client = await findClient(clientId);
  const bankingCase = await findCase(caseId);

  return {
    recordId: `AGE-${client.id.toUpperCase()}-${bankingCase.id.toUpperCase()}`,
    statusLabel: committed ? "Compromisso registrado" : "Rascunho de compromisso",
    stageLabel: committed ? "Lancado na agenda" : "Aguardando confirmacao",
    clientLabel: client.fullName,
    caseLabel: bankingCase.title,
    message:
      "Atualizacao preparada para o cliente com situacao atual do caso, proxima medida e expectativa de andamento.",
    talkingPoints: [
      "Confirmar o marco processual mais recente antes do envio",
      "Explicar a proxima medida em linguagem simples",
      "Registrar retorno do cliente na agenda operacional"
    ]
  };
}

export async function getClaraRevisionalAgendaArtifact(params: {
  clientId?: string | null;
  caseId?: string | null;
  processId?: string | null;
  documentId?: string | null;
  objective?: string | null;
  committed?: boolean;
}) {
  const revisionalWorkspace = await getBankingRevisionalWorkspace({
    clientId: params.clientId ?? undefined,
    documentId: params.documentId ?? undefined,
    objective: params.objective ?? undefined,
    processId: params.processId ?? undefined
  });

  const pendingDocuments = revisionalWorkspace.documentReadiness
    .filter((item) => item.status !== "ok")
    .map((item) => item.title);

  return {
    recordId: `AGE-REV-${revisionalWorkspace.client.id.toUpperCase()}-${revisionalWorkspace.process.id.toUpperCase()}`,
    statusLabel: params.committed ? "Compromisso registrado" : "Rascunho de compromisso",
    stageLabel: params.committed ? "Lancado na agenda" : "Aguardando confirmacao",
    clientLabel: revisionalWorkspace.client.fullName,
    caseLabel: revisionalWorkspace.bankingCase.title,
    message:
      pendingDocuments.length > 0
        ? `Atualizacao pronta para o cliente informando que a revisional segue em preparacao e que o escritorio ainda precisa de ${pendingDocuments[0].toLowerCase()} para fechar o ajuizamento.`
        : "Atualizacao pronta para o cliente informando que a revisional esta tecnicamente estruturada e em fase final de ajuizamento.",
    talkingPoints: [
      `Explicar a tese principal: ${revisionalWorkspace.priorityTheses[0]?.title ?? revisionalWorkspace.bankingCase.mainThesis}.`,
      `Informar o proximo passo operacional: ${revisionalWorkspace.filingChecklist[0]?.title ?? "fechar a inicial revisional"}.`,
      pendingDocuments.length > 0
        ? `Solicitar ao cliente ${pendingDocuments[0].toLowerCase()}.`
        : "Alinhar expectativa de protocolo e retorno do escritorio."
    ]
  };
}

export async function getClaraTextDraftArtifact(params: {
  caseId?: string | null;
  documentId?: string | null;
  piece?: string | null;
  objective?: string | null;
  committed?: boolean;
  revisedInstallment?: string | null;
  estimatedTotalExcess?: string | null;
  chargedInstallment?: string | null;
  contractedInstallment?: string | null;
}) {
  const pieceLabel = params.piece ?? "peticao-inicial";
  const isRevisionalPiece = pieceLabel === "acao-revisional";
  const objectiveLabel = params.objective ?? "Revisar clausulas e parcelas";
  const bankingCase = await findCase(params.caseId);
  const client = await findClient(bankingCase.clientId);
  const document = await findCaseDocument({
    caseId: bankingCase.id,
    documentId: params.documentId
  });

  if (!document) {
    throw new Error(`No document available for case ${bankingCase.id} to build Clara text draft.`);
  }

  const revisionalWorkspace = isRevisionalPiece
    ? await getBankingRevisionalWorkspace({
        clientId: bankingCase.clientId,
        documentId: params.documentId ?? undefined,
        objective: params.objective ?? undefined
      })
    : null;
  const revisionalScenario = getRevisionalScenario(
    bankingCase.title,
    document.documentType,
    bankingCase.bankName
  );
  const revisionalUrgency = getRevisionalUrgency(bankingCase.title, objectiveLabel);
  const procuracaoPreview = `${client.fullName} outorga procuracao para representacao no caso "${bankingCase.title}", com poderes ajustados para conferencia humana antes da impressao e assinatura.`;
  const contratoHonorariosPreview = `Minuta de contrato de honorarios preparada para ${client.fullName}, vinculada ao caso "${bankingCase.title}", com clausulas-base, qualificacao das partes e campos financeiros sujeitos a revisao final.`;

  return {
    recordId: buildTextDraftArtifactId({
      caseId: bankingCase.id,
      documentId: document.id,
      pieceLabel
    }),
    statusLabel: params.committed ? "Minuta criada" : "Minuta iniciada",
    stageLabel: params.committed ? "Disponivel no editor" : "Rascunho em preparacao",
    clientLabel: client.fullName,
    caseId: bankingCase.id,
    documentId: document.id,
    pieceLabel,
    caseLabel: bankingCase.title,
    bankLabel: bankingCase.bankName,
    processLabel: bankingCase.processNumber,
    documentLabel: document.fileName,
    sections:
      pieceLabel === "procuracao"
        ? [
            "Qualificacao do outorgante e referencia do caso",
            "Poderes gerais e especificos para representacao judicial",
            "Faculdades para firmar termos, receber citacao e acompanhar atos",
            "Campos finais de local, data e assinatura para conferencia humana"
          ]
        : pieceLabel === "contrato-honorarios"
          ? [
              "Qualificacao das partes e objeto contratual",
              "Escopo dos servicos juridicos e limites de atuacao",
              "Honorarios, despesas e condicoes de pagamento",
              "Clausulas de vigencia, rescicao e assinatura"
            ]
          : isRevisionalPiece
            ? [
                "Sintese contratual e historico das parcelas",
                "Clausulas abusivas, CET, capitalizacao e encargos discutidos",
                "Memoria de calculo revisional e impacto economico",
                "Tutela para conter cobranca excessiva e readequar a parcela",
                "Pedidos revisionais e repeticao de indebito, se cabivel"
              ]
            : [
                "Sintese fatica e bancaria do caso",
                "Fundamentos de abusividade e desequilibrio contratual",
                "Pedidos, tutela e estrategia probatoria"
              ],
    preview:
      pieceLabel === "procuracao"
        ? procuracaoPreview
        : pieceLabel === "contrato-honorarios"
          ? contratoHonorariosPreview
          : isRevisionalPiece
            ? "Estrutura inicial revisional preparada pela Clara com foco em clausulas abusivas, readequacao de parcelas, memoria de calculo e tutela para conter cobranca excessiva."
            : "Estrutura inicial sugerida pela Clara pronta para evolucao em minuta assistida com foco em direito bancario.",
    revisionalMemory: isRevisionalPiece
      ? {
          contractedInstallment: params.contractedInstallment ?? "R$ 1.842,00",
          chargedInstallment: params.chargedInstallment ?? "R$ 2.214,00",
          revisedInstallment: params.revisedInstallment ?? "R$ 1.598,00",
          estimatedTotalExcess: params.estimatedTotalExcess ?? "R$ 17.864,00",
          thesis:
            revisionalWorkspace?.decisionSummary ??
            "Revisao das clausulas remuneratorias, afastamento de encargos abusivos e readequacao do valor das parcelas.",
          productLabel: revisionalWorkspace?.productProfile.label ?? null,
          scenarioLabel: revisionalWorkspace?.scenarioProfile.label ?? revisionalScenario.label,
          objectiveLabel,
          urgencyLabel: revisionalWorkspace?.urgencyProfile.label ?? revisionalUrgency.label,
          legalGrounds:
            revisionalWorkspace?.legalGrounds.map((item) => item.detail) ?? [
              "violacao da transparencia e da informacao adequada sobre CET, encargos e composicao da parcela",
              "onerosidade excessiva e desequilibrio contratual diante da distancia entre a parcela contratada e a efetivamente cobrada",
              `necessidade de controle judicial sobre ${revisionalScenario.thesisFocus.join(", ")}`
            ],
          evidenceFocus:
            revisionalWorkspace?.criticalProof ?? revisionalWorkspace?.scenarioProfile.evidenceFocus ?? revisionalScenario.evidenceFocus,
          requests:
            revisionalWorkspace?.petitionRequests.map((item) => item.detail) ?? [
              ...revisionalScenario.requests,
              ...revisionalUrgency.requests
            ],
          decisionSummary: revisionalWorkspace?.decisionSummary ?? null,
          priorityTheses:
            revisionalWorkspace?.priorityTheses.map((item) => ({
              title: item.title,
              rationale: item.rationale,
              proof: item.proof,
              request: item.request
            })) ?? [],
          documentReadiness:
            revisionalWorkspace?.documentReadiness.map((item) => ({
              title: item.title,
              status: item.status,
              detail: item.detail
            })) ?? [],
          filingChecklist:
            revisionalWorkspace?.filingChecklist.map((item) => ({
              title: item.title,
              status: item.status,
              detail: item.detail
            })) ?? []
        }
      : null
  };
}

export async function getClaraComparisonArtifact(
  documentId?: string | null,
  documentId2?: string | null,
  committed?: boolean
) {
  const firstDocument = await findDocument(documentId, 0);
  const secondDocument = await findDocument(documentId2, 1);

  return {
    recordId: `CMP-${firstDocument.id.toUpperCase()}-${secondDocument.id.toUpperCase()}`,
    statusLabel: committed ? "Quadro comparativo criado" : "Quadro comparativo salvo",
    stageLabel: committed ? "Registrado nos arquivos" : "Aguardando confirmacao",
    firstLabel: firstDocument.fileName,
    secondLabel: secondDocument.fileName,
    summary:
      "Quadro comparativo preparado para localizar divergencias de clausula, encargos e pontos aproveitaveis na tese.",
    findings: [
      "Divergencias em encargos e custo efetivo total",
      "Pontos de reforco para narrativa de abusividade",
      "Base pronta para reaproveitamento em minuta ou analise"
    ]
  };
}

export async function getClaraRevisionalFilingPackageArtifact(params: {
  clientId?: string | null;
  caseId?: string | null;
  processId?: string | null;
  documentId?: string | null;
  objective?: string | null;
  committed?: boolean;
}) {
  const revisionalWorkspace = await getBankingRevisionalWorkspace({
    clientId: params.clientId ?? undefined,
    documentId: params.documentId ?? undefined,
    objective: params.objective ?? undefined,
    processId: params.processId ?? undefined
  });

  return {
    recordId: `PKG-REV-${revisionalWorkspace.process.id.toUpperCase()}`,
    statusLabel: params.committed ? "Pacote criado" : "Pacote preparado",
    stageLabel: params.committed ? "Registrado na Clara" : "Aguardando confirmacao",
    title: revisionalWorkspace.filingPackage.title,
    summary: revisionalWorkspace.filingPackage.summary,
    clientLabel: revisionalWorkspace.client.fullName,
    caseLabel: revisionalWorkspace.bankingCase.title,
    packageItems: revisionalWorkspace.filingPackage.items.map((item) => item.title),
    nextStep:
      revisionalWorkspace.documentReadiness.some((item) => item.status !== "ok")
        ? "Resolver as pendencias documentais mais criticas antes do protocolo."
        : "Avancar com revisao final da minuta e alinhamento de protocolo."
  };
}

export async function getClaraDeadlineArtifact(action?: string | null, committed?: boolean) {
  return {
    recordId: "PRZ-CLARA-001",
    statusLabel: committed ? "Prazo registrado" : "Prazo orientado",
    stageLabel: committed ? "Lancado para controle" : "Aguardando confirmacao",
    actionLabel: action ?? "calcular-prazo",
    summary:
      "Prazo preliminar preparado pela Clara com foco em janela util, revisao documental e distribuicao interna do trabalho.",
    steps: [
      "Conferir data-base no andamento mais recente",
      "Travar checklist de preparacao da peca",
      "Reservar janela de revisao antes do protocolo"
    ]
  };
}
