# Recorte Faseado: Reestruturacao do Escritorio Bancario

**Data:** 2026-04-27  
**Status:** Proposed  
**Origem:** PM  
**Base:** 

1. `docs/product/lexia-bancaria/reestruturacao-produto-canonica.md`
2. `docs/handoffs/2026-04-27-analyst-gap-visao-vs-sistema.md`

---

## Objetivo

Transformar a visao canonica do escritorio bancario em um plano de produto executavel, com cortes que:

1. ataquem primeiro a confusao central da experiencia
2. evitem novo desvio para slices perifericos
3. abram uma primeira experiencia coerente fim a fim

O alvo nao e “melhorar algumas telas”. O alvo e instalar a primeira espinha dorsal real do produto.

---

## Tese de priorizacao

O maior problema atual nao e falta de modulo. E falta de eixo.

Por isso, a priorizacao correta nao comeca por:

1. relatorios
2. refinamentos de navegacao
3. estatisticas
4. frentes visuais isoladas

Ela comeca por onde o escritorio passa a fazer sentido:

1. `Clara`
2. entrada unica do caso
3. area do cliente como cockpit

Sem esses tres pontos, o restante continua parecendo agregado tecnico.

---

## Escopo faseado

### Fase 1: Instalar a nova espinha dorsal

Objetivo:

Criar a primeira experiencia real do escritorio bancario no fluxo:

`Clara simplificada -> Novo atendimento bancario -> Cliente como cockpit`

Inclui:

1. simplificar a home da `Clara`
2. remover ou rebaixar cards explicativos e atalhos fragmentados
3. corrigir botoes e selects quebrados da `Clara`
4. criar `Novo atendimento bancario` como pagina unica
5. criar a primeira instancia de workflow automatico por nicho
6. transformar a area do cliente em cockpit inicial do caso

Nao inclui:

1. CRM completo
2. pipeline documental completo com todas as exportacoes finais
3. chatbot externo
4. reestruturacao profunda de todos os modulos secundarios

### Fase 2: Tornar Clara executora operacional real

Objetivo:

Fazer `Clara` sair de orquestradora visual para motor de execucao com persistencia de acoes.

Inclui:

1. sugestoes clicaveis com execucao real
2. registro da execucao no workflow
3. abertura contextual do artefato gerado
4. historico de execucoes por cliente/caso
5. integracao melhor entre `Clara` e o cockpit do cliente

### Fase 3: Pipeline documental juridico

Objetivo:

Instalar a trilha principal de artefatos juridicos com revisao humana.

Inclui:

1. editor juridico contextual
2. status `rascunho -> em revisao -> aprovado`
3. versionamento
4. exportacao `.docx`
5. exportacao `.pdf`
6. impressao

### Fase 4: CRM real

Objetivo:

Fazer a entrada comercial do escritorio existir como modulo de negocio.

Inclui:

1. leads
2. pipeline
3. follow-ups
4. origem do contato
5. contratos e conversas
6. conversao de lead em cliente/caso

### Fase 5: Integracoes e escala

Objetivo:

Ligar automacoes externas depois que o fluxo interno estiver coerente.

Inclui:

1. chatbot externo
2. integracoes adicionais
3. novos nichos bancarios

---

## Recorte recomendado para a primeira onda

O menor recorte que de fato muda o produto e:

1. `Clara` simplificada
2. `Novo atendimento bancario`
3. `Cliente` como cockpit inicial

Esse corte e o primeiro que permite a usuaria sentir o produto novo, e nao apenas ver uma navegacao nova.

---

## Entregas esperadas da Fase 1

### 1. Clara simplificada

Escopo:

1. manter conversa e contexto
2. remover `Acesso rapido` fragmentado
3. rebaixar ou remover cards que nao geram acao
4. reduzir a dependencia de bancada manual cheia de selects
5. manter so o necessario para escolha de nicho e contexto real

Resultado esperado:

`Clara` deixa de parecer bancada experimental e passa a parecer porta inteligente do trabalho.

### 2. Novo atendimento bancario

Escopo:

1. cliente
2. caso
3. nicho
4. documentos
5. objetivo inicial
6. acao `Iniciar caso`

Resultado esperado:

a usuaria para de navegar por varias telas soltas para abrir uma demanda

### 3. Cockpit inicial do cliente

Escopo:

1. resumo do cliente/caso
2. workflow do nicho
3. documentos do caso
4. processo vinculado
5. proximo passo sugerido
6. Clara contextual do cliente

Resultado esperado:

o cliente deixa de ser detalhe expandido e vira centro do caso

---

## Dependencias de negocio

Para a Fase 1 funcionar, o corte precisa assumir:

1. pelo menos um nicho bancario bem suportado na primeira iteracao
2. preferencia inicial por `Revisional de contratos (veiculos)` como vertical piloto
3. workflow automatico minimo desse nicho
4. compatibilidade com estrutura atual suficiente para nao quebrar o workspace inteiro

---

## Riscos

### 1. Risco de fazer UI sem espinha

Se a entrega focar em visual e nao no fluxo fim a fim, o produto continuara confuso.

### 2. Risco de tentar os tres nichos completos de uma vez

O corte inicial pode explodir se tentar profundidade maxima nos tres nichos simultaneamente.

### 3. Risco de manter Clara grande demais

Se a simplificacao da `Clara` for timida, a experiencia continua baguncada.

### 4. Risco de cockpit do cliente virar so redesign

Se a area do cliente mudar so de layout, sem workflow e proximo passo real, o ganho sera superficial.

---

## Recomendacao de MVP funcional

Para a primeira onda, o PM recomenda:

1. usar `Revisional de contratos (veiculos)` como nicho piloto completo
2. deixar `Fraude bancaria` e `Busca e apreensao` visiveis como nichos previstos, mas com profundidade menor no primeiro corte
3. provar o fluxo fim a fim em um nicho antes de generalizar

Isso reduz risco e aumenta clareza.

---

## Perguntas que o Architect deve responder

1. Qual o menor caminho tecnico para criar `Novo atendimento bancario` sem quebrar os cadastros atuais?
2. Como simplificar `Clara` sem perder as integracoes e artefatos ja existentes?
3. Qual a forma mais segura de transformar a tela do cliente em cockpit sem reescrever tudo?
4. Como instanciar workflow por nicho de modo extensivel?
5. Qual a estrategia para conviver temporariamente com rotas legadas?

---

## Recomendacao final do PM

O proximo trabalho nao deve ser uma implementacao direta.

O proximo agente correto e `@architect`, para converter esta priorizacao em sequencia tecnica segura e definir o primeiro slice de implementacao verdadeiro.
