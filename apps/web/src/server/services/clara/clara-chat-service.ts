import { randomUUID } from "node:crypto";

import {
  getClaraAnalysisApiPayload,
  getClaraCaseChecklistApiPayload,
  getClaraMinutaReviewApiPayload,
  getClaraNextStepApiPayload,
  getClaraPieceDraftApiPayload,
  getClaraProcessSummaryApiPayload
} from "@/server/services/clara/clara-api";
import {
  appendClaraChatMessages,
  getOrCreateClaraChatThread
} from "@/server/services/clara/clara-chat-store";
import type {
  ClaraChatContext,
  ClaraChatIntent,
  ClaraChatMessage,
  ClaraChatResolution,
  ClaraChatThread
} from "@/server/services/clara/clara-chat-types";

function createMessage(input: {
  role: ClaraChatMessage["role"];
  text: string;
  intent?: ClaraChatIntent;
  status?: ClaraChatMessage["status"];
  sourceTrace?: ClaraChatMessage["sourceTrace"];
  metadata?: Record<string, string>;
}): ClaraChatMessage {
  return {
    id: `clara-message-${randomUUID()}`,
    role: input.role,
    text: input.text,
    createdAt: new Date().toISOString(),
    intent: input.intent,
    status: input.status,
    sourceTrace: input.sourceTrace,
    metadata: input.metadata
  };
}

function detectIntent(message: string): ClaraChatIntent {
  const normalized = message.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

  if (/(jurisprud|precedent|stj|stf|sumula)/.test(normalized)) {
    return "consultar-jurisprudencia";
  }

  if (/(minuta|revisar|corrigir peca|ajustar peca)/.test(normalized)) {
    return "revisar-minuta";
  }

  if (/(peticao|peca|inicial|minuta|contestacao|recurso)/.test(normalized)) {
    return "gerar-peca";
  }

  if (/(andamento|processo|prazo|moviment|tribunal|intimac)/.test(normalized)) {
    return "acompanhar-processo";
  }

  if (/(document|anexo|falt|checklist|prova|arquivo)/.test(normalized)) {
    return "checklist-documental";
  }

  if (/(proximo passo|e agora|seguir|qual o passo|o que fazer agora)/.test(normalized)) {
    return "sugerir-proximos-passos";
  }

  if (/(resum|explica|explique|entenda|entendi|caso|analisa)/.test(normalized)) {
    return "analisar-caso";
  }

  return "fallback";
}

function formatSection(title: string, items: ReadonlyArray<string>) {
  if (!items.length) {
    return "";
  }

  return `${title}: ${items.join(" | ")}`;
}

function normalizeAssistantVoice(text: string) {
  return text
    .replace(/^Clara classificou\s*/i, "Pelo que vejo aqui, ")
    .replace(/\bIA Clara\b/g, "Eu")
    .replace(/^A Clara recomenda\s*/i, "Eu recomendo ")
    .replace(/^Clara recomenda\s*/i, "Eu recomendo ")
    .replace(/\bA Clara\b/g, "Eu")
    .replace(/\bClara\b/g, "Eu");
}

