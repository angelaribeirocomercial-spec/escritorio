const diaryWarnings = [
  "Esta ferramenta e fornecida a titulo de cortesia para nossos assinantes.",
  "A utilizacao do MJ Diario Oficial nao desobriga o advogado a ler o Diario Oficial.",
  "Nao nos responsabilizamos por eventuais perdas em decorrencia da utilizacao desta ferramenta.",
  "As publicacoes permanecem armazenadas por 90 dias."
];

export default function DiarioOficialPalavrasPage() {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mj-model-title">Palavras-chave para recebimento de publicacoes</p>
          <p className="mj-model-subtitle">Exibindo 0 resultado(s)</p>
        </div>
        <button className="mj-model-button-green" type="button">
          Adicionar
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <div className="mj-model-panel overflow-hidden">
          <div className="mj-model-gridline grid grid-cols-[1fr_3rem] border-b px-3 py-2 text-[13px] font-semibold text-slate-400">
            <span>Quantidade de monitoramentos permitidos</span>
            <span>1</span>
          </div>
          <div className="mj-model-gridline grid grid-cols-[1fr_3rem] border-b px-3 py-2 text-[13px] text-slate-300">
            <span>Quantidade em uso</span>
            <span>0</span>
          </div>
          <div className="grid grid-cols-[1fr_3rem] px-3 py-2 text-[13px] text-slate-300">
            <span>Status</span>
            <span>uso normal</span>
          </div>
        </div>

        <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-4 py-4 text-[13px] leading-6 text-slate-600">
          {diaryWarnings.map((warning) => (
            <p key={warning} className="mb-2 break-words last:mb-0">
              {warning}
            </p>
          ))}
        </div>
      </div>

      <div className="mj-model-panel px-4 py-4 text-[13px] text-slate-300">
        Voce ainda nao cadastrou nenhuma palavra-chave.
      </div>
    </div>
  );
}
