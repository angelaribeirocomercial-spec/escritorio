const diaryWarnings = [
  "Esta ferramenta e fornecida a titulo de cortesia para nossos assinantes.",
  "A utilizacao do MJ Diario Oficial nao desobriga o advogado a ler o Diario Oficial.",
  "Nao nos responsabilizamos por eventuais perdas em decorrencia da utilizacao desta ferramenta.",
  "As publicacoes permanecem armazenadas por 90 dias."
];

const oabStates = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export default function DiarioOficialPublicacoesPage() {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <p className="mj-model-title">Adicionar</p>
        <button className="mj-model-button-gray" type="button">
          Voltar
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-4 py-4 text-[13px] leading-6 text-slate-600">
          {diaryWarnings.map((warning) => (
            <p key={warning} className="mb-2 break-words last:mb-0">
              {warning}
            </p>
          ))}
        </div>
        <div />
      </div>

      <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-4 py-4 text-[13px] leading-6 text-slate-600">
        Para comecar a utilizar Mais Juridico D.O e receber publicacoes do diario oficial e preciso cadastrar o primeiro advogado.
      </div>

      <section className="mj-model-panel px-5 py-5">
        <p className="mb-4 text-[16px] font-semibold text-slate-100">Dados do advogado</p>
        <div className="space-y-3 text-[13px]">
          <div>
            <label className="mb-1 block text-slate-400">Nome completo sem abreviacoes</label>
            <input className="mj-model-input w-full px-3 outline-none" placeholder="Nomes incompletos ou abreviados podem causar problemas nas buscas de publicacoes dos Diarios Oficiais." type="text" />
          </div>
          <div>
            <label className="mb-1 block text-slate-400">Numero OAB</label>
            <input className="mj-model-input w-full px-3 outline-none" type="text" />
          </div>
          <div>
            <label className="mb-1 block text-slate-400">Estado da OAB</label>
            <select className="mj-model-input w-full px-3 outline-none">
              {oabStates.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-slate-400">Email</label>
            <input className="mj-model-input w-full px-3 outline-none" placeholder="Email" type="email" />
          </div>
          <div>
            <label className="mb-1 block text-slate-400">Avisar novas publicacoes por email</label>
            <select className="mj-model-input w-full px-3 outline-none">
              <option>Sim</option>
              <option>Nao</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button className="mj-model-button-gray" type="button">
          Cancelar
        </button>
        <button className="mj-model-button-green" type="button">
          Salvar
        </button>
      </div>
    </div>
  );
}
