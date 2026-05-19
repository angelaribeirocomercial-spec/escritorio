# PRD Mestre - Backlog por Fases do Dossie Unico

**Base canonica:** `docs/product/lexia-bancaria/prd-mestre-escritorio-bancario-v2.md`
**Complementos:**
- `docs/product/lexia-bancaria/prd-mestre.addendum-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.execucao-dossie-unico.md`
**Status:** Draft controlado

---

## 1. Objetivo

Organizar as stories do recorte do dossie unico em uma ordem executavel, com dependencias claras e sem misturar `Financeiro Operacional` com `Financeiro Juridico`.

---

## 2. Fase 0 - Slice minimo ja validado

Stories ja concluídas e servindo de base:

1. `18.22` - slice minimo de onboarding do novo atendimento bancario
2. `18.23` - consolidar andamentos dentro de processos
3. `18.24` - criacao financeira com validacao controlada e normalizacao local

Essas stories ficam como precondicao operacional do recorte atual.

---

## 3. Fase 1 - Fundacao

### Stories

1. `18.25` - travar o modelo canonico Cliente -> Caso -> Processo -> Dossie Unico
2. `18.26` - separar Financeiro Operacional de Financeiro Juridico

### Dependencias

- base canonica do PRD mestre
- intake minimo ja validado

### Saida esperada

- fronteiras de dominio fixadas
- dossie unico reconhecido como superficie central
- finance operational e juridico sem colisionar

---

## 4. Fase 2 - Cockpit do caso

### Stories

1. `18.27` - criar cockpit unico do caso e intake minimo
2. `18.28` - consolidar documentos, workflow e timeline no caso

### Dependencias

- Fase 1 concluida

### Saida esperada

- area do cliente vira cockpit unico do caso
- documentos, workflow e timeline aparecem na mesma superficie

---

## 5. Fase 3 - GED + OCR

### Stories

1. `18.29` - criar boundary real de OCR com status e revisao humana

### Dependencias

- Fase 2 concluida

### Saida esperada

- o sistema distingue documento armazenado de documento lido
- a revisao humana entra na leitura com status explicito

---

## 6. Fase 4 - Financeiro Juridico + BACEN

### Stories

1. `18.30` - persistir calculo juridico e comparacao BACEN

### Dependencias

- Fase 1 concluida
- OCR e cockpit minimo estabilizados

### Saida esperada

- calculo juridico persistido como artefato do caso
- BACEN como boundary controlado

---

## 7. Fase 5 - Abusividades, Estrategia e Laudo

### Stories

1. `18.31` - registrar abusividades e sugestao juridica
2. `18.32` - gerar estrategia e laudo revisional

### Dependencias

- Fase 4 concluida

### Saida esperada

- inventario de abusividades com gravidade e impacto
- saida tecnica consolidada para o caso

---

## 8. Fase 6 - Clara Orquestradora

### Stories

1. `18.33` - Clara orquestradora e acao Analise Caso

### Dependencias

- Fases 2, 4 e 5 concluidas

### Saida esperada

- Clara opera sobre o dossie real
- acao central `Analisar Caso com Clara` passa a refletir status real do fluxo

---

## 9. Fase 7 - Validacao

### Stories sugeridas

1. matriz de QA do fluxo unico
2. regressao de navegacao e permissao
3. rastreabilidade final entre PRD mestre, addendum e stories

### Dependencias

- todas as fases anteriores

### Saida esperada

- fluxo unico validado de ponta a ponta
- sem regressao de surfaces existentes

---

## 10. Ordem de prioridade operacional

1. fundacao
2. cockpit do caso
3. OCR
4. BACEN e calculo juridico
5. abusividades, estrategia e laudo
6. Clara orquestradora
7. QA e rastreabilidade

---

## 11. Donos sugeridos por fase

### `@architect`

- Fase 1
- Fase 3
- Fase 4
- desenho da orquestracao de Clara

### `@dev`

- Fase 2
- Fase 5
- implementacao da acao central

### `@qa`

- validacao de todas as fases

### `@po`

- rastreabilidade
- priorizacao
- corte de escopo

