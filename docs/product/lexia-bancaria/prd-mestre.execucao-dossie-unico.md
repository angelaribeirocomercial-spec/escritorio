# PRD Mestre - Plano de Execucao do Dossie Unico

**Base canonica:** `docs/product/lexia-bancaria/prd-mestre-escritorio-bancario-v2.md`
**Complemento:** `docs/product/lexia-bancaria/prd-mestre.addendum-dossie-unico.md`
**Status:** Draft controlado

---

## 1. Objetivo deste plano

Transformar o PRD mestre em um fluxo executavel e incremental, preservando:

1. o produto atual
2. a navegacao atual
3. as funcionalidades existentes
4. a separacao entre financeiro operacional e financeiro juridico

---

## 2. Ordem de execucao

### Fase 1 - Fundacao

1. travar o modelo canônico de cliente, caso, processo e dossie unico
2. definir contratos de dados compartilhados
3. separar claramente os dominios financeiro operacional e juridico

### Fase 2 - Cockpit do caso

1. consolidar a visao unica do caso
2. unificar intake minimo com o dossie
3. consolidar documentos, workflow e timeline

### Fase 3 - GED + OCR

1. introduzir boundary real de OCR
2. ligar upload ao contrato do caso
3. habilitar conferencia humana

### Fase 4 - Financeiro Juridico + BACEN

1. persistir calculo juridico
2. formalizar consulta BACEN como boundary
3. comparar contrato x mercado
4. classificar abusividades

### Fase 5 - Estrategia, laudo e peticao

1. registrar abusividades por caso
2. gerar estrategia
3. gerar laudo
4. gerar peticao com revisao humana

### Fase 6 - Clara Orquestradora

1. fazer Clara operar sobre o dossie real
2. consolidar historico, fontes e minutas
3. criar a acao central de analise do caso

### Fase 7 - Validacao

1. matriz de QA por fluxo
2. regressao de navegacao
3. rastreabilidade final do PRD mestre

---

## 3. Backlog resumido por dono

### `@architect`

1. fundacao do dossie
2. contratos de dados
3. boundary de OCR
4. boundary BACEN
5. modelagem do financeiro juridico
6. Clara como orquestradora

### `@dev`

1. cockpit do caso
2. intake minimo
3. documentos e workflow
4. persistencia dos calculos e abusividades
5. estrategia, laudo e peticao
6. acao de analise central

### `@qa`

1. validar fluxo unico
2. validar separacao de dominios financeiros
3. validar OCR e revisao humana
4. validar geracao de estrategia, laudo e peticao
5. validar regressao de navegacao

### `@po`

1. manter rastreabilidade com o PRD mestre
2. garantir backlog incremental
3. manter escopo limpo

---

## 4. Regras de corte

1. nao criar um ERP financeiro novo
2. nao fragmentar BACEN, OCR ou Clara em sistemas separados
3. nao reabrir PRDs antigos
4. nao perder a distincao entre financeiro operacional e juridico
5. nao permitir peticao sem revisao humana

---

## 5. Entregaveis de produto

1. diagnostico consolidado
2. addendum do PRD mestre
3. backlog por fase
4. stories priorizadas
5. matriz de rastreabilidade
