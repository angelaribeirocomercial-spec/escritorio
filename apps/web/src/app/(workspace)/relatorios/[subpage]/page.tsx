import { notFound } from "next/navigation";
import { WorkspaceStatePanel } from "@lexia/ui";

import { getAgendaCommitments, getProceduralDeadlines } from "@/server/services/agenda/get-agenda-workspace";
import { getAdversaries } from "@/server/services/adversaries/get-adversaries";
import { getClients } from "@/server/services/clients/get-clients";
import { formatFinancialAmount, getFinancialEntries } from "@/server/services/finance/get-financial-entries";
import { getProcesses } from "@/server/services/processes/get-processes";
import { getTasks } from "@/server/services/tasks/get-tasks";

type SelectFilter = {
  kind: "select";
  label: string;
  options: string[];
};

type InputFilter = {
  kind: "input";
  label: string;
  placeholder?: string;
};

type RadioFilter = {
  kind: "radio";
  label: string;
  options: string[];
};

type CheckboxFilter = {
  kind: "checkbox";
  label: string;
};

type FilterField = SelectFilter | InputFilter | RadioFilter | CheckboxFilter;

type ReportConfig = {
  title: string;
  submitLabel: string;
  topActions?: string[];
  summaryRows?: { label: string; value: string }[];
  emptyMessage?: string;
  emptyHeading?: string;
  filters: FilterField[];
};

type ReportSummary = {
  heading: string;
  message: string;
  rows: Array<{ label: string; value: string }>;
};

