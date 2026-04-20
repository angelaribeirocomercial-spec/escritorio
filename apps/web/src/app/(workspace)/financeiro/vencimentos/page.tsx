export default function FinanceiroVencimentosPage() {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mj-model-title">Resumo dos vencimentos</p>
          <p className="mj-model-subtitle">Exibindo 0 resultado(s)</p>
        </div>
        <button className="mj-model-button-green" type="button">Lembrar por e-mail</button>
      </div>

      <form className="mj-model-toolbar grid gap-3 px-4 py-4 xl:grid-cols-[10rem_1fr_1fr_auto]" method="get">
        <div>
          <label className="mb-2 block text-[13px] text-slate-400">Periodo</label>
          <select className="mj-model-input w-full px-3 outline-none">
            <option>Proximos 30 dias</option>
            <option>Hoje</option>
            <option>Este mes</option>
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
          <label className="mb-2 block text-[13px] text-slate-400">Cliente</label>
          <input className="mj-model-input w-full px-3 outline-none" type="text" />
        </div>
        <div className="flex items-end">
          <button className="mj-model-button-gray w-full" type="submit">Buscar</button>
        </div>
      </form>

      <div className="mj-model-panel px-4 py-4">
        <p className="mj-model-empty">Nao existem cadastro de contas a pagar ou a receber para os proximos 30 dias.</p>
      </div>
    </div>
  );
}
