export type NavChild = {
  href: string;
  label: string;
};

export type NavIconId =
  | "dashboard"
  | "processes"
  | "people"
  | "team"
  | "financial"
  | "reports"
  | "stats"
  | "officialDiary"
  | "updates"
  | "agenda"
  | "documents"
  | "clara"
  | "editor";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: NavIconId;
  description?: string;
  children?: NavChild[];
};

export type NavSection = {
  id: "primary" | "secondary";
  label: string;
  description?: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    id: "primary",
    label: "Nucleo do escritorio",
    description: "Onde o fluxo principal do produto esta se consolidando.",
    items: [
      {
        href: "/clara",
        label: "Clara",
        shortLabel: "Clara",
        icon: "clara",
        description: "Advogada digital e porta inteligente do fluxo do caso."
      },
      {
        href: "/pessoas/clientes",
        label: "Clientes",
        shortLabel: "Clientes",
        icon: "people",
        description: "Base de clientes e ponto de partida para abertura de casos."
      },
      {
        href: "/crm",
        label: "CRM",
        shortLabel: "CRM",
        icon: "people",
        description: "Entrada, relacionamento e passagem para cliente/caso.",
        children: [
          { href: "/crm/pipeline", label: "Pipeline" },
          { href: "/crm/contratos", label: "Contratos" },
          { href: "/crm/conversas", label: "Conversas" },
          { href: "/crm/conversao", label: "Conversao" }
        ]
      },
      {
        href: "/processos",
        label: "Processos",
        shortLabel: "Processos",
        icon: "processes",
        description: "Carteira juridica e contexto processual do escritorio.",
        children: [
          { href: "/processos", label: "Lista" },
          { href: "/processos/ultimos-andamentos", label: "Ultimos andamentos" },
          { href: "/processos/monitoramentos", label: "Monitoramentos" },
          { href: "/processos/lixeira", label: "Lixeira" }
        ]
      },
      {
        href: "/diario-oficial",
        label: "Diario oficial",
        shortLabel: "Diario",
        icon: "officialDiary",
        description: "Fila pratica de agenda, prazos, publicacoes e monitoramento.",
        children: [
          { href: "/diario-oficial/publicacoes", label: "Publicacoes" },
          { href: "/diario-oficial/palavras-chave", label: "Palavras-chave" },
          { href: "/diario-oficial/advogados", label: "Advogados" },
          { href: "/diario-oficial/lixeira", label: "Lixeira" }
        ]
      },
      {
        href: "/agenda",
        label: "Agenda",
        shortLabel: "Agenda",
        icon: "agenda",
        description: "Compromissos, tarefas e prazos como execucao diaria do escritorio.",
        children: [
          { href: "/agenda/compromissos", label: "Compromissos" },
          { href: "/agenda/tarefas", label: "Tarefas" },
          { href: "/agenda/prazos", label: "Prazos" }
        ]
      },
      {
        href: "/financeiro",
        label: "Financeiro Operacional",
        shortLabel: "Financeiro",
        icon: "financial",
        description: "Receitas, despesas e leitura operacional do escritorio.",
        children: [
          { href: "/financeiro/despesas", label: "Despesas" },
          { href: "/financeiro/receitas", label: "Receitas" },
          { href: "/financeiro/vencimentos", label: "Vencimentos" },
          { href: "/financeiro/transferencias", label: "Transferencias" },
          { href: "/financeiro/graficos", label: "Graficos" }
        ]
      },
      {
        href: "/configuracoes",
        label: "Configuracoes",
        shortLabel: "Config",
        icon: "agenda",
        description: "Parametros, integracoes e governanca do workspace.",
        children: [{ href: "/configuracoes/integracoes", label: "Integracoes" }]
      }
    ]
  },
  {
    id: "secondary",
    label: "Apoio, contexto e legado",
    description: "Itens absorvidos ou reposicionados ficam fora do menu lateral principal.",
    items: []
  }
];
