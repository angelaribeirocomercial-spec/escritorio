import { notFound } from "next/navigation";

type TableRow = string[];

type StatConfig =
  | {
      kind: "chart-table";
      title: string;
      headers: string[];
      rows: TableRow[];
      legend?: { label: string; color: string }[];
      warnings?: string[];
      footerLabel?: string;
    }
  | {
      kind: "date-table";
      title: string;
      headers: string[];
      rows: TableRow[];
    }
  | {
      kind: "financial-chart";
      title: string;
    }
  | {
      kind: "message";
      title: string;
      message: string;
    }
  | {
      kind: "client-service";
      title: string;
    };

const emptyDates = [
  "09/03/2026",
  "10/03/2026",
  "11/03/2026",
  "12/03/2026",
  "13/03/2026",
  "14/03/2026",
  "15/03/2026",
  "16/03/2026",
  "17/03/2026",
  "18/03/2026",
  "19/03/2026",
  "20/03/2026",
  "21/03/2026",
  "22/03/2026",
  "23/03/2026",
  "24/03/2026",
  "25/03/2026",
  "26/03/2026",
  "27/03/2026",
  "28/03/2026",
  "29/03/2026",
  "30/03/2026",
  "31/03/2026",
  "01/04/2026",
  "02/04/2026",
  "03/04/2026",
  "04/04/2026",
  "05/04/2026",
  "06/04/2026",
  "07/04/2026",
  "08/04/2026",
  "09/04/2026"
].map((date) => [date, "0"]);

const statConfigs: Record<string, StatConfig> = {
  "andamentos-atrasados": {
    kind: "chart-table",
    title: "Andamentos atrasados",
    headers: ["Periodo sem andamentos", "Processo", "%"],
    rows: [["Total", "", "100,00%"]],
    warnings: [
      "Warning: implode(): Invalid arguments passed in /home/www/maisjuridico.com.br/cp/estatistica_lista.php on line 181",
      "Warning: mysqli_num_rows() expects parameter 1 to be mysqli_result, boolean given in /home/www/maisjuridico.com.br/fu_mysql2mysqli.php on line 90"
    ]
  },
  "andamentos-dos-processos": {
    kind: "chart-table",
    title: "Andamentos dos processos",
    headers: ["Andamento", "Qtde"],
    rows: []
  },
  "ultimos-andamentos": {
    kind: "chart-table",
    title: "Ultimos andamentos dos processos",
    headers: ["Andamento", "Qtde"],
    rows: []
  },
  "andamentos-automaticos": {
    kind: "chart-table",
    title: "Andamentos Automaticos",
    headers: ["PROCESSOS", "TOTAL"],
    rows: [
      ["Monitorados", "0"],
      ["Em fase de cadastramento", "0"],
      ["Nao monitorados", "0"]
    ]
  },
  clientes: {
    kind: "chart-table",
    title: "Clientes",
    headers: ["Status dos processos", "Qtde"],
    rows: [
      ["Pessoa Fisica", "0"],
      ["Pessoa Juridica", "0"],
      ["Nao especificado", "0"]
    ],
    legend: [
      { label: "Pessoa Fisica", color: "#ff5b89" },
      { label: "Pessoa Juridica", color: "#68a6d9" },
      { label: "Nao especificado", color: "#f4be3f" }
    ]
  },
  processos: {
    kind: "chart-table",
    title: "Clientes e processos",
    headers: ["Status dos processos", "Qtde"],
    rows: [["Qtde. Clientes", "Qtde. Processos"]],
    warnings: [
      "Warning: implode(): Invalid arguments passed in /home/www/maisjuridico.com.br/cp/estatistica_processo.php on line 170",
      "Warning: mysqli_num_rows() expects parameter 1 to be mysqli_result, boolean given in /home/www/maisjuridico.com.br/fu_mysql2mysqli.php on line 90"
    ],
    footerLabel: "Clientes"
  },
  "abertura-de-processos": {
    kind: "date-table",
    title: "Data de abertura e processos",
    headers: ["Data de abertura", "Qtde. Processos"],
    rows: emptyDates
  },
  "cadastro-de-processos": {
    kind: "date-table",
    title: "Data de cadastro de processos no sistema",
    headers: ["Data de cadastro", "Qtde. Processos"],
    rows: emptyDates
  },
  "fase-do-processo": {
    kind: "chart-table",
    title: "Processos e fase",
    headers: ["Fase", "Qtde. de processos"],
    rows: []
  },
  "natureza-da-acao": {
    kind: "chart-table",
    title: "Processos e naturezas",
    headers: ["Natureza", "Qtde. de processos"],
    rows: []
  },
  "atendimento-clientes": {
    kind: "client-service",
    title: "Atendimento por clientes"
  },
  financeiro: {
    kind: "financial-chart",
    title: "Grafico financeiro"
  },
  personalizados: {
    kind: "message",
    title: "Campos personalizados",
    message: "Voce nao possui estatisticas de campos personalizados para serem exibidas neste momento."
  }
};

