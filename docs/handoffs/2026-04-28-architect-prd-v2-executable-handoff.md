# Handoff Arquitetural Executavel do PRD Mestre v2

**Data:** 2026-04-28  
**Origem:** `@architect`  
**Destino:** `@po` e `@sm`  
**Autoridade principal:** `docs/product/lexia-bancaria/prd-mestre-escritorio-bancario-v2.md`

---

## 1. Decisao arquitetural principal

O produto deve sair do modelo de telas soltas e passar a operar por um nucleo unico:

`CRM -> Novo atendimento bancario -> Cliente como cockpit -> Clara como motor juridico -> Processo/Andamentos/Diario`

Isso implica quatro regras de arquitetura:

1. `Cliente` e `Caso` sao o centro de contexto do sistema.
2. `Clara` nunca pode operar fora de contexto resolvido de cliente/caso/workflow.
3. Todo nicho bancario entra por contratos configuraveis de workflow, checklist, modelos e regras.
4. O legado so pode continuar se servir ao fluxo principal ou se for compatibilidade temporaria controlada.

---

## 2. Mapa de modulos

### Modulos principais de produto

1. `Clara`
   - conversa
   - execucao de sugestoes
   - historico
   - logs
   - revisao humana
2. `CRM`
   - leads
   - pipeline
   - origem
   - follow-ups
   - contratos
   - conversas
   - conversao para cliente/caso
3. `Clientes`
   - cockpit do cliente
   - casos
   - workflow
   - documentos
   - pecas
   - processo
   - Clara contextual
4. `Processos`
   - visao global da carteira processual
   - monitoramento
   - vinculo com DataJud e historico interno
5. `Diario oficial`
   - publicacoes globais
   - correlacao com cliente/caso
6. `Andamentos`
   - leitura global de movimentacoes
   - priorizacao
   - reflexo por processo e por cliente
7. `Agenda`
   - prazos
   - tarefas
   - compromissos derivados do workflow
8. `Financeiro`
   - eventos financeiros globais e por cliente
9. `Configuracoes`
   - usuarios
   - modelos
   - teses
   - nichos
   - conectores
   - politicas da Clara

### Modulos absorvidos ou rebaixados

1. `Dashboard` vira home resumida do dia.
2. `Arquivos` vira visao documental contextual do caso/cliente.
3. `Editor de texto` vira ferramenta contextual de minuta/peca.
4. `Relatorios` e `Estatisticas` viram visoes derivadas dentro dos modulos principais.
5. `Pessoas` vira compatibilidade temporaria de rotas e fonte de migracao para `Clientes` e `CRM`.
6. `Equipe` migra para `Configuracoes`/administracao.

---

## 3. Arquitetura da Clara

### Visao em camadas

1. **Camada de identidade**
   - prompt mestre
   - regras de ouro
   - limites operacionais
   - formatos de resposta
2. **Camada de resolucao de contexto**
   - resolve cliente, caso, workflow, documentos, processo, tarefas, modelos e logs
   - falha de forma controlada se faltar contexto minimo
3. **Camada de leitura estruturada**
   - normaliza fatos, partes, provas, contratos, valores, datas e pendencias
4. **Camada de classificacao**
   - identifica nicho, subtipo e tipo de tarefa juridica
5. **Camada de decisao**
   - define checklist, risco, urgencia, estrategia, documento faltante e proximo passo
6. **Camada geradora**
   - produz analise, checklist, parecer, minuta e resumo processual
7. **Camada revisora anti-alucinacao**
   - valida completude, coerencia, origem e bloqueios
8. **Camada de execucao**
   - transforma sugestao clicada em acao real do sistema
9. **Camada de rastreabilidade**
   - salva execution id, logs, origens, artefatos, status e observacoes humanas

### Servicos arquiteturais da Clara

1. `CaseContextResolver`
2. `StructuredCaseReader`
3. `BankingCaseClassifier`
4. `DecisionEngine`
5. `LegalArtifactGenerator`
6. `HallucinationGuard`
7. `ClaraTaskOrchestrator`
8. `ClaraExecutionLogService`
9. `HumanReviewService`

### Contrato arquitetural da Clara

Toda operacao da Clara deve nascer de:

1. `clientId`
2. `caseId`
3. `taskType`
4. `contextSnapshot`
5. `sourceTrace`

Sem isso, a acao nao deve executar.

---

## 4. Arquitetura de dados

