# PRD Mestre - Escritorio Bancario com Clara

**Data:** 2026-04-28  
**Status:** Proposto por `@pm`  
**Precedencia:** Este documento passa a ser a autoridade principal do produto. Em caso de conflito, ele prevalece sobre documentacao herdada, slices tecnicos antigos e navegacoes intermediarias que nao reflitam esta visao.  
**Base:**  
- `docs/product/lexia-bancaria/reestruturacao-produto-canonica.md`
- `docs/handoffs/2026-04-27-atlas-reestruturacao-produto.md`
- `docs/handoffs/2026-04-27-analyst-gap-visao-vs-sistema.md`
- `docs/handoffs/2026-04-27-revisao-alinhamento-execucao.md`
- consolidacao analitica da conversa com a usuaria em 2026-04-27 e 2026-04-28

---

## 1. Resumo executivo

O produto deve evoluir para um escritorio de advocacia bancario:

1. automatizado
2. intuitivo
3. simples de usar
4. operacionalmente guiado por uma agente juridica digital chamada `Clara`

O objetivo nao e ter um conjunto de modulos soltos. O objetivo e ter um fluxo unico que conduza o caso desde a entrada do cliente ate a distribuicao e acompanhamento processual, com rastreabilidade, integracoes reais, revisao humana e reducao de erro operacional.

Este PRD redefine a autoridade do produto para impedir recontaminacao por decisoes antigas, nomenclaturas herdadas e superficies legadas que ja nao representam o sistema desejado.

---

## 2. Problema de produto

O sistema em andamento acumulou:

1. modulos herdados com semantica antiga
2. navegacao parcial que nao representa o fluxo real do escritorio
3. superficies de UI com botoes, cards e controles sem acao final coerente
4. residuos de identidade e naming legado
5. implementacoes tecnicas parciais antes da consolidacao plena da direcao do produto

Resultado:

1. a `Clara` ficou confusa e sobrecarregada
2. o `Cliente` ainda nao e o cockpit definitivo do caso
3. o `CRM` ainda nao existe como modulo de negocio real
4. o onboarding do caso ainda nao entrega o fluxo juridico completo
5. o sistema exige correcoes reativas manuais em vez de obedecer a uma espinha dorsal clara

---

## 3. Visao do produto

O escritorio deve operar assim:

1. o lead entra pelo `CRM`
2. o lead e convertido em cliente
3. o cliente entra em `Novo atendimento bancario`
4. o caso e criado com nicho e documentos
5. o workflow correto nasce automaticamente
6. a `Clara` analisa, organiza, sugere e executa acoes reais
7. o advogado revisa e aprova o que exige validacao juridica
8. a acao e preparada, distribuida e acompanhada
9. todo o historico do caso fica centralizado na area do cliente

O sistema deve parecer um escritorio real, com fluxo juridico bancario real, e nao uma colecao de telas tecnicas.

---

## 4. Objetivos de negocio

1. reduzir friccao operacional para abrir e tocar casos bancarios
2. permitir cadastramento imediato de cliente e caso para testes reais
3. aumentar padronizacao e rastreabilidade da atuacao juridica
4. reduzir erros causados por documentos faltantes, contexto incompleto e trabalho manual fragmentado
5. estruturar a operacao para crescer por nichos sem reescrever a espinha dorsal
6. preparar o produto para trabalhar com chatbot, APIs oficiais e automacoes futuras

---

## 5. Objetivos imediatos de entrega

Prioridade imediata:

1. permitir cadastrar cliente e caso o quanto antes
2. anexar documentos dentro do fluxo de entrada
3. escolher nicho bancario
4. gerar o primeiro workflow funcional do nicho piloto
5. abrir o cockpit do cliente com situacao do caso

O nicho piloto prioritario para maturacao operacional inicial e:

1. `Revisional de contratos (veiculos)`

---

## 6. Modulos principais do produto

Os modulos principais do produto sao:

1. `Clara`
2. `CRM`
3. `Clientes`
4. `Processos`
5. `Diario oficial`
6. `Andamentos`
7. `Agenda`
8. `Financeiro`
9. `Configuracoes`

### Modulos ou areas que deixam de ser protagonistas

1. `Dashboard` vira uma home resumida do dia e nao modulo principal
2. `Arquivos` e absorvido pelo fluxo documental do cliente/caso
3. `Editor de texto` vira ferramenta contextual de peca/minuta
4. `Relatorios` e `Estatisticas` viram visoes contextuais dentro de modulos principais
5. `Pessoas` deixa de ser protagonista de navegacao
6. `Equipe` vai para administracao/configuracoes
7. `Casos` deixa de competir com `Processos`

