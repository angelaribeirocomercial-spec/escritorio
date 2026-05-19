"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { ClaraFloatingAvatar } from "@/components/layout/clara-floating-avatar";
import { SessionActions } from "@/components/layout/session-actions";
import { WorkspaceGlobalSearch } from "@/components/layout/workspace-global-search";
import {
  navSections,
  type NavIconId,
  type NavItem
} from "@/components/layout/workspace-navigation";
import type { WorkspaceSearchEntry } from "@/components/layout/workspace-search-types";
import { WorkspaceSession } from "@/lib/auth/session";

type WorkspaceShellProps = {
  session: WorkspaceSession;
  children: ReactNode;
  searchEntries: WorkspaceSearchEntry[];
};

const navigationItems = navSections.flatMap((section) => section.items);

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({
  icon,
  active
}: {
  icon: NavIconId;
  active: boolean;
}) {
  const stroke = active ? "rgba(255,255,255,0.95)" : "rgba(207,250,254,0.85)";

  switch (icon) {
    case "dashboard":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path
            d="M2.5 2.5h4v4h-4zM9.5 2.5h4v6h-4zM2.5 9.5h4v4h-4zM9.5 10.5h4v3h-4z"
            stroke={stroke}
            strokeWidth="1.4"
          />
        </svg>
      );
    case "people":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path
            d="M5.2 7a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 5.2 7ZM10.9 6.3a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM2.3 12.8c.4-1.7 1.8-2.7 3.8-2.7s3.3 1 3.7 2.7M9.1 12.8c.3-1.2 1.4-1.9 2.8-1.9 1.3 0 2.4.7 2.7 1.9"
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "processes":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path
            d="M5 2.8h6M4 5.5h8M3.5 8.2h9M4.5 10.9h7M5.5 13.2h5"
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "officialDiary":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path
            d="M4 3.5h8v9H4zM6 2.5v2M10 2.5v2M5.5 7.5h5M5.5 10h3.5"
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "updates":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path
            d="M3.5 11.5 6.2 8.8l2 2L12.5 5.5M10.8 5.5h1.7v1.7"
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "agenda":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path
            d="M4 3.5h8v8.5H4zM6 2.5v2M10 2.5v2M5.5 7h5M5.5 9.5h3"
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "financial":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path
            d="M3 5.5h10M3 10.5h10M5 3v10M11 3v10"
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "reports":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path
            d="M4 3.5h8v9H4zM6 6.5h4M6 9h4M6 11.5h2.5"
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "stats":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path
            d="M3.5 12.5h9M5 10V7.5M8 10V5.5M11 10V8.5"
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "documents":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path
            d="M4 2.5h5l3 3v8H4zM9 2.7v3h3M6 8h4M6 10.5h4"
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "clara":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <rect x="3" y="4" width="10" height="8" rx="2" stroke={stroke} strokeWidth="1.4" />
          <path
            d="M6 2.8v2M10 2.8v2M6.2 8h3.6M8 6.2v3.6"
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "editor":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path
            d="m4 11.8 1.2-3.4 4.8-4.8 2.3 2.3-4.8 4.8L4 11.8ZM8.8 4.8l2.4 2.4"
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "team":
      return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path
            d="M5 6.6A1.8 1.8 0 1 0 5 3a1.8 1.8 0 0 0 0 3.6ZM11.2 6.1a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8ZM2.8 12.8c.3-1.6 1.5-2.5 3.3-2.5 1.7 0 3 .9 3.3 2.5M9.4 12.8c.2-1 .9-1.6 2-1.6 1 0 1.8.6 2 1.6"
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="1.4"
          />
        </svg>
      );
  }
}

