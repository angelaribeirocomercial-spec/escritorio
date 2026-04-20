# Handoff de Arquitetura: Módulo de Processos Judiciais

## Escopo

Este handoff fecha a direção técnica da story [10.1.build-judicial-process-registry-and-workspace.md](/C:/Users/User/escritorio/docs/stories/10.1.build-judicial-process-registry-and-workspace.md).

Objetivo: adicionar `processos` como módulo novo de primeira classe, sem quebrar o núcleo atual de `casos`.

## Decisões Arquiteturais

### 1. `caso` continua sendo a âncora de negócio

`Casos bancários` continuam sendo a unidade central do produto.

`Processo judicial` entra como camada jurídica vinculada ao caso, não como substituto do caso.

Relação:

1. `Client -> BankingCase -> JudicialProcess`
2. Um `caso` pode ter um ou mais `processos`
3. O primeiro corte da story `10.1` pode trabalhar com um processo principal por caso nos mocks, mas a estrutura não deve travar expansão futura

### 2. Não refatorar agressivamente `BankingCaseRecord` na 10.1

Hoje `processNumber` já existe dentro de `BankingCaseRecord` em [index.ts](/C:/Users/User/escritorio/packages/domain/src/index.ts).

Para evitar regressão:

1. manter `processNumber` no contrato atual de `casos` durante a `10.1`
2. introduzir `JudicialProcessRecord` como novo contrato separado
3. usar um serviço enriquecido para conectar `processo + caso + cliente`
4. deixar uma futura story responsável por desnormalizar ou retirar `processNumber` de `casos` se isso ainda fizer sentido

Razão: o detalhe e a listagem de `casos` já dependem desse campo hoje em [casos/page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/casos/page.tsx) e [[caseId]/page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/casos/[caseId]/page.tsx).

### 3. Novo contrato de domínio

Adicionar em [index.ts](/C:/Users/User/escritorio/packages/domain/src/index.ts):

1. `JudicialProcessStatus`
2. `JudicialProcessCriticality`
3. `JudicialTimelineItem`
4. `JudicialProcessRecord`

Estrutura recomendada:

```ts
export type JudicialProcessStatus =
  | "monitoring"
  | "awaiting-filing"
  | "active"
  | "stayed"
  | "closed";

export type JudicialProcessCriticality = "low" | "medium" | "high";

export interface JudicialTimelineItem {
  id: string;
  occurredAt: string;
  title: string;
  description: string;
  source: string;
  criticality: JudicialProcessCriticality;
}

export interface JudicialProcessRecord {
  id: string;
  caseId: string;
  clientId: string;
  processNumber: string;
  tribunal: string;
  courtDistrict: string;
  courtName: string;
  proceduralPhase: string;
  status: JudicialProcessStatus;
  responsibleLawyer: string;
  monitoringMode: "manual" | "oab" | "court";
  latestTimeline: readonly JudicialTimelineItem[];
}
```

Observação: `bankName`, `mainThesis` e `legalRisk` não precisam viver duplicados no contrato-base do processo. Esses dados já pertencem ao `caso`.

### 4. Serviço enriquecido, não página acoplada ao mock

Criar:

1. `apps/web/src/server/services/processes/get-processes.ts`

O serviço deve retornar um shape enriquecido:

```ts
type JudicialProcessWithRelations = JudicialProcessRecord & {
  client: ClientRecord;
  bankingCase: BankingCaseRecord;
};
```

Isso permite:

1. lista de `processos` com banco, tese e risco sem duplicar origem de verdade
2. detalhe de processo com visão jurídica e contexto bancário no mesmo workspace
3. futura troca de mocks por persistência real sem reescrever a UI

### 5. Mocks devem ser derivados da carteira atual

Criar:

1. `packages/mocks/src/processes.ts`

Regras:

1. cada processo mock deve apontar para `caseId` e `clientId` existentes
2. usar os mesmos bancos, teses e responsáveis já presentes em [cases.ts](/C:/Users/User/escritorio/packages/mocks/src/cases.ts)
3. timeline curta, mas convincente, com 3 a 5 eventos por processo
4. modelar variedade real: processo ativo, aguardando protocolo, suspenso, em monitoramento

### 6. Rotas novas

Adicionar:

1. `apps/web/src/app/(workspace)/processos/page.tsx`
2. `apps/web/src/app/(workspace)/processos/[processId]/page.tsx`

Navegação:

1. incluir `Processos` em [workspace-shell.tsx](/C:/Users/User/escritorio/apps/web/src/components/layout/workspace-shell.tsx)
2. manter `Casos` separado
3. não mover `casos` de lugar nem fundir menus nesta story

### 7. Padrão visual

Reutilizar o mesmo padrão de:

1. [workspace-page.tsx](/C:/Users/User/escritorio/apps/web/src/components/layout/workspace-page.tsx)
2. lista operacional usada em [casos/page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/casos/page.tsx)
3. detalhe contextual usado em [[caseId]/page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/casos/[caseId]/page.tsx)

Direção:

1. a lista de processos deve ser mais jurídica e menos comercial que a de casos
2. o detalhe do processo deve mostrar primeiro dados processuais, depois contexto do caso bancário
3. o card da Clara deve aparecer como leitura contextual, não como substituto do dado processual

### 8. Compatibilidade obrigatória

A `10.1` não deve alterar o comportamento atual de:

1. `clientes`
2. `casos`
3. `documentos`
4. `tarefas`
5. `clara`

Além disso:

1. manter compatibilidade com o teste em [run-tests.js](/C:/Users/User/escritorio/apps/web/tests/run-tests.js)
2. expandir o smoke test para verificar as novas rotas `processos`

## Sequência recomendada para o `@dev`

1. adicionar contratos no domínio
2. adicionar mocks de processos
3. criar serviço `get-processes`
4. registrar export em `packages/mocks/src/index.ts`
5. criar `processos/page.tsx`
6. criar `processos/[processId]/page.tsx`
7. adicionar entrada no menu lateral
8. expandir `apps/web/tests/run-tests.js`
9. rodar `npm run lint`, `npm run typecheck`, `npm test`

## Riscos aceitos

1. duplicidade temporária entre `case.processNumber` e `process.processNumber`
2. timeline ainda mockada na primeira entrega
3. sem persistência real nesta story

Esses riscos são aceitáveis porque preservam estabilidade e destravam o bloco seguinte de `Diário Oficial` e `Andamentos`.

## Saída esperada da `10.1`

Ao final da story, o produto deve ganhar:

1. módulo `Processos`
2. lista de processos com filtros úteis
3. detalhe de processo com timeline e contexto bancário
4. integração clara com `casos` e `clientes`
5. base pronta para `Diário Oficial` e `Andamentos`

