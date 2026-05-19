import Link from "next/link";

type WorkspaceStatePanelProps = {
  title: string;
  description: string;
  tone?: "neutral" | "warning" | "danger";
  actionHref?: string;
  actionLabel?: string;
  footer?: string;
};

const toneClasses = {
  neutral: "border-white/10 bg-white/[0.04] text-slate-300",
  warning: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  danger: "border-rose-300/20 bg-rose-300/10 text-rose-100"
} as const;

export function WorkspaceStatePanel({
  title,
  description,
  tone = "neutral",
  actionHref,
  actionLabel,
  footer
}: WorkspaceStatePanelProps) {
  return (
    <section className={`workspace-state-panel workspace-panel rounded-[6px] border p-5 ${toneClasses[tone]}`}>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          className="detail-link-button mt-4 inline-flex px-4 py-3 text-sm font-semibold"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
      {footer ? <div className="mt-4 text-sm leading-6">{footer}</div> : null}
    </section>
  );
}
