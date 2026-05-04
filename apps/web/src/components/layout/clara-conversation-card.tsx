"use client";

import { useRef } from "react";
import Link from "next/link";

type ClaraConversationEntry = {
  kind: string;
  label: string;
  detail?: string;
  href: string;
};

type ClaraConversationCardProps = {
  badgeLabel: string;
  badgeSubtitle: string;
  responseDetail: string;
  responseQuery?: string;
  composerHint?: string;
  composerPlaceholder?: string;
  composerValue?: string;
  searchIndex?: readonly ClaraConversationEntry[];
  interactive?: boolean;
  statusLabel: string;
  statusLine: string;
};

export function ClaraConversationCard({
  badgeLabel,
  badgeSubtitle,
  responseDetail,
  responseQuery,
  composerHint,
  composerPlaceholder,
  composerValue,
  searchIndex = [],
  interactive = false,
  statusLabel,
  statusLine
}: ClaraConversationCardProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const previewItems = searchIndex.slice(0, 3);

  return (
    <article className="workspace-panel overflow-hidden p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="workspace-kicker">{badgeLabel}</p>
          <p className="mt-2 text-lg font-semibold text-white">{badgeSubtitle}</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            {responseDetail}
          </p>
        </div>
        <div className="clara-secondary-surface rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            {statusLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{statusLine}</p>
        </div>
      </div>

      <form ref={formRef} className="mt-5">
        <textarea
          className="reference-search-input min-h-[7rem] w-full px-3 py-3 text-sm outline-none"
          defaultValue={composerValue}
          name="q"
          placeholder={composerPlaceholder ?? "Digite sua pergunta para a Clara."}
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

      {responseQuery ? (
        <section className="mt-5 rounded-[4px] border border-cyan-300/20 bg-cyan-300/8 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
            Resposta da Clara
          </p>
          <div className="mt-3 rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90">Pergunta recebida</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              {responseQuery}
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Estou preparando a resposta com base no contexto local do workspace e nas fontes já disponíveis no caso.
          </p>
          {searchIndex.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {searchIndex.map((item) => (
                <Link
                  key={`${item.kind}-${item.href}`}
                  className="workspace-soft-card flex h-full flex-col justify-between rounded-[4px] border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]"
                  href={item.href}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                      {item.kind}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-white">{item.label}</p>
                    {item.detail ? <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p> : null}
                  </div>
                  <span className="mt-4 inline-flex w-fit rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                    Abrir contexto
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-6 text-slate-300">
              Nenhuma correspondência direta foi encontrada. A Clara pode seguir com a entrada unica do caso ou você pode refinar a pergunta.
            </div>
          )}
        </section>
      ) : null}

      {interactive ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {previewItems.length ? (
            previewItems.map((entry) => (
              <Link
                key={`${entry.kind}-${entry.href}`}
                className="workspace-soft-card block rounded-[4px] px-4 py-4 transition hover:bg-white/[0.08]"
                href={entry.href}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  {entry.kind}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{entry.label}</p>
                {entry.detail ? (
                  <p className="mt-2 text-sm leading-6 text-slate-300">{entry.detail}</p>
                ) : null}
              </Link>
            ))
          ) : (
            <div className="workspace-soft-card rounded-[4px] px-4 py-4 text-sm leading-6 text-slate-300 lg:col-span-3">
              Nenhum contexto adicional foi indexado para a Clara ainda.
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
