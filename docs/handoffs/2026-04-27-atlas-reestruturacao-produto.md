# Handoff: Reestruturacao Canonica do Produto

**Data:** 2026-04-27  
**Origem:** Analyst / Atlas  
**Destino sugerido:** PM -> Architect -> SM -> Dev

---

## Motivo deste handoff

Este documento existe para impedir nova perda de contexto. Em 2026-04-27 a visao do produto foi redefinida em conversa direta com a usuaria, mas parte do desenvolvimento seguiu por slices tecnicos secundarios e deixou de refletir o alvo real do sistema.

Este handoff passa a ser a ancora oficial da conversa de reestruturacao do escritorio bancario.

---

## Problema identificado

O sistema atual se desviou do resultado esperado por tres motivos:

1. `Clara` acumulou papeis demais ao mesmo tempo: hub, cards explicativos, onboarding parcial, painel operacional e pseudo-workflow.
2. `Cliente` ainda nao e o centro operacional do caso.
3. A navegacao e alguns modulos atuais refletem cobertura tecnica de rotas, mas nao o fluxo real do escritorio bancario desejado.

Tambem foi identificado problema tecnico recorrente:

1. botoes visiveis sem acao util
2. campos de selecao com comportamento inconsistente
3. placeholders expostos como se fossem fluxo final

---

## Visao de produto aprovada

O produto desejado e um escritorio de advocacia bancario:

1. automatizado
2. intuitivo
3. simples de usar
4. conduzido por uma advogada digital conversacional chamada `Clara`

Nichos iniciais obrigatorios:

1. `Revisional de contratos (veiculos)`
2. `Fraude bancaria (consignados)`
3. `Busca e apreensao (veiculos)`

O produto deve nascer preparado para suportar novos nichos de direito bancario no futuro sem quebrar a espinha dorsal do fluxo.

---

## Decisoes de produto ja tomadas

### 1. Clara muda de papel

`Clara` nao deve continuar como pagina carregada de cards explicativos e paineis paralelos.

Ela deve ser:

1. advogada digital conversacional
2. orquestradora do proximo passo
3. camada de comandos executaveis
4. executora operacional com revisao humana juridica

Quando `Clara` sugerir uma acao e a usuaria clicar, o sistema deve executar de fato a acao escolhida.

### 2. Onboarding unico do caso

`Novo atendimento bancario` nao e uma sessao extra posterior. E a propria pagina unica de entrada do caso.

Essa pagina deve concentrar:

1. dados do cliente
2. dados do caso
3. selecao do nicho bancario
4. anexos/documentos
5. objetivo inicial

Ao confirmar, o sistema deve criar automaticamente:

1. cliente
2. caso
3. vinculo documental
4. nicho
5. workflow do nicho
6. processo interno inicial
7. primeiras tarefas

Depois disso, o sistema deve abrir direto a area do cliente/caso.

### 3. Workflow do nicho e embutido

Nao e necessario abrir uma tela separada de workflow no inicio.

O workflow:

1. nasce automaticamente conforme o nicho escolhido
2. fica embutido no caso
3. aparece dentro da area do cliente
4. evolui conforme `Clara` executa as acoes

### 4. Cliente vira centro operacional

A area do cliente deve concentrar:

1. resumo
2. caso bancario
3. workflow
4. documentos
5. pecas
6. processo
7. andamentos
8. diario oficial relacionado
9. conversa com `Clara`

### 5. CRM passa a existir como sessao propria

O sistema precisa de `CRM`, inexistente hoje como modulo claro.

Escopo do CRM:

1. leads
2. clientes em prospeccao
3. origem do contato
4. status comercial
5. follow-ups
6. contratos
7. conversas
8. pendencias
9. conversao de lead para cliente/caso

### 6. Documentos e editor mudam de lugar

`Documentos/Arquivos` e `Editor de texto` nao devem continuar como ilhas principais de navegacao.

