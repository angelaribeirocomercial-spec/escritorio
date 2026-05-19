# PRD Mestre - Plano Operacional Imediato

**Base canonica:** `docs/product/lexia-bancaria/prd-mestre-escritorio-bancario-v2.md`
**Complementos:**
- `docs/product/lexia-bancaria/prd-mestre.addendum-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.execucao-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.backlog-fases.md`
- `docs/product/lexia-bancaria/prd-mestre.matriz-estado-atual.md`
- `docs/product/lexia-bancaria/prd-mestre.matriz-rastreabilidade.md`
- `docs/product/lexia-bancaria/prd-mestre.pacote-final-handoff.md`
**Status:** Draft controlado

---

## 1. Objetivo

Definir o primeiro ciclo de execucao correto considerando o sistema exatamente como ele existe hoje.

Este plano nao reinicia o produto. Ele organiza a proxima rodada para evitar retrabalho, conflito de escopo e mistura entre `Financeiro Operacional` e `Financeiro Juridico`.

---

## 2. Ordem correta de acao

### Passo 1 - PO

O `@po` deve:

1. validar que o `PRD mestre` continua como fonte unica
2. usar apenas o addendum, a matriz de estado atual e a matriz de rastreabilidade
3. manter as stories `18.25` a `18.33` como backlog canonico do recorte
4. impedir reintroducao de PRDs antigos ou escopo removido

### Passo 2 - Architect

O `@architect` deve:

1. fechar o modelo canonico `Cliente -> Caso -> Processo -> Dossie Unico`
2. travar a separacao entre `Financeiro Operacional` e `Financeiro Juridico`
3. definir a fronteira de OCR como boundary real
4. manter BACEN como servico boundary
5. desenhar Clara como orquestradora do dossie, nao como modulo paralelo

### Passo 3 - Dev

O `@dev` deve iniciar somente depois do alinhamento arquitetural minimo:

1. consolidacao do cockpit do caso
2. consolidacao de documentos, workflow e timeline
3. boundary real de OCR
4. persistencia do calculo juridico e comparacao BACEN
5. abusividades, estrategia, laudo e peticao
6. Clara orquestradora

### Passo 4 - QA

O `@qa` deve validar em paralelo com a implementacao, mas sempre contra o estado atual:

1. fluxo unico do dossie
2. separacao operacional x juridica
3. OCR com revisao humana
4. BACEN como boundary
5. Clara operando sobre o caso real

---

## 3. Gatilhos de liberacao

### Liberar para implementacao

Somente apos:

1. backlog por fases aprovado
2. matriz de rastreabilidade completa
3. entendimento claro das surfaces reaproveitaveis
4. fronteira operacional vs juridica aceita

### Liberar para QA de fluxo

Somente apos:

1. cockpit do caso consolidado
2. OCR boundary definido
3. calculo juridico persistente
4. estrategia, laudo e peticao conectados ao mesmo caso

---

## 4. O que nao deve acontecer agora

1. nao criar um novo ERP financeiro
2. nao tratar o financeiro operacional como base do caso juridico
3. nao criar OCR, BACEN ou Clara como modulos isolados
4. nao reabrir PRDs antigos
5. nao começar por peticao antes de documento e calculo
6. nao começar por Clara antes do dossie ter uma base confiavel

---

## 5. Sequencia de entrega recomendada

1. fundacao
2. cockpit do caso
3. OCR
4. BACEN e calculo juridico
5. abusividades
6. estrategia e laudo
7. peticao
8. Clara orquestradora
9. QA final

---

## 6. Resultado esperado da primeira rodada

1. cada agente sabe o que fazer
2. nenhuma superficie critica fica sem dono
3. o trabalho respeita o estado atual do sistema
4. o recorte fica incremental e rastreavel
5. o produto avanca sem perder o que ja foi construido

