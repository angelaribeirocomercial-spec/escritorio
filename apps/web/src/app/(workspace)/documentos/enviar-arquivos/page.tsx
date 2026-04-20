function ToolButton({
  label,
  active = false
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={
        active
          ? "mj-model-button-green !min-h-0 !w-[2.5rem] !px-0 !py-1"
          : "mj-model-button-gray !min-h-0 !w-[2.5rem] !px-0 !py-1"
      }
      type="button"
    >
      {label}
    </button>
  );
}

const acceptedFormats = [
  "PDF, DOC, DOCX, JPG, PNG e ZIP",
  "Tamanho maximo por envio: 30 MB",
  "Os arquivos ficam disponiveis em Meus arquivos apos o processamento"
];

export default function EnviarArquivosPage() {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mj-model-title">Enviar arquivos</p>
          <p className="mj-model-subtitle">Envie documentos para organizacao, analise e vinculacao ao fluxo do escritorio.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <ToolButton label="<" />
          <ToolButton label="..." />
          <ToolButton active label="+" />
          <ToolButton label="x" />
        </div>
      </div>

      <section className="mj-model-panel overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3 mj-model-gridline">
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <span>Destino atual:</span>
            <span className="font-semibold text-slate-200">Inicio</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="mj-model-button-gray" type="button">
              Selecionar cliente
            </button>
            <button className="mj-model-button-gray" type="button">
              Vincular processo
            </button>
          </div>
        </div>

        <div className="grid gap-4 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div
            className="flex min-h-[24rem] flex-col items-center justify-center border border-dashed px-6 text-center mj-model-gridline"
            style={{ borderRadius: "4px" }}
          >
            <svg aria-hidden="true" className="h-14 w-14 text-slate-400" fill="none" viewBox="0 0 48 48">
              <path d="M24 31V12m0 0-7 7m7-7 7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              <path d="M14 34h20" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
            </svg>
            <p className="mt-4 text-[15px] font-semibold text-slate-200">
              Clique aqui ou arraste os arquivos que deseja enviar.
            </p>
            <p className="mt-2 max-w-[34rem] text-[13px] leading-6 text-slate-400">
              Use esta area para subir contratos, peticoes, comprovantes, planilhas e anexos que serao usados nas rotinas
              de Clara, Processos e Arquivos.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button className="mj-model-button-green" type="button">
                Escolher arquivos
              </button>
              <button className="mj-model-button-gray" type="button">
                Criar pasta de destino
              </button>
            </div>
          </div>

          <aside className="mj-model-panel px-4 py-4">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">Orientacoes</p>
            <ul className="mt-3 space-y-2 text-[13px] leading-6 text-slate-300">
              {acceptedFormats.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="mt-5 border-t pt-4 mj-model-gridline">
              <p className="text-[13px] font-semibold text-slate-200">Fluxo recomendado</p>
              <ul className="mt-3 space-y-2 text-[13px] leading-6 text-slate-400">
                <li>1. Enviar os documentos brutos do cliente ou do processo.</li>
                <li>2. Organizar em Meus arquivos por pasta ou caso.</li>
                <li>3. Acionar Clara para analise, comparacao ou minuta.</li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3 text-[13px] text-slate-400 mj-model-gridline">
          <span>Nenhum envio em andamento</span>
          <span>Aguardando selecao de arquivos</span>
        </div>
      </section>
    </div>
  );
}