Eles devem existir como recursos do fluxo do caso:

1. documentos entram no onboarding e vivem no cliente/caso
2. pecas nascem da Clara e do workflow
3. editor abre no contexto da peca certa, nao como destino solto

### 7. Diario oficial e andamentos continuam existindo

`Diario oficial` e `Andamentos` continuam valendo como areas globais do escritorio, mas tambem devem aparecer dentro do cliente/caso quando relacionados.

### 8. Lexia e Site saem do produto visivel

1. `Lexia` deve ser removida como identidade visivel; tudo o que o usuario ve passa a ser `Clara`
2. `Site` sai do produto juridico principal

---

## Comportamento esperado de Clara

Ao clicar em uma sugestao de `Clara`, o sistema deve:

1. executar a acao
2. registrar a execucao no workflow do caso
3. gerar o artefato correspondente
4. abrir para revisao do advogado
5. permitir aprovar, ajustar, salvar, imprimir ou exportar

Exemplo alvo:

1. `Clara` sugere `Gerar peticao inicial`
2. a usuaria clica
3. o sistema gera o rascunho editavel
4. vincula ao cliente/caso/processo
5. marca status `rascunho`
6. advogado revisa
7. advogado aprova
8. sistema permite `DOCX`, `PDF` e impressao

---

## Modelo documental aprovado

O formato interno principal nao deve depender de Word como fonte oficial.

Modelo desejado:

1. editor juridico interno
2. armazenamento editavel no sistema
3. versionamento
4. status `rascunho -> em revisao -> aprovado`
5. exportacao `.docx`
6. exportacao `.pdf`
7. impressao

---

## Navegacao alvo aprovada

Menu principal recomendado:

1. `Clara`
2. `CRM`
3. `Clientes`
4. `Processos`
5. `Diario oficial`
6. `Andamentos`
7. `Agenda`
8. `Financeiro`
9. `Configuracoes`

Decisoes associadas:

1. `Dashboard` deixa de ser modulo principal e vira home resumida do dia
2. `Pessoas` deixa de ser protagonista
3. `Equipe` vai para administracao/configuracoes
4. `Relatorios` e `Estatisticas` deixam de competir como modulos primarios
5. `Arquivos` e `Editor de texto` saem do menu principal e viram modulos contextuais
6. `Casos` deixa de competir com `Processos`

---

## Ordem correta de execucao do produto

O desenvolvimento deve voltar para esta sequencia:

1. corrigir botoes e campos quebrados
2. simplificar `Clara`
3. desenhar e implementar `Novo atendimento bancario`
4. reorganizar a area do cliente como cockpit
5. plugar workflow por nicho
6. criar `CRM`
7. ligar pipeline documental editavel com exportacoes
8. depois integrar chatbot externo

Observacao: a ordem tecnica pode ser fatiada, mas os proximos slices devem nascer daqui, e nao de reorganizacoes perifericas isoladas.

---

## Guardrails

1. Nao continuar multiplicando cards explicativos na `Clara`.
2. Nao abrir novas frentes de UI sem ancora no fluxo cliente -> caso -> nicho -> workflow -> peca -> distribuicao -> acompanhamento.
3. Nao tratar navegacao ou modulo isolado como objetivo final do produto.
4. Nao expor botoes, links ou selects sem comportamento real e validado.
5. Nao perder novamente esta conversa; este handoff passa a ser referencia obrigatoria para os proximos agentes.

---

## Proximo fluxo correto de agentes

1. `@analyst`: consolidar gap entre sistema atual e esta visao canonica
2. `@pm`: transformar a visao em recorte de produto faseado e priorizado
3. `@architect`: definir a sequencia tecnica segura
4. `@sm`: abrir a primeira story correta alinhada ao alvo real
5. `@dev`: implementar apenas a story resultante desse fluxo

Enquanto esse reancoramento nao ocorrer, nenhum slice tecnico novo deve ser tratado como representante fiel do produto desejado.
