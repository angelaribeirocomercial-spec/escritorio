const diaryWarnings = [
  "Esta ferramenta e fornecida a titulo de cortesia para nossos assinantes.",
  "A utilizacao do MJ Diario Oficial nao desobriga o advogado a ler o Diario Oficial.",
  "Nao nos responsabilizamos por eventuais perdas em decorrencia da utilizacao desta ferramenta.",
  "As publicacoes permanecem armazenadas por 90 dias."
];

export default function DiarioOficialLixeiraPage() {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mj-model-title">Publicacoes excluidas</p>
          <p className="mj-model-subtitle">Exibindo 0 resultado(s)</p>
        </div>
        <button className="mj-model-button-gray" type="button">
          Voltar
        </button>
      </div>

      <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-4 py-4 text-[13px] leading-6 text-slate-600">
        {diaryWarnings.map((warning) => (
          <p key={warning} className="mb-2 break-words last:mb-0">
            {warning}
          </p>
        ))}
      </div>

      <div className="mj-model-panel px-4 py-4 text-[13px] text-slate-300">
        Nao existem publicacoes para exibir.
      </div>
    </div>
  );
}