const reportConfigs: Record<string, ReportConfig> = {
  resumo: {
    title: "Relatorio resumido",
    submitLabel: "Consultar",
    filters: [
      { kind: "select", label: "Relatorio", options: ["Ultimos andamentos", "Compromissos futuros"] },
      { kind: "input", label: "Processo" },
      { kind: "input", label: "Cliente" },
      { kind: "input", label: "Advogado / Equipe" },
      { kind: "input", label: "Outras partes" },
      { kind: "input", label: "Data de inicio", placeholder: "__/__/____" },
      { kind: "input", label: "Data de termino", placeholder: "__/__/____" },
      { kind: "select", label: "Classes processuais", options: ["Todos", "Acao de cobranca", "Acao de despejo", "Acao de indenizacao", "Divorcio", "Execucao de alimentos"] },
      { kind: "select", label: "Natureza", options: ["Todos", "Civel", "Criminal", "Familia", "Nao definido", "Trabalhista"] },
      { kind: "select", label: "Forum", options: ["Todos"] },
      { kind: "select", label: "Vara", options: ["Todos"] },
      { kind: "select", label: "Comarca", options: ["Todos"] },
      { kind: "select", label: "Ordenar", options: ["Processo ascendente", "Processo descendente", "Cliente ascendente", "Cliente descendente"] },
      { kind: "select", label: "Filtro", options: ["Mostrar apenas processos ativos", "Mostrar apenas processos baixados", "Mostrar apenas processos suspensos", "Mostrar todos os processos"] },
      { kind: "select", label: "Privacidade", options: ["Exibir todas as informacoes", "Nao exibir informacoes confidenciais"] },
      { kind: "select", label: "Quantidade", options: ["1 item", "2 itens", "3 itens"] },
      { kind: "select", label: "Quantidade de processos por pagina", options: ["20 processos", "50 processos", "100 processos", "200 processos", "300 processos", "400 processos", "500 processos"] },
      { kind: "checkbox", label: "Exibir processos sem andamentos ou compromissos" },
      { kind: "radio", label: "Modo do relatorio PDF", options: ["Retrato", "Paisagem"] }
    ]
  },
  processos: {
    title: "Relatorio de processos",
    submitLabel: "Consultar",
    filters: [
      { kind: "input", label: "Processo" },
      { kind: "input", label: "Cliente" },
      { kind: "input", label: "Advogado / Equipe" },
      { kind: "input", label: "Outras partes" },
      { kind: "input", label: "Sem andamentos desde" },
      { kind: "input", label: "Data de cadastro inicial" },
      { kind: "input", label: "Data de cadastro final" },
      { kind: "input", label: "Pasta" },
      { kind: "input", label: "Controle" },
      { kind: "select", label: "Fase", options: ["Todos", "Execucao", "Inicial", "Recursal"] },
      { kind: "select", label: "Classes processuais", options: ["Todos", "Acao de cobranca", "Acao de despejo", "Acao de indenizacao", "Divorcio", "Execucao de alimentos"] },
      { kind: "select", label: "Natureza", options: ["Todos", "Civel", "Criminal", "Familia", "Nao definido", "Trabalhista"] },
      { kind: "select", label: "Forum", options: ["Todos"] },
      { kind: "select", label: "Vara", options: ["Todos"] },
      { kind: "select", label: "Comarca", options: ["Todos"] },
      { kind: "select", label: "Ordenar", options: ["Processo ascendente", "Processo descendente", "Cliente ascendente", "Cliente descendente"] },
      { kind: "select", label: "Filtro", options: ["Mostrar apenas processos ativos", "Mostrar apenas processos baixados", "Mostrar apenas processos suspensos", "Mostrar todos os processos"] },
      { kind: "select", label: "Exibir", options: ["Exibir todas as informacoes", "Nao exibir informacoes confidenciais"] },
      { kind: "checkbox", label: "Dados da parte" },
      { kind: "checkbox", label: "Telefone e e-mail das partes" },
      { kind: "select", label: "Andamento", options: ["Todos", "Apenas o ultimo", "Os 3 ultimos", "Os 5 ultimos", "Os 10 ultimos"] },
      { kind: "select", label: "Compromissos", options: ["Todos", "Apenas os futuros", "Apenas 1 ultimo e os futuros", "Os 3 ultimos e os futuros"] },
      { kind: "select", label: "Custa", options: ["Todas", "Apenas a ultima", "As 3 ultimas", "As 5 ultimas"] },
      { kind: "select", label: "Honorarios", options: ["Todos", "Apenas o ultimo", "Os 3 ultimos", "Os 5 ultimos"] },
      { kind: "select", label: "Horas trabalhadas", options: ["Todas", "Apenas a ultima", "As 3 ultimas", "As 5 ultimas"] },
      { kind: "select", label: "Prazos", options: ["Todos", "Apenas o ultimo", "Os 3 ultimos", "Os 5 ultimos"] },
      { kind: "select", label: "Publicacoes", options: ["Todas", "Apenas a ultima", "As 3 ultimas", "As 5 ultimas"] },
      { kind: "select", label: "Limitar texto da publicacao", options: ["Sim", "Nao"] },
      { kind: "select", label: "Quantidade de processos por pagina", options: ["20 processos", "50 processos", "100 processos", "200 processos", "300 processos", "400 processos", "500 processos", "1000 processos"] },
      { kind: "radio", label: "Campos personalizados", options: ["Exibir", "Ocultar"] }
    ]
  },
  financeiro: {
    title: "Relatorio financeiro",
    submitLabel: "Ver relatorio",
    topActions: ["Imprimir", "Editor de relatorios"],
    summaryRows: [
      { label: "Periodo", value: "01/03/2026 a 31/03/2026" },
      { label: "Situacao", value: "Em aberto e realizadas" }
    ],
    emptyMessage: "Sem dados para a filtragem atual.",
    filters: [
      { kind: "select", label: "Tipo de Relatorio", options: ["Manual"] },
      { kind: "select", label: "Relatorio", options: ["Planilha de receitas e despesas", "Planilha de despesas", "Planilha de receitas", "Extrato de receitas e despesas"] },
      { kind: "select", label: "Conta", options: ["Todas as contas", "Conta Principal"] },
      { kind: "select", label: "Analise por", options: ["Data do movimento", "Data do pagamento"] },
      { kind: "select", label: "Situacao", options: ["Todas", "Somente em aberto", "Somente realizadas"] },
      { kind: "select", label: "Categoria", options: ["Todas", "Impostos", "Infra-estrutura", "Recebimentos", "Transferencias"] },
      { kind: "select", label: "Subcategoria", options: ["Todas", "Aluguel", "IPTU", "Pensao alimenticia", "Transferencia"] },
      { kind: "input", label: "Periodo inicial", placeholder: "01/03/2026" },
      { kind: "input", label: "Periodo final", placeholder: "31/03/2026" },
      { kind: "checkbox", label: "Incluir transferencias no relatorio" }
    ]
  },
  sms: {
    title: "Relatorio de torpedos SMS",
    submitLabel: "Consultar",
    emptyHeading: "Torpedos SMS",
    emptyMessage: "Nenhum torpedo foi encontrado para o periodo informado.",
    filters: [
      { kind: "select", label: "Periodo", options: ["Todos os periodos", "Apenas deste mes", "Indicar o periodo"] },
      { kind: "input", label: "De", placeholder: "__/__/____" },
      { kind: "input", label: "Ate", placeholder: "__/__/____" }
    ]
  },
  emails: {
    title: "Relatorio de e-mails enviados",
    submitLabel: "Consultar",
    emptyHeading: "E-mails",
    emptyMessage: "Nenhum e-mail foi enviado no intervalo selecionado.",
    filters: [
      { kind: "input", label: "Data de inicio", placeholder: "__/__/____" },
      { kind: "input", label: "Data de termino", placeholder: "__/__/____" }
    ]
  },
  custas: {
    title: "Relatorio de custas",
    submitLabel: "Consultar",
    filters: [
      { kind: "input", label: "Cliente:" },
      { kind: "select", label: "Processo:", options: ["Todos"] },
      { kind: "select", label: "Filtro:", options: ["Mostrar apenas processos ativos", "Mostrar apenas processos baixados", "Mostrar todos os processos"] },
      { kind: "select", label: "Exibir:", options: ["Exibir todas as informacoes", "Nao exibir informacoes confidenciais"] },
      { kind: "select", label: "Situacao:", options: ["Tudo", "Somente valores em aberto", "Somente valores quitados"] },
      { kind: "select", label: "Periodo:", options: ["Todos os periodos", "Apenas deste mes", "Indicar o periodo"] },
      { kind: "input", label: "De:" },
      { kind: "input", label: "Ate:" }
    ]
  },
  honorarios: {
    title: "Relatorio de honorarios",
    submitLabel: "Consultar",
    filters: [
      { kind: "select", label: "Cliente", options: ["Todos"] },
      { kind: "select", label: "Advogado", options: ["Todos"] },
      { kind: "select", label: "Filtro", options: ["Mostrar apenas processos ativos", "Mostrar apenas processos suspensos", "Mostrar apenas processos baixados", "Mostrar todos os processos"] },
      { kind: "select", label: "Exibir", options: ["Exibir todas as informacoes", "Nao exibir informacoes confidenciais"] },
      { kind: "select", label: "Conta", options: ["Todas", "Conta Principal"] },
      { kind: "select", label: "Situacao", options: ["Tudo", "Somente valores em aberto", "Somente valores quitados"] },
      { kind: "select", label: "Periodo:", options: ["Todos os periodos", "Apenas deste mes", "Indicar o periodo"] },
      { kind: "input", label: "De:" },
      { kind: "input", label: "Ate:" },
      { kind: "select", label: "Analise por", options: ["Data do movimento"] }
    ]
  },
  compromissos: {
    title: "Relatorio de compromissos",
    submitLabel: "Consultar",
    filters: [
      { kind: "select", label: "Cliente", options: ["Todos"] },
      { kind: "select", label: "Advogado", options: ["Todos"] },
      { kind: "select", label: "Classificacao", options: ["Todos", "Audiencia"] },
      { kind: "select", label: "Ordenacao", options: ["Data ascendente", "Data descendente"] },
      { kind: "select", label: "Periodo", options: ["Compromissos do mes", "Indicar o periodo"] },
      { kind: "input", label: "De" },
      { kind: "input", label: "Ate" }
    ]
  },
  tarefas: {
    title: "Relatorio de tarefas",
    submitLabel: "Consultar",
    filters: [
      { kind: "select", label: "Responsavel:", options: ["Todos"] },
      { kind: "select", label: "Filtro:", options: ["Somente pendentes", "Somente finalizadas", "Todas"] },
      { kind: "select", label: "Tipo:", options: ["Somente internas", "Somente externas", "Todas"] },
      { kind: "select", label: "Ordenacao:", options: ["Crescente", "Decrescente"] },
      { kind: "select", label: "Periodo:", options: ["Tarefas do mes", "Indicar o periodo"] },
      { kind: "input", label: "De" },
      { kind: "input", label: "Ate" }
    ]
  },
  prazos: {
    title: "Relatorio de prazos",
    submitLabel: "Consultar",
    filters: [
      { kind: "select", label: "Advogado:", options: ["Todos"] },
      { kind: "select", label: "Filtrar por:", options: ["Data do prazo", "Data interna"] },
      { kind: "select", label: "Periodo:", options: ["Prazos do mes", "Indicar o periodo"] },
      { kind: "input", label: "De:" },
      { kind: "input", label: "Ate:" },
      { kind: "select", label: "Prazo atendido?", options: ["Todos", "Sim", "Nao"] }
    ]
  },
  pessoas: {
    title: "Relatorio de pessoas",
    submitLabel: "Consultar",
    filters: [{ kind: "select", label: "Tipo de cadastro:", options: ["Todos", "Advogado", "Advogado adverso", "Adverso", "Cliente", "Contato / Parte", "Estagiario", "Secretario", "Outros"] }]
  }
};

