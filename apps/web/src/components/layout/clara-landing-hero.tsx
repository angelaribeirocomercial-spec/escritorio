"use client";

import Image from "next/image";
import Link from "next/link";

type ClaraLandingHeroProps = {
  activeModeLabel: string;
  clientLabel: string;
  caseLabel: string;
  processLabel: string;
  summary: string;
  factsConfirmed: string[];
  documentsMissing: string[];
  risks: string[];
  tabs: ReadonlyArray<{
    id: string;
    label: string;
  }>;
};

const tabSummaries: Record<string, string> = {
  analise: "Triagem juridica, prova e classificacao do caso.",
  intimacao: "Leitura do ato, prazo e resposta controlada.",
  pecas: "Minutas e pecas com revisao humana obrigatoria.",
  jurisprudencia: "Pesquisa rastreavel e sugestao de precedentes.",
  checklist: "Acompanhamento processual e pendencias.",
  "proximos-passos": "Estrategia e proxima acao operacional.",
  comparador: "Revisao final e consistencia da minuta."
};

export function ClaraLandingHero({
  activeModeLabel,
  caseLabel,
  clientLabel,
  documentsMissing,
  factsConfirmed,
  processLabel,
  risks,
  summary,
  tabs
}: ClaraLandingHeroProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(26rem,0.95fr)]">
      <div className="workspace-panel p-6 lg:p-8">
        <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          CLARA - Online agora
        </div>

        <div className="mt-5">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Fluxo juridico
            <br />
            do escritorio com <span className="text-amber-300">CLARA</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
            A Clara organiza o trabalho do escritorio por etapas objetivas: triagem,
            estrategia, intimacao, peca, jurisprudencia, acompanhamento e revisao.
            Tudo fica rastreavel e pronto para revisao humana e validação.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {[
            {
              title: "Triagem do caso",
              detail: "Classifica o nicho, confere o contexto e indica o que falta para seguir."
            },
            {
              title: "Analise de intimacao",
              detail: "Extrai prazo, ato exigido e risco, deixando a resposta pronta para revisao."
            },
            {
              title: "Peças e minutas",
              detail: "Contestacao, recurso, manifestacao e minuta seguem o template do escritorio."
            },
            {
              title: "Acompanhamento e revisao",
              detail: "Resume andamentos, aponta pendencias e encerra tudo com validacao humana."
            }
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/10 text-xs font-semibold text-amber-100">
                ✓
              </div>
              <div>
                <p className="text-base font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            className="rounded-[0.9rem] bg-[linear-gradient(90deg,#22c55e,#4ade80)] px-6 py-4 text-sm font-semibold text-slate-950 transition hover:brightness-105"
            href="/clara?tab=analise#clara-workbench"
          >
            Abrir fluxo da Clara
          </Link>
          <Link
            className="rounded-[0.9rem] border border-white/10 px-6 py-4 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
            href="#clara-workbench"
          >
            Ver funcoes
          </Link>
        </div>
      </div>

      <aside className="workspace-panel overflow-hidden p-0">
        <div className="relative min-h-[34rem] overflow-hidden rounded-[inherit] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,26,0.98),rgba(14,23,43,0.98))] p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,168,68,0.12),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(34,197,94,0.1),transparent_25%)]" />

          <div className="relative rounded-[1.4rem] border border-white/10 bg-[#101828]/95 p-4 shadow-[0_24px_70px_rgba(2,6,23,0.35)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-300/15 text-lg">
                🤖
              </div>
              <div>
                <p className="text-sm font-semibold text-white">CLARA</p>
                <p className="text-xs text-slate-400">Inteligencia Juridica ADVX</p>
              </div>
            </div>
            <div className="mt-4 h-px bg-white/10" />
          </div>

          <div className="relative mt-5 grid gap-4">
            <div className="relative flex justify-center">
              <div className="relative aspect-[4/5] w-full max-w-[13.25rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/55 shadow-[0_28px_90px_rgba(2,6,23,0.45)]">
                <Image
                  alt="Clara, Advogada Digital IA"
                  className="object-cover object-[center_15%]"
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 13.25rem"
                  src="/clara/avatar.png"
                />
              </div>
            </div>

            <div className="relative flex justify-end">
              <div className="max-w-[22rem] rounded-[1.2rem] border border-amber-300/25 bg-amber-300/90 px-4 py-3 text-sm font-medium text-slate-950 shadow-[0_16px_40px_rgba(212,168,68,0.2)]">
                CLARA, analise esta intimacao e me diga o prazo para resposta.
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-white/15 bg-[#0b1220]/95 p-4 shadow-[0_22px_60px_rgba(2,6,23,0.35)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Analisando processo 0001234-56.2024.8.26.0100...</p>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                  ativo
                </span>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                <p>
                  <span className="font-semibold text-white">Tipo:</span> Citacao para Contestacao
                </p>
                <p>
                  <span className="font-semibold text-white">Prazo:</span> 15 dias uteis
                </p>
                <p>
                  <span className="font-semibold text-white">Vencimento:</span> 28/01/2026
                </p>
              </div>
              <div className="mt-4 rounded-[1rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Recomendacoes
                </p>
                <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                  <li>1. Verificar documentos do cliente</li>
                  <li>2. Analisar tese de defesa</li>
                  <li>3. Preparar contestacao</li>
                </ol>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Deseja que eu redija um rascunho da contestacao?
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              <span>CLARA esta analisando...</span>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
