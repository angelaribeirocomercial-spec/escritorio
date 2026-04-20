export default function FinanceiroGraficosPage() {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <p className="mj-model-title">Graficos</p>
        <div className="flex gap-2">
          <button className="mj-model-button-gray" type="button">Imprimir</button>
          <button className="mj-model-button-gray" type="button">Modo manual</button>
          <button className="mj-model-button-gray" type="button">Modo filtro</button>
        </div>
      </div>

      <form className="mj-model-toolbar grid gap-3 px-4 py-4 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_auto]" method="get">
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Grafico</label>
          <select className="mj-model-input w-full px-3 outline-none">
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
          <select className="mj-model-input w-full px-3 outline-none">
            <option>Todas as contas</option>
            <option>Conta Principal</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Analise por</label>
          <select className="mj-model-input w-full px-3 outline-none">
            <option>data do movimento</option>
            <option>data do pagamento</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Situacao</label>
          <select className="mj-model-input w-full px-3 outline-none">
            <option>Aberto e realizadas</option>
            <option>Somente em aberto</option>
            <option>Somente realizadas</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Inicio</label>
          <input className="mj-model-input w-full px-3 outline-none" defaultValue="04/2026" type="text" />
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Fim</label>
          <input className="mj-model-input w-full px-3 outline-none" defaultValue="04/2026" type="text" />
        </div>
        <div className="flex items-end">
          <button className="mj-model-button-gray w-full" type="submit">Buscar</button>
        </div>
        <label className="xl:col-span-7 flex items-center gap-2 text-[13px] text-slate-400">
          <input type="checkbox" />
          <span>Incluir transferencias no grafico</span>
        </label>
      </form>

      <div className="mj-model-panel px-4 py-10 text-center">
        <p className="text-[15px] text-slate-300">Nao existe informacao suficiente para plotar o grafico.</p>
        <p className="mt-2 text-[13px] text-slate-400">Altere as opcoes acima a fim ajustar uma situacao que possamos plotar um grafico.</p>
      </div>
    </div>
  );
}
