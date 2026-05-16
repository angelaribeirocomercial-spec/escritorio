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

function buildGreeting(context: ClaraChatContext) {
  return createMessage({
    role: "assistant",
    text:
      `Entendi. Este chat esta preso ao caso ${context.caseId} e vou responder usando o contexto real do dossie.` +
      " Pode perguntar sobre o caso, documentos, processo, proximo passo ou minuta.",
    intent: "fallback",
    status: "completed",
    metadata: {
      source: context.source
    }
  });
}

function formatSection(title: string, items: ReadonlyArray<string>) {
  if (!items.length) {
    return "";
  }

  return `${title}: ${items.join(" | ")}`;
}

async function buildAssistantReply(
  context: ClaraChatContext,
  intent: ClaraChatIntent
): Promise<{
  text: string;
  resolution: ClaraChatResolution;
  sourceTrace?: ClaraChatMessage["sourceTrace"];
}> {
  if (intent === "checklist-documental") {
    const payload = await getClaraCaseChecklistApiPayload(context.caseId);

    return {
      text: [
        payload.summary,
        formatSection("Fatos confirmados", payload.confirmedFacts),
        formatSection("Documentos faltantes", payload.documentsMissing),
        formatSection("Recomendacoes", payload.recommendations)
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
        payload.summary,
        `Proximo passo sugerido: ${payload.nextStep}`,
        formatSection("Riscos", payload.risks),
        formatSection("Lacunas documentais", payload.documentsMissing)
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
        payload.summary,
        formatSection("Atualizacoes relevantes", payload.updates.map((update) => update.operationalSummary)),
        formatSection("Proximas acoes", payload.nextActions)
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
        analysis.summary,
        formatSection("Base factual", analysis.caseAnalysis.confirmedFacts),
        formatSection("Sugestoes", analysis.caseAnalysis.suggestions),
        draft ? `Minuta relacionada: ${draft.summary}` : ""
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
        payload.draft.preview,
        formatSection("Checklist de revisao", payload.reviewChecklist),
        formatSection("Alertas", payload.warnings)
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
      analysis.summary,
      formatSection("Fatos confirmados", analysis.caseAnalysis.confirmedFacts),
      formatSection("Lacunas atuais", analysis.caseAnalysis.documentsMissing),
      formatSection("Sugestoes", analysis.caseAnalysis.suggestions)
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
  const thread = await getOrCreateClaraChatThread(context);

  if (thread.messages.length > 0) {
    return thread;
  }

  return appendClaraChatMessages({
    threadId: thread.id,
    context,
    messages: [buildGreeting(context)]
  });
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
    const assistantReply = await buildAssistantReply(params.context, intent);
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