### Legado visivel a remover

1. `Lexia` como identidade visivel do produto
2. `Site` como modulo do escritorio juridico

---

## 7. Nichos iniciais e extensibilidade

### Nichos iniciais obrigatorios

1. `Revisional de contratos (veiculos)`
2. `Fraude bancaria (consignados)`
3. `Busca e apreensao (veiculos)`

### Escopo bancario ampliado previsto

O produto deve suportar crescimento posterior para:

1. emprestimo consignado indevido
2. cartao de credito consignado / RMC
3. descontos indevidos em beneficio previdenciario
4. negativacao indevida
5. cobranca indevida de tarifas
6. renegociacao abusiva
7. superendividamento
8. cumprimento de sentenca em acoes bancarias
9. acompanhamento processual bancario
10. outros nichos de direito bancario

### Regra de extensibilidade

Novos nichos devem ser adicionados por:

1. configuracao de regras
2. templates
3. checklists
4. workflows
5. modelos de peca

Sem reescrever a espinha dorsal do sistema.

---

## 8. Novo atendimento bancario

`Novo atendimento bancario` e a entrada unica do caso.

Nao e um modulo extra de navegacao principal. E a jornada principal de criacao do caso juridico.

### Campos e blocos obrigatorios

1. identificacao do cliente
2. dados do caso
3. selecao do nicho bancario
4. anexos/documentos
5. objetivo inicial
6. observacoes iniciais

### Comportamento esperado

Ao confirmar:

1. criar cliente
2. criar caso
3. vincular documentos
4. registrar nicho
5. instanciar workflow por nicho
6. criar processo interno inicial
7. gerar checklist documental inicial
8. criar tarefas iniciais
9. redirecionar para a area do cliente

### Prioridade de implementacao

Este fluxo deve ser o primeiro caminho real e confiavel do produto para testes operacionais.

---

## 9. Area do cliente como cockpit do caso

A area do cliente e o cockpit central do escritorio.

### Estrutura alvo

1. `Resumo`
2. `Workflow`
3. `Documentos`
4. `Pecas`
5. `Processo`
6. `Andamentos`
7. `Diario oficial relacionado`
8. `Clara`
9. `Financeiro do cliente`, quando aplicavel

### O que deve ser visivel ao abrir um cliente

1. caso ativo
2. nicho do caso
3. fase atual do workflow
4. proximo passo recomendado
5. checklist documental
6. documentos presentes
7. documentos faltantes
8. pecas geradas e seus status
9. andamento processual relevante
10. historico de interacoes e execucoes da Clara

---

## 10. Workflow por nicho

O workflow deve nascer automaticamente com base no nicho selecionado.

Ele nao exige tela propria na entrada. Ele vive dentro do caso e aparece no cockpit do cliente.

### Espinha dorsal comum

1. entrada
2. triagem
3. documentacao
4. analise juridica
5. estrategia
6. peca inicial
7. revisao humana
8. distribuicao
9. acompanhamento

### Exemplo: revisional de contratos

1. cadastro concluido
2. contrato e documentos recebidos
3. leitura automatica do contrato
4. parecer tecnico inicial
5. memoria de calculo / abusividades
6. estrategia juridica
7. minuta da peticao inicial
8. revisao humana
9. distribuicao
10. acompanhamento processual

### Exemplo: fraude bancaria / consignado

1. cadastro concluido
2. extratos e provas recebidos
3. classificacao da fraude ou desconto indevido
4. checklist de prova
5. analise de urgencia
6. estrategia juridica
7. minuta da peca cabivel
8. revisao humana
9. distribuicao
10. acompanhamento

### Exemplo: busca e apreensao

1. cadastro concluido
2. contrato e notificacoes recebidos
3. analise da divida e do risco
4. revisional defensiva, se cabivel
5. estrategia e tutela
6. minuta da defesa ou acao
7. revisao humana
8. protocolo/distribuicao
9. acompanhamento

---

## 11. Clara: definicao de produto

`Clara` e uma agente juridica profissional, segura, objetiva, rastreavel e integrada ao sistema por APIs e banco de dados.

Ela nao deve ser um chat generico. Ela deve atuar como motor juridico dentro do fluxo real do escritorio.

