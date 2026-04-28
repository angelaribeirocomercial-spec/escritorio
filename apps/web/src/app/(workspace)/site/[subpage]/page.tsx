import { WorkspaceStatePanel } from "@lexia/ui";
import { notFound } from "next/navigation";

const siteStates = {
  "paginas-do-site": {
    title: "Criador de site indisponivel",
    description:
      "Esta area depende de um backend proprio para paginas publicas, permissao de clientes e publicacao do site. Como esse contrato ainda nao existe no sistema, a rota permanece bloqueada para nao simular uma criacao funcional.",
    actionHref: "/dashboard",
    actionLabel: "Voltar ao dashboard"
  },
  "banco-de-imagens": {
    title: "Banco de imagens indisponivel",
    description:
      "O banco de imagens do site precisa de armazenamento e catalogo especificos antes de aceitar uploads. Use Documentos para arquivos operacionais enquanto essa vertical nao estiver implementada.",
    actionHref: "/documentos/meus-arquivos",
    actionLabel: "Abrir documentos"
  },
  email: {
    title: "E-mail do site indisponivel",
    description:
      "O acesso aos e-mails do site depende de uma integracao externa configurada por tenant. Sem esse conector, a tela fica em estado controlado em vez de exibir uma caixa de e-mail ficticia.",
    actionHref: "/agenda/tarefas",
    actionLabel: "Abrir tarefas"
  },
  configuracoes: {
    title: "Configuracoes do site indisponiveis",
    description:
      "Cores, logotipo, scripts e WhatsApp do site so devem ser editaveis depois que existir persistencia real para a vertical de site. Esta rota foi bloqueada para evitar salvar preferencias que nao seriam aplicadas.",
    actionHref: "/configuracoes",
    actionLabel: "Abrir configuracoes gerais"
  }
} as const;

export default function SiteSubpage({
  params
}: {
  params: { subpage: string };
}) {
  const state = siteStates[params.subpage as keyof typeof siteStates];

  if (!state) {
    notFound();
  }

  return (
    <WorkspaceStatePanel
      actionHref={state.actionHref}
      actionLabel={state.actionLabel}
      description={state.description}
      title={state.title}
      tone="warning"
    />
  );
}