### Entidades nucleares

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
17. `logs_execucao_clara`
18. `resultados_api`
19. `fontes_externas_consultadas`
20. `observacoes_revisor_humano`
21. `crm_leads`
22. `crm_pipeline_stages`
23. `crm_followups`
24. `crm_conversas`
25. `crm_contratos`

### Regras de modelagem

1. `caso` e a unidade central do trabalho juridico.
2. `workflow` pertence ao `caso`, nao a Clara.
3. `documento` e `minuta` pertencem ao `caso` e podem aparecer agregados no `cliente`.
4. `processo` pode nascer vazio no onboarding e ser enriquecido depois.
5. toda execucao da Clara gera trilha persistida independente da resposta exibida.

### Campos obrigatorios de rastreabilidade

1. `execution_id`
2. `status_revisao`
3. `source_trace`
4. `origem_interna`
5. `origem_documental`
6. `origem_api`
7. `inferencia_controlada`
8. `criado_por`
9. `atualizado_por`

### Contratos de escrita

1. onboarding escreve em `clientes`, `casos`, `caso_workflows`, `checklists`, `tarefas`
2. upload escreve em `documentos` e `documento_anexos` e atualiza status do workflow
3. Clara escreve em `logs_execucao_clara`, `checklists`, `minutas`, `versoes_peca`, `tarefas` e observacoes
4. integracoes escrevem em `resultados_api` e `fontes_externas_consultadas`

---

## 5. Arquitetura dos workflows por nicho

### Modelo base

Cada nicho deve ser descrito por quatro contratos:

1. `workflow definition`
2. `document checklist`
3. `decision rules`
4. `artifact templates`

### Estrutura minima do workflow

1. `code`
2. `niche`
3. `ordered_steps`
4. `current_step`
5. `next_step`
6. `blocking_requirements`
7. `artifacts_generated`
8. `review_required`

### Nicho piloto

`Revisional de contratos (veiculos)` e o primeiro nicho completo.

Etapas obrigatorias:

1. cadastro concluido
2. documentos minimos recebidos
3. leitura automatica do contrato
4. parecer tecnico inicial
5. memoria de calculo e abusividades
6. estrategia juridica
7. minuta da peca
8. revisao humana
9. distribuicao
10. acompanhamento

### Nichos faseados

`Fraude bancaria` e `Busca e apreensao` entram com:

1. checklist minimo
2. fluxo de prova
3. fase de urgencia/estrategia
4. minuta cabivel
5. revisao e acompanhamento

### Regra de extensibilidade

Novos nichos nao geram novas telas-base. Eles entram por:

1. nova definicao de workflow
2. novos checklists
3. novas regras de decisao
4. novos templates

---

## 6. Estrategia de integracao por APIs

### Principio

Toda fonte externa entra por adaptador proprio, nunca direto no fluxo da Clara ou na UI.

### Camadas

1. `connector client`
   - autenticacao
   - request/response
   - retry e erro
2. `normalizer`
   - traduz payload externo para contrato interno
3. `trace recorder`
   - grava consulta, sucesso, falha e origem
4. `domain bridge`
   - entrega dados estruturados ao caso/processo/Clara

### Ordem de implementacao

1. DataJud
2. Banco Central
3. STJ
4. STF
5. Consumidor.gov

### Regra arquitetural

Se a API falhar:

1. o erro deve ser rastreado
2. a Clara deve informar falha de fonte
3. a execucao segue apenas com dados disponiveis
4. a UI nao pode fingir dado confirmado

---

## 7. Mapa tecnico de reaproveitar, adaptar, congelar e remover

### Reaproveitar

1. modelos atuais de cliente, caso, documento e processo que ja escrevam em entidades reais
2. autenticacao e demonstracao, agora que a regra da demo foi centralizada
3. partes estaveis do upload documental
4. servicos de contexto e artefatos da Clara que ja usem caso/cliente reais
5. componentes neutros de UI

### Adaptar

1. pagina atual da Clara para virar superficie operacional enxuta
2. pagina atual do cliente para virar cockpit canonico
3. rotas herdadas de `pessoas/*` para compatibilidade e migracao progressiva
4. editor e armazenamento documental para pipeline juridico formal
5. menu lateral e navegacao contextual

### Congelar

1. slices antigos de navegacao que nao batam com o PRD mestre
2. backlog periférico fora do fluxo `CRM -> cliente/caso -> workflow -> peca -> acompanhamento`
3. superficies intermediarias que nao tenham papel no produto final
4. experimentos de Clara que exponham cards ou acoes sem efeito real

### Remover

