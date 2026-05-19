"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const contextualFixtures = {
  crm: {
    eyebrow: "Contexto atual",
    title: "Leitura de entrada e relacionamento",
    prompt: "Resuma os gargalos mais urgentes da jornada de CRM desta semana.",
    conclusion:
      "A entrada concentra urgencia em triagem, pendencias documentais e passagem para cliente e caso ativo.",
    actions: ["Ver triagem pendente", "Revisar clientes travados", "Gerar resumo da semana"]
  },
  clientes: {
    eyebrow: "Contexto atual",
    title: "Triagem e relacionamento juridico",
    prompt: "Me diga quais clientes exigem acao imediata e o que esta faltando.",
    conclusion:
      "Os clientes com pendencia documental devem ser priorizados antes de qualquer aprofundamento juridico adicional.",
    actions: ["Listar documentos faltantes", "Montar atualizacao ao cliente", "Abrir triagem"]
  },
  casos: {
    eyebrow: "Contexto atual",
    title: "Leitura estrategica do caso",
    prompt: "Resuma o caso ativo e me diga os pontos fortes, riscos e proximo passo.",
    conclusion:
      "O caso em foco ja tem direcao estrategica, e a decisao principal agora e alinhar prova, tarefa e peca.",
    actions: ["Resumir processo", "Listar documentos faltantes", "Gerar estrutura da peca"]
  },
  documentos: {
    eyebrow: "Contexto atual",
    title: "Leitura documental contextual",
    prompt: "Analise este documento bancario e destaque sinais juridicos relevantes.",
    conclusion:
      "O documento atual pode ser convertido em tese, resumo ou suporte direto para a proxima medida juridica.",
    actions: ["Resumir documento", "Extrair tese", "Buscar jurisprudencia"]
  },
  processos: {
    eyebrow: "Contexto atual",
    title: "Leitura processual da carteira",
    prompt: "Aponte os processos que exigem acao prioritaria e o proximo passo operacional.",
    conclusion:
      "A leitura processual deve destacar risco imediato, ultimos andamentos e tarefas que destravam a carteira.",
    actions: ["Priorizar processos ativos", "Revisar ultimos andamentos", "Abrir filtros de risco"]
  },
  pessoas: {
    eyebrow: "Contexto atual",
    title: "Panorama de clientes, adversos e partes",
    prompt: "Mostre quem precisa de contato ou complemento de contexto nesta base de pessoas.",
    conclusion:
      "A organizacao de pessoas deve deixar claro quem precisa de retorno, documentacao ou vinculacao adicional.",
    actions: ["Listar clientes travados", "Revisar adversos", "Montar atualizacao ao cliente"]
  },
  equipe: {
    eyebrow: "Contexto atual",
    title: "Distribuicao operacional da equipe",
    prompt: "Resuma a carga atual da equipe e onde ha gargalo de execucao.",
    conclusion:
      "A alocacao de advogados e grupos deve evidenciar filas criticas e capacidade disponivel para a semana.",
    actions: ["Ver carga por advogado", "Revisar grupos ativos", "Redistribuir demandas"]
  },
  agenda: {
    eyebrow: "Contexto atual",
    title: "Comando temporal da operacao",
    prompt: "Mostre os compromissos, tarefas e prazos que exigem acao imediata.",
    conclusion:
      "A agenda deve funcionar como central de execucao, separando o que vence hoje do que precisa de preparacao.",
    actions: ["Filtrar por responsavel", "Listar prazos de hoje", "Abrir compromissos"]
  },
  financeiro: {
    eyebrow: "Contexto atual",
    title: "Leitura financeira do escritorio",
    prompt: "Resuma receitas, despesas e vencimentos que merecem atencao imediata.",
    conclusion:
      "O financeiro precisa destacar recebimentos em aberto, despesas relevantes e previsao de caixa da operacao.",
    actions: ["Ver receitas em aberto", "Revisar despesas", "Abrir vencimentos"]
  },
  relatorios: {
    eyebrow: "Contexto atual",
    title: "Orquestracao de relatorios",
    prompt: "Sugira qual relatorio operacional gera a melhor leitura para esta analise.",
    conclusion:
      "A escolha do relatorio certo acelera diagnostico de carteira, produtividade e pontos de risco financeiro.",
    actions: ["Abrir resumo", "Comparar processos", "Exportar leitura operacional"]
  },
  estatisticas: {
    eyebrow: "Contexto atual",
    title: "Indicadores da operacao bancaria",
    prompt: "Mostre os indicadores que ajudam a localizar gargalos e atraso na carteira.",
    conclusion:
      "As estatisticas devem evidenciar atrasos, concentracao por fase e sinais de estrangulamento da operacao.",
    actions: ["Ver andamentos atrasados", "Abrir indicadores por fase", "Comparar carteira"]
  },
  diarioOficial: {
    eyebrow: "Contexto atual",
    title: "Triagem de publicacoes oficiais",
    prompt: "Resuma as publicacoes que exigem leitura imediata e conversao em tarefa.",
    conclusion:
      "A triagem do Diario Oficial deve destacar urgencia, vinculo processual e encaminhamento operacional.",
    actions: ["Revisar publicacoes", "Abrir palavras-chave", "Gerar tarefa"]
  },
  site: {
    eyebrow: "Contexto atual",
    title: "Operacao institucional do site",
    prompt: "Resuma o que precisa de ajuste nas paginas, imagens e configuracoes do site.",
    conclusion:
      "O modulo institucional deve orientar publicacao, consistencia visual e configuracoes de comunicacao.",
    actions: ["Revisar paginas", "Abrir banco de imagens", "Validar configuracoes"]
  },
  editor: {
    eyebrow: "Contexto atual",
    title: "Producao textual do escritorio",
    prompt: "Sugira o melhor ponto de partida para textos e modelos desta frente.",
    conclusion:
      "O editor deve acelerar a producao de textos operacionais e modelos recorrentes do escritorio bancario.",
    actions: ["Abrir meus textos", "Revisar modelos", "Gerar minuta assistida"]
  },
  tarefas: {
    eyebrow: "Contexto atual",
    title: "Copiloto operacional do escritorio",
    prompt: "Organize minhas prioridades e me diga o proximo melhor passo.",
    conclusion:
      "A prioridade correta e concluir o item que desbloqueia tutela, tese ou robustez probatoria.",
    actions: ["Reordenar prioridades", "Criar checklist", "Atualizar cliente"]
  },
  clara: {
    eyebrow: "Workspace dedicado",
    title: "Clara contextual em modo premium",
    prompt: "Clara, consolide analise, estrategia e proximas acoes do escritorio bancario.",
    conclusion:
      "A Clara deve atuar como camada contextual integrada ao fluxo do escritorio, e nao como chat solto.",
    actions: ["Trocar modo", "Comparar documentos", "Gerar minuta assistida"]
  }
} as const;

