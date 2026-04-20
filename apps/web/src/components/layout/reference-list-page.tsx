import Link from "next/link";

type ReferenceAction = {
  label: string;
  href?: string;
  tone?: "primary" | "secondary";
};

type ReferenceRow = {
  id: string;
  title: string;
  detail: string;
  href?: string;
};

type ReferenceListPageProps = {
  title: string;
  countLabel?: string;
  count: number;
  searchName?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  actions?: ReadonlyArray<ReferenceAction>;
  rows: ReadonlyArray<ReferenceRow>;
  emptyState: string;
};

const lightSurfaceStyle = {
  background: "var(--surface-1)",
  borderColor: "var(--surface-border)",
  color: "hsl(var(--foreground))"
} as const;

function ActionButton({ action }: { action: ReferenceAction }) {
  const className =
    action.tone === "primary"
      ? "reference-action-primary px-4 py-2 text-sm font-semibold"
      : "reference-action-secondary px-4 py-2 text-sm font-semibold";

  if (action.href) {
    return <Link className={className} href={action.href}>{action.label}</Link>;
  }

  return (
    <button className={className} type="button">
      {action.label}
    </button>
  );
}

export function ReferenceListPage({
  title,
  countLabel = "Exibindo",
  count,
  searchName = "termo",
  searchValue = "",
  searchPlaceholder = "Termo de busca",
  actions = [],
  rows,
  emptyState
}: ReferenceListPageProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[2rem] font-semibold" style={{ color: "hsl(var(--foreground))" }}>
            {title}
          </p>
          <p className="workspace-muted text-sm">
            {countLabel} {count} resultado(s)
          </p>
        </div>

        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <ActionButton key={`${action.label}-${action.href ?? "button"}`} action={action} />
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-[16px] border p-4" style={lightSurfaceStyle}>
        <div className="mb-3 text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
          Busca
        </div>
        <form className="flex flex-col gap-3 sm:flex-row" method="get">
          <input
            className="reference-search-input w-full px-4 py-2.5 text-sm outline-none placeholder:text-slate-500"
            defaultValue={searchValue}
            name={searchName}
            placeholder={searchPlaceholder}
            type="text"
          />
          <button className="reference-action-secondary px-4 py-2.5 text-sm font-semibold" type="submit">
            Buscar
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="reference-list-shell px-5 py-4 text-sm">
          {emptyState}
        </div>
      ) : (
        <div className="reference-list-shell overflow-hidden">
          <div className="divide-y divide-white/10">
            {rows.map((row) =>
              row.href ? (
                <Link key={row.id} className="reference-list-row block px-5 py-4 transition" href={row.href}>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                    {row.title}
                  </p>
                  <p className="workspace-muted mt-1 text-sm">{row.detail}</p>
                </Link>
              ) : (
                <div key={row.id} className="px-5 py-4">
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                    {row.title}
                  </p>
                  <p className="workspace-muted mt-1 text-sm">{row.detail}</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