1. referencias visiveis a `Lexia`
2. `Site` do produto juridico
3. botoes mortos e placeholders expostos
4. cards explicativos sem acao correspondente
5. semantica residual de `Operacao` como eixo principal de produto

---

## 8. Fases de implementacao seguras

### Fase A - estabilizacao do eixo principal

1. consolidar `Novo atendimento bancario`
2. consolidar `Cliente` como cockpit inicial
3. instalar workflow visivel do nicho piloto
4. estabilizar fluxo documental do caso

**Saida esperada:** abrir cliente/caso de ponta a ponta sem navegar por modulos herdados.

### Fase B - Clara executora com rastreabilidade

1. resolver contexto unico por caso
2. instalar checklist documental real
3. instalar analise do caso e parecer tecnico
4. instalar sugestoes executaveis
5. registrar logs e historico

**Saida esperada:** a Clara deixa de sugerir abstratamente e passa a executar com trilha.

### Fase C - pipeline documental juridico

1. minutas
2. versoes
3. revisao humana
4. aprovacao
5. exportacao DOCX/PDF
6. impressao

**Saida esperada:** artefatos juridicos editaveis e aprovaveis dentro do caso.

### Fase D - CRM real

1. leads
2. pipeline
3. follow-ups
4. contratos
5. conversas
6. conversao para cliente/caso

**Saida esperada:** chatbot e operacao comercial passam a alimentar o escritorio.

### Fase E - integracoes e escala

1. DataJud
2. Banco Central
3. STJ
4. STF
5. Consumidor.gov
6. novos nichos

**Saida esperada:** Clara mais forte, monitoramento mais real e ampliacao sem reabrir arquitetura.

---

## 9. Ordem tecnica correta para evitar recontaminacao por lixo antigo

1. fixar contratos de dados de `cliente`, `caso`, `workflow` e `documento`
2. implementar tudo novo a partir desses contratos, nao a partir de telas antigas
3. fazer a UI consumir servicos novos/clarificados, nao replicar logica no componente
4. isolar compatibilidade legada em adaptadores/bridges
5. so depois redirecionar ou esconder superficies antigas
6. nao abrir frente de integracao externa antes do fluxo interno estabilizar
7. nao generalizar todos os nichos antes do piloto fechar o fluxo real
8. toda acao da Clara deve nascer de contrato de caso, nunca de estado solto de pagina

### Regra de governanca tecnica

Nenhuma story pode:

1. introduzir nova semantica de modulo fora do PRD
2. expor botao sem acao final real
3. reativar naming ou identidade `Lexia` visivel
4. criar fluxo paralelo ao onboarding e ao cockpit do cliente

---

## 10. Criterios arquiteturais para abrir as proximas stories

Cada story nova deve responder claramente:

1. qual modulo principal do PRD ela fortalece
2. em qual fase arquitetural ela se encaixa
3. qual contrato de dados toca
4. qual parte do legado ela reaproveita, adapta, congela ou remove
5. qual comportamento real do escritorio ela entrega
6. como evita reintroduzir UI morta, contexto paralelo ou naming legado

### Critérios de aceite de story

1. precisa ter fluxo observavel de entrada e saida
2. precisa declarar dependencias de dados e contexto
3. nao pode depender de suposicoes implicitas da UI
4. precisa atualizar checklist e file list
5. precisa passar por gate coerente com o risco: `architect` para estrutura, `qa` para comportamento

---

## 11. Recomendacao para `@po`

O `@po` deve validar:

1. se a ordem de fases preserva prioridade de negocio
2. se o PRD e este handoff eliminam ambiguidades de modulo
3. se o legado congelado nao volta ao backlog como “melhoria opportunistica”
4. se as proximas stories estao estritamente no eixo principal do produto

---

## 12. Recomendacao para `@sm`

O `@sm` deve abrir o proximo epic/story tree nesta ordem:

1. consolidacao final de `Novo atendimento bancario`
2. cockpit do cliente mais proximo da estrutura canonica
3. workflow visivel do nicho piloto
4. Clara executora com checklist documental e sugestoes acionaveis

### Regra de corte

Nao abrir story periferica de:

1. relatorios
2. estatisticas
3. refinamento cosmetico de modulos secundarios
4. integracoes externas profundas

antes de o fluxo principal estar funcional.

---

## 13. Conclusao arquitetural

O menor nucleo implementavel correto e:

`Novo atendimento bancario -> caso com workflow do nicho -> cockpit do cliente -> Clara contextual executora`

Essa e a espinha dorsal que deve governar as proximas stories. O restante do produto cresce em volta dela, nao antes dela.
