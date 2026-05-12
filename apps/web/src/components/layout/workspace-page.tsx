import { ReactNode } from "react";

type Metric = {
  label: string;
  value: string;
};

type WorkspacePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: Metric[];
  heroAside?: ReactNode;
  children?: ReactNode;
};

export function WorkspacePage({
  eyebrow,
  title,
  description,
  metrics,
  heroAside,
  children
}: WorkspacePageProps) {
  return (
    <div className="space-y-6">
      <section className="workspace-panel p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="workspace-kicker">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="workspace-muted mt-3 text-sm leading-7">{description}</p>
          </div>

          {heroAside ? <div className="lg:max-w-sm">{heroAside}</div> : null}
        </div>
      </section>

      {metrics.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="workspace-panel min-w-0 p-5">
              <p className="workspace-muted text-sm font-medium">{metric.label}</p>
              <p className="mt-4 break-words text-2xl font-semibold leading-tight tracking-tight text-white">
                {metric.value}
              </p>
            </article>
          ))}
        </section>
      ) : null}

      {children}
    </div>
  );
}
