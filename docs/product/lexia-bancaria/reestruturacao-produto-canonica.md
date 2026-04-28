# Reestruturacao Canonica do Escritorio Bancario

**Data:** 2026-04-27  
**Status:** Canonico  
**Fonte:** conversa de reestruturacao com a usuaria em 2026-04-27  
**Objetivo:** fixar a visao aprovada para evitar novas perdas de contexto e orientar backlog, arquitetura e stories

---

## 1. Resultado de produto desejado

O sistema deve evoluir para um escritorio de advocacia bancario:

1. automatizado
2. intuitivo
3. simples de usar
4. guiado por uma advogada digital chamada `Clara`

O escritorio nao deve parecer uma colecao de telas tecnicas. Ele deve parecer um fluxo unico de trabalho, com transicoes naturais entre entrada do caso, operacao juridica e acompanhamento.

---

## 2. Nichos iniciais

Nichos obrigatorios no primeiro desenho:

1. `Revisional de contratos (veiculos)`
2. `Fraude bancaria (consignados)`
3. `Busca e apreensao (veiculos)`

O desenho deve ficar extensivel para novos nichos bancarios sem reescrever a espinha dorsal do sistema.

---

## 3. Espinha dorsal do produto

Fluxo macro aprovado:

1. cadastrar cliente
2. abrir caso
3. anexar documentos
4. escolher nicho
5. gerar workflow automaticamente
6. conduzir analise, estrategia e peca
7. revisar e aprovar juridicamente
8. distribuir a acao
9. acompanhar o processo

Esse fluxo deve ser percebido como um processo continuo, e nao como navegacao entre modulos desconexos.

---

## 4. Papel final da Clara

`Clara` e a advogada digital do sistema.

Ela deve oferecer:

1. conversa natural tipo chat
2. leitura de contexto do cliente/caso
3. sugestoes acionaveis
4. execucao real das sugestoes
5. historico das execucoes
6. orquestracao do proximo passo

### O que Clara nao deve ser

1. home confusa cheia de cards explicativos
2. painel paralelo de testes
3. area que pede para o usuario montar manualmente o proprio fluxo

### Regra operacional de Clara

Quando a usuaria clicar em uma sugestao de `Clara`, o sistema deve fazer a acao correspondente. Nao deve abrir um card sem efeito nem um placeholder.

---

## 5. Novo atendimento bancario

`Novo atendimento bancario` e a pagina unica de entrada do caso.

Nao e um modulo adicional posterior. E o ponto de partida do fluxo.

### Campos/etapas esperadas na mesma pagina

1. cliente
2. caso
3. nicho
4. documentos
5. objetivo inicial

### Efeito ao confirmar

1. criar cliente
2. criar caso
3. vincular documentos
4. associar nicho
5. instanciar workflow do nicho
6. criar processo interno inicial
7. criar primeiras tarefas
8. redirecionar para a area do cliente

---

## 6. Workflow por nicho

O workflow nao precisa de uma tela inicial propria.

Ele deve:

1. ser criado automaticamente com base no nicho escolhido
2. ficar embutido no caso
3. aparecer dentro da area do cliente
4. avancar conforme `Clara` executa e conforme o advogado revisa/aprova

### Exemplo de espinha dorsal comum

1. entrada
2. triagem
3. documentacao
4. analise juridica
5. estrategia
6. peca inicial
7. revisao humana
8. distribuicao
9. acompanhamento

### Variacao por nicho

Cada nicho troca as etapas intermediarias especificas, mantendo a mesma estrutura geral de controle e visibilidade.

---

## 7. Area do cliente

A area do cliente vira o cockpit real do caso.

Estrutura alvo:

1. `Resumo`
2. `Workflow`
3. `Documentos`
4. `Pecas`
5. `Processo`
6. `Andamentos`
7. `Diario oficial relacionado`
8. `Clara`
9. `Financeiro do cliente` quando aplicavel

O objetivo e que a usuaria consiga acompanhar toda a vida daquele cliente a partir desse centro, sem depender de navegar em varios modulos dispersos.

---

## 8. CRM

O produto precisa de um modulo `CRM`.

Objetivo:

1. captar leads
2. qualificar interesse
3. acompanhar follow-ups
4. registrar origem do contato
5. armazenar contratos e conversas
6. converter lead em cliente/caso

O `CRM` fica antes do caso juridico. Depois da conversao, o cliente/caso segue para o fluxo operacional do escritorio.

---

## 9. Modelo documental

As pecas e documentos juridicos devem seguir este modelo:

1. edicao interna no sistema
2. versionamento
3. status `rascunho -> em revisao -> aprovado`
4. exportacao `.docx`
5. exportacao `.pdf`
6. impressao

O advogado continua como aprovador juridico final.

`Clara` pode preparar, estruturar, preencher e organizar, mas nao deve concluir juridicamente sem revisao humana.

---

## 10. Decisao sobre modulos e navegacao

### Permanecem como areas proprias

1. `Clara`
2. `CRM`
3. `Clientes`
4. `Processos`
5. `Diario oficial`
6. `Andamentos`
7. `Agenda`
8. `Financeiro`
9. `Configuracoes`

### Deixam de ser protagonistas

1. `Dashboard` vira home resumida do dia
2. `Pessoas` deixa de ser area principal
3. `Equipe` migra para administracao/configuracoes
4. `Relatorios` e `Estatisticas` ficam contextuais
5. `Arquivos/Documentos` saem do menu principal
6. `Editor de texto` sai do menu principal
7. `Casos` deixa de competir com `Processos`

### Legado a remover do produto visivel

1. `Lexia` como identidade visivel
2. `Site` como modulo do produto juridico

---

## 11. Regras de UX e operacao

1. Nao expor acoes sem efeito real.
2. Nao manter botoes mortos.
3. Nao manter selects quebrados ou com estado inconsistente.
4. Nao forcar a usuaria a pensar em arquitetura interna do sistema.
5. A simplicidade deve vir de um fluxo guiado, nao de mais cards explicativos.

---

## 12. Implicacoes para backlog

Qualquer novo slice deve ser avaliado contra estas perguntas:

1. aproxima o produto do fluxo cliente -> caso -> nicho -> workflow -> peca -> distribuicao -> acompanhamento?
2. simplifica `Clara` ou a deixa mais confusa?
3. fortalece a area do cliente como cockpit?
4. cria acao real ou so mais superficie visual?
5. ajuda a instalar `CRM` e `Novo atendimento bancario` como espinha dorsal?

Se a resposta for `nao`, o slice nao deve ser priorizado como frente principal.

---

## 13. Ordem recomendada de implementacao

1. corrigir botoes e campos quebrados
2. simplificar `Clara`
3. implementar `Novo atendimento bancario`
4. transformar `Cliente` em cockpit do caso
5. plugar workflows por nicho
6. criar `CRM`
7. conectar pipeline documental editavel com exportacao
8. integrar chatbot externo depois que a base operacional estiver clara

---

## 14. Status desta decisao

Este documento substitui interpretacoes soltas e conversas nao canonizadas como referencia primaria da reestruturacao do produto.

Backlog, arquitetura, stories e implementacoes futuras devem se alinhar a ele explicitamente.
