import { notFound } from "next/navigation";
import { WorkspaceStatePanel } from "@lexia/ui";

import { getClients } from "@/server/services/clients/get-clients";
import { formatFinancialAmount, getFinancialEntries } from "@/server/services/finance/get-financial-entries";
import { getProceduralUpdates } from "@/server/services/procedural-updates/get-procedural-updates";
import { getProcesses } from "@/server/services/processes/get-processes";
import { getTasks } from "@/server/services/tasks/get-tasks";

const statTitles: Record<string, string> = {
  "abertura-de-processos": "Data de abertura e processos",
  "andamentos-atrasados": "Andamentos atrasados",
  "andamentos-automaticos": "Andamentos Automaticos",
  "andamentos-dos-processos": "Andamentos dos processos",
  "atendimento-clientes": "Atendimento por clientes",
  "cadastro-de-processos": "Data de cadastro de processos no sistema",
  clientes: "Clientes",
  "fase-do-processo": "Processos e fase",
  financeiro: "Grafico financeiro",
  "natureza-da-acao": "Processos e naturezas",
  personalizados: "Campos personalizados",
  processos: "Clientes e processos",
  "ultimos-andamentos": "Ultimos andamentos dos processos"
};

type StatRow = {
  label: string;
  value: string;
  detail: string;
};

async function getStatisticRows(subpage: string): Promise<StatRow[]> {
  if (subpage === "financeiro") {
    const entries = await getFinancialEntries();
    const income = entries.filter((entry) => entry.kind === "income").reduce((sum, entry) => sum + entry.amount, 0);
    const expenses = entries.filter((entry) => entry.kind === "expense").reduce((sum, entry) => sum + entry.amount, 0);

    return [
      { label: "Receitas", value: formatFinancialAmount(income), detail: "Lancamentos de receita persistidos" },
      { label: "Despesas", value: formatFinancialAmount(expenses), detail: "Lancamentos de despesa persistidos" },
      { label: "Saldo", value: formatFinancialAmount(income - expenses), detail: "Receitas menos despesas" }
    ];
  }

  if (subpage === "clientes" || subpage === "atendimento-clientes") {
    const clients = await getClients();
    const active = clients.filter((client) => client.serviceStatus === "active").length;
    const waiting = clients.filter((client) => client.serviceStatus === "waiting-docs").length;

    return [
      { label: "Clientes", value: `${clients.length}`, detail: "Total de clientes do tenant" },
      { label: "Ativos", value: `${active}`, detail: "Clientes em atendimento ativo" },
      { label: "Aguardando documentos", value: `${waiting}`, detail: "Clientes com gargalo documental" }
    ];
  }

  if (subpage.includes("andamentos")) {
    const [updates, processes] = await Promise.all([getProceduralUpdates(), getProcesses()]);
    const high = updates.filter((update) => update.criticality === "high").length;

    return [
      { label: "Andamentos", value: `${updates.length}`, detail: "Movimentos processuais persistidos" },
      { label: "Criticos", value: `${high}`, detail: "Andamentos com criticidade alta" },
      { label: "Processos monitorados", value: `${processes.filter((processItem) => processItem.monitoringMode !== "manual").length}`, detail: "Monitoramento OAB ou tribunal" }
    ];
  }

  if (subpage === "personalizados") {
    const tasks = await getTasks();
    return [
      { label: "Campos operacionais", value: `${tasks.length}`, detail: "Tarefas usadas como indicadores customizados" },
      { label: "Urgentes", value: `${tasks.filter((task) => task.priority === "urgent").length}`, detail: "Tarefas com prioridade urgente" }
    ];
  }

  const [processes, clients] = await Promise.all([getProcesses(), getClients()]);
  return [
    { label: "Processos", value: `${processes.length}`, detail: "Total de processos do tenant" },
    { label: "Clientes", value: `${clients.length}`, detail: "Total de clientes vinculados" },
    { label: "Ativos", value: `${processes.filter((processItem) => processItem.status === "active").length}`, detail: "Processos em status ativo" }
  ];
}

export default async function EstatisticasSubpage({
  params
}: {
  params: { subpage: string };
}) {
  const title = statTitles[params.subpage];

  if (!title) {
    notFound();
  }

  let rows: StatRow[] = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    rows = await getStatisticRows(params.subpage);
  } catch {
    state = {
      title: "Estatisticas indisponiveis no momento",
      description:
        "Nao foi possivel calcular estatisticas reais. Valide Supabase, migrations e seed do tenant ativo.",
      tone: "danger"
    };
  }

  return (
    <div className="mj-model-page space-y-4">
      <div>
        <p className="mj-model-title">{title}</p>
        <p className="mj-model-subtitle">Leitura estatistica baseada na base real do tenant.</p>
      </div>

      {state ? (
        <WorkspaceStatePanel
          description={state.description}
          title={state.title}
          tone={state.tone ?? "neutral"}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-3">
          {rows.map((row) => (
            <article key={row.label} className="mj-model-panel px-4 py-4">
              <p className="text-[13px] text-slate-400">{row.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{row.value}</p>
              <p className="mt-2 text-[12px] leading-5 text-slate-400">{row.detail}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
