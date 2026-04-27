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
  children?: NavChild[];
};

export type NavSection = {
  id: "primary" | "secondary";
  label: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    id: "primary",
    label: "Fluxo principal",
    items: [
      { href: "/dashboard", label: "Hoje", shortLabel: "Hoje", icon: "dashboard" },
      {
        href: "/crm",
        label: "CRM",
        shortLabel: "CRM",
        icon: "people",
        children: [
          { href: "/pessoas/clientes", label: "Clientes" },
          { href: "/pessoas/adversos", label: "Adversos" },
          { href: "/pessoas/contatos-partes", label: "Contatos / Partes" }
        ]
      },
      {
        href: "/processos",
        label: "Processos",
        shortLabel: "Processos",
        icon: "processes",
        children: [
          { href: "/processos", label: "Lista" },
          { href: "/processos/ultimos-andamentos", label: "Ultimos andamentos" },
          { href: "/processos/importar-lote", label: "Importar lote" },
          { href: "/processos/lixeira", label: "Lixeira" }
        ]
      },
      {
        href: "/operacao",
        label: "Operacao",
        shortLabel: "Operacao",
        icon: "updates",
        children: [
          { href: "/agenda/compromissos", label: "Agenda" },
          { href: "/agenda/tarefas", label: "Tarefas" },
          { href: "/agenda/prazos", label: "Prazos" },
          { href: "/diario-oficial/publicacoes", label: "Publicacoes" },
          { href: "/andamentos/automaticos", label: "Monitoramento" }
        ]
      },
      {
        href: "/financeiro",
        label: "Financeiro",
        shortLabel: "Financeiro",
        icon: "financial",
        children: [
          { href: "/financeiro/despesas", label: "Despesas" },
          { href: "/financeiro/receitas", label: "Receitas" },
          { href: "/financeiro/vencimentos", label: "Vencimentos" },
          { href: "/financeiro/transferencias", label: "Transferencias" },
          { href: "/financeiro/graficos", label: "Graficos" }
        ]
      },
      { href: "/clara", label: "Clara", shortLabel: "Clara", icon: "clara" }
    ]
  },
  {
    id: "secondary",
    label: "Apoio e administracao",
    items: [
      {
        href: "/relatorios",
        label: "Relatorios",
        shortLabel: "Relatorios",
        icon: "reports",
        children: [
          { href: "/relatorios/resumo", label: "Resumo" },
          { href: "/relatorios/processos", label: "Processos" },
          { href: "/relatorios/financeiro", label: "Financeiro" }
        ]
      },
      {
        href: "/estatisticas",
        label: "Estatisticas",
        shortLabel: "Estatisticas",
        icon: "stats",
        children: [
          { href: "/estatisticas/processos", label: "Processos" },
          { href: "/estatisticas/clientes", label: "Clientes" },
          { href: "/estatisticas/financeiro", label: "Financeiro" }
        ]
      },
      {
        href: "/documentos",
        label: "Arquivos",
        shortLabel: "Arquivos",
        icon: "documents",
        children: [
          { href: "/documentos/meus-arquivos", label: "Meus arquivos" },
          { href: "/documentos/enviar-arquivos", label: "Enviar arquivos" },
          { href: "/documentos/relatorios", label: "Relatorios" }
        ]
      },
      {
        href: "/editor-de-texto",
        label: "Editor",
        shortLabel: "Editor",
        icon: "editor",
        children: [
          { href: "/editor-de-texto/meus-textos", label: "Meus textos" },
          { href: "/editor-de-texto/modelos", label: "Modelos" }
        ]
      },
      {
        href: "/equipe",
        label: "Equipe",
        shortLabel: "Equipe",
        icon: "team",
        children: [
          { href: "/equipe/advogados-equipe", label: "Advogados / Equipe" },
          { href: "/equipe/grupo-de-advogados", label: "Grupo de advogados" }
        ]
      },
      { href: "/configuracoes", label: "Configuracoes", shortLabel: "Config", icon: "agenda" }
    ]
  }
];
