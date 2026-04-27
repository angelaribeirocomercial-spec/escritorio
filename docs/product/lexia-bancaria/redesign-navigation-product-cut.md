# Recorte de Produto: Redesign da Navegacao

**Data:** 2026-04-27  
**Status:** Proposed  
**Escopo:** menu principal alvo, papeis de modulos-chave e sequenciamento incremental

---

## Objetivo

Definir uma IA final mais curta, mais operacional e mais coerente com o produto real. O foco nao e redesenhar todos os modulos ao mesmo tempo. O foco e reduzir friccao de navegacao e organizar o produto em torno do fluxo de trabalho do escritorio:

1. captar e qualificar
2. estruturar o processo
3. operar prazos, publicacoes e tarefas
4. cobrar e acompanhar receita
5. usar Clara como camada transversal de inteligencia

---

## Premissas de Produto

1. `Clara` nao substitui modulos estruturados. Ela costura contexto, prioriza e recomenda a proxima acao.
2. `Processos` continua sendo o centro juridico-operacional do produto.
3. `Clientes` nao precisa continuar como item de primeiro nivel se o papel real for CRM + relacionamento.
4. `Diario Oficial`, `Andamentos` e `Agenda` pertencem ao mesmo momento operacional e devem parar de competir entre si no menu principal.
5. `Financeiro` permanece de primeiro nivel porque tem dono, rotina e linguagem propria.
6. Rotas atuais devem continuar funcionando como compatibilidade durante a transicao.

---

## Diagnostico

Hoje o shell principal expande a referencia MaisJuridico quase inteira como navegacao primaria. Isso ajudou a ganhar cobertura, mas deixou tres problemas de produto:

1. menu principal longo demais para o momento atual do produto
2. modulos que sao partes do mesmo fluxo aparecem como destinos independentes
3. Clara aparece forte demais como modulo isolado e fraca demais como camada transversal

O resultado e um workspace que parece completo, mas exige do usuario uma traducao mental desnecessaria entre CRM, cliente, processo, agenda, diario, andamento e IA.

---

## Menu Principal Alvo

### Navegacao principal final

1. `Hoje`
2. `CRM`
3. `Processos`
4. `Operacao`
5. `Financeiro`
6. `Clara`

### Navegacao secundaria

1. `Arquivos`
2. `Editor`
3. `Relatorios`
4. `Estatisticas`
5. `Equipe`
6. `Configuracoes`

---

## Decisao por Modulo

| Item atual | Destino alvo | Decisao | Papel no produto |
| --- | --- | --- | --- |
| Dashboard | Hoje | Permanece, com reposicionamento | cockpit diario, fila, risco e prioridades |
| Clara | Clara + camada transversal | Permanece, mas muda de papel | inteligencia contextual, comando e memoria operacional |
| Pessoas | CRM | Absorvido | agrupa relacionamento, lead, cliente e pendencias de onboarding |
| Clientes | CRM > Clientes | Absorvido | carteira ativa, historico, score, documentos faltantes |
| Processos | Processos | Permanece | dossie juridico central e contexto principal do caso |
| Diario Oficial | Operacao > Publicacoes | Absorvido | captura evento oficial e alimenta prazo/tarefa/processo |
| Andamentos | Operacao > Monitoramento | Absorvido | captura movimento processual e leitura de impacto |
| Agenda | Operacao > Agenda | Absorvido | agenda, prazos e tarefas como execucao do escritorio |
| Financeiro | Financeiro | Permanece | receitas, despesas, vencimentos e previsao de recebimento |

---

## Papel Final de Cada Area

### Hoje

Nao e um dashboard generico. E a tela de abertura do dia:

1. o que venceu
2. o que entrou
3. o que travou
4. o que Clara recomenda atacar primeiro

### CRM

CRM e a camada de entrada e relacionamento. Ele absorve `Pessoas` e organiza:

1. leads e clientes
2. qualificacao
3. score de viabilidade
4. pendencia documental
5. origem e banco
6. passagem para processo quando a demanda vira caso ativo

`Clientes` continua existindo, mas como subarea do CRM, nao como modulo-irmão de Processos.

### Processos

Processos e o centro do produto. Tudo o que e juridicamente executavel converge aqui:

1. cliente vinculado
2. estrategia
3. tese
4. timeline
5. documentos
6. prazos e tarefas relacionadas
7. leitura Clara contextual

### Operacao

Operacao une tudo o que hoje esta fragmentado entre `Agenda`, `Diario Oficial` e `Andamentos`. O usuario nao pensa nesses tres itens como produtos separados; ele pensa em fila operacional.

Subareas alvo:

1. `Agenda`
2. `Publicacoes`
3. `Monitoramento`
4. `Tarefas`
5. `Prazos`

Essa area responde: o que entrou, o que mudou, o que vence e quem precisa agir.

### Financeiro

Financeiro continua autonomo porque tem logica, owner e leitura propria:

1. receita
2. despesa
3. repasse
4. vencimento
5. inadimplencia
6. previsao por cliente/processo

