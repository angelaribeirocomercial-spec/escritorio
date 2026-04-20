# Handoff de Arquitetura: Diário Oficial Bancário

## Escopo

Este handoff fecha a direção técnica da story [10.2.build-official-diary-monitoring-and-triage.md](/C:/Users/User/escritorio/docs/stories/10.2.build-official-diary-monitoring-and-triage.md).

Objetivo: adicionar `diario-oficial` como módulo novo de publicações, vinculado a `processos`, sem duplicar o papel operacional de `tarefas`.

## Decisões Arquiteturais

### 1. Publicação é o evento-fonte

No ADVX:

1. `publicacao do Diario Oficial` vira um objeto próprio
2. `processo judicial` continua sendo a âncora jurídica
3. `caso bancario` continua sendo a âncora de negócio
4. `tarefa` continua sendo o artefato operacional downstream

Relação:

`Client -> BankingCase -> JudicialProcess -> OfficialDiaryPublication -> Task draft/preparada`

### 2. Não criar CRUD real de tarefa nesta story

A `10.2` deve **preparar** a tarefa, não criar persistência real.

Decisão:

1. o detalhe da publicação mostra uma tarefa sugerida
2. o CTA principal leva para `tarefas` com um identificador da publicação
3. a tela de `tarefas` renderiza uma faixa ou card de “tarefa preparada a partir da publicação”

Isso cumpre o fluxo sem fingir um backend real que ainda não existe.

### 3. Novo contrato de domínio

Adicionar em [index.ts](/C:/Users/User/escritorio/packages/domain/src/index.ts):

1. `OfficialDiaryUrgency`
2. `OfficialDiaryPublicationRecord`

Estrutura recomendada:

```ts
export type OfficialDiaryUrgency = "low" | "medium" | "high";

export interface OfficialDiaryPublicationRecord {
  id: string;
  processId: string;
  caseId: string;
  clientId: string;
  publishedAt: string;
  sourceCourt: string;
  sourceLabel: string;
  title: string;
  rawContext: string;
  bankingSummary: string;
  requiredAction: string;
  urgency: OfficialDiaryUrgency;
  responsibleLawyer: string;
  suggestedTaskTitle: string;
  suggestedTaskDescription: string;
}
```

### 4. Serviço enriquecido

Criar:

1. `apps/web/src/server/services/official-diary/get-official-diary.ts`

O serviço deve retornar:

```ts
type OfficialDiaryPublicationWithRelations = OfficialDiaryPublicationRecord & {
  client: ClientRecord;
  bankingCase: BankingCaseRecord;
  judicialProcess: JudicialProcessRecord;
};
```

Também deve expor uma função pequena para “task draft” da publicação.

### 5. Mock ligado à base real atual

Criar:

1. `packages/mocks/src/official-diary.ts`

Regras:

1. toda publicação aponta para `processId`, `caseId` e `clientId` existentes
2. usar bancos, teses e responsáveis já presentes em `casos` e `processos`
3. variar urgência e tipo de ação requerida
4. manter texto curto, mas juridicamente plausível

### 6. Rotas novas

Adicionar:

1. `apps/web/src/app/(workspace)/diario-oficial/page.tsx`
2. `apps/web/src/app/(workspace)/diario-oficial/[publicationId]/page.tsx`

Navegação:

1. incluir `Diario Oficial` no menu lateral
2. proteger rota no `middleware`

### 7. Bridge com tarefas

Atualizar [page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/tarefas/page.tsx):

1. aceitar `searchParams.publication`
2. quando presente, buscar um draft da publicação
3. renderizar um card de “tarefa preparada”
4. não alterar a listagem base de tarefas

### 8. Padrão visual

Direção:

1. lista de publicações com urgência, processo, banco e ação exigida
2. detalhe com duas camadas bem separadas:
   - texto cru da publicação
   - interpretação bancária do ADVX/Clara
3. CTA final sempre aponta para ação operacional

## Sequência recomendada para o `@dev`

1. adicionar contratos no domínio
2. adicionar mocks de publicações
3. criar serviço `get-official-diary`
4. registrar export no `packages/mocks`
5. criar `diario-oficial/page.tsx`
6. criar `diario-oficial/[publicationId]/page.tsx`
7. atualizar menu lateral e `middleware`
8. atualizar `tarefas/page.tsx` para exibir tarefa preparada
9. expandir `apps/web/tests/run-tests.js`
10. rodar `npm run lint`, `npm run typecheck`, `npm test`

## Riscos aceitos

1. task draft apenas visual nesta story
2. publicação ainda mockada
3. sem ingestão automática nesta etapa

Esses riscos são aceitáveis porque destravam o próximo bloco de andamentos sem inventar persistência falsa.

