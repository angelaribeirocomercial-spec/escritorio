# PRD Mestre - Matriz de Rastreabilidade

**Base canonica:** `docs/product/lexia-bancaria/prd-mestre-escritorio-bancario-v2.md`
**Complementos:**
- `docs/product/lexia-bancaria/prd-mestre.addendum-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.execucao-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.backlog-fases.md`
- `docs/product/lexia-bancaria/prd-mestre.matriz-estado-atual.md`
**Status:** Draft controlado

---

## 1. Objetivo

Conectar cada bloco de produto do `PRD mestre` com:

1. a story correspondente
2. a surface real do sistema hoje
3. o gap que ainda precisa ser fechado

Esta matriz evita perda de contexto e impede que o trabalho seja tratado como greenfield.

---

## 2. Regra de leitura

Se um requisito nao tiver story, ele nao esta pronto para execucao.

Se uma story nao apontar para uma surface real, ela precisa ser revisada antes da implementacao.

Se uma surface real nao estiver mapeada, ela precisa entrar como reaproveitamento ou gap.

---

## 3. Matriz principal

| Requisito de produto | Story principal | Surface atual reaproveitavel | Gap atual |
| --- | --- | --- | --- |
| Cliente -> Caso -> Processo -> Dossie Unico | `18.25` | `client-cockpit-frame`, `process-cockpit-frame`, `cases`, `processes` | falta projeção formal do dossie unico |
| Separar Financeiro Operacional de Financeiro Juridico | `18.26` | `financial_entries`, `get-financial-entries`, `create-financial-entry`, `get-banking-revisional-calculation` | falta fronteira explicita e ownership separado |
| Cockpit unico do caso e intake minimo | `18.27` | `novo-atendimento-bancario`, `pessoas/clientes/[clientId]`, `casos/[caseId]` | cockpit ainda precisa consolidar o caso como centro |
| Documentos, workflow e timeline no caso | `18.28` | `documents`, `tasks`, `procedural_updates`, `get-banking-case-workflow` | falta consolidacao na mesma superficie |
| Boundary real de OCR | `18.29` | `upload-tenant-document`, `get-documents`, storage documental | nao existe OCR estruturado |
| Calculo juridico persistido + BACEN | `18.30` | `get-banking-revisional-calculation`, `get-contract-analysis`, `get-bcb-consultation` | falta persistencia canonica do financeiro juridico |
| Abusividades com sugestao juridica | `18.31` | `get-contract-analysis`, `get-clara-structured-core`, `get-clara-workspace` | falta artefato persistido de abusividades |
| Estrategia + laudo revisional | `18.32` | `get-banking-revisional-workspace`, `get-clara-artifacts`, `analise-contrato` | falta saida juridica consolidada e persistente |
| Clara orquestradora + Analise Caso | `18.33` | `clara/page.tsx`, `clara/actions.ts`, `get-clara-workspace`, `clara-workspace-context` | falta acao central e amarracao total ao dossie |

---

## 4. Matriz por requisito macro do PRD mestre

### 4.1 Fluxo principal do sistema

**Requisito:** cadastrar cliente -> criar caso -> subir contrato/documentos -> ler -> calcular -> comparar BACEN -> detectar abusividades -> explicar -> gerar estrategia -> gerar laudo -> gerar peticao -> revisar.

**Stories:**

1. `18.25`
2. `18.27`
3. `18.28`
4. `18.29`
5. `18.30`
6. `18.31`
7. `18.32`
8. `18.33`

**Surfaces atuais:**

1. `novo-atendimento-bancario`
2. `pessoas/clientes/[clientId]`
3. `casos/[caseId]`
4. `documentos`
5. `analise-contrato`
6. `clara`

**Gap:**

1. fluxo ainda esta distribuido em varias surfaces
2. dossie unico ainda nao e a unidade central de leitura

---

### 4.2 Estrutura do dossie unico do caso

**Requisito:** visão geral, documentos, contrato, financeiro juridico, BACEN, abusividades, estrategia, laudo, peticoes, timeline, Clara.

**Stories:**

1. `18.25`
2. `18.27`
3. `18.28`
4. `18.30`
5. `18.31`
6. `18.32`
7. `18.33`

**Surfaces atuais:**

1. cockpit do cliente
2. workflow de caso
3. documentos
4. Clara workspace
5. analise contratual

**Gap:**

1. nao existe uma composicao unica e persistida dessas abas
2. laudo e peticoes ainda nao vivem como artefatos do mesmo dossie

---

### 4.3 Motor financeiro juridico

**Requisito:** Tabela Price, SAC, saldo devedor, valor total pago, diferenca apurada, repeticao de indébito, liquidacao antecipada, margem consignavel.

**Stories:**

1. `18.26`
2. `18.30`
3. `18.32`

**Surfaces atuais:**

1. `get-banking-revisional-calculation`
2. `get-contract-analysis`
3. `get-banking-revisional-workspace`

**Gap:**

1. falta persistencia formal do calculo juridico
2. falta fronteira propria para o dominio juridico

---

### 4.4 BACEN

**Requisito:** BACEN deve ser service automatico, com mock estruturado e comparacao com mercado.

**Stories:**

1. `18.30`

**Surfaces atuais:**

1. `get-bcb-consultation`
2. `api/bcb/tarifas`
3. `api/bcb/sgs`
4. `api/bcb/ptax`

**Gap:**

1. comparacao ainda precisa virar artefato do caso
2. classificacao precisa ficar persistida no dossie

---

### 4.5 Clara IA

**Requisito:** Clara deve explicar o caso, os calculos, a comparacao BACEN, as abusividades, os documentos faltantes e gerar parecer, resumo e minuta.

**Stories:**

1. `18.33`
2. `18.32`
3. `18.31`

**Surfaces atuais:**

1. `clara/page.tsx`
2. `clara/actions.ts`
3. `get-clara-workspace`
4. `get-clara-structured-core`
5. `clara-record-store`
6. `clara-minutas-store`

**Gap:**

1. Clara ainda precisa ser amarrada ao dossie real do caso
2. a acao central de analise ainda nao existe como orquestrador completo

---

## 5. Rastreabilidade por estado atual

### Ja existente e reaproveitavel

1. clientes
2. casos
3. processos
4. documentos
5. Clara workspace
6. analise contratual parcial
7. financeiro operacional
8. BACEN boundary

### Parcial e precisa consolidacao

1. cockpit do cliente como dossie unico
2. financeiro juridico como vertical do caso
3. timeline unificada
4. estrategia e laudo como artefatos persistidos

### Nao existe ainda

1. OCR como boundary
2. abusividades persistidas
3. peticao gerada a partir do dossie unico
4. acao central `Analisar Caso com Clara`

---

## 6. Uso pratico desta matriz

1. toda nova story deve apontar para uma surface real ou para um gap claramente identificado
2. toda revisao de arquitetura deve manter esta rastreabilidade viva
3. toda entrega de dev deve atualizar o status dessa matriz
4. nenhum slice deve assumir que OCR, BACEN, Clara ou peticoes ja sao dominios persistidos quando ainda nao sao

