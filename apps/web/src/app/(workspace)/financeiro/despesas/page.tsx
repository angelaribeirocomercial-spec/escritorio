function BalancePanel() {
  return (
    <div className="mj-model-panel overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[1fr_14rem]">
        <div className="border-b px-4 py-4 md:border-b-0 md:border-r mj-model-gridline">
          <p className="text-[15px] font-semibold text-slate-300">Saldo das contas</p>
          <p className="mt-1 text-[13px] text-slate-400">* Lancamentos realizados ate 09/04/2026</p>
          <div className="mt-4 flex items-center justify-between text-[14px]">
            <span className="text-slate-400">Conta Principal</span>
            <span>0,00</span>
          </div>
        </div>
        <div className="px-4 py-4">
          <p className="text-[15px] font-semibold text-slate-300">Exibir</p>
          <select className="mj-model-input mt-3 w-full px-3 outline-none">
            <option>Saldo</option>
            <option>Lancamentos realizados</option>
            <option>Lancamentos em aberto</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function FinanceiroDespesasPage() {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mj-model-title">Despesas</p>
          <p className="mj-model-subtitle">Exibindo 0 resultado(s)</p>
        </div>
        <div className="flex gap-2">
          <button className="mj-model-button-gray" type="button">Transferencia entre contas</button>
          <button className="mj-model-button-green" type="button">Adicionar</button>
        </div>
      </div>

      <BalancePanel />

      <form className="mj-model-toolbar grid gap-3 px-4 py-4 xl:grid-cols-[7rem_1fr_1.2fr_1fr_auto]" method="get">
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Mes</label>
          <select className="mj-model-input w-full px-3 outline-none">
            <option>04/2026</option>
            <option>Ultimos lancamentos</option>
            <option>Todos os meses</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Contas</label>
          <select className="mj-model-input w-full px-3 outline-none">
            <option>Todas as contas</option>
            <option>Conta Principal</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Situacao</label>
          <select className="mj-model-input w-full px-3 outline-none">
            <option>Todas (filtra pelo vencimento)</option>
            <option>Somente realizadas (filtra pelo pagamento)</option>
            <option>Somente em aberto (filtra pelo vencimento)</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Cliente</label>
          <input className="mj-model-input w-full px-3 outline-none" type="text" />
        </div>
        <div className="flex items-end">
          <button className="mj-model-button-gray w-full" type="submit">Buscar</button>
        </div>
      </form>

      <div className="mj-model-panel px-4 py-4">
        <p className="mj-model-empty">Voce ainda nao cadastrou nenhuma despesa.</p>
      </div>
    </div>
  );
}
