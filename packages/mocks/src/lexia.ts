import { LexiaResponseFixture } from "@lexia/domain";

export const lexiaFixtures: readonly LexiaResponseFixture[] = [
  {
    id: "lexia-dashboard",
    contextKey: "dashboard",
    title: "Leitura executiva da carteira",
    mode: "operacional",
    prompt: "LexIA, resuma os gargalos mais urgentes da operacao bancaria desta semana.",
    contextBasis: [
      "clientes em espera documental",
      "tarefas urgentes da carteira",
      "contratos ja analisados",
      "prazos internos proximos"
    ],
    mainConclusion:
      "A operacao esta concentrada em pendencias documentais e tarefas urgentes ligadas a tutela e definicao de tese.",
    facts: [
      "Existem clientes aguardando documentacao complementar.",
      "As tarefas mais sensiveis estao ligadas a revisional e negativacao indevida.",
      "Os contratos mais relevantes ja possuem leitura juridica inicial."
    ],
    recommendations: [
      "Priorizar a fila urgente antes de abrir novos fluxos.",
      "Usar a base documental analisada para acelerar pecas e atualizacoes.",
      "Acionar o time para reduzir casos travados por documento faltante."
    ],
    nextActions: [
      "Abrir tarefas urgentes",
      "Revisar clientes sem atualizacao",
      "Gerar resumo executivo da semana"
    ],
    cautionLabel: "Sugestoes operacionais devem ser validadas pelo responsavel do escritorio."
  },
  {
    id: "lexia-clientes",
    contextKey: "clientes",
    title: "Triagem e relacionamento juridico",
    mode: "atendimento",
    prompt: "LexIA, me diga quais clientes exigem acao imediata e o que esta faltando.",
    contextBasis: [
      "status de atendimento",
      "score de viabilidade",
      "documentos enviados",
      "historico do cliente"
    ],
    mainConclusion:
      "Os clientes com documentacao pendente devem ser tratados antes de qualquer aprofundamento juridico adicional.",
    facts: [
      "Ha cliente aguardando documentos criticos para robustez probatoria.",
      "Os clientes ativos com contrato assinado ja possuem contexto suficiente para acelerar a fase seguinte."
    ],
    recommendations: [
      "Reforcar checklist documental dos casos travados.",
      "Registrar atualizacao clara ao cliente apos cada marco interno."
    ],
    nextActions: [
      "Listar documentos faltantes",
      "Montar atualizacao ao cliente",
      "Abrir triagem de novo lead"
    ],
    cautionLabel: "A triagem da IA e sugestiva e nao substitui validacao juridica."
  },
  {
    id: "lexia-casos",
    contextKey: "casos",
    title: "Leitura estrategica do caso",
    mode: "analise",
    prompt: "LexIA, resuma o caso ativo e me diga os pontos fortes, riscos e proximo passo.",
    contextBasis: [
      "tipo de demanda",
      "banco reu",
      "fase processual",
      "tese atual",
      "documentos e tarefas vinculadas"
    ],
    mainConclusion:
      "O caso possui aderencia clara a tese principal, mas a qualidade da execucao depende da consolidacao documental e do timing da proxima medida.",
    facts: [
      "Os documentos vinculados sustentam a narrativa central do caso.",
      "As tarefas abertas indicam que a proxima etapa ja esta definida operacionalmente."
    ],
    recommendations: [
      "Amarrar estrategia, prova e checklist na mesma revisao.",
      "Usar o resumo executivo do caso para apoiar producao juridica."
    ],
    nextActions: [
      "Resumir processo",
      "Listar documentos faltantes",
      "Gerar estrutura da peca inicial"
    ],
    cautionLabel: "A estrategia sugerida deve ser conferida pelo advogado responsavel."
  },
  {
    id: "lexia-documentos",
    contextKey: "documentos",
    title: "Leitura documental contextual",
    mode: "analise",
    prompt: "LexIA, analise este documento bancario e destaque sinais juridicos relevantes.",
    contextBasis: [
      "tipo documental",
      "categoria e tags",
      "cliente e caso vinculados",
      "status de analise"
    ],
    mainConclusion:
      "O documento atual e util para reforcar tese, organizar prova e orientar a proxima acao juridica ou operacional.",
    facts: [
      "A classificacao documental ja indica seu papel no fluxo do caso.",
      "O vinculo com cliente e caso evita analise solta e sem uso pratico."
    ],
    recommendations: [
      "Extrair tese e pontos sensiveis antes de produzir a proxima peca.",
      "Converter leitura documental em tarefa ou resumo reaproveitavel."
    ],
    nextActions: [
      "Resumir documento",
      "Extrair tese",
      "Buscar jurisprudencia relacionada"
    ],
    cautionLabel: "A interpretacao documental precisa de conferencia humana antes de uso processual."
  },
  {
    id: "lexia-tarefas",
    contextKey: "tarefas",
    title: "Copiloto operacional do escritorio",
    mode: "operacional",
    prompt: "LexIA, organize minhas prioridades e me diga o proximo melhor passo.",
    contextBasis: [
      "status da tarefa",
      "prioridade",
      "prazo interno",
      "checklist",
      "caso vinculado"
    ],
    mainConclusion:
      "A prioridade correta e concluir o que impacta tutela, tese ou prova antes de atividades de manutencao.",
    facts: [
      "As tarefas urgentes estao conectadas a atos com impacto direto no andamento do caso.",
      "O checklist ja mostra onde a execucao travou."
    ],
    recommendations: [
      "Executar primeiro o item pendente que desbloqueia a proxima entrega juridica.",
      "Atualizar cliente apenas apos consolidar o marco interno relevante."
    ],
    nextActions: [
      "Criar checklist inicial",
      "Reordenar prioridades",
      "Montar atualizacao ao cliente"
    ],
    cautionLabel: "A organizacao sugerida deve respeitar a revisao do responsavel pela carteira."
  },
  {
    id: "lexia-workspace",
    contextKey: "lexia",
    title: "Workspace dedicado da LexIA",
    mode: "producao_juridica",
    prompt: "Clara, consolide analise, estrategia e proximas acoes do escritorio bancario.",
    contextBasis: [
      "tenant atual",
      "objetos juridicos ativos",
      "modos de atuacao",
      "historico recente"
    ],
    mainConclusion:
      "A LexIA deve operar como camada de apoio contextual, conectando atendimento, analise, producao e operacao sem perder rastreabilidade.",
    facts: [
      "Os modulos do sistema ja fornecem contexto suficiente para respostas ancoradas.",
      "A mesma base pode gerar resumo, tese sugerida, tarefa e atualizacao ao cliente."
    ],
    recommendations: [
      "Acionar primeiro o modo mais aderente ao tipo de trabalho.",
      "Transformar respostas importantes em objetos reaproveitaveis do escritorio."
    ],
    nextActions: [
      "Escolher modo de atuacao",
      "Comparar documentos",
      "Gerar minuta assistida"
    ],
    cautionLabel: "Toda recomendacao juridica da IA deve ser conferida pelo advogado responsavel."
  }
];
