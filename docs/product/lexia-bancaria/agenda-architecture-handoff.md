# Handoff de Arquitetura: Agenda Operacional

## Escopo

Este handoff fecha a direção técnica da story [11.1.build-operational-agenda-workspace.md](/C:/Users/User/escritorio/docs/stories/11.1.build-operational-agenda-workspace.md).

Objetivo: adicionar `agenda` como módulo novo que unifica compromissos, prazos e tarefas sem duplicar a função de `tarefas`.

## Decisões Arquiteturais

### 1. Agenda é centro temporal, não substituto de módulo

No ADVX:

1. `tarefas` continua sendo a superfície de execução
2. `agenda` vira a superfície temporal unificada
3. `processos`, `andamentos` e `diario-oficial` alimentam a agenda, mas não são substituídos por ela

### 2. Tipos explícitos de item

Os itens precisam ser distinguíveis:

1. `task`
2. `commitment`
3. `deadline`

Nunca renderizar tudo como “evento” genérico.

### 3. Novos contratos de domínio

Adicionar em [index.ts](/C:/Users/User/escritorio/packages/domain/src/index.ts):

1. `AgendaViewMode`
2. `AgendaCommitmentRecord`
3. `ProceduralDeadlineRecord`

O serviço de agenda deve produzir um shape enriquecido comum, não apenas devolver os mocks crus.

### 4. Serviço agregador

Criar:

1. `apps/web/src/server/services/agenda/get-agenda-workspace.ts`

Esse serviço deve:

1. ler tarefas existentes
2. ler compromissos mockados
3. ler prazos mockados
4. normalizar tudo em um array de agenda
5. aplicar filtros de `view` e `responsavel`

### 5. Views

Views mínimas:

1. `dia`
2. `semana`
3. `mes`

Implementação:

1. usar uma janela temporal baseada na data corrente
2. `dia` = mesma data
3. `semana` = 7 dias corridos
4. `mes` = mês corrente

### 6. Rota

Adicionar:

1. `apps/web/src/app/(workspace)/agenda/page.tsx`

Não é necessário criar detalhe próprio de agenda nesta story. Os links devem apontar para os módulos de origem quando existir detalhe próprio.

### 7. Navegação e localhost

1. incluir `Agenda` no menu lateral
2. proteger no `middleware`
3. atualizar smoke tests
4. o resultado deve aparecer imediatamente no `localhost` com hot reload ou após refresh da rota

## Sequência recomendada para o `@dev`

1. adicionar contratos
2. criar mocks de compromissos e prazos
3. criar serviço agregador
4. criar rota `agenda`
5. atualizar shell, middleware e smoke test
6. validar com `lint`, `typecheck`, `test`

