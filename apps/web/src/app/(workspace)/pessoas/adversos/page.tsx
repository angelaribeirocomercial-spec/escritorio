const adversos = [
  { title: "Banco Pan", detail: "Revisional de financiamento de veiculo" },
  { title: "Itau", detail: "Fraude bancaria via PIX" },
  { title: "Santander", detail: "Capital de giro e negativacao indevida" }
];

export default function PessoasAdversosPage({
  searchParams
}: {
  searchParams?: { pesquisa?: string };
}) {
  const search = searchParams?.pesquisa?.toLowerCase().trim() ?? "";
  const filteredItems = adversos.filter((item) =>
    !search ? true : `${item.title} ${item.detail}`.toLowerCase().includes(search)
  );

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="mj-model-title">Adversos</p>
        <div className="flex gap-2">
          <button className="mj-model-button-gray" type="button">
            Importar lote
          </button>
          <button className="mj-model-button-green" type="button">
            Adicionar
          </button>
        </div>
      </div>

      <p className="mj-model-subtitle">Exibindo {filteredItems.length} resultado(s)</p>

      <section className="mj-model-toolbar px-4 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-[6rem] text-[13px] font-semibold text-slate-400">Busca</div>
          <form className="flex w-full gap-3" method="get">
            <input className="mj-model-input w-full px-3 outline-none" defaultValue={searchParams?.pesquisa ?? ""} name="pesquisa" type="text" />
            <button className="mj-model-button-gray" type="submit">
              Buscar
            </button>
          </form>
        </div>
      </section>

      {filteredItems.length === 0 ? (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">Voce ainda nao cadastrou nenhum adverso.</p>
        </div>
      ) : (
        <div className="mj-model-panel overflow-hidden">
          <div className="divide-y divide-white/10">
            {filteredItems.map((item) => (
              <div key={item.title} className="px-5 py-4">
                <p className="text-[15px] font-semibold text-slate-100">{item.title}</p>
                <p className="mt-1 text-[13px] text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
