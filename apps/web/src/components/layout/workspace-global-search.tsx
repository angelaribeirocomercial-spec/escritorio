"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { WorkspaceSearchEntry } from "@/components/layout/workspace-search-types";

type WorkspaceGlobalSearchProps = {
  entries: WorkspaceSearchEntry[];
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function scoreEntry(entry: WorkspaceSearchEntry, query: string) {
  const normalizedQuery = normalizeText(query);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const haystack = normalizeText([entry.kind, entry.title, entry.preview, ...entry.keywords].join(" "));
  const title = normalizeText(entry.title);
  const preview = normalizeText(entry.preview);

  if (!normalizedQuery) {
    return 0;
  }

  let score = 0;

  if (haystack.includes(normalizedQuery)) {
    score += 50;
  }

  if (title.includes(normalizedQuery)) {
    score += 30;
  }

  if (preview.includes(normalizedQuery)) {
    score += 10;
  }

  if (title.startsWith(normalizedQuery)) {
    score += 12;
  }

  for (const token of tokens) {
    if (title.includes(token)) {
      score += 10;
    }

    if (preview.includes(token)) {
      score += 4;
    }

    if (haystack.includes(token)) {
      score += 6;
    }
  }

  return score;
}

function kindLabel(kind: WorkspaceSearchEntry["kind"]) {
  switch (kind) {
    case "Cliente":
      return "Cliente";
    case "Processo":
      return "Processo";
    case "Documento":
      return "Documento";
    case "Tese":
      return "Tese";
  }

  return kind;
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
  onSelect: () => void;
}) {
  return (
    <Link
      className="flex items-start gap-3 rounded-lg border border-transparent px-3 py-3 text-left transition hover:border-white/10 hover:bg-white/[0.04]"
      href={entry.href}
      onClick={onSelect}
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

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const suggestions = useMemo(() => {
    const result = new Map<WorkspaceSearchEntry["kind"], WorkspaceSearchEntry>();

    for (const entry of entries) {
      if (!result.has(entry.kind)) {
        result.set(entry.kind, entry);
      }
    }

    return Array.from(result.values()).slice(0, 4);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (!query.trim()) {
      return suggestions;
    }

    return entries
      .map((entry) => ({
        entry,
        score: scoreEntry(entry, query)
      }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title))
      .slice(0, 6)
      .map(({ entry }) => entry);
  }, [entries, query, suggestions]);

  function openBestResult() {
    const target = filteredEntries[0];

    if (!target) {
      return;
    }

    setIsOpen(false);
    setQuery("");
    router.push(target.href);
  }

  return (
    <div className="relative w-full sm:w-[23rem]" ref={containerRef}>
      {isOpen ? (
        <div className="relative">
          <div className="reference-header-search flex h-9 items-center gap-2 px-3">
            <SearchIcon />
            <input
              ref={inputRef}
              className="w-full bg-transparent text-[13px] font-medium text-white outline-none placeholder:text-cyan-100/45"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  openBestResult();
                }
              }}
              placeholder="Buscar cliente, processo, documento ou tese"
              type="search"
              value={query}
            />
            <button
              aria-label="Fechar busca"
              className="rounded-[4px] border border-white/10 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-cyan-100/70"
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              type="button"
            >
              Esc
            </button>
          </div>

          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-[18px] border border-white/10 bg-[rgba(20,27,38,0.98)] shadow-[0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className="border-b border-white/8 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100/55">
                Busca no workspace atual
              </p>
              <p className="mt-1 text-[12px] leading-5 text-cyan-100/55">
                Sem API externa. Resultado curto com destino direto para abrir o item certo.
              </p>
            </div>

            <div className="max-h-[24rem] overflow-auto p-2">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <SearchResult key={entry.id} entry={entry} onSelect={() => setIsOpen(false)} />
                ))
              ) : (
                <div className="px-3 py-5 text-sm text-cyan-100/60">
                  Nenhum resultado para <span className="font-semibold text-white">&quot;{query.trim()}&quot;</span>.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          aria-label="Abrir busca do workspace"
          className="reference-header-search theme-header-muted inline-flex h-9 w-full items-center justify-between gap-3 px-3 text-[13px] font-medium transition hover:bg-white/[0.08] hover:text-white"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2">
            <SearchIcon />
            <span className="truncate">Buscar cliente, processo, documento ou tese</span>
          </span>
          <span className="shrink-0 rounded-[4px] border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em]">
            /
          </span>
        </button>
      )}
    </div>
  );
}