const tableHeadStyle = {
  color: "rgba(100, 116, 139, 0.92)"
} as const;

function GraphPlaceholder({ legend }: { legend?: { label: string; color: string }[] }) {
  return (
    <div className="mj-model-panel px-4 py-4">
      <div className="flex min-h-[14rem] flex-col justify-center">
        {legend ? (
          <div className="mb-4 flex flex-wrap justify-center gap-4 text-[10px]" style={tableHeadStyle}>
            {legend.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="h-2 w-8 rounded-[2px]" style={{ background: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[8px] border-[10px] border-slate-200">
          <div className="h-10 w-10 rounded-[4px] border-[8px] border-slate-300 border-t-transparent" />
        </div>
      </div>
    </div>
  );
}

function SummaryTable({
  headers,
  rows
}: {
  headers: string[];
  rows: TableRow[];
}) {
  return (
    <div className="mj-model-panel overflow-hidden">
      <div className={`grid border-b px-3 py-2 text-[10px] font-semibold mj-model-gridline ${headers.length === 3 ? "grid-cols-[1.2fr_0.8fr_0.5fr]" : "grid-cols-[1fr_4rem]"}`} style={tableHeadStyle}>
        {headers.map((header) => (
          <span key={header}>{header}</span>
        ))}
      </div>
      {rows.length ? (
        rows.map((row, index) => (
          <div
            key={`${row.join("-")}-${index}`}
            className={`grid px-3 py-2 text-[10px] ${headers.length === 3 ? "grid-cols-[1.2fr_0.8fr_0.5fr]" : "grid-cols-[1fr_4rem]"}`}
            style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}
          >
            {row.map((cell, cellIndex) => (
              <span key={`${cell}-${cellIndex}`}>{cell}</span>
            ))}
          </div>
        ))
      ) : (
        <div className="px-3 py-4 text-[10px]" style={tableHeadStyle}>
          Sem dados.
        </div>
      )}
    </div>
  );
}

function FilterCard() {
  return (
    <aside className="mj-model-panel px-3 py-3">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[10px] font-semibold" style={tableHeadStyle}>
            Data inicial
          </label>
          <input className="mj-model-input w-full px-2 py-2 text-[10px] outline-none" defaultValue="09/03/2026" type="text" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold" style={tableHeadStyle}>
            Data final
          </label>
          <input className="mj-model-input w-full px-2 py-2 text-[10px] outline-none" defaultValue="09/04/2026" type="text" />
        </div>
        <button className="mj-model-button-green w-full px-3 py-2 text-[10px] font-semibold" type="button">
          Consultar
        </button>
      </div>
    </aside>
  );
}

function DateTableLayout({ config }: { config: Extract<StatConfig, { kind: "date-table" }> }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_10rem]">
      <section className="space-y-3">
        <GraphPlaceholder legend={[{ label: "", color: "#ff5b89" }]} />
        <div className="mj-model-panel overflow-hidden">
          <div className="mj-model-gridline grid grid-cols-[1fr_9rem] border-b px-3 py-2 text-[10px] font-semibold" style={tableHeadStyle}>
            {config.headers.map((header) => (
              <span key={header}>{header}</span>
            ))}
          </div>
          {config.rows.map((row, index) => (
            <div key={`${row[0]}-${index}`} className="grid grid-cols-[1fr_9rem] px-3 py-2 text-[10px]" style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}>
              <span>{row[0]}</span>
              <span>{row[1]}</span>
            </div>
          ))}
        </div>
      </section>

      <FilterCard />
    </div>
  );
}

function FinancialLayout() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="mj-model-button-gray px-4 py-2 text-[10px] font-semibold" type="button">
          Imprimir
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_12rem]">
        <section className="mj-model-panel px-4 py-4">
          <div className="flex min-h-[14rem] flex-col items-center justify-center text-center">
            <svg aria-hidden="true" className="h-24 w-24 text-slate-300" fill="none" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="24" fill="currentColor" opacity="0.25" />
              <path d="M48 24a24 24 0 0 1 20.8 12H48V24Z" fill="currentColor" opacity="0.75" />
              <path d="M25 58.5A24 24 0 0 0 48 72V48L25 58.5Z" fill="currentColor" />
            </svg>
            <p className="mt-2 text-xl font-medium text-slate-300">Estatisticas</p>
            <p className="text-[10px]" style={tableHeadStyle}>
              Sem dados para a filtragem atual.
            </p>
          </div>
        </section>

        <aside className="mj-model-panel px-3 py-3">
          <form className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold" style={tableHeadStyle}>
                Tipo de Relatorio
              </label>
              <select className="mj-model-input w-full px-2 py-2 text-[10px] outline-none">
                <option>MODO MANUAL</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold" style={tableHeadStyle}>
                Grafico
              </label>
              <select className="mj-model-input w-full px-2 py-2 text-[10px] outline-none">
                <option>Grafico de pizza das despesas</option>
                <option>Grafico de pizza das receitas</option>
                <option>Despesas (mensal)</option>
                <option>Receitas (mensal)</option>
                <option>Despesas e Receitas (mensal)</option>
                <option>Lucro / Prejuizo (Receitas - Despesas)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold" style={tableHeadStyle}>
                Conta
              </label>
              <select className="mj-model-input w-full px-2 py-2 text-[10px] outline-none">
                <option>Todas as contas</option>
                <option>Conta Principal</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold" style={tableHeadStyle}>
                Analise por
              </label>
              <select className="mj-model-input w-full px-2 py-2 text-[10px] outline-none">
                <option>data do movimento</option>
                <option>data do pagamento</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold" style={tableHeadStyle}>
                Situacao
              </label>
              <select className="mj-model-input w-full px-2 py-2 text-[10px] outline-none">
                <option>Aberto e realizadas</option>
                <option>Somente em aberto</option>
                <option>Somente realizadas</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold" style={tableHeadStyle}>
                Periodo Inicio
              </label>
              <input className="mj-model-input w-full px-2 py-2 text-[10px] outline-none" defaultValue="04/2026" type="text" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold" style={tableHeadStyle}>
                Periodo Fim
              </label>
              <input className="mj-model-input w-full px-2 py-2 text-[10px] outline-none" defaultValue="04/2026" type="text" />
            </div>
            <label className="flex items-start gap-2 text-[10px]" style={tableHeadStyle}>
              <input className="mt-0.5" type="checkbox" />
              <span>Incluir transferencias no relatorio</span>
            </label>
            <button className="mj-model-button-green w-full px-3 py-2 text-[10px] font-semibold" type="button">
              Exibir
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

