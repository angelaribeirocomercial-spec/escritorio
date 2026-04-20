"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { SessionActions } from "@/components/layout/session-actions";
import { WorkspaceSession } from "@/lib/auth/session";

type NavChild = {
  href: string;
  label: string;
};

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon:
    | "dashboard"
    | "processes"
    | "people"
    | "team"
    | "financial"
    | "reports"
    | "stats"
    | "officialDiary"
    | "updates"
    | "agenda"
    | "documents"
    | "clara"
    | "editor";
  children?: NavChild[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Dash", icon: "dashboard" },
  { href: "/clara", label: "Clara", shortLabel: "Clara", icon: "clara" },
  {
    href: "/processos",
    label: "Processos",
    shortLabel: "Processos",
    icon: "processes"
  },
  {
    href: "/pessoas",
    label: "Pessoas",
    shortLabel: "Pessoas",
    icon: "people",
    children: [
      { href: "/pessoas/clientes", label: "Clientes" },
      { href: "/pessoas/adversos", label: "Adversos" },
      { href: "/pessoas/advogados-adversos", label: "Advogados Adversos" },
      { href: "/pessoas/contatos-partes", label: "Contatos / Partes" }
    ]
  },
  {
    href: "/equipe",
    label: "Equipe",
    shortLabel: "Equipe",
    icon: "team",
    children: [
      { href: "/equipe/advogados-equipe", label: "Advogados / Equipe" },
      { href: "/equipe/grupo-de-advogados", label: "Grupo de advogados" }
    ]
  },
  {
    href: "/agenda",
    label: "Agenda",
    shortLabel: "Agenda",
    icon: "agenda",
    children: [
      { href: "/agenda/compromissos", label: "Compromissos" },
      { href: "/agenda/tarefas", label: "Tarefas" },
      { href: "/agenda/prazos", label: "Prazos" }
    ]
  },
  {
    href: "/financeiro",
    label: "Financeiro",
    shortLabel: "Financeiro",
    icon: "financial",
    children: [
      { href: "/financeiro/despesas", label: "Despesas" },
      { href: "/financeiro/receitas", label: "Receitas" },
      { href: "/financeiro/transferencias", label: "Transferencias" },
      { href: "/financeiro/vencimentos", label: "Vencimentos" },
      { href: "/financeiro/graficos", label: "Graficos" }
    ]
  },
  {
    href: "/relatorios",
    label: "Relatorios",
    shortLabel: "Relatorios",
    icon: "reports",
    children: [
      { href: "/relatorios/resumo", label: "Resumo" },
      { href: "/relatorios/processos", label: "Processos" },
      { href: "/relatorios/financeiro", label: "Financeiro" },
      { href: "/relatorios/custas", label: "Custas" },
      { href: "/relatorios/honorarios", label: "Honorarios" },
      { href: "/relatorios/compromissos", label: "Compromissos" },
      { href: "/relatorios/tarefas", label: "Tarefas" },
      { href: "/relatorios/prazos", label: "Prazos" },
      { href: "/relatorios/pessoas", label: "Pessoas" },
      { href: "/relatorios/sms", label: "Torpedos SMS" },
      { href: "/relatorios/emails", label: "E-mails" }
    ]
  },
  {
    href: "/estatisticas",
    label: "Estatisticas",
    shortLabel: "Estatisticas",
    icon: "stats",
    children: [
      { href: "/estatisticas/andamentos-atrasados", label: "Andamentos atrasados" },
      { href: "/estatisticas/ultimos-andamentos", label: "Ultimos andamentos" },
      { href: "/estatisticas/andamentos-automaticos", label: "Andamentos automaticos" },
      { href: "/estatisticas/clientes", label: "Clientes" },
      { href: "/estatisticas/processos", label: "Processos" },
      { href: "/estatisticas/abertura-de-processos", label: "Abertura de processos" },
      { href: "/estatisticas/cadastro-de-processos", label: "Cadastro de processos" },
      { href: "/estatisticas/fase-do-processo", label: "Fase do processo" },
      { href: "/estatisticas/natureza-da-acao", label: "Natureza da acao" },
      { href: "/estatisticas/atendimento-clientes", label: "Atendimento por clientes" },
      { href: "/estatisticas/financeiro", label: "Financeiro" }
    ]
  },
  {
    href: "/diario-oficial",
    label: "Diario Oficial",
    shortLabel: "Diario",
    icon: "officialDiary",
    children: [
      { href: "/diario-oficial/publicacoes", label: "Publicacoes" },
      { href: "/diario-oficial/advogados", label: "Advogados" },
      { href: "/diario-oficial/palavras-chave", label: "Palavras-chave" },
      { href: "/diario-oficial/lixeira", label: "Lixeira" }
    ]
  },
  {
    href: "/andamentos",
    label: "Andamentos",
    shortLabel: "Andamentos",
    icon: "updates",
    children: [
      { href: "/andamentos/automaticos", label: "Andamentos automaticos" },
      { href: "/andamentos/monitoramentos", label: "Configurar monitoramentos" }
    ]
  },
  {
    href: "/documentos",
    label: "Arquivos",
    shortLabel: "Arquivos",
    icon: "documents",
    children: [
      { href: "/documentos/meus-arquivos", label: "Meus arquivos" },
      { href: "/documentos/enviar-arquivos", label: "Enviar arquivos" },
      { href: "/documentos/relatorios", label: "Relatorios" }
    ]
  },
  {
    href: "/editor-de-texto",
    label: "Editor de texto",
    shortLabel: "Editor",
    icon: "editor",
    children: [
      { href: "/editor-de-texto/meus-textos", label: "Meus textos" },
      { href: "/editor-de-texto/modelos", label: "Modelos" }
    ]
  }
];