### Objetivo da Clara

1. analisar casos de direito bancario
2. identificar documentos presentes e faltantes
3. classificar o tipo de demanda
4. sugerir estrategia juridica
5. gerar minutas e pecas com base em dados reais
6. acompanhar processos
7. resumir andamentos
8. sugerir proximos passos operacionais e juridicos
9. apontar riscos, inconsistencias e ausencia de prova
10. usar APIs oficiais e fontes publicas quando disponiveis
11. nunca inventar fatos, jurisprudencia, contratos ou dados processuais

### Papel operacional

Quando a usuaria clicar em uma sugestao da Clara, o sistema deve:

1. executar a acao real
2. registrar a execucao no caso/workflow
3. gerar o artefato correspondente
4. abrir o resultado para revisao humana quando necessario
5. manter historico e rastreabilidade

### O que a Clara pode fazer

1. analisar caso
2. gerar checklist documental
3. gerar parecer tecnico inicial
4. classificar demanda
5. sugerir estrategia
6. gerar minuta
7. resumir andamento
8. preparar proximo passo
9. organizar documentos e pendencias
10. alimentar historico do caso

### O que a Clara nao pode fazer sozinha

1. inventar fatos
2. inventar documentos
3. inventar jurisprudencia
4. inventar numero de processo
5. fingir consulta de API nao executada
6. tratar hipotese como fato
7. protocolar ou concluir juridicamente sem validacao humana final

---

## 12. Regras de ouro da Clara

1. nunca inventar fatos
2. nunca inventar documentos
3. nunca inventar jurisprudencia
4. nunca inventar numero de processo
5. nunca afirmar que consultou API se a consulta nao ocorreu
6. nunca tratar hipotese como fato confirmado
7. sempre separar fatos confirmados, pendencias e sugestoes
8. sempre informar quando faltarem dados essenciais
9. sempre apontar inconsistencias documentais
10. sempre alertar sobre risco de prova insuficiente
11. sempre trabalhar com LGPD e sigilo profissional
12. nunca pedir senha do cliente
13. sempre orientar procedimento seguro quando houver acesso sensivel
14. nunca concluir automaticamente sem validacao humana final

---

## 13. Personalidade e estilo da Clara

1. tecnico
2. claro
3. objetivo
4. profissional
5. juridico
6. sem floreios
7. sem enrolacao
8. sem linguagem robotica excessiva
9. estruturado
10. focado em escritorio real

---

## 14. Arquitetura funcional da Clara

### Camada 1 - identidade da agente

Define:

1. papel
2. limites
3. nicho
4. regras
5. formato de resposta

### Camada 2 - leitura estruturada do caso

Extrai e organiza:

1. partes
2. fatos
3. pedidos
4. documentos
5. provas
6. valores
7. datas
8. contratos
9. descontos
10. movimentacoes
11. risco juridico
12. pendencias

### Camada 3 - motor de classificacao

Classifica:

1. fraude bancaria
2. consignado indevido
3. cartao consignado / RMC
4. revisao contratual
5. busca e apreensao
6. tarifas/cobrancas
7. negativacao indevida
8. superendividamento
9. outro bancario

### Camada 4 - motor de decisao

Decide:

1. qual peca e cabivel
2. quais documentos faltam
3. se cabe tutela de urgencia
4. se cabe dano moral
5. se cabe repeticao de indebito
6. se cabe inversao do onus
7. se cabe exibicao de contrato
8. qual proximo passo e indicado
9. qual risco existe

### Camada 5 - gerador juridico

Gera:

1. analise do caso
2. checklist
3. resumo processual
4. minuta de peticao
5. sugestao de proximos passos
6. observacoes para revisao humana

### Camada 6 - revisor interno

Revisa:

1. coerencia dos fatos
2. nomes
3. datas
4. documentos mencionados
5. pedidos
6. contradicoes
7. lacunas
8. risco de alucinacao

---

## 15. Formato de resposta da Clara

### Analise de caso

1. resumo do caso
2. fatos confirmados
3. documentos encontrados
4. documentos faltantes
5. enquadramento juridico preliminar
6. riscos e inconsistencias
7. proximos passos sugeridos

### Geracao de peca

1. tipo de peca indicada
2. checklist previo
3. dados faltantes
4. estrategia juridica
5. minuta estruturada
6. pontos que exigem revisao humana

### Acompanhamento processual

