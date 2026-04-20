export default function AndamentosMonitoramentosPage() {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mj-model-title">Monitorar processos</p>
          <p className="mj-model-subtitle">Exibindo 0 resultado(s)</p>
          <p className="mt-1 text-[13px] text-slate-400">
            monitoramento ativo cadastrando verificar erro fase de exclusao
          </p>
        </div>
        <button className="mj-model-button-green" type="button">
          Adquirir pacote de andamentos
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_12rem]">
        <div className="mj-model-panel overflow-hidden">
          <div className="border-b px-4 py-3 text-center text-[13px] font-semibold text-slate-400 mj-model-gridline">
            QUOTAS DE MONITORAMENTO
          </div>
          {[
            ["Contratado", "0"],
            ["Utilizado", "0"],
            ["Em cadastramento", "0"],
            ["Livre", "0"]
          ].map(([label, value], index) => (
            <div
              key={label}
              className="grid grid-cols-[1fr_2rem] px-4 py-3 text-[13px]"
              style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}
            >
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>

        <div className="mj-model-soft-panel px-4 py-4 text-[13px] leading-6 text-slate-400">
          <p className="text-[15px] font-semibold text-white">Atencao:</p>
          <p className="mt-2">Apenas processos no padrao CNJ, preenchidos com a pontuacao correta, podem ser monitorados.</p>
          <p className="mt-2">Por nao haver uma integracao oficial com os sistemas dos tribunais, nao garantimos a entrega dos andamentos.</p>
          <p className="mt-2">A utilizacao dos andamentos automaticos nao desobriga o advogado a consultar o site dos tribunais.</p>
          <p className="mt-2">Nao nos responsabilizamos por eventuais perdas em decorrencia da utilizacao desta ferramenta.</p>
        </div>
      </div>

      <section className="mj-model-toolbar px-3 py-3">
        <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_auto]">
          <div>
            <label className="mb-1 block text-[13px] text-slate-400">Status</label>
            <select className="mj-model-input w-full px-3 outline-none">
              <option>Ver apenas os ativos</option>
              <option>Ver todos os processos</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-slate-400">Exibir os processos</label>
            <select className="mj-model-input w-full px-3 outline-none">
              <option>Todos</option>
              <option>Configurados para monitoramento</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-slate-400">Busca</label>
            <input className="mj-model-input w-full px-3 outline-none" placeholder="Filtrar por processo, cliente ou natureza" type="text" />
          </div>
          <div className="flex items-end">
            <button className="mj-model-button-gray" type="button">
              Buscar
            </button>
          </div>
        </div>
      </section>

      <div className="mj-model-panel px-3 py-3">
        <p className="mj-model-empty">Nenhum processo encontrado.</p>
      </div>
    </div>
  );
}