type WorkspaceShellProps = {
  session: WorkspaceSession;
  children: ReactNode;
};

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({
  icon,
  active
}: {
  icon: NavItem["icon"];
  active: boolean;
}) {
  const stroke = active ? "rgba(255,255,255,0.95)" : "rgba(207,250,254,0.85)";

  switch (icon) {
    case "dashboard":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M2.5 2.5h4v4h-4zM9.5 2.5h4v6h-4zM2.5 9.5h4v4h-4zM9.5 10.5h4v3h-4z" stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
    case "people":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M5.2 7a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 5.2 7ZM10.9 6.3a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM2.3 12.8c.4-1.7 1.8-2.7 3.8-2.7s3.3 1 3.7 2.7M9.1 12.8c.3-1.2 1.4-1.9 2.8-1.9 1.3 0 2.4.7 2.7 1.9" stroke={stroke} strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      );
    case "processes":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M5 2.8h6M4 5.5h8M3.5 8.2h9M4.5 10.9h7M5.5 13.2h5" stroke={stroke} strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      );
    case "officialDiary":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M4 3.5h8v9H4zM6 2.5v2M10 2.5v2M5.5 7.5h5M5.5 10h3.5" stroke={stroke} strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      );
    case "updates":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M3.5 11.5 6.2 8.8l2 2L12.5 5.5M10.8 5.5h1.7v1.7" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
        </svg>
      );
    case "agenda":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M4 3.5h8v8.5H4zM6 2.5v2M10 2.5v2M5.5 7h5M5.5 9.5h3" stroke={stroke} strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      );
    case "financial":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M3 5.5h10M3 10.5h10M5 3v10M11 3v10" stroke={stroke} strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      );
    case "reports":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M4 3.5h8v9H4zM6 6.5h4M6 9h4M6 11.5h2.5" stroke={stroke} strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      );
    case "stats":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M3.5 12.5h9M5 10V7.5M8 10V5.5M11 10V8.5" stroke={stroke} strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      );
    case "documents":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M4 2.5h5l3 3v8H4zM9 2.7v3h3M6 8h4M6 10.5h4" stroke={stroke} strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      );
    case "clara":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <rect x="3" y="4" width="10" height="8" rx="2" stroke={stroke} strokeWidth="1.4" />
          <path d="M6 2.8v2M10 2.8v2M6.2 8h3.6M8 6.2v3.6" stroke={stroke} strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      );
    case "editor":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="m4 11.8 1.2-3.4 4.8-4.8 2.3 2.3-4.8 4.8L4 11.8ZM8.8 4.8l2.4 2.4" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
        </svg>
      );
    case "team":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M5 6.6A1.8 1.8 0 1 0 5 3a1.8 1.8 0 0 0 0 3.6ZM11.2 6.1a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8ZM2.8 12.8c.3-1.6 1.5-2.5 3.3-2.5 1.7 0 3 .9 3.3 2.5M9.4 12.8c.2-1 .9-1.6 2-1.6 1 0 1.8.6 2 1.6" stroke={stroke} strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      );
  }
}