function getContextKey(pathname: string) {
  if (pathname.startsWith("/dashboard")) return "crm";
  if (pathname.startsWith("/crm")) return "crm";
  if (pathname.startsWith("/processos")) return "processos";
  if (pathname.startsWith("/pessoas")) return "pessoas";
  if (pathname.startsWith("/equipe")) return "equipe";
  if (pathname.startsWith("/agenda")) return "agenda";
  if (pathname.startsWith("/financeiro")) return "financeiro";
  if (pathname.startsWith("/relatorios")) return "relatorios";
  if (pathname.startsWith("/estatisticas")) return "estatisticas";
  if (pathname.startsWith("/diario-oficial")) return "diarioOficial";
  if (pathname.startsWith("/andamentos")) return "processos";
  if (pathname.startsWith("/site")) return "site";
  if (pathname.startsWith("/editor-de-texto")) return "editor";
  if (pathname.startsWith("/clientes")) return "pessoas";
  if (pathname.startsWith("/casos")) return "processos";
  if (pathname.startsWith("/documentos")) return "documentos";
  if (pathname.startsWith("/tarefas")) return "agenda";
  return "clara";
}

export function ClaraSideCopilot() {
  const pathname = usePathname();
  const context = contextualFixtures[getContextKey(pathname)];

  return (
    <section className="workspace-panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="workspace-kicker">Clara Hub</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{context.title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            {context.conclusion}
          </p>
        </div>
        <Link
          className="detail-link-button px-4 py-3 text-sm font-semibold"
          href="/clara"
        >
          Abrir na Clara
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {context.actions.map((action) => (
          <span
            key={action}
            className="rounded-[4px] border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300"
          >
            {action}
          </span>
        ))}
      </div>
    </section>
  );
}