const lightSurfaceStyle = {
  background: "var(--surface-1)",
  borderColor: "var(--surface-border)",
  color: "hsl(var(--foreground))"
} as const;

function ClipboardEmpty({ heading, message }: { heading?: string; message?: string }) {
  return (
    <div className="flex min-h-[16rem] flex-col items-center justify-center text-center">
      <svg aria-hidden="true" className="h-24 w-24" fill="none" viewBox="0 0 96 96">
        <path d="M35 18h26m-18-6h10a5 5 0 0 1 5 5v4H38v-4a5 5 0 0 1 5-5Zm-9 12h30a8 8 0 0 1 8 8v42a8 8 0 0 1-8 8H34a8 8 0 0 1-8-8V32a8 8 0 0 1 8-8Z" stroke="rgba(203,213,225,0.85)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      </svg>
      <p className="mt-4 text-3xl font-semibold" style={{ color: "rgba(203,213,225,0.9)" }}>
        {heading ?? "Relatorios"}
      </p>
      <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
        {message ?? "Defina suas configuracoes para refinar a busca."}
      </p>
    </div>
  );
}

function renderFilter(field: FilterField) {
  if (field.kind === "select") {
    return (
      <div key={field.label} className="space-y-1.5">
        <label className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
          {field.label}
        </label>
        <select className="reference-search-input w-full px-3 py-2 text-xs outline-none" style={lightSurfaceStyle}>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.kind === "input") {
    return (
      <div key={field.label} className="space-y-1.5">
        <label className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
          {field.label}
        </label>
        <input
          className="reference-search-input w-full px-3 py-2 text-xs outline-none placeholder:text-slate-400"
          placeholder={field.placeholder ?? ""}
          style={lightSurfaceStyle}
          type="text"
        />
      </div>
    );
  }

  if (field.kind === "radio") {
    return (
      <div key={field.label} className="space-y-1.5">
        <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
          {field.label}
        </p>
        <div className="space-y-1.5">
          {field.options.map((option, index) => (
            <label key={option} className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <input defaultChecked={index === 0} name={field.label} type="radio" />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <label key={field.label} className="flex items-start gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
      <input className="mt-0.5" type="checkbox" />
      <span>{field.label}</span>
    </label>
  );
}

async function getReportSummary(subpage: string): Promise<ReportSummary> {
  if (subpage === "financeiro" || subpage === "honorarios" || subpage === "custas") {
    const entries = await getFinancialEntries();
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const open = entries.filter((entry) => entry.status === "open").length;

    return {
      heading: "Resumo financeiro real",
      message: `${entries.length} lancamento(s) financeiro(s) encontrado(s) no tenant ativo.`,
      rows: [
        { label: "Lancamentos", value: `${entries.length}` },
        { label: "Em aberto", value: `${open}` },
        { label: "Valor total", value: formatFinancialAmount(total) }
      ]
    };
  }

  if (subpage === "processos" || subpage === "resumo") {
    const processes = await getProcesses();

    return {
      heading: "Resumo processual real",
      message: `${processes.length} processo(s) encontrado(s) no tenant ativo.`,
      rows: [
        { label: "Processos", value: `${processes.length}` },
        { label: "Ativos", value: `${processes.filter((item) => item.status === "active").length}` },
        { label: "Monitorados", value: `${processes.filter((item) => item.monitoringMode !== "manual").length}` }
      ]
    };
  }

  if (subpage === "compromissos") {
    const commitments = await getAgendaCommitments();
    return {
      heading: "Resumo de compromissos real",
      message: `${commitments.length} compromisso(s) encontrado(s) no tenant ativo.`,
      rows: [
        { label: "Compromissos", value: `${commitments.length}` },
        { label: "Com cliente", value: `${commitments.filter((item) => item.clientId).length}` }
      ]
    };
  }

  if (subpage === "tarefas") {
    const tasks = await getTasks();
    return {
      heading: "Resumo de tarefas real",
      message: `${tasks.length} tarefa(s) encontrada(s) no tenant ativo.`,
      rows: [
        { label: "Tarefas", value: `${tasks.length}` },
        { label: "Urgentes", value: `${tasks.filter((item) => item.priority === "urgent").length}` },
        { label: "Pendentes", value: `${tasks.filter((item) => item.status !== "done").length}` }
      ]
    };
  }

  if (subpage === "prazos") {
    const deadlines = await getProceduralDeadlines();
    return {
      heading: "Resumo de prazos real",
      message: `${deadlines.length} prazo(s) encontrado(s) no tenant ativo.`,
      rows: [
        { label: "Prazos", value: `${deadlines.length}` },
        { label: "Alta severidade", value: `${deadlines.filter((item) => item.severity === "high").length}` }
      ]
    };
  }

  if (subpage === "pessoas") {
    const [clients, adversaries] = await Promise.all([getClients(), getAdversaries()]);
    return {
      heading: "Resumo de pessoas real",
      message: `${clients.length + adversaries.length} pessoa(s) encontrada(s) no tenant ativo.`,
      rows: [
        { label: "Clientes", value: `${clients.length}` },
        { label: "Adversos", value: `${adversaries.length}` }
      ]
    };
  }

  return {
    heading: "Relatorio configurado",
    message: "Este relatorio ainda nao possui agregador especifico, mas usa a configuracao real da rota.",
    rows: []
  };
}

export default async function RelatoriosSubpage({
  params
}: {
  params: { subpage: string };
}) {
  const page = reportConfigs[params.subpage];

  if (!page) {
    notFound();
  }

  let summary: ReportSummary | null = null;
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    summary = await getReportSummary(params.subpage);
  } catch {
    state = {
      title: "Relatorio indisponivel no momento",
      description:
        "Nao foi possivel montar o resumo real deste relatorio. Valide Supabase, migrations e seed do tenant ativo.",
      tone: "danger"
    };
  }

  return (
    <div className="space-y-4">
      <p className="text-[2rem] font-semibold" style={{ color: "hsl(var(--foreground))" }}>
        {page.title}
      </p>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="reference-list-shell px-4 py-4">
          {state ? (
            <WorkspaceStatePanel
              description={state.description}
              title={state.title}
              tone={state.tone ?? "neutral"}
            />
          ) : null}

          {page.topActions ? (
            <div className="mb-3 flex justify-end gap-2">
              <button className="reference-action-secondary px-4 py-2 text-xs font-semibold" type="button">
                {page.topActions[0]}
              </button>
              <button className="reference-action-primary px-4 py-2 text-xs font-semibold" type="button">
                {page.topActions[1]}
              </button>
            </div>
          ) : null}

          {page.summaryRows ? (
            <div className="mb-4 border" style={{ borderColor: "rgba(226,232,240,0.9)" }}>
              <div className="border-b px-4 py-2 text-center text-xs font-semibold uppercase" style={{ borderColor: "rgba(226,232,240,0.9)" }}>
                Planilha de receitas e despesas
              </div>
              {page.summaryRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[7rem_1fr] border-b px-4 py-2 text-xs last:border-b-0" style={{ borderColor: "rgba(226,232,240,0.9)" }}>
                  <span className="font-semibold" style={{ color: "var(--text-muted)" }}>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          ) : null}

          {!state && summary ? (
            <div className="flex min-h-[16rem] flex-col justify-center">
              <p className="text-3xl font-semibold" style={{ color: "rgba(203,213,225,0.9)" }}>
                {summary.heading}
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                {summary.message}
              </p>
              {summary.rows.length ? (
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {summary.rows.map((row) => (
                    <div key={row.label} className="rounded-[10px] border px-4 py-3" style={lightSurfaceStyle}>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{row.label}</p>
                      <p className="mt-1 text-lg font-semibold">{row.value}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {!state && !summary ? <ClipboardEmpty heading={page.emptyHeading} message={page.emptyMessage} /> : null}
        </section>

        <aside className="reference-list-shell px-3 py-3">
          <form className="space-y-3" method="get">
            {page.filters.map((field) => renderFilter(field))}
            <button className="reference-action-primary mt-2 px-4 py-2 text-xs font-semibold" type="submit">
              {page.submitLabel}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
