"use client";

import { useRef } from "react";

type ClaraConversationCardProps = {
  badgeLabel: string;
  badgeSubtitle: string;
  responseDetail: string;
  assistantReply?: string;
  composerHint?: string;
  composerPlaceholder?: string;
  composerValue?: string;
};

export function ClaraConversationCard({
  badgeLabel,
  badgeSubtitle,
  responseDetail,
  assistantReply,
  composerHint,
  composerPlaceholder,
  composerValue
}: ClaraConversationCardProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const question = composerValue?.trim() ?? "";
  const reply =
    assistantReply ?? "Pode me dizer o que você precisa? Eu respondo de forma curta e objetiva no contexto bancário.";

  return (
    <article className="workspace-panel overflow-hidden p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="workspace-kicker">{badgeLabel}</p>
          <p className="mt-2 text-lg font-semibold text-white">{badgeSubtitle}</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{responseDetail}</p>
        </div>
      </div>

      <form ref={formRef} className="mt-5">
        <textarea
          className="reference-search-input min-h-[7rem] w-full px-3 py-3 text-sm outline-none"
          defaultValue={composerValue}
          name="q"
          placeholder={composerPlaceholder ?? "Escreva sua pergunta para a Clara."}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey) {
              return;
            }

            event.preventDefault();
            formRef.current?.requestSubmit();
          }}
        />
      </form>

      {composerHint ? <p className="mt-3 text-[11px] leading-5 text-slate-500">{composerHint}</p> : null}

      {question ? (
        <div className="mt-5 space-y-3">
          <div className="ml-auto max-w-3xl rounded-[4px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">Você</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-100">{question}</p>
          </div>
          <div className="max-w-3xl rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">Clara</p>
            <p className="mt-2 text-sm leading-6 text-slate-100">{reply}</p>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-sm leading-6 text-slate-400">
          {responseDetail}
        </p>
      )}
    </article>
  );
}