export function WorkspaceShell({ children, session }: WorkspaceShellProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const activeParent = navItems.find(
      (item) =>
        item.children &&
        (pathMatches(pathname, item.href) ||
          item.children.some((child) => pathMatches(pathname, child.href)))
    );

    if (!activeParent) {
      return;
    }

    setOpenSections((current) => {
      if (current[activeParent.href]) {
        return current;
      }

      return {
        ...current,
        [activeParent.href]: true
      };
    });
  }, [pathname]);

  function toggleSection(href: string, fallbackOpen: boolean) {
    setOpenSections((current) => {
      const nextOpen = !(current[href] ?? fallbackOpen);
      const nextState: Record<string, boolean> = {};

      for (const item of navItems) {
        if (item.children) {
          nextState[item.href] = false;
        }
      }

      nextState[href] = nextOpen;

      return nextState;
    });
  }

  return (
    <div className="min-h-screen bg-shell text-foreground">
      <div className="absolute inset-0 -z-10 bg-lexia-glow opacity-100" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(71,196,255,0.08),transparent_22%),radial-gradient(circle_at_82%_0%,rgba(255,187,77,0.08),transparent_24%)]" />

      <aside className="fixed inset-y-0 left-0 hidden w-[18.5rem] overflow-y-auto shadow-[0_24px_90px_rgba(0,0,0,0.42)] lg:flex lg:flex-col" style={{ background: "var(--shell-gradient)" }}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <p className="theme-shell-muted text-[11px] font-semibold uppercase tracking-[0.22em]">
              Escritorio
            </p>
            <p className="theme-shell-text mt-1 text-sm font-semibold">
              {session.workspace.tenant.name}
            </p>
          </div>
          <div className="space-y-1">
            <div className="h-0.5 w-4 rounded-full bg-cyan-100/75" />
            <div className="h-0.5 w-4 rounded-full bg-cyan-100/75" />
            <div className="h-0.5 w-4 rounded-full bg-cyan-100/75" />
          </div>
        </div>

        <nav className="mt-6 px-4 pb-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isPrimary =
                pathMatches(pathname, item.href) ||
                item.children?.some((child) => pathMatches(pathname, child.href));
              const isOpen = openSections[item.href] ?? Boolean(isPrimary);

              return (
                <div key={item.href} className="rounded-md">
                  {item.children ? (
                    <div
                      className={`flex items-center rounded-md text-[15px] font-medium transition ${
                        isPrimary
                          ? "text-white"
                          : "theme-shell-muted hover:bg-white/[0.06] hover:text-white"
                      }`}
                      style={isPrimary ? { backgroundColor: "var(--shell-active-bg)" } : undefined}
                    >
                      <Link
                        className="group flex min-w-0 flex-1 items-center gap-3 px-3 py-3"
                        href={item.href}
                        onClick={() => toggleSection(item.href, Boolean(isPrimary))}
                      >
                        <NavIcon active={Boolean(isPrimary)} icon={item.icon} />
                        <span className="truncate transition group-hover:translate-x-1">
                          {item.label}
                        </span>
                      </Link>
                      <button
                        className={`mr-2 flex h-8 w-8 items-center justify-center rounded-md text-xs transition ${
                          isOpen ? "text-white/80" : "text-cyan-100/70 hover:text-white"
                        }`}
                        onClick={() => toggleSection(item.href, Boolean(isPrimary))}
                        type="button"
                      >
                        <span className={`transition ${isOpen ? "rotate-90" : ""}`}>
                          ›
                        </span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      className={`group flex items-center justify-between rounded-md px-3 py-3 text-[15px] font-medium transition ${
                        isPrimary
                          ? "text-white"
                          : "theme-shell-muted hover:bg-white/[0.06] hover:text-white"
                      }`}
                      href={item.href}
                      style={isPrimary ? { backgroundColor: "var(--shell-active-bg)" } : undefined}
                    >
                      <span className="flex items-center gap-3">
                        <NavIcon active={Boolean(isPrimary)} icon={item.icon} />
                        <span className="transition group-hover:translate-x-1">
                          {item.label}
                        </span>
                      </span>
                    </Link>
                  )}

                  {item.children && isOpen ? (
                    <div className="mt-1 space-y-1 pl-10">
                      {item.children.map((child) => {
                        const childActive = pathMatches(pathname, child.href);

                        return (
                          <Link
                            key={child.href}
                            className={`block rounded-md px-3 py-2 text-sm transition ${
                              childActive
                                ? "text-white"
                                : "theme-shell-muted hover:bg-white/[0.06] hover:text-white"
                            }`}
                            href={child.href}
                            style={
                              childActive
                                ? { backgroundColor: "var(--shell-active-sub-bg)" }
                                : undefined
                            }
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="mt-auto border-t border-white/10 px-5 py-5">
          <p className="theme-shell-muted text-xs font-semibold uppercase tracking-[0.22em]">
            Estado do workspace
          </p>
          <p className="theme-shell-muted mt-3 text-sm font-medium leading-6">
            Tenant ativo: {session.workspace.tenant.slug} · Papel: {session.role}
          </p>
          <div className="theme-shell-muted mt-4 rounded-xl bg-white/[0.05] px-4 py-4 text-sm">
            Suite juridica bancaria com Clara integrada ao fluxo.
          </div>
        </div>
      </aside>

      <div className="lg:pl-[18.5rem]">
        <header className="sticky top-0 z-20 border-b border-white/10 backdrop-blur-xl" style={{ background: "var(--header-surface)" }}>
          <div className="px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="hidden h-7 w-7 rounded-sm border border-white/15 bg-white/[0.06] lg:flex lg:items-center lg:justify-center">
                  <span className="text-[10px] font-bold tracking-[0.12em] text-white">A</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/90">
                    ADVX
                  </p>
                  <p className="theme-header-text truncate text-[13px] font-semibold">
                    {session.workspace.tenant.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                <button
                  className="reference-header-search theme-header-muted inline-flex h-9 w-full sm:w-[23rem] items-center justify-between px-3 text-[13px] font-medium transition hover:bg-white/[0.08] hover:text-white"
                  type="button"
                >
                  <span className="truncate">Buscar cliente, processo, documento ou tese</span>
                  <span className="rounded-[4px] border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em]">
                    /
                  </span>
                </button>
                <SessionActions session={session} />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pt-1 pb-0.5 lg:hidden">
              {navItems.map((item) => {
                const active = pathMatches(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    className={`whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "border-cyan-200/30 bg-cyan-300/15 text-white"
                        : "theme-header-muted border-white/10 bg-white/[0.04]"
                    }`}
                    href={item.href}
                  >
                    {item.shortLabel}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        <div
          className="min-h-[calc(100vh-4.5rem)] px-4 py-6 sm:px-6 lg:px-8"
          style={{ background: "var(--workspace-content-surface)" }}
        >
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