function normalizeMessageText(message: string) {
  return message.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function isShortContinuationPrompt(message: string) {
  return /^(clara|oi|ola|opa|ok|entendi|me explica melhor|explique melhor|continua|continue)$/i.test(
    normalizeMessageText(message)
  );
}

function takeFirstItems(items: ReadonlyArray<string>, count: number) {
  return items.slice(0, count);
}

function buildContinuationReply(lastAssistantIntent?: ClaraChatIntent) {
  if (lastAssistantIntent === "checklist-documental") {
    return "Estou aqui. Se quiser, eu posso focar so nos documentos faltantes ou te dizer o que cobrar primeiro.";
  }

  if (lastAssistantIntent === "sugerir-proximos-passos") {
    return "Estou aqui. Se quiser, eu detalho o proximo passo ou separo o que depende de documento e o que ja pode andar agora.";
  }

  if (lastAssistantIntent === "acompanhar-processo") {
    return "Estou acompanhando com voce. Se quiser, eu posso resumir o andamento ou destacar so o risco e a proxima acao.";
  }

  if (lastAssistantIntent === "gerar-peca" || lastAssistantIntent === "revisar-minuta") {
    return "Posso continuar por minuta. Se quiser, eu separo a base factual, os pedidos ou os pontos que ainda precisam de revisao.";
  }

  return "Estou aqui. Posso resumir o caso, listar os documentos faltantes, te dizer o proximo passo ou olhar a minuta.";
}

async function buildAssistantReply(
  context: ClaraChatContext,
  intent: ClaraChatIntent,
  thread: ClaraChatThread,
  userMessage: string
): Promise<{
  text: string;
  resolution: ClaraChatResolution;
  sourceTrace?: ClaraChatMessage["sourceTrace"];
}> {
  const lastAssistantIntent = [...thread.messages]
    .reverse()
    .find((message) => message.role === "assistant" && message.intent)?.intent;

  if (intent === "fallback" && isShortContinuationPrompt(userMessage)) {
    return {
      text: buildContinuationReply(lastAssistantIntent),
      resolution: { intent: "fallback", usedFallback: false }
    };
  }

  if (intent === "checklist-documental") {
    const payload = await getClaraCaseChecklistApiPayload(context.caseId);

    return {
      text: [
        normalizeAssistantVoice(payload.summary),
        formatSection("O que eu consigo confirmar", takeFirstItems(payload.confirmedFacts, 3)),
        formatSection("O que ainda esta faltando", takeFirstItems(payload.documentsMissing, 3)),
        formatSection("O que eu recomendo agora", takeFirstItems(payload.recommendations, 2))
      ]
        .filter(Boolean)
        .join("\n\n"),
      resolution: { intent, usedFallback: false }
    };
  }

  if (intent === "sugerir-proximos-passos") {
    const payload = await getClaraNextStepApiPayload({
      clientId: context.clientId,
      caseId: context.caseId,
      processId: context.processId,
      documentId: context.documentId,
      taskType: "sugerir-proximos-passos"
    });

    return {
      text: [
        normalizeAssistantVoice(payload.summary),
        `Meu proximo passo sugerido aqui e: ${payload.nextStep}`,
        formatSection("Riscos que eu vejo agora", takeFirstItems(payload.risks, 2)),
        formatSection("Lacunas documentais", takeFirstItems(payload.documentsMissing, 2))
      ]
        .filter(Boolean)
        .join("\n\n"),
      resolution: { intent, usedFallback: false }
    };
  }

  if (intent === "acompanhar-processo") {
    const payload = await getClaraProcessSummaryApiPayload({
      processId: context.processId,
      clientId: context.clientId,
      documentId: context.documentId
    });

    return {
      text: [
        normalizeAssistantVoice(payload.summary),
        formatSection(
          "Atualizacoes que eu considerei relevantes",
          takeFirstItems(payload.updates.map((update) => update.operationalSummary), 2)
        ),
        formatSection("Proximas acoes que eu sugiro", takeFirstItems(payload.nextActions, 2))
      ]
        .filter(Boolean)
        .join("\n\n"),
      resolution: { intent, usedFallback: false }
    };
  }

  if (intent === "gerar-peca") {
    const analysis = await getClaraAnalysisApiPayload({
      clientId: context.clientId,
      caseId: context.caseId,
      processId: context.processId,
      documentId: context.documentId,
      taskType: "gerar-peca"
    });
    const draft = await getClaraPieceDraftApiPayload({
      caseId: context.caseId,
      documentId: context.documentId,
      piece: "peticao-inicial",
      objective: "Preparar peca do caso"
    }).catch(() => null);

    return {
      text: [
        normalizeAssistantVoice(analysis.summary),
        formatSection(
          "Base factual que eu consigo sustentar",
          takeFirstItems(analysis.caseAnalysis.confirmedFacts, 3)
        ),
        formatSection("O que eu sugiro para a peca", takeFirstItems(analysis.caseAnalysis.suggestions, 2)),
        draft ? `A minuta relacionada neste contexto e: ${normalizeAssistantVoice(draft.summary)}` : ""
      ]
        .filter(Boolean)
        .join("\n\n"),
      resolution: { intent, usedFallback: false },
      sourceTrace: analysis.sourceTrace
    };
  }

  if (intent === "revisar-minuta") {
    const payload = await getClaraMinutaReviewApiPayload({
      caseId: context.caseId,
      documentId: context.documentId,
      objective: "Revisar minuta do caso",
      piece: "peticao-inicial"
    });

    return {
      text: [
        normalizeAssistantVoice(payload.draft.preview),
        formatSection("Checklist de revisao que eu seguiria", takeFirstItems(payload.reviewChecklist, 3)),
        formatSection("Alertas que eu deixo aqui", takeFirstItems(payload.warnings, 2))
      ]
        .filter(Boolean)
        .join("\n\n"),
      resolution: { intent, usedFallback: false }
    };
  }

  const analysis = await getClaraAnalysisApiPayload({
    clientId: context.clientId,
    caseId: context.caseId,
    processId: context.processId,
    documentId: context.documentId,
    taskType: intent === "consultar-jurisprudencia" ? "consultar-jurisprudencia" : "analisar-caso"
  });

  return {
    text: [
      normalizeAssistantVoice(analysis.summary),
      formatSection("O que eu consigo confirmar", takeFirstItems(analysis.caseAnalysis.confirmedFacts, 4)),
      formatSection("Lacunas que ainda vejo", takeFirstItems(analysis.caseAnalysis.documentsMissing, 2)),
      formatSection("O que eu sugiro a partir daqui", takeFirstItems(analysis.caseAnalysis.suggestions, 2))
    ]
      .filter(Boolean)
      .join("\n\n"),
    resolution: {
      intent,
      usedFallback: intent === "fallback"
    },
    sourceTrace: analysis.sourceTrace
  };
}

export async function getClaraChatThread(context: ClaraChatContext): Promise<ClaraChatThread> {
  return getOrCreateClaraChatThread(context);
}

export async function sendClaraChatMessage(params: {
  threadId?: string;
  context: ClaraChatContext;
  message: string;
}) {
  const trimmedMessage = params.message.trim();

  if (!trimmedMessage) {
    throw new Error("Informe uma mensagem antes de enviar para a Clara.");
  }

  const thread = await getClaraChatThread(params.context);

  const intent = detectIntent(trimmedMessage);
  const userMessage = createMessage({
    role: "user",
    text: trimmedMessage
  });

  try {
    const assistantReply = await buildAssistantReply(params.context, intent, thread, trimmedMessage);
    const assistantMessage = createMessage({
      role: "assistant",
      text: assistantReply.text,
      intent: assistantReply.resolution.intent,
      status: assistantReply.resolution.usedFallback ? "fallback" : "completed",
      sourceTrace: assistantReply.sourceTrace
    });
    const updatedThread = await appendClaraChatMessages({
      threadId: thread.id,
      context: params.context,
      messages: [userMessage, assistantMessage]
    });

    return {
      thread: updatedThread,
      resolution: assistantReply.resolution
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Falha inesperada ao consultar a Clara neste caso.";
    const fallbackMessage = createMessage({
      role: "assistant",
      text:
        "Nao consegui concluir a resposta conversacional agora. Mantive o dossie funcional com fallback controlado.\n\n" +
        `Motivo observado: ${message}`,
      intent: "fallback",
      status: "fallback"
    });
    const updatedThread = await appendClaraChatMessages({
      threadId: thread.id,
      context: params.context,
      messages: [userMessage, fallbackMessage]
    });

    return {
      thread: updatedThread,
      resolution: {
        intent: "fallback" as const,
        usedFallback: true
      }
    };
  }
}
