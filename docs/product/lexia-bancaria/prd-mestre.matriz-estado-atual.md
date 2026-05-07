# PRD Mestre - Matriz de Estado Atual do Sistema

**Base canonica:** `docs/product/lexia-bancaria/prd-mestre-escritorio-bancario-v2.md`
**Complementos:**
- `docs/product/lexia-bancaria/prd-mestre.addendum-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.execucao-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.backlog-fases.md`
**Status:** Draft controlado

---

## 1. Objetivo

Registrar o sistema exatamente como ele existe agora, para que a execucao do `PRD mestre` considere:

1. o que ja existe
2. o que ja esta funcional
3. o que e apenas visual ou parcial
4. o que falta
5. o que pode ser reaproveitado
6. o que precisa ser criado

---

## 2. Dominios existentes hoje

### 2.1 Cliente / Caso / Processo

**Existe hoje:**

1. entidades de clientes e casos
2. cockpit de cliente
3. processo pos-distribuicao
4. workflow e checklist de caso
5. timeline e updates processuais

**Reaproveitavel:**

1. `clients`
2. `cases`
3. `processes`
4. `tasks`
5. `procedural_updates`
6. `get-banking-case-workflow`

**Gap atual:**

1. falta a projeção formal do dossie unico como unidade central
2. ainda existe separacao de superficies que precisa ser consolidada

---

### 2.2 Clara

**Existe hoje:**

1. workspace contextual
2. historico de execucoes
3. fontes e adapters
4. minutas e revisao humana
5. analise contratual e revisional parcial

**Reaproveitavel:**

1. `clara-workspace`
2. `clara-record-store`
3. `clara-minutas-store`
4. `clara-source-adapters`
5. `get-clara-structured-core`
6. `get-clara-workspace`
7. `get-banking-revisional-workspace`
8. `get-banking-revisional-calculation`

**Gap atual:**

1. Clara ainda nao opera como orquestradora completa do dossie unico
2. falta a acao central `Analisar Caso com Clara`
3. falta persistencia canonica de saidas do caso

---

### 2.3 Documentos / GED

**Existe hoje:**

1. storage real de documentos
2. metadados de documentos
3. listagem e preview
4. upload funcional

**Reaproveitavel:**

1. `documents`
2. `upload-tenant-document`
3. `get-document-file-url`
4. `get-documents`
5. migrations e policies de documentos

**Gap atual:**

1. nao existe boundary real de OCR
2. leitura estruturada e confianca ainda nao existem como objeto separado
3. revisao humana de extracao ainda nao e um fluxo formal

---

### 2.4 Financeiro Operacional

**Existe hoje:**

1. receitas
2. despesas
3. transferencias
4. vencimentos
5. graficos e visoes operacionais

**Reaproveitavel:**

1. `financial_entries`
2. `get-financial-entries`
3. `create-financial-entry`
4. migrations e seeds do financeiro operacional

**Gap atual:**

1. caixa e conta bancaria real ainda nao foram modelados como vertical propria
2. o financeiro operacional nao deve ser usado como base do financeiro juridico

---

### 2.5 Financeiro Juridico / BACEN

**Existe hoje:**

1. calculo revisional parcial
2. analise contratual
3. boundary BACEN com fallback controlado

**Reaproveitavel:**

1. `get-contract-analysis`
2. `get-bcb-consultation`
3. `api/bcb/tarifas`
4. `api/bcb/sgs`
5. `api/bcb/ptax`

**Gap atual:**

1. nao existe vertical persistida do financeiro juridico do caso
2. nao existe comparacao BACEN formal como artefato do dossie
3. nao existe classificacao persistida de abusividades vinculada ao contrato

---

### 2.6 Peticoes / Laudos / Estrategia

**Existe hoje:**

1. minutas
2. editor de texto
3. exportacao de documentos
4. revisao humana em algumas superficies

**Reaproveitavel:**

1. `minutas`
2. `versoes_peca`
3. `editor-de-texto`
4. `document-generation`

**Gap atual:**

1. laudo revisional ainda nao e artefato de caso persistido
2. estrategia automatica ainda nao e uma vertical propria
3. peticao ainda nao consome um dossie unico consolidado

---

## 3. Matriz de prioridade considerando o estado atual

### P0

1. travar modelo canonico do dossie
2. separar financeiro operacional de financeiro juridico
3. consolidar cockpit unico do caso

### P1

1. consolidar documentos, workflow e timeline no caso
2. criar boundary real de OCR
3. persistir calculo juridico e comparacao BACEN

### P2

1. registrar abusividades
2. gerar estrategia
3. gerar laudo revisional
4. gerar peticao com revisao humana

### P3

1. Clara orquestradora
2. acao central analisar caso
3. QA final e rastreabilidade

---

## 4. Leitura operacional imediata

O sistema atual nao e um projeto vazio.

Ele ja possui:

1. caso real
2. documentos reais
3. processo real
4. Clara contextual parcial
5. financeiro operacional real
6. revisional parcial

Portanto, o trabalho correto e evoluir por consolidacao, nao por reinicio.

---

## 5. Regra de uso desta matriz

1. o backlog deve sempre ser lido junto com este estado atual
2. nenhuma story deve assumir que o que ainda nao existe ja foi criado
3. nada de recortar o produto como se fosse greenfield
4. qualquer dependencia deve apontar para uma surface real ja presente no repo

