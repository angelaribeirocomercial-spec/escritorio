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
  composerButtonLabel?: string;
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
  composerButtonLabel,
  composerHint,
  composerPlaceholder,
  composerValue,
  searchIndex = [],
  interactive = false,
  statusLabel,
  statusLine
}: ClaraConversationCardProps) {
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

      {composerButtonLabel ? (
        <form className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <textarea
            className="reference-search-input min-h-[7rem] w-full px-3 py-3 text-sm outline-none"
            defaultValue={composerValue}
            name="q"
            placeholder={composerPlaceholder ?? "Digite sua pergunta para a Clara."}
          />
          <div className="flex items-end">
            <button
              className="clara-secondary-button h-fit rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/15"
              type="submit"
            >
              {composerButtonLabel}
            </button>
          </div>
        </form>
      ) : null}

      {composerHint ? <p className="mt-3 text-[11px] leading-5 text-slate-500">{composerHint}</p> : null}

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
