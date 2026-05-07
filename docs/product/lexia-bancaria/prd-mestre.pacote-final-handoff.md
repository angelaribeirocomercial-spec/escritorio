# PRD Mestre - Pacote Final de Handoff

**Base canonica:** `docs/product/lexia-bancaria/prd-mestre-escritorio-bancario-v2.md`
**Complementos:**
- `docs/product/lexia-bancaria/prd-mestre.addendum-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.execucao-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.backlog-fases.md`
- `docs/product/lexia-bancaria/prd-mestre.matriz-estado-atual.md`
- `docs/product/lexia-bancaria/prd-mestre.matriz-rastreabilidade.md`
**Status:** Draft controlado

---

## 1. Objetivo

Consolidar o pacote de instrucao para a proxima rodada do fluxo, com base no estado real do sistema e sem reabrir PRDs antigos.

---

## 2. Estado atual resumido

### Ja existe e deve ser reaproveitado

1. cliente
2. caso
3. processo
4. documentos
5. Clara contextual parcial
6. analise contratual parcial
7. financeiro operacional
8. BACEN boundary
9. minutas e revisao humana

### Ainda falta

1. dossie unico como superficie central
2. boundary real de OCR
3. financeiro juridico persistido
4. abusividades persistidas
5. estrategia, laudo e peticao como artefatos do caso
6. Clara como orquestradora completa

---

## 3. Ordem recomendada de execucao

### Bloco A - Fundacao

1. `18.25` - travar o modelo canonico Cliente -> Caso -> Processo -> Dossie Unico
2. `18.26` - separar Financeiro Operacional de Financeiro Juridico

### Bloco B - Cockpit do caso

1. `18.27` - criar cockpit unico do caso e intake minimo
2. `18.28` - consolidar documentos, workflow e timeline no caso

### Bloco C - OCR e leitura

1. `18.29` - criar boundary real de OCR com status e revisao humana

### Bloco D - Financeiro Juridico + BACEN

1. `18.30` - persistir calculo juridico e comparacao BACEN

### Bloco E - Abusividades, estrategia, laudo

1. `18.31` - registrar abusividades e sugestao juridica
2. `18.32` - gerar estrategia e laudo revisional

### Bloco F - Clara

1. `18.33` - Clara orquestradora e acao Analise Caso

### Bloco G - QA

1. matriz de QA do fluxo unico
2. regressao de navegacao e permissao
3. rastreabilidade final

---

## 4. Instrucoes por agente

### `@po`

1. manter o `PRD mestre` como base unica
2. atualizar backlog e prioridade apenas via addendum e matriz
3. impedir reintroducao de PRDs antigos ou escopo legado
4. garantir que cada story tenha dependencia e surface real

### `@architect`

1. fechar fronteiras de dominio
2. travar o modelo `Cliente -> Caso -> Processo -> Dossie Unico`
3. separar Financeiro Operacional de Financeiro Juridico
4. definir boundary real de OCR e BACEN como servicos
5. definir Clara como orquestradora do dossie, nao surface paralela

### `@dev`

1. implementar por fases, sem pular fundacao
2. reaproveitar surfaces reais do sistema atual
3. nao criar modulo novo se a surface atual puder ser consolidada
4. manter atualizados checklist e file list das stories

### `@qa`

1. validar que o fluxo nao mistura financeiro operacional com juridico
2. validar que OCR, BACEN, estrategia, laudo e peticao usam o mesmo caso
3. validar que Clara responde sobre o dossie real e nao sobre dados soltos
4. validar regressao de rotas, permissao e navegacao

---

## 5. Gaps que nao podem ser ignorados

1. OCR ainda nao existe como boundary proprio
2. dossie unico ainda nao existe como projeção central persistida
3. financeiro juridico ainda nao existe como vertical formal
4. abusividades ainda nao sao artefato persistido
5. laudo e peticao ainda dependem de consolidacao do dossie
6. Clara ainda nao opera como analista central do caso

---

## 6. Regra de corte

1. nao tratar o sistema como greenfield
2. nao quebrar o layout atual sem necessidade
3. nao duplicar surfaces
4. nao confundir financeiro operacional com financeiro juridico
5. nao reabrir PRDs antigos

---

## 7. Saida esperada da proxima rodada

1. stories com dependencias reais
2. arquitetura alinhada ao estado atual
3. execucao incremental por fase
4. QA centrado em fluxo unico
5. rastreabilidade viva entre produto e implementacao
