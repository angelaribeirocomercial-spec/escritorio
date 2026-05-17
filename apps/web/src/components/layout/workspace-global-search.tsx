"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { CLARA_GLOBAL_SEARCH_OPEN_EVENT } from "@/components/layout/workspace-global-search-events";

import type { WorkspaceSearchEntry, WorkspaceSearchEntryKind } from "@/components/layout/workspace-search-types";

type WorkspaceGlobalSearchProps = {
  entries: WorkspaceSearchEntry[];
};

type ClaraGlobalAnswer = {
  badge: string;
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  primaryEntry?: WorkspaceSearchEntry;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function labelForAction(entry: WorkspaceSearchEntry) {
  switch (entry.kind) {
    case "Cliente":
      return "Abrir cliente";
    case "Caso":
      return "Abrir caso";
    case "Processo":
      return "Abrir processo";
    case "Documento":
      return "Abrir documento";
    case "Tese":
      return "Abrir tese";
    case "Compromisso":
      return "Abrir agenda";
    case "Tarefa":
      return "Abrir tarefa";
    case "Prazo":
      return "Abrir prazo";
    case "Andamento":
      return "Abrir andamento";
    case "Adverso":
      return "Abrir adverso";
    case "Contrato":
      return "Abrir contrato";
    case "Follow-up":
      return "Abrir follow-up";
    case "Publicacao":
      return "Abrir publicacoes";
    case "Palavra-chave":
      return "Abrir palavras-chave";
    case "Advogado":
      return "Abrir advogados";
    case "Financeiro":
      return "Abrir financeiro";
    case "Integracao":
      return "Abrir integracao";
    case "Configuracao":
      return "Abrir configuracoes";
    default:
      return "Abrir";
  }
}

function kindLabel(kind: WorkspaceSearchEntryKind) {
  switch (kind) {
    case "Cliente":
      return "Cliente";
    case "Caso":
      return "Caso";
    case "Processo":
      return "Processo";
    case "Documento":
      return "Documento";
    case "Tese":
      return "Tese";
    case "Compromisso":
      return "Compromisso";
    case "Tarefa":
      return "Tarefa";
    case "Prazo":
      return "Prazo";
    case "Andamento":
      return "Andamento";
    case "Adverso":
      return "Adverso";
    case "Contrato":
      return "Contrato";
    case "Follow-up":
      return "Follow-up";
    case "Publicacao":
      return "Publicacao";
    case "Palavra-chave":
      return "Palavra-chave";
    case "Advogado":
      return "Advogado";
    case "Financeiro":
      return "Financeiro";
    case "Integracao":
      return "Integracao";
    case "Configuracao":
      return "Configuracao";
    default:
      return kind;
  }
}

function normalizeWords(value: string) {
  return normalizeText(value).split(/\s+/).filter(Boolean);
}

function scoreEntry(entry: WorkspaceSearchEntry, query: string) {
  const normalizedQuery = normalizeText(query);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const haystackText = [entry.kind, entry.title, entry.preview, ...entry.keywords].join(" ");
  const haystack = normalizeText(haystackText);
  const title = normalizeText(entry.title);
  const preview = normalizeText(entry.preview);
  const titleWords = normalizeWords(entry.title);

  if (!normalizedQuery) {
    return 0;
  }

  let score = 0;

  if (haystack.includes(normalizedQuery)) {
    score += 64;
  }

  if (title.includes(normalizedQuery)) {
    score += 42;
  }

  if (preview.includes(normalizedQuery)) {
    score += 16;
  }

  if (title.startsWith(normalizedQuery)) {
    score += 18;
  }

  for (const token of tokens) {
    if (titleWords.some((word) => word.startsWith(token))) {
      score += 18;
    }

    if (title.includes(token)) {
      score += 12;
    }

    if (preview.includes(token)) {
      score += 6;
    }

    if (haystack.includes(token)) {
      score += 10;
    }
  }

  if (entry.kind === "Cliente" && tokens.some((token) => titleWords.some((word) => word.startsWith(token)))) {
    score += 14;
  }

  return score;
}

function findBestEntry(
  entries: WorkspaceSearchEntry[],
  query: string,
  allowedKinds: WorkspaceSearchEntryKind[]
) {
  return entries
    .filter((entry) => allowedKinds.includes(entry.kind))
    .map((entry) => ({
      entry,
      score: scoreEntry(entry, query)
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title))[0]
    ?.entry;
}

function detectIntent(query: string) {
  const normalized = normalizeText(query);

  if (/tese|jurispru/.test(normalized)) {
    return "thesis";
  }

  if (/distribu|protocol|ajuiz/.test(normalized)) {
    return "distribution";
  }

  if (/falta|faltam|penden|document/.test(normalized)) {
    return "documents";
  }

  if (/processo|numero/.test(normalized)) {
    return "process";
  }

  return "general";
}

function buildGeneralAnswer(entry: WorkspaceSearchEntry): ClaraGlobalAnswer {
  const clientName = entry.claraContext?.clientName;
  const caseTitle = entry.claraContext?.caseTitle;

  switch (entry.kind) {
    case "Cliente":
      return {
        badge: "Cliente",
        title: entry.title,
        body: entry.preview,
        actionHref: entry.href,
        actionLabel: labelForAction(entry),
        primaryEntry: entry
      };
    case "Caso":
      return {
        badge: "Caso",
        title: caseTitle ?? entry.title,
        body: `${clientName ?? "Cliente"} | ${entry.claraContext?.mainThesis ?? entry.preview}`,
        actionHref: entry.href,
        actionLabel: labelForAction(entry),
        primaryEntry: entry
      };
    case "Processo":
      return {
        badge: "Processo",
        title: entry.claraContext?.processNumber ?? entry.title,
        body: `${clientName ?? "Cliente"} | ${caseTitle ?? entry.preview}`,
        actionHref: entry.href,
        actionLabel: labelForAction(entry),
        primaryEntry: entry
      };
    case "Documento":
      return {
        badge: "Documento",
        title: entry.title,
        body: `${entry.claraContext?.clientName ?? "Cliente"} | ${entry.preview}`,
        actionHref: entry.href,
        actionLabel: labelForAction(entry),
        primaryEntry: entry
      };
    case "Tese":
      return {
        badge: "Tese",
        title: entry.title,
        body: `${clientName ?? "Cliente"} | ${caseTitle ?? entry.preview}`,
        actionHref: entry.href,
        actionLabel: labelForAction(entry),
        primaryEntry: entry
      };
    default:
      return {
        badge: "Clara",
        title: entry.title,
        body: entry.preview,
        actionHref: entry.href,
        actionLabel: labelForAction(entry),
        primaryEntry: entry
      };
  }
}

function buildClaraAnswer(params: {
  query: string;
  filteredEntries: WorkspaceSearchEntry[];
  activeContextEntry: WorkspaceSearchEntry | null;
}) {
  const query = params.query.trim();

  if (!query) {
    return null;
  }

  const intent = detectIntent(query);
  const contextEntry = params.activeContextEntry;
  const firstResult = params.filteredEntries[0];

  if (!firstResult && !contextEntry) {
    return null;
  }

  const processEntry =
    findBestEntry(params.filteredEntries, query, ["Processo"]) ??
    (contextEntry?.kind === "Processo" ? contextEntry : undefined);
  const caseEntry =
    findBestEntry(params.filteredEntries, query, ["Caso"]) ??
    (contextEntry?.kind === "Caso" || contextEntry?.routeContext?.caseId ? contextEntry : undefined);
  const thesisEntry = findBestEntry(params.filteredEntries, query, ["Tese"]);
  const documentEntry = findBestEntry(params.filteredEntries, query, ["Documento"]);

  if (intent === "distribution") {
    const target = processEntry ?? caseEntry ?? firstResult;
    const status = target?.claraContext?.distributionStatusLabel;
    const date = target?.claraContext?.distributionDateLabel;

    if (!target || !status) {
      return {
        badge: "Distribuicao",
        title: "Preciso de um cliente, caso ou processo",
        body: "Pergunte com o nome do cliente, do caso ou com o numero do processo para eu confirmar a distribuicao."
      };
    }

    return {
      badge: "Distribuicao",
      title: target.claraContext?.caseTitle ?? target.title,
      body: date && date !== "Nao registrada" ? `${status}. Data: ${date}.` : `${status}.`,
      actionHref: target.href,
      actionLabel: labelForAction(target),
      primaryEntry: target
    };
  }

  if (intent === "documents") {
    const target = caseEntry ?? processEntry ?? documentEntry ?? firstResult;
    const missingDocuments = target?.claraContext?.missingDocuments ?? [];

    if (!target) {
      return null;
    }

    return {
      badge: "Documentos",
      title: target.claraContext?.caseTitle ?? target.title,
      body: missingDocuments.length
        ? `Ainda faltam ${missingDocuments.slice(0, 3).join(", ")}.`
        : "Nao ha lacuna documental critica no indice interno para este caso.",
      actionHref: target.href,
      actionLabel: labelForAction(target),
      primaryEntry: target
    };
  }

  if (intent === "process") {
    const target = processEntry ?? caseEntry ?? firstResult;

    if (!target) {
      return null;
    }

    const processNumber = target.claraContext?.processNumber ?? target.title;
    const caseTitle = target.claraContext?.caseTitle;
    const clientName = target.claraContext?.clientName;

    return {
      badge: "Processo",
      title: processNumber,
      body: [clientName, caseTitle].filter(Boolean).join(" | ") || target.preview,
      actionHref: target.href,
      actionLabel: labelForAction(target),
      primaryEntry: target
    };
  }

  if (intent === "thesis") {
    const target = thesisEntry ?? caseEntry ?? firstResult;

    if (!target) {
      return null;
    }

    return {
      badge: "Tese",
      title: target.claraContext?.mainThesis ?? target.title,
      body:
        [target.claraContext?.clientName, target.claraContext?.caseTitle]
          .filter(Boolean)
          .join(" | ") || target.preview,
      actionHref: target.href,
      actionLabel: labelForAction(target),
      primaryEntry: target
    };
  }

  return firstResult ? buildGeneralAnswer(firstResult) : null;
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-100/75" fill="none" viewBox="0 0 16 16">
      <path
        d="M7 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9ZM10.5 10.5 13.5 13.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function SearchResult({
  entry,
  onSelect
}: {
  entry: WorkspaceSearchEntry;
  onSelect: (entry: WorkspaceSearchEntry) => void;
}) {
  return (
    <Link
      className="flex items-start gap-3 rounded-lg border border-transparent px-3 py-3 text-left transition hover:border-white/10 hover:bg-white/[0.04]"
      href={entry.href}
      onClick={() => onSelect(entry)}
    >
      <div className="mt-0.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/75">
        {kindLabel(entry.kind)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-sm font-semibold text-white">{entry.title}</p>
          <span className="shrink-0 rounded-[4px] border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/80">
            Abrir
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-cyan-100/60">{entry.preview}</p>
      </div>
    </Link>
  );
}

export function WorkspaceGlobalSearch({ entries }: WorkspaceGlobalSearchProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeContextEntry, setActiveContextEntry] = useState<WorkspaceSearchEntry | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTypingField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable === true;

      if (event.key === "Escape") {
        setIsOpen(false);
      }

      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingField) {
        event.preventDefault();
        setIsOpen(true);
      }
    }

    function onOpenClaraGlobalSearch() {
      setIsOpen(true);
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(CLARA_GLOBAL_SEARCH_OPEN_EVENT, onOpenClaraGlobalSearch);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(CLARA_GLOBAL_SEARCH_OPEN_EVENT, onOpenClaraGlobalSearch);
    };
  }, []);

  const filteredEntries = useMemo(() => {
    if (!submittedQuery.trim()) {
      return [];
    }

    return entries
      .map((entry) => ({
        entry,
        score: scoreEntry(entry, submittedQuery)
      }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title))
      .slice(0, 6)
      .map(({ entry }) => entry);
  }, [entries, submittedQuery]);

  const claraAnswer = useMemo(
    () =>
      buildClaraAnswer({
        query: submittedQuery,
        filteredEntries,
        activeContextEntry
      }),
    [activeContextEntry, filteredEntries, submittedQuery]
  );

  useEffect(() => {
    if (claraAnswer?.primaryEntry) {
      setActiveContextEntry(claraAnswer.primaryEntry);
    }
  }, [claraAnswer?.primaryEntry]);

  function closeSearch() {
    setIsOpen(false);
    setQuery("");
    setSubmittedQuery("");
  }

  function submitSearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    setSubmittedQuery(trimmedQuery);
  }

  function openBestResult() {
    const targetHref = claraAnswer?.actionHref ?? filteredEntries[0]?.href;
    const targetEntry = claraAnswer?.primaryEntry ?? filteredEntries[0];

    if (!targetHref) {
      return;
    }

    if (targetEntry) {
      setActiveContextEntry(targetEntry);
    }

    closeSearch();
    router.push(targetHref);
  }

  return (
    <div className="relative w-full sm:w-[25rem]" ref={containerRef}>
      {isOpen ? (
        <div className="relative">
          <div className="reference-header-search flex h-9 items-center gap-2 px-3">
            <SearchIcon />
            <input
              ref={inputRef}
              className="w-full bg-transparent text-[13px] font-medium text-white outline-none placeholder:text-cyan-100/45"
              onChange={(event) => {
                setQuery(event.target.value);
                setSubmittedQuery("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitSearch();
                }
              }}
              placeholder="Busque qualquer dado interno do workspace"
              type="search"
              value={query}
            />
            <button
              aria-label="Buscar"
              className="rounded-[4px] border border-white/10 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-cyan-100/70"
              onClick={submitSearch}
              type="button"
            >
              Ir
            </button>
            <button
              aria-label="Fechar busca"
              className="rounded-[4px] border border-white/10 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-cyan-100/70"
              onClick={closeSearch}
              type="button"
            >
              Esc
            </button>
          </div>

          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-[18px] border border-white/10 bg-[rgba(20,27,38,0.98)] shadow-[0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className="max-h-[24rem] overflow-auto p-2">
              {submittedQuery.trim() ? (
                <>
                  {claraAnswer ? (
                    <div className="mx-2 mb-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/80">
                          {claraAnswer.badge}
                        </div>
                        {claraAnswer.actionHref && claraAnswer.actionLabel ? (
                          <button
                            className="rounded-[4px] border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/80"
                            onClick={openBestResult}
                            type="button"
                          >
                            {claraAnswer.actionLabel}
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-white">{claraAnswer.title}</p>
                      <p className="mt-2 text-[13px] leading-6 text-cyan-50">{claraAnswer.body}</p>
                    </div>
                  ) : null}

                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                      <SearchResult
                        key={entry.id}
                        entry={entry}
                        onSelect={(selectedEntry) => {
                          setActiveContextEntry(selectedEntry);
                          closeSearch();
                        }}
                      />
                    ))
                  ) : (
                    <div className="px-3 py-5 text-sm text-cyan-100/60">
                      Nenhum resultado para <span className="font-semibold text-white">&quot;{submittedQuery.trim()}&quot;</span>.
                    </div>
                  )}
                </>
              ) : (
                <div className="px-3 py-4 text-xs text-cyan-100/50">
                  Digite e pressione Enter.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          aria-label="Abrir Clara global"
          className="reference-header-search theme-header-muted inline-flex h-9 w-full items-center justify-between gap-3 px-3 text-[13px] font-medium transition hover:bg-white/[0.08] hover:text-white"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2">
            <SearchIcon />
            <span className="truncate">Clara global: busque qualquer dado interno</span>
          </span>
          <span className="shrink-0 rounded-[4px] border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em]">
            /
          </span>
        </button>
      )}
    </div>
  );
}