function ClientServiceLayout() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_12rem]">
      <section className="space-y-3">
        <div className="mj-model-panel px-4 py-4">
          <div className="flex min-h-[14rem] flex-col items-center justify-center text-center">
            <svg aria-hidden="true" className="h-24 w-24 text-slate-300" fill="none" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="24" fill="currentColor" opacity="0.18" />
              <path d="M48 24a24 24 0 0 1 20.8 12H48V24Z" fill="currentColor" opacity="0.7" />
              <path d="M25 58.5A24 24 0 0 0 48 72V48L25 58.5Z" fill="currentColor" />
            </svg>
            <p className="mt-2 text-xl font-medium text-slate-300">Estatisticas</p>
          </div>
        </div>

        <div className="mj-model-panel overflow-hidden">
          <div className="mj-model-gridline border-b px-3 py-2 text-[10px] font-semibold" style={tableHeadStyle}>
            Atendimentos por status
          </div>
          <div className="grid grid-cols-[1fr_4rem] px-3 py-2 text-[10px]" style={{ borderTop: "1px solid var(--surface-border)" }}>
            <span>Total</span>
            <span>0</span>
          </div>
        </div>
      </section>

      <aside className="mj-model-panel px-3 py-3">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold" style={tableHeadStyle}>
              Periodo inicio
            </label>
            <input className="mj-model-input w-full px-2 py-2 text-[10px] outline-none" defaultValue="10/03/2026" type="text" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold" style={tableHeadStyle}>
              Periodo fim
            </label>
            <input className="mj-model-input w-full px-2 py-2 text-[10px] outline-none" defaultValue="09/04/2026" type="text" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold" style={tableHeadStyle}>
              Cliente
            </label>
            <select className="mj-model-input w-full px-2 py-2 text-[10px] outline-none">
              <option>Todos</option>
            </select>
          </div>
          <button className="mj-model-button-green w-full px-3 py-2 text-[10px] font-semibold" type="button">
            Consultar
          </button>
        </div>
      </aside>
    </div>
  );
}

export default function EstatisticasSubpage({
  params
}: {
  params: { subpage: string };
}) {
  const config = statConfigs[params.subpage];

  if (!config) {
    notFound();
  }

  return (
    <div className="mj-model-page space-y-4">
      <div>
        <p className="mj-model-title">{config.title}</p>
        <p className="mj-model-subtitle">Leitura estatistica no mesmo padrao visual do workspace principal.</p>
      </div>

      {config.kind === "chart-table" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_11rem]">
          <section className="space-y-3">
            <GraphPlaceholder legend={config.legend} />

            {config.warnings?.length ? (
              <div className="mj-model-panel px-3 py-2 text-[10px]">
                {config.warnings.map((warning) => (
                  <p key={warning} className="mb-2 last:mb-0">
                    {warning}
                  </p>
                ))}
              </div>
            ) : null}

            {config.footerLabel ? (
              <div className="mj-model-panel px-3 py-2 text-[10px] font-semibold">
                {config.footerLabel}
              </div>
            ) : null}
          </section>

          <SummaryTable headers={config.headers} rows={config.rows} />
        </div>
      ) : null}

      {config.kind === "date-table" ? <DateTableLayout config={config} /> : null}
      {config.kind === "financial-chart" ? <FinancialLayout /> : null}
      {config.kind === "client-service" ? <ClientServiceLayout /> : null}

      {config.kind === "message" ? (
        <div className="mj-model-panel px-4 py-4 text-sm">
          {config.message}
        </div>
      ) : null}
    </div>
  );
}
