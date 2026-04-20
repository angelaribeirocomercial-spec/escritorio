const units = [
  ["1 byte (b)", "8 bits"],
  ["1 Kilobyte (Kb)", "1024 b"],
  ["1 Megabyte (Mb)", "1024 Kb"],
  ["1 Gigabyte (Gb)", "1024 Mb"],
  ["1 Terabyte (Tb)", "1024 Gb"]
];

const usage = [
  ["Espaco total", "314572800 B"],
  ["Espaco utilizado", "0 B"],
  ["Espaco disponivel", "314572800 B"]
];

export default function DocumentosRelatoriosPage() {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mj-model-title">Relatorios de arquivos</p>
          <p className="mj-model-subtitle">Acompanhe consumo do armazenamento e a capacidade disponivel no escritorio.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="mj-model-button-gray" type="button">
            Atualizar
          </button>
          <button className="mj-model-button-gray" type="button">
            Exportar
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="mj-model-panel overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3 mj-model-gridline">
            <div>
              <p className="text-[13px] font-semibold text-slate-200">Espaco em disco</p>
              <p className="text-[13px] text-slate-400">Baseado no armazenamento disponivel para documentos e anexos.</p>
            </div>
            <span className="text-[13px] text-slate-400">Uso atual: 0.0%</span>
          </div>

          <div className="grid gap-4 px-4 py-4 xl:grid-cols-[16rem_1fr]">
            <div className="flex flex-col items-center justify-center border px-4 py-5 mj-model-gridline" style={{ borderRadius: "4px" }}>
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[10px] border-amber-400/90 border-r-slate-700/40 border-b-slate-700/40 border-l-slate-700/40">
                <div className="text-center">
                  <p className="text-[28px] font-semibold text-slate-100">0%</p>
                  <p className="text-[12px] uppercase tracking-[0.18em] text-slate-400">Utilizado</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[12px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-8 bg-amber-400/90" style={{ borderRadius: "4px" }} />
                  <span>Espaco disponivel</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-8 bg-slate-600/60" style={{ borderRadius: "4px" }} />
                  <span>Espaco utilizado</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {usage.map(([label, value]) => (
                <article key={label} className="border px-4 py-4 mj-model-gridline" style={{ borderRadius: "4px" }}>
                  <p className="text-[12px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
                  <p className="mt-2 text-[18px] font-semibold text-slate-100">{value}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="mj-model-panel overflow-hidden">
          <div className="border-b px-4 py-3 mj-model-gridline">
            <p className="text-[13px] font-semibold text-slate-200">Unidades de medida</p>
          </div>
          <div className="grid grid-cols-[1fr_4.5rem] border-b px-4 py-2 text-[12px] font-semibold text-slate-400 mj-model-gridline">
            <span>Unidade</span>
            <span>Espaco</span>
          </div>
          {units.map(([label, value], index) => (
            <div
              key={label}
              className={`grid grid-cols-[1fr_4.5rem] px-4 py-2 text-[13px] ${index < units.length - 1 ? "border-b mj-model-gridline" : ""}`}
            >
              <span className="text-slate-300">{label}</span>
              <span className="text-slate-400">{value}</span>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