### Clara

Clara nao deve ser tratada nem como chat livre nem como modulo que compete com os objetos reais. O papel final e duplo:

1. `camada transversal`
   Clara aparece dentro de CRM, Processos e Operacao para ler contexto e sugerir proxima acao.
2. `workspace dedicado`
   Clara continua com area propria para analise profunda, memoria, historico e execucao assistida.

Regra de produto: se a acao gera ou altera um objeto operacional, o destino final desse objeto pertence ao modulo estruturado, nao a Clara.

---

## O Que Permanece, e Absorvido, e Removido

### Permanece

1. `Processos`
2. `Financeiro`
3. `Clara`
4. `Dashboard`, reposicionado como `Hoje`

### E absorvido

1. `Pessoas` -> `CRM`
2. `Clientes` -> `CRM > Clientes`
3. `Agenda` -> `Operacao`
4. `Diario Oficial` -> `Operacao > Publicacoes`
5. `Andamentos` -> `Operacao > Monitoramento`

### Sai do menu principal

1. `Relatorios`
2. `Estatisticas`
3. `Equipe`
4. `Arquivos`
5. `Editor de texto`

Esses itens continuam existindo, mas como ferramentas de apoio, nao como centros primarios de navegacao.

### Remover

1. duplicidade conceitual entre `Pessoas` e `Clientes`
2. competicao entre `Agenda`, `Diario Oficial` e `Andamentos`
3. leitura de Clara como destino paralelo ao fluxo operacional

---

## IA Final de Navegacao

### Nivel 1

- `Hoje`
- `CRM`
- `Processos`
- `Operacao`
- `Financeiro`
- `Clara`

### Nivel 2 sugerido

**CRM**

- `Visao da carteira`
- `Clientes`
- `Leads`
- `Pendencias documentais`

**Processos**

- `Lista`
- `Ultimos andamentos`
- `Importacoes`
- `Lixeira`

**Operacao**

- `Agenda`
- `Tarefas`
- `Prazos`
- `Publicacoes`
- `Monitoramento`

**Financeiro**

- `Receitas`
- `Despesas`
- `Vencimentos`
- `Transferencias`
- `Graficos`

**Clara**

- `Analise`
- `Pecas`
- `Checklist`
- `Proximos passos`
- `Historico`

---

## Primeiro Slice de Implementacao

### Nome

`Slice 1 - Reenquadrar navegacao sem reescrever os modulos`

### Objetivo

Gerar valor imediato reduzindo carga cognitiva do menu e organizando o produto em torno do fluxo real, sem reconstruir CRM, agenda, diario, andamentos e Clara no mesmo ciclo.

### Escopo

1. criar o agrupamento visual e semantico `CRM` no lugar de `Pessoas`
2. criar o agrupamento visual e semantico `Operacao` unindo `Agenda`, `Diario Oficial` e `Andamentos`
3. reposicionar `Dashboard` como `Hoje`
4. manter `Processos`, `Financeiro` e `Clara`
5. mover `Relatorios`, `Estatisticas`, `Arquivos`, `Editor` e `Equipe` para navegacao secundaria
6. preservar rotas atuais como compatibilidade

### O que nao entra neste slice

1. novo CRUD completo de CRM
2. fusao de schemas de dominio
3. novo motor de automacao entre diario, andamento e agenda
4. refactor profundo da Clara
5. reescrita visual de todos os submodulos

### Valor entregue

1. menu principal mais curto e compreensivel
2. melhor leitura do fluxo fim a fim
3. menos competicao entre modulos correlatos
4. Clara reposicionada corretamente sem perder a area dedicada
5. base limpa para os slices seguintes

### Racional de priorizacao

Esse slice entrega valor porque mexe na porta de entrada do produto, nao no fundo do sistema. Ele reduz ruido agora e compra tempo para evoluir os modulos certos depois.

---

## Recomendacao de Execucao

### Slice 1

Navegacao e rotulagem:

1. atualizar `WorkspaceShell`
2. criar landings simples para `CRM` e `Operacao`
3. remapear itens existentes sem quebrar rotas

### Slice 2

Fila operacional unificada:

1. consolidar `Tarefas`, `Prazos`, `Publicacoes` e `Monitoramento` numa leitura unica de fila
2. inserir recomendacao Clara por item

### Slice 3

CRM juridico real:

1. separar lead x cliente ativo
2. score, pendencia documental e passagem para processo

### Slice 4

Clara embedded:

1. acionar Clara a partir de CRM, Processo e Operacao
2. reduzir dependencia de ida manual ao workspace dedicado

---

## Decisao Final

Para o redesign, o produto deve parar de espelhar a suite de referencia como menu completo e passar a expor a estrutura que o escritorio realmente entende:

1. `Hoje`
2. `CRM`
3. `Processos`
4. `Operacao`
5. `Financeiro`
6. `Clara`

Esse e o menor recorte que melhora IA, preserva o que ja existe e abre caminho para um redesign mais forte sem tentar resolver tudo de uma vez.
