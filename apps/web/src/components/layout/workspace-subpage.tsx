import Link from "next/link";

type SubpageItem = {
  title: string;
  detail: string;
  href?: string;
};

type WorkspaceSubpageProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: ReadonlyArray<SubpageItem>;
  emphasized?: boolean;
};

export function WorkspaceSubpage({
  eyebrow,
  title,
  description,
  items,
  emphasized = true
}: WorkspaceSubpageProps) {
  const panelClass = emphasized
    ? "workspace-panel workspace-session-summary"
    : "workspace-panel";

  return (
    <div className="space-y-6">
      <section className={`${panelClass} p-6`}>
        <p className="workspace-kicker">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
        <p className="workspace-muted mt-3 text-sm leading-7">{description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) =>
          item.href ? (
            <Link
              key={`${item.title}-${item.href}`}
              className={`${panelClass} p-5 transition hover:bg-white/[0.07]`}
              href={item.href}
            >
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="workspace-muted mt-3 text-sm leading-7">{item.detail}</p>
            </Link>
          ) : (
            <article key={item.title} className={`${panelClass} p-5`}>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="workspace-muted mt-3 text-sm leading-7">{item.detail}</p>
            </article>
          )
        )}
      </section>
    </div>
  );
}
