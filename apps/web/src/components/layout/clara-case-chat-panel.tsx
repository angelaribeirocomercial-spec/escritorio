"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import type {
  ClaraChatMessage,
  ClaraChatRouteResponse
} from "@/server/services/clara/clara-chat-types";

type ClaraCaseChatPanelProps = {
  context: {
    clientId: string;
    caseId: string;
    processId?: string | null;
    documentId?: string | null;
    source: "dossie";
  };
  header: {
    clientName: string;
    caseTitle: string;
  };
  fallback: {
    summary: string;
    focusPoints: ReadonlyArray<string>;
    timeline: ReadonlyArray<string>;
    comparisonLabel?: string | null;
  };
};

function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function ClaraCaseChatPanel(props: ClaraCaseChatPanelProps) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ClaraChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const searchParams = new URLSearchParams({
      clientId: props.context.clientId,
      caseId: props.context.caseId,
      source: props.context.source
    });

    if (props.context.processId) {
      searchParams.set("processId", props.context.processId);
    }

    if (props.context.documentId) {
      searchParams.set("documentId", props.context.documentId);
    }

    return searchParams.toString();
  }, [props.context]);

  useEffect(() => {
    async function loadThread() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/clara/chat?${queryString}`, {
          method: "GET",
          cache: "no-store"
        });
        const payload = (await response.json()) as ClaraChatRouteResponse | { error?: string };

        if (!response.ok || !("ok" in payload) || payload.ok !== true) {
          throw new Error(
            "error" in payload ? payload.error ?? "Falha ao carregar a Clara." : "Falha ao carregar a Clara."
          );
        }

        setThreadId(payload.data.threadId);
        setMessages(payload.data.messages);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Falha ao carregar a Clara.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadThread();
  }, [queryString]);

  async function handleRetry() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clara/chat?${queryString}`, {
        method: "GET",
        cache: "no-store"
      });
      const payload = (await response.json()) as ClaraChatRouteResponse | { error?: string };

      if (!response.ok || !("ok" in payload) || payload.ok !== true) {
        throw new Error("error" in payload ? payload.error ?? "Falha ao carregar a Clara." : "Falha ao carregar a Clara.");
      }

      setThreadId(payload.data.threadId);
      setMessages(payload.data.messages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar a Clara.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDraft = draft.trim();

    if (!trimmedDraft || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/clara/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          threadId: threadId ?? undefined,
          clientId: props.context.clientId,
          caseId: props.context.caseId,
          processId: props.context.processId ?? undefined,
          documentId: props.context.documentId ?? undefined,
          source: props.context.source,
          message: trimmedDraft
        })
      });
      const payload = (await response.json()) as ClaraChatRouteResponse | { error?: string };

      if (!response.ok || !("ok" in payload) || payload.ok !== true) {
        throw new Error("error" in payload ? payload.error ?? "Falha ao enviar mensagem." : "Falha ao enviar mensagem.");
      }

      setThreadId(payload.data.threadId);
      setMessages(payload.data.messages);
      setDraft("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Falha ao enviar mensagem.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="detail-subpanel p-5">
        <p className="text-sm leading-7 text-slate-200">
          Conversa viva com a Clara para <span className="font-semibold text-white">{props.header.clientName}</span>.
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-200">
          Caso atual: <span className="font-semibold text-white">{props.header.caseTitle}</span>
        </p>
      </div>

      <div className="detail-subpanel p-5">
        {isLoading ? (
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">Clara esta abrindo a thread do caso.</div>
        ) : messages.length ? (
          <div className="grid gap-4">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`max-w-[88%] rounded-[20px] border px-4 py-3 text-sm leading-7 ${
                    isUser
                      ? "ml-auto border-cyan-300/30 bg-cyan-400/10 text-cyan-50"
                      : "border-slate-400/20 bg-slate-900/60 text-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {isUser ? "Voce" : "Clara"}
                    </p>
                    <span className="text-[11px] text-slate-500">{formatMessageTime(message.createdAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap">{message.text}</p>
                </div>
              );
            })}
            {isSending ? (
              <div className="max-w-[88%] rounded-[20px] border border-slate-400/20 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                Clara esta analisando o contexto do caso.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            Nenhuma mensagem foi persistida ainda para este caso.
          </div>
        )}

        <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
          <textarea
            className="mj-model-input min-h-[7rem] w-full px-4 py-3 text-sm outline-none"
            name="clara-message"
            placeholder="Pergunte sobre o caso, os documentos, o processo ou o proximo passo."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400">Enter envia. Shift+Enter quebra linha.</p>
            <button
              className="detail-link-button px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSending || !draft.trim()}
              type="submit"
            >
              {isSending ? "Enviando" : "Enviar"}
            </button>
          </div>
        </form>

        {error ? (
          <div className="mt-4 detail-soft-row border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm text-amber-100">
            {error}
            <button
              className="ml-3 font-semibold underline underline-offset-4"
              onClick={() => {
                void handleRetry();
              }}
              type="button"
            >
              Tentar novamente
            </button>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="detail-subpanel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Fallback controlado</p>
          <p className="mt-3 text-sm leading-7 text-slate-200">{props.fallback.summary}</p>
          {props.fallback.comparisonLabel ? (
            <div className="mt-4 detail-soft-row px-4 py-4 text-sm text-slate-300">{props.fallback.comparisonLabel}</div>
          ) : null}
          {props.fallback.focusPoints.length ? (
            <div className="mt-4 grid gap-2">
              {props.fallback.focusPoints.map((point) => (
                <div key={point} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {point}
                </div>
              ))}
            </div>
          ) : null}
          {props.fallback.timeline.length ? (
            <div className="mt-4 grid gap-2">
              {props.fallback.timeline.slice(0, 3).map((entry) => (
                <div key={entry} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                  {entry}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
