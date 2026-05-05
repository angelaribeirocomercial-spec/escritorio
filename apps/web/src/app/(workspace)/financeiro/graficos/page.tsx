"use client";

import { useState } from "react";

export default function FinanceiroGraficosPage() {
  const [mode, setMode] = useState<"manual" | "filter">("manual");
  const [appliedFilters, setAppliedFilters] = useState<{
    grafico: string;
    conta: string;
    analisePor: string;
    situacao: string;
    inicio: string;
    fim: string;
    incluirTransferencias: boolean;
  } | null>(null);

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mj-model-title">Graficos</p>
          <p className="mj-model-subtitle">
            {mode === "manual" ? "Modo manual ativo" : "Modo filtro ativo"}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="mj-model-button-gray" type="button" onClick={() => window.print()}>
            Imprimir
          </button>
          <button className="mj-model-button-gray" type="button" onClick={() => setMode("manual")}>
            Modo manual
          </button>
          <button className="mj-model-button-gray" type="button" onClick={() => setMode("filter")}>
            Modo filtro
          </button>
        </div>
      </div>

      <form
        className="mj-model-toolbar grid gap-3 px-4 py-4 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setAppliedFilters({
            grafico: String(formData.get("grafico") ?? ""),
            conta: String(formData.get("conta") ?? ""),
            analisePor: String(formData.get("analisePor") ?? ""),
            situacao: String(formData.get("situacao") ?? ""),
            inicio: String(formData.get("inicio") ?? ""),
            fim: String(formData.get("fim") ?? ""),
            incluirTransferencias: formData.get("incluirTransferencias") === "on"
          });
        }}
      >
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Grafico</label>
          <select className="mj-model-input w-full px-3 outline-none" name="grafico">
            <option>Grafico de pizza das despesas</option>
            <option>Grafico de pizza das receitas</option>
            <option>Despesas (mensal)</option>
            <option>Receitas (mensal)</option>
            <option>Despesas e Receitas (mensal)</option>
            <option>Lucro / Prejuizo (Receitas - Despesas)</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Conta</label>
          <select className="mj-model-input w-full px-3 outline-none" name="conta">
            <option>Todas as contas</option>
            <option>Conta Principal</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Analise por</label>
          <select className="mj-model-input w-full px-3 outline-none" name="analisePor">
            <option>data do movimento</option>
            <option>data do pagamento</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Situacao</label>
          <select className="mj-model-input w-full px-3 outline-none" name="situacao">
            <option>Aberto e realizadas</option>
            <option>Somente em aberto</option>
            <option>Somente realizadas</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Inicio</label>
          <input className="mj-model-input w-full px-3 outline-none" defaultValue="04/2026" name="inicio" type="text" />
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Fim</label>
          <input className="mj-model-input w-full px-3 outline-none" defaultValue="04/2026" name="fim" type="text" />
        </div>
        <div className="flex items-end">
          <button className="mj-model-button-gray w-full" type="submit">
            Buscar
          </button>
        </div>
        <label className="xl:col-span-7 flex items-center gap-2 text-[13px] text-slate-400">
          <input name="incluirTransferencias" type="checkbox" />
          <span>Incluir transferencias no grafico</span>
        </label>
      </form>

      <div className="mj-model-panel px-4 py-10 text-center">
        <p className="text-[15px] text-slate-300">Nao existe informacao suficiente para plotar o grafico.</p>
        <p className="mt-2 text-[13px] text-slate-400">
          {mode === "manual"
            ? "Ajuste as opcoes acima para refinar a leitura manual dos dados."
            : "Use os filtros acima para refinar a base antes de plotar um grafico."}
        </p>
        {appliedFilters ? (
          <p className="mt-3 text-[12px] text-slate-500">
            Filtros aplicados: {appliedFilters.grafico} | {appliedFilters.conta} | {appliedFilters.analisePor} |{" "}
            {appliedFilters.situacao} | {appliedFilters.inicio} - {appliedFilters.fim}
            {appliedFilters.incluirTransferencias ? " | incluir transferencias" : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}