function renderNavItem(
  item: NavItem,
  pathname: string,
  openSections: Record<string, boolean>,
  toggleSection: (href: string, fallbackOpen: boolean) => void,
  clearSections: () => void,
  mode: "desktop" | "mobile" = "desktop"
) {
  const isActive =
    pathMatches(pathname, item.href) ||
    item.children?.some((child) => pathMatches(pathname, child.href));
  const isOpen = openSections[item.href] ?? Boolean(isActive);
  const isMobile = mode === "mobile";
  const containerClass = isMobile
    ? "rounded-xl border border-white/10 bg-white/[0.04]"
    : "rounded-md";
  const parentClass = isMobile
    ? `flex items-center rounded-xl text-sm font-medium transition ${
        isActive ? "text-white" : "theme-shell-muted hover:bg-white/[0.06] hover:text-white"
      }`
    : `flex items-center rounded-md text-[15px] font-medium transition ${
        isActive ? "text-white" : "theme-shell-muted hover:bg-white/[0.06] hover:text-white"
      }`;
  const parentPadding = isMobile ? "px-3 py-2.5" : "px-3 py-3";
  const childWrapperClass = isMobile ? "mt-1 space-y-1 px-3 pb-3" : "mt-1 space-y-1 pl-10";
  const childRadius = isMobile ? "rounded-lg" : "rounded-md";

  return (
    <div key={item.href} className={containerClass}>
      {item.children ? (
        <div
          className={parentClass}
          style={isActive ? { backgroundColor: "var(--shell-active-bg)" } : undefined}
        >
          <Link
            className={`group flex min-w-0 flex-1 items-center gap-3 ${parentPadding}`}
            href={item.href}
            onClick={() => toggleSection(item.href, Boolean(isActive))}
          >
            <NavIcon active={Boolean(isActive)} icon={item.icon} />
            <span className="min-w-0">
              <span className="block truncate transition group-hover:translate-x-1">{item.label}</span>
              {item.description ? (
                <span className="mt-1 block truncate text-[11px] font-normal leading-4 text-cyan-100/55">
                  {item.description}
                </span>
              ) : null}
            </span>
          </Link>
          <button
            className={`mr-2 flex h-8 w-8 items-center justify-center rounded-md text-xs transition ${
              isOpen ? "text-white/80" : "text-cyan-100/70 hover:text-white"
            }`}
            onClick={() => toggleSection(item.href, Boolean(isActive))}
            type="button"
          >
            <span className={`transition ${isOpen ? "rotate-90" : ""}`}>{">"}</span>
          </button>
        </div>
      ) : (
        <Link
          className={`group flex items-center justify-between ${isMobile ? "rounded-xl" : "rounded-md"} ${parentPadding} ${
            isMobile ? "text-sm" : "text-[15px]"
          } font-medium transition ${
            isActive ? "text-white" : "theme-shell-muted hover:bg-white/[0.06] hover:text-white"
          }`}
          href={item.href}
          onClick={clearSections}
          style={isActive ? { backgroundColor: "var(--shell-active-bg)" } : undefined}
        >
          <span className="flex items-center gap-3">
            <NavIcon active={Boolean(isActive)} icon={item.icon} />
            <span className="min-w-0">
              <span className="block transition group-hover:translate-x-1">{item.label}</span>
              {item.description ? (
                <span className="mt-1 block text-[11px] font-normal leading-4 text-cyan-100/55">
                  {item.description}
                </span>
              ) : null}
            </span>
          </span>
        </Link>
      )}

      {item.children && isOpen ? (
        <div className={childWrapperClass}>
          {item.children.map((child) => {
            const childActive = pathMatches(pathname, child.href);

            return (
              <Link
                key={child.href}
                className={`block ${childRadius} px-3 py-2 text-sm transition ${
                  childActive
                    ? "text-white"
                    : "theme-shell-muted hover:bg-white/[0.06] hover:text-white"
                }`}
                href={child.href}
                style={
                  childActive ? { backgroundColor: "var(--shell-active-sub-bg)" } : undefined
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
}

export function WorkspaceShell({ children, searchEntries, session }: WorkspaceShellProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const clearSections = () => setOpenSections({});

  useEffect(() => {
    const activeParent = navigationItems.find(
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

      for (const item of navigationItems) {
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

      <aside
        className="fixed inset-y-0 left-0 hidden w-[18.5rem] overflow-y-auto shadow-[0_24px_90px_rgba(0,0,0,0.42)] lg:flex lg:flex-col"
        style={{ background: "var(--shell-gradient)" }}
      >
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
          <div className="space-y-5">
            {navSections.filter((section) => section.items.length > 0).map((section) => (
              <div key={section.id}>
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/55">
                  {section.label}
                </p>
                {section.description ? (
                  <p className="px-3 pb-3 text-[11px] leading-5 text-cyan-100/45">
                    {section.description}
                  </p>
                ) : null}
                <div className="space-y-1">
                    {section.items.map((item) =>
                      renderNavItem(item, pathname, openSections, toggleSection, clearSections)
                    )}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="mt-auto border-t border-white/10 px-5 py-5">
          <p className="theme-shell-muted text-xs font-semibold uppercase tracking-[0.22em]">
            Estado do workspace
          </p>
          <p className="theme-shell-muted mt-3 text-sm font-medium leading-6">
            Tenant ativo: {session.workspace.tenant.slug} | Papel: {session.role}
          </p>
          <div className="theme-shell-muted mt-4 rounded-xl bg-white/[0.05] px-4 py-4 text-sm">
            Suite juridica bancaria com Clara integrada ao fluxo.
          </div>
        </div>
      </aside>

      <div className="lg:pl-[18.5rem]">
        <header
          className="sticky top-0 z-20 border-b border-white/10 backdrop-blur-xl"
          style={{ background: "var(--header-surface)" }}
        >
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
                <WorkspaceGlobalSearch entries={searchEntries} />
                <SessionActions session={session} />
              </div>
            </div>

            <div className="space-y-2 pt-1 pb-0.5 lg:hidden">
              {navSections.filter((section) => section.items.length > 0).map((section) => (
                <div key={section.id}>
                  <p className="pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/55">
                    {section.label}
                  </p>
                  <div className="space-y-2">
                    {section.items.map((item) =>
                      renderNavItem(item, pathname, openSections, toggleSection, clearSections, "mobile")
                    )}
                  </div>
                </div>
              ))}
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
      <ClaraFloatingAvatar />
    </div>
  );
}
