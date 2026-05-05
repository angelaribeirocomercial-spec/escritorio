"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ClaraConversationClient = {
  id: string;
  label: string;
};

type ClaraConversationCardProps = {
  badgeLabel: string;
  badgeSubtitle: string;
  responseDetail: string;
  assistantReply?: string;
  composerHint?: string;
  composerPlaceholder?: string;
  composerValue?: string;
  clientOptions?: ClaraConversationClient[];
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

type ConversationContext = {
  lastClientLabel: string | null;
  lastTopic: "client" | "case" | "document" | "process" | null;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function findClientMatch(question: string, clientOptions: ClaraConversationClient[]) {
  const normalized = normalizeText(question);

  return clientOptions.find((client) => {
    const [name, bank] = client.label.split(" · ");
    const normalizedName = normalizeText(name ?? client.label);
    const normalizedBank = normalizeText(bank ?? "");
    const normalizedId = normalizeText(client.id);

    return (
      normalized.includes(normalizedName) ||
      normalizedName.includes(normalized) ||
      (normalizedBank ? normalized.includes(normalizedBank) : false) ||
      normalized.includes(normalizedId)
    );
  });
}

function buildAssistantReplyWithContext(
  question: string,
  clientOptions: ClaraConversationClient[],
  context: ConversationContext
) {
  const normalized = normalizeText(question);
  const wantsContinuation = /(?:^|\s)(continuar|continue|seguir|segue|prosseguir|mais|e agora|proximo passo|próximo passo|isso|pode continuar)(?:\s|$)/.test(
    normalized
  );
  const clientMatch = findClientMatch(question, clientOptions);

  if (clientMatch) {
    const clientLabel = clientMatch.label.split(" · ")[0] ?? clientMatch.label;

    return {
      reply: `Encontrei o cliente ${clientLabel}. Posso abrir o cockpit dele e seguir com o caso, os documentos ou a minuta.`,
      nextContext: {
        lastClientLabel: clientLabel,
        lastTopic: "client" as const
      }
    };
  }

  if (wantsContinuation && context.lastClientLabel) {
    const topic =
      context.lastTopic === "document"
        ? "documentos"
        : context.lastTopic === "process"
          ? "processo"
          : context.lastTopic === "case"
            ? "caso"
            : "fluxo";

    return {
      reply: `Continuando com ${context.lastClientLabel}: posso abrir o cockpit, retomar o ${topic} ou seguir para a próxima ação do fluxo.`,
      nextContext: context
    };
  }

  if (normalized.includes("caso")) {
    return {
      reply: "Posso localizar o caso, cruzar cliente, processo e documentos e seguir com a resposta curta que voce pediu.",
      nextContext: { ...context, lastTopic: "case" as const }
    };
  }

  if (normalized.includes("documento")) {
    return {
      reply: "Posso revisar os documentos ligados ao caso e apontar o que ja esta anexado e o que ainda falta.",
      nextContext: { ...context, lastTopic: "document" as const }
    };
  }

  if (normalized.includes("processo")) {
    return {
      reply: "Posso localizar o processo e te mostrar a situacao processual, os andamentos e o proximo passo operacional.",
      nextContext: { ...context, lastTopic: "process" as const }
    };
  }

  return {
    reply: "Entendi. Me passe o nome, CPF, processo ou documento e eu sigo direto no contexto do caso.",
    nextContext: context
  };
}

export function ClaraConversationCard({
  badgeLabel,
  badgeSubtitle,
  responseDetail,
  assistantReply,
  composerHint,
  composerPlaceholder,
  composerValue,
  clientOptions = []
}: ClaraConversationCardProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const initialQuestion = composerValue?.trim() ?? "";
  const initialReply =
    assistantReply ?? "Pode me dizer o que você precisa? Eu respondo de forma curta e objetiva no contexto bancário.";
  const initialClientMatch = initialQuestion ? findClientMatch(initialQuestion, clientOptions) : null;
  const initialClientLabel = initialClientMatch ? initialClientMatch.label.split(" · ")[0] ?? initialClientMatch.label : null;
  const initialThread = useMemo<ChatMessage[]>(() => {
    if (!initialQuestion) {
      return [];
    }

    return [
      { role: "user", text: initialQuestion },
      { role: "assistant", text: initialReply }
    ];
  }, [initialQuestion, initialReply]);
  const [thread, setThread] = useState<ChatMessage[]>(initialThread);
  const [inputValue, setInputValue] = useState("");
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    lastClientLabel: initialClientLabel,
    lastTopic: initialClientLabel ? "client" : null
  });

  useEffect(() => {
    setThread(initialThread);
  }, [initialThread]);

  useEffect(() => {
    threadRef.current?.scrollTo({
      behavior: "smooth",
      top: threadRef.current.scrollHeight
    });
  }, [thread]);

  function sendMessage() {
    const question = inputValue.trim();

    if (!question) {
      return;
    }

    const assistantTurn = buildAssistantReplyWithContext(question, clientOptions, conversationContext);

    setThread((current) => [
      ...current,
      { role: "user", text: question },
      { role: "assistant", text: assistantTurn.reply }
    ]);
    setConversationContext((current) => ({
      lastClientLabel: assistantTurn.nextContext.lastClientLabel ?? current.lastClientLabel,
      lastTopic: assistantTurn.nextContext.lastTopic ?? current.lastTopic
    }));
    setInputValue("");
  }

  return (
    <article className="workspace-panel overflow-hidden p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="workspace-kicker">{badgeLabel}</p>
          <p className="mt-2 text-lg font-semibold text-white">{badgeSubtitle}</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{responseDetail}</p>
        </div>
      </div>

      <div className="mt-5 flex min-h-[28rem] flex-col">
        <div
          ref={threadRef}
          className="max-h-[22rem] flex-1 space-y-3 overflow-y-auto pr-1"
        >
          {thread.length === 0 ? (
            <div className="rounded-[4px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-slate-300">
              {responseDetail}
            </div>
          ) : (
            thread.map((message) => (
              <div
                key={`${message.role}-${message.text}`}
                className={`max-w-3xl rounded-[4px] border px-4 py-3 ${
                  message.role === "user"
                    ? "ml-auto border-cyan-300/20 bg-cyan-300/10"
                    : "border-emerald-300/20 bg-emerald-300/10"
                }`}
              >
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    message.role === "user" ? "text-cyan-100" : "text-emerald-100"
                  }`}
                >
                  {message.role === "user" ? "Você" : "Clara"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-100">{message.text}</p>
              </div>
            ))
          )}
        </div>

        <form
          ref={formRef}
          className="mt-4 border-t border-white/10 pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <textarea
            className="reference-search-input min-h-[7rem] w-full px-3 py-3 text-sm outline-none"
            name="q"
            placeholder={composerPlaceholder ?? "Escreva sua pergunta para a Clara."}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.shiftKey) {
                return;
              }

              event.preventDefault();
              sendMessage();
            }}
            value={inputValue}
          />
          {composerHint ? <p className="mt-3 text-[11px] leading-5 text-slate-500">{composerHint}</p> : null}
        </form>
      </div>
    </article>
  );
}


