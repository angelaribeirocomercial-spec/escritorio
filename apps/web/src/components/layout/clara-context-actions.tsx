import Link from "next/link";

type ClaraContextActionsProps = {
  eyebrow: string;
  title: string;
  basis: readonly string[];
  conclusion: string;
  nextActions: readonly string[];
  cautionLabel: string;
  actionHref?: string;
  actionLabel?: string;
};

export function ClaraContextActions({
  eyebrow,
  title,
  basis,
  conclusion,
  nextActions,
  cautionLabel,
  actionHref = "/clara",
  actionLabel = "Continuar na Clara"
}: ClaraContextActionsProps) {
  return (
    <section className="detail-panel-accent p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/85">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">{conclusion}</p>
          <p className="mt-3 text-xs leading-5 text-slate-400">{cautionLabel}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-[4px] border border-white/10 px-3 py-1 text-xs font-semibold text-white/90">
            Hub Clara
          </span>
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="detail-soft-row px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Contexto enviado
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {basis.map((item) => (
              <span
                key={item}
                className="rounded-[4px] border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="detail-soft-row px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Fluxo sugerido na Clara
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {nextActions.map((action) => (
              <span
                key={action}
                className="rounded-[4px] border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200"
              >
                {action}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
