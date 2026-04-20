import { notFound } from "next/navigation";

type SearchParams = {
  termo?: string;
};

const directoryPages = {
  "advogados-adversos": {
    title: "Advogados adversos",
    emptyState: "Voce ainda nao cadastrou nenhum advogado adverso.",
    items: [
      {
        id: "adv-001",
        name: "Ribeiro e Falcao Advogados",
        detail: "Banco Santander | (11) 3333-2200 | contato@rfadv.com.br"
      }
    ]
  },
  "contatos-partes": {
    title: "Contatos / Partes",
    emptyState: "Voce ainda nao cadastrou nenhuma parte.",
    items: [
      {
        id: "ctp-001",
        name: "Mariana Torres Lima",
        detail: "Cliente | WhatsApp (11) 99881-1200 | mariana.torres@email.com"
      }
    ]
  }
} as const;

export default function PessoasSubpage({
  params,
  searchParams
}: {
  params: { subpage: keyof typeof directoryPages };
  searchParams?: SearchParams;
}) {
  const page = directoryPages[params.subpage];

  if (!page) {
    notFound();
  }

  const term = searchParams?.termo?.toLowerCase().trim() ?? "";
  const filteredItems = page.items.filter((item) =>
    !term ? true : `${item.name} ${item.detail}`.toLowerCase().includes(term)
  );

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="mj-model-title">{page.title}</p>
        <div className="flex gap-2">
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
            <input className="mj-model-input w-full px-3 outline-none" defaultValue={searchParams?.termo ?? ""} name="termo" type="text" />
            <button className="mj-model-button-gray" type="submit">
              Buscar
            </button>
          </form>
        </div>
      </section>

      {filteredItems.length === 0 ? (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">{page.emptyState}</p>
        </div>
      ) : (
        <div className="mj-model-panel overflow-hidden">
          <div className="divide-y divide-white/10">
            {filteredItems.map((item) => (
              <div key={item.id} className="px-5 py-4">
                <p className="text-[15px] font-semibold text-slate-100">{item.name}</p>
                <p className="mt-1 text-[13px] text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