1. numero do processo
2. ultimo andamento relevante
3. fase processual atual
4. prazo identificado ou ausencia de prazo
5. impacto pratico
6. proxima acao recomendada

### Checklist documental

1. tipo de acao
2. documentos presentes
3. documentos ausentes
4. grau de suficiencia probatoria
5. acao recomendada antes da peca

---

## 16. Fontes de dados e prioridade

Ordem obrigatoria:

1. dados internos do sistema
2. documentos anexados ao caso
3. modelos juridicos internos aprovados
4. checklists internos por tipo de acao
5. historico do cliente e do processo
6. APIs publicas e oficiais integradas
7. jurisprudencia e bases publicas configuradas

### Regra de divergencia

Se houver conflito entre dados internos e externos, a Clara deve apontar a divergencia com clareza.

---

## 17. Integracoes por API

### Prioridade 1 - CNJ / DataJud

Finalidades:

1. consultar metadados processuais
2. acompanhar movimentacoes
3. identificar fase processual
4. apoiar monitoramento automatico de acoes

### Prioridade 2 - Banco Central do Brasil

Finalidades:

1. consultar tarifas bancarias
2. consultar series economicas e financeiras
3. consultar indicadores uteis em revisionais
4. consultar PTAX quando aplicavel

### Prioridade 3 - STJ

Finalidades:

1. apoiar pesquisa de jurisprudencia e precedentes relevantes

### Prioridade 4 - STF

Finalidades:

1. apoiar pesquisa de temas constitucionais, repercussao geral e teses superiores

### Prioridade 5 - Consumidor.gov.br / Senacon

Finalidades:

1. inteligencia complementar sobre padroes de reclamacoes bancarias

### Regra tecnica

Todas as integracoes externas devem ser construidas por adaptadores, porque nem toda fonte publica oferece API uniforme e simples.

---

## 18. Endpoints internos

### Endpoints de dominio

1. `GET /api/clientes/:id`
2. `GET /api/casos/:id`
3. `GET /api/casos/:id/documentos`
4. `GET /api/casos/:id/checklist`
5. `GET /api/casos/:id/modelos`
6. `GET /api/processos/:numero/datajud`
7. `GET /api/bcb/tarifas?instituicao=...`
8. `GET /api/bcb/sgs?serie=...`
9. `GET /api/bcb/ptax?data=...`
10. `GET /api/jurisprudencia/stj?consulta=...`
11. `GET /api/jurisprudencia/stf?consulta=...`
12. `GET /api/consumidor/reclamacoes?empresa=...`

### Endpoints de orquestracao da Clara

1. `POST /api/clara/analisar-caso`
2. `POST /api/clara/gerar-peca`
3. `POST /api/clara/resumir-andamentos`
4. `POST /api/clara/sugerir-proximo-passo`
5. `POST /api/clara/checklist-documental`
6. `POST /api/clara/revisar-minuta`

---

## 19. Modulos de backend

### Nucleo do dominio juridico

1. clientes
2. casos
3. workflows
4. processos
5. documentos
6. pecas
7. checklists
8. tarefas
9. andamentos
10. publicacoes

### Nucleo Clara

1. resolvedor de contexto do caso
2. motor de classificacao
3. motor de decisao
4. gerador juridico
5. revisor anti-alucinacao
6. orquestrador de tarefas
7. historico e logs de execucao

### Nucleo CRM

1. leads
2. pipeline
3. origem do contato
4. follow-ups
5. contratos
6. conversas
7. conversao para cliente/caso

### Nucleo de integracoes

1. adaptador DataJud
2. adaptador Banco Central
3. adaptador STJ
4. adaptador STF
5. adaptador Consumidor.gov

### Nucleo documental

1. armazenamento editavel interno
2. versionamento
3. revisao/aprovacao
4. exportacao DOCX
5. exportacao PDF
6. impressao

---

## 20. Schema de banco de dados

Estruturas obrigatorias:

1. `clientes`
2. `casos`
3. `caso_workflows`
4. `caso_workflow_steps`
5. `documentos`
6. `documento_anexos`
7. `checklists`
8. `checklist_itens`
9. `tarefas`
10. `processos`
11. `andamentos`
12. `publicacoes`
13. `minutas`
14. `versoes_peca`
15. `modelos_internos`
16. `teses_argumentos`
17. `fontes_externas_consultadas`
18. `resultados_api`
19. `logs_execucao_clara`
20. `observacoes_revisor_humano`
21. `crm_leads`
22. `crm_pipeline_stages`
23. `crm_followups`
24. `crm_conversas`
25. `crm_contratos`

