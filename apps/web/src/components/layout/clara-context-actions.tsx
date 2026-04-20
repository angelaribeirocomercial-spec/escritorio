import Link from "next/link";

type ClaraContextActionsProps = {
  eyebrow: string;
  title: string;
  basis: readonly string[];
  conclusion: string;
  nextActions: readonly string[];
  cautionLabel: string;
};

export function ClaraContextActions({
  eyebrow,
  title,
  basis,
  conclusion,
  nextActions,
  cautionLabel
}: ClaraContextActionsProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-soft">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/90">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">{title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">{conclusion}</p>
          <p className="mt-3 text-xs leading-5 text-slate-500">{cautionLabel}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Contextual
          </span>
          <Link
            className="rounded-xl bg-[linear-gradient(90deg,#d9a437,#e0b04f)] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-soft"
            href="/clara"
          >
            Abrir Clara
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Base da leitura
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {basis.map((item) => (
              <span
                key={item}
                className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Proximas acoes sugeridas
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {nextActions.map((action) => (
              <button
                key={action}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800"
                type="button"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
