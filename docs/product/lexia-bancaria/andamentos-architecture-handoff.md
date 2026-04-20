# Handoff de Arquitetura: Andamentos Processuais com Clara

## Escopo

Este handoff fecha a direção técnica da story [10.3.build-automatic-procedural-updates-with-clara.md](/C:/Users/User/escritorio/docs/stories/10.3.build-automatic-procedural-updates-with-clara.md).

Objetivo: adicionar `andamentos` como módulo novo de monitoramento processual, mantendo separação clara entre dado factual do tribunal e interpretação contextual da Clara.

## Decisões Arquiteturais

### 1. Andamento é evento factual

No ADVX:

1. `andamento processual` vira objeto próprio
2. `processo judicial` continua sendo a âncora jurídica
3. `caso bancario` continua sendo a âncora de negócio
4. `Clara` interpreta o andamento, mas não substitui o dado bruto

Relação:

`Client -> BankingCase -> JudicialProcess -> ProceduralUpdate -> Clara interpretation`

### 2. Não misturar timeline do processo com interpretação da Clara

Decisão:

1. o registro do andamento deve conter dados crus e resumo operacional curto
2. a leitura da Clara fica em um bloco separado
3. o detalhe do andamento deve deixar visível o que veio do evento e o que é sugestão

### 3. Novo contrato de domínio

Adicionar em [index.ts](/C:/Users/User/escritorio/packages/domain/src/index.ts):

1. `ProceduralUpdateCriticality`
2. `ProceduralUpdateRecord`

Estrutura recomendada:

```ts
export type ProceduralUpdateCriticality = "low" | "medium" | "high";

export interface ProceduralUpdateRecord {
  id: string;
  processId: string;
  caseId: string;
  clientId: string;
  occurredAt: string;
  movementType: string;
  sourceCourt: string;
  sourceLabel: string;
  rawMovement: string;
  operationalSummary: string;
  criticality: ProceduralUpdateCriticality;
  claraImpactSummary: string;
  claraCaution: string;
  claraNextActions: readonly string[];
}
```

### 4. Serviço enriquecido

Criar:

1. `apps/web/src/server/services/procedural-updates/get-procedural-updates.ts`

Shape enriquecido:

```ts
type ProceduralUpdateWithRelations = ProceduralUpdateRecord & {
  client: ClientRecord;
  bankingCase: BankingCaseRecord;
  judicialProcess: JudicialProcessRecord;
};
```

Também deve expor:

1. `getProceduralUpdatesByProcessId`
2. `getProceduralUpdateById`

### 5. Integração com o workspace de processo

A tela de [processos/[processId]/page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/processos/[processId]/page.tsx) deve passar a mostrar um bloco `Ultimos andamentos`.

Regras:

1. mostrar no máximo 3 itens
2. usar o serviço novo, não reusar `latestTimeline` do processo como se fosse a mesma coisa
3. manter a timeline original do processo visível

### 6. Rotas novas

Adicionar:

1. `apps/web/src/app/(workspace)/andamentos/page.tsx`
2. `apps/web/src/app/(workspace)/andamentos/[updateId]/page.tsx`

Navegação:

1. incluir `Andamentos` no menu lateral
2. proteger rota no `middleware`

### 7. Padrão visual

Direção:

1. lista de andamentos com criticidade, processo, banco e resumo operacional
2. detalhe com duas camadas explícitas:
   - movimento/andamento bruto
   - interpretação da Clara
3. CTA deve apontar para processo ou tarefa recomendada, sem inventar automação persistente

## Sequência recomendada para o `@dev`

1. adicionar contratos no domínio
2. adicionar mocks de andamentos
3. criar serviço `get-procedural-updates`
4. registrar export em `packages/mocks`
5. criar `andamentos/page.tsx`
6. criar `andamentos/[updateId]/page.tsx`
7. atualizar `processos/[processId]/page.tsx` com últimos andamentos
8. atualizar menu lateral, `middleware` e smoke test
9. rodar `npm run lint`, `npm run typecheck`, `npm test`

## Riscos aceitos

1. andamentos ainda mockados nesta etapa
2. sem configuração real de monitoramento automático
3. sem geração persistente de tarefa a partir do andamento

Esses riscos são aceitáveis porque a story visa provar a camada de monitoramento e interpretação antes da automação real.