### Campos de rastreabilidade obrigatorios

1. `origem_interna`
2. `origem_documental`
3. `origem_api`
4. `inferencia_controlada`
5. `status_revisao`
6. `criado_por`
7. `atualizado_por`
8. `execution_id`
9. `source_trace`

---

## 21. Documentos minimos por tipo de caso

### Fraude bancaria

1. RG/CPF
2. comprovante de endereco
3. procuracao
4. extratos bancarios
5. prints/comprovantes do evento
6. protocolos de atendimento
7. comprovante de prejuizo

### Consignado indevido / descontos em beneficio

1. documento pessoal
2. comprovante de endereco
3. procuracao
4. extrato do beneficio
5. extrato bancario
6. historico de descontos
7. contrato, se houver
8. protocolo administrativo, se houver

### Busca e apreensao / revisional

1. contrato
2. planilha ou evolucao da divida
3. comprovantes de pagamento
4. notificacoes
5. documentos pessoais
6. comprovante de endereco
7. documentos do veiculo, quando houver

### Regra

Se faltar documento essencial, a Clara nao deve fingir completude. Ela deve parar e apontar a falta.

---

## 22. Camada anti-alucinacao

Implementacoes obrigatorias:

1. validacao de campos obrigatorios
2. checagem de documentos realmente anexados
3. marcacao de origem de cada informacao
4. distincao entre dado interno, API externa e inferencia
5. bloqueio de jurisprudencia inventada
6. bloqueio de contratos ficticios
7. bloqueio de citacoes normativas nao confirmadas
8. sinalizacao de falha de API
9. logs de consulta e logs de resposta

Toda saida da Clara deve carregar trilha interna de origem.

---

## 23. Interface da agente no sistema

A interface da Clara deve conter:

1. painel da agente
2. analise do caso
3. documentos
4. checklist
5. APIs consultadas
6. log de consultas
7. minuta gerada
8. revisao humana
9. proximos passos
10. acompanhamento processual
11. historico de interacoes
12. configuracoes da agente
13. cadastro de modelos internos
14. cadastro de teses e argumentos por tipo de acao

### Regra de UX

A Clara nao deve ser uma home poluida por cards explicativos. Ela deve ser uma camada operacional:

1. conversa
2. sugestoes executaveis
3. historico
4. proximo passo

---

## 24. CRM ligado ao chatbot

O `CRM` sera alimentado pela vinculacao com um chatbot externo.

### Fluxo desejado

1. chatbot capta lead
2. lead entra no CRM
3. lead recebe classificacao e follow-up
4. lead vira cliente
5. cliente vira caso
6. caso entra em `Novo atendimento bancario`
7. fluxo juridico assume a partir dai

### Estrutura funcional minima do CRM

1. leads
2. pipeline
3. origem do contato
4. follow-ups
5. contratos
6. conversas
7. conversao para cliente/caso

---

## 25. Fluxo funcional da Clara

Quando o usuario solicitar uma tarefa, a Clara deve:

1. identificar o tipo de tarefa
2. buscar dados internos
3. consultar APIs externas quando aplicavel
4. consolidar contexto estruturado
5. validar faltas, conflitos e inconsistencias
6. gerar saida no formato correto
7. salvar historico, versao, observacoes e logs da execucao

Tipos de tarefa:

1. analisar caso
2. gerar peca
3. acompanhar processo
4. sugerir proximos passos
5. revisar minuta

---

## 26. Prompt mestre e prompt de execucao

### Prompt mestre

`Clara` deve operar com um prompt-base equivalente a:

> Voce e CLARA, agente juridica especializada em Direito Bancario no Brasil. Sua funcao e analisar casos, gerar minutas, acompanhar processos e sugerir proximos passos com base em dados reais do sistema, documentos do caso, modelos internos e APIs oficiais configuradas. Voce nunca inventa fatos, documentos, jurisprudencia ou numeros processuais. Voce sempre separa fatos confirmados, pendencias, riscos e sugestoes. Quando faltarem dados essenciais, voce interrompe a conclusao e informa exatamente o que falta. Sua linguagem e tecnica, clara, objetiva e profissional. Voce trabalha com foco em seguranca juridica, rastreabilidade, consistencia documental e apoio real ao escritorio.

### Estrutura de execucao por tarefa

Toda chamada deve seguir estrutura equivalente a:

