"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "clara-floating-avatar-minimized";

function readContextLabel(pathname: string) {
  if (pathname.startsWith("/clara")) return "Workspace juridico ativo";
  if (pathname.startsWith("/pessoas/clientes")) return "Cliente em contexto";
  if (pathname.startsWith("/processos")) return "Processo em contexto";
  if (pathname.startsWith("/documentos")) return "Documento em contexto";
  if (pathname.startsWith("/agenda")) return "Agenda operacional";
  return "Workspace do escritorio";
}

function buildClaraHref(pathname: string, searchParams: URLSearchParams) {
  const routeParts = pathname.split("/").filter(Boolean);
  const params = new URLSearchParams();

  const clientFromQuery = searchParams.get("client") ?? searchParams.get("clientId");
  const caseFromQuery = searchParams.get("case") ?? searchParams.get("caseId");
  const processFromQuery = searchParams.get("process") ?? searchParams.get("processId");
  const documentFromQuery = searchParams.get("document") ?? searchParams.get("documentId");
  const taskFromQuery = searchParams.get("task");

  if (pathname.startsWith("/pessoas/clientes/") && routeParts[2]) {
    params.set("client", routeParts[2]);
  } else if (clientFromQuery) {
    params.set("client", clientFromQuery);
  }

  if (caseFromQuery) {
    params.set("case", caseFromQuery);
  }

  if (pathname.startsWith("/processos/") && routeParts[1] && routeParts[1] !== "modelo") {
    params.set("process", routeParts[1]);
  } else if (processFromQuery) {
    params.set("process", processFromQuery);
  }

  if (pathname.startsWith("/documentos/") && routeParts[1] && routeParts[1] !== "enviar-arquivos") {
    params.set("document", routeParts[1]);
  } else if (documentFromQuery) {
    params.set("document", documentFromQuery);
  }

  if (taskFromQuery) {
    params.set("task", taskFromQuery);
  }

  if (!params.has("tab")) {
    params.set("tab", "analise");
  }

  const queryString = params.toString();
  return queryString ? `/clara?${queryString}` : "/clara";
}

function ClaraAvatarGlyph() {
  return (
    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-cyan-200/30 bg-[radial-gradient(circle_at_35%_30%,rgba(248,250,252,0.95),rgba(125,211,252,0.3)_45%,rgba(15,23,42,0.95)_100%)] shadow-[0_18px_45px_rgba(8,145,178,0.28)]">
      <div className="absolute inset-x-3 top-2 h-5 rounded-full bg-[linear-gradient(180deg,#0f172a,#1e293b)]" />
      <div className="absolute left-[18px] top-[14px] h-6 w-6 rounded-full bg-[#f5d0c5]" />
      <div className="absolute left-[15px] top-[23px] h-2 w-2 rounded-full border border-slate-700/50 bg-white/20" />
      <div className="absolute right-[15px] top-[23px] h-2 w-2 rounded-full border border-slate-700/50 bg-white/20" />
      <div className="absolute left-[20px] top-[24px] h-[2px] w-[4px] rounded-full bg-slate-800" />
      <div className="absolute right-[20px] top-[24px] h-[2px] w-[4px] rounded-full bg-slate-800" />
      <div className="absolute left-[22px] top-[30px] h-[2px] w-[12px] rounded-full bg-rose-200/90" />
      <div className="absolute bottom-0 left-[11px] h-6 w-8 rounded-t-[14px] bg-[linear-gradient(180deg,#e2e8f0,#94a3b8)]" />
      <div className="absolute bottom-0 left-[6px] h-5 w-10 rounded-t-[16px] bg-[linear-gradient(180deg,#0f172a,#1e3a5f)]" />
    </div>
  );
}

export function ClaraFloatingAvatar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [minimized, setMinimized] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "expanded") {
      setMinimized(false);
    }
  }, []);

  function updateMinimized(nextValue: boolean) {
    setMinimized(nextValue);
    window.localStorage.setItem(STORAGE_KEY, nextValue ? "minimized" : "expanded");
  }

  const claraHref = useMemo(
    () => buildClaraHref(pathname, new URLSearchParams(searchParams.toString())),
    [pathname, searchParams]
  );
  const contextLabel = readContextLabel(pathname);
  const isClaraPage = pathname.startsWith("/clara");

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-30 flex max-w-[calc(100vw-2rem)] items-end justify-end lg:bottom-6 lg:right-6">
      {minimized ? (
        <button
          aria-label="Abrir Clara"
          className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.96))] p-1.5 shadow-[0_24px_70px_rgba(15,23,42,0.42)] transition hover:-translate-y-0.5 hover:border-cyan-200/35"
          onClick={() => updateMinimized(false)}
          type="button"
        >
          <ClaraAvatarGlyph />
        </button>
      ) : (
        <section className="pointer-events-auto w-[19rem] rounded-[1.2rem] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(30,41,59,0.98))] p-4 text-white shadow-[0_24px_80px_rgba(15,23,42,0.48)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <ClaraAvatarGlyph />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/85">CLARA</p>
                <p className="mt-1 text-sm font-semibold text-white">Advogada Digital IA</p>
              </div>
            </div>
            <button
              aria-label="Minimizar Clara"
              className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              onClick={() => updateMinimized(true)}
              type="button"
            >
              -
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/80">{contextLabel}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {isClaraPage
                ? "Clara ativa neste workspace. Continue a triagem, a estrategia ou a revisao sem sair do fluxo."
                : "Abra a Clara com o contexto atual para seguir com leitura juridica, pendencias e proxima acao."}
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              className="flex-1 rounded-[0.9rem] bg-[linear-gradient(90deg,#22c55e,#4ade80)] px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:brightness-105"
              href={claraHref}
            >
              {isClaraPage ? "Abrir contexto" : "Abrir na Clara"}
            </Link>
            <button
              className="rounded-[0.9rem] border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
              onClick={() => updateMinimized(true)}
              type="button"
            >
              Recolher
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