1. `TAREFA`
2. `DADOS DO CLIENTE`
3. `DADOS DO CASO`
4. `DOCUMENTOS`
5. `ANDAMENTOS`
6. `DADOS EXTERNOS / APIs`
7. `MODELOS INTERNOS`
8. `CHECKLIST`
9. `INSTRUCOES`

---

## 27. Criterios de sucesso

O produto estara no rumo certo quando:

1. a usuaria conseguir abrir cliente e caso de forma rapida e confiavel
2. o nicho for selecionado e o workflow nascer automaticamente
3. o caso puder ser acompanhado a partir da area do cliente
4. a Clara conseguir analisar, apontar faltas e executar sugestoes reais
5. os documentos e pecas estiverem vinculados ao caso com revisao humana
6. os erros herdados deixarem de reaparecer por conta de backlog e precedencia documental claros

---

## 28. Estrategia para evitar recontaminacao por lixo legado

### Regra principal

Nenhuma implementacao futura deve partir da intuicao de telas antigas. Toda frente deve partir deste PRD, do handoff arquitetural subsequente e da story aberta a partir deles.

### Mapa de legado

#### Reaproveitar

1. estruturas de dados que ja representem clientes, casos, documentos e processos
2. partes estaveis do upload documental
3. infraestrutura de autenticacao e demonstracao que ja estiver corrigida
4. componentes de UI que sejam neutros e reutilizaveis

#### Adaptar

1. area atual da Clara
2. area atual do cliente
3. rotas herdadas de `Pessoas`
4. editor e documentos existentes
5. navegacao atual que ainda herda semantica antiga

#### Congelar

1. modulos intermediarios que nao representam o fluxo principal
2. slices antigos de navegacao que conflitem com a estrutura final
3. backlog periferico que desvie do eixo cliente -> caso -> nicho -> workflow -> peca -> distribuicao -> acompanhamento

#### Remover

1. referencias visiveis a `Lexia`
2. superficies de `Site` no produto juridico
3. botoes mortos, links redundantes e placeholders expostos
4. cards explicativos sem acao real correspondente

---

## 29. Fases de implementacao orientadas pelo produto

### Fase 1 - base operacional real

1. fechar `Novo atendimento bancario`
2. consolidar `Cliente` como cockpit inicial
3. instalar workflow visivel do nicho piloto
4. estabilizar documentos do caso

### Fase 2 - Clara executora

1. motor de analise do caso
2. checklist documental
3. parecer tecnico
4. sugestoes executaveis
5. historico e logs

### Fase 3 - pipeline documental

1. minutas
2. revisao humana
3. aprovacao
4. exportacao DOCX/PDF
5. impressao

### Fase 4 - CRM real

1. leads
2. pipeline
3. follow-ups
4. contratos
5. conversas
6. conversao com chatbot

### Fase 5 - integracoes e ampliacao de nichos

1. DataJud
2. Banco Central
3. STJ
4. STF
5. Consumidor.gov
6. novos nichos bancarios

---

## 30. O que o @architect deve receber depois

O `@architect` deve receber este PRD como entrada obrigatoria e devolver:

1. mapa de modulos executaveis
2. arquitetura da Clara em servicos, camadas e responsabilidades
3. arquitetura de dados e compatibilidade com o legado
4. arquitetura dos workflows por nicho
5. estrategia de integracao por APIs com adaptadores
6. mapa tecnico de `reaproveitar`, `adaptar`, `congelar`, `remover`
7. ordem tecnica de implementacao segura
8. estrategia para evitar recontaminacao por residuos antigos
9. criterios arquiteturais para stories futuras

### Perguntas que o @architect deve responder

1. qual e o menor nucleo implementavel que entrega o fluxo real do caso sem reabrir a bagunca antiga?
2. como organizar Clara, Cliente e CRM sem duplicar contexto?
3. quais partes do legado podem ser mantidas sem comprometer o produto?
4. que contratos internos de API e banco precisam nascer primeiro?
5. que ordem tecnica minimiza regressao e retrabalho?

---

## 31. Status desta proposta

Este documento estabelece o novo centro de gravidade do produto.

Ele nao implementa codigo. Ele redefine:

1. a direcao
2. a precedencia
3. a espinha dorsal
4. a ordem de decisao
5. o criterio para aceitar ou rejeitar novas implementacoes

Qualquer backlog novo deve se declarar explicitamente alinhado a este PRD.
