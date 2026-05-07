# PRD Mestre - Handoff Operacional Curto

**Base canonica:** `docs/product/lexia-bancaria/prd-mestre-escritorio-bancario-v2.md`
**Complementos obrigatorios:**
- `docs/product/lexia-bancaria/prd-mestre.addendum-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.matriz-estado-atual.md`
- `docs/product/lexia-bancaria/prd-mestre.matriz-rastreabilidade.md`
- `docs/product/lexia-bancaria/prd-mestre.backlog-fases.md`
- `docs/product/lexia-bancaria/prd-mestre.plano-operacional-imediato.md`
**Status:** Pronto para execucao

---

## Ordem dos agentes

1. `@po`
2. `@architect`
3. `@dev`
4. `@qa`

---

## Instrucoes para `@po`

1. manter o `PRD mestre` como unica fonte canonica
2. considerar o estado atual do sistema como brownfield
3. usar apenas os complementos listados acima
4. manter o backlog em `18.25` a `18.33`
5. nao reabrir PRDs antigos

## Instrucoes para `@architect`

1. travar `Cliente -> Caso -> Processo -> Dossie Unico`
2. separar `Financeiro Operacional` de `Financeiro Juridico`
3. definir OCR como boundary real
4. manter BACEN como boundary de servico
5. desenhar Clara como orquestradora do dossie

## Instrucoes para `@dev`

1. iniciar por `18.25` e `18.26`
2. continuar com `18.27` e `18.28`
3. depois OCR, BACEN, abusividades, estrategia, laudo, peticao e Clara
4. reaproveitar surfaces reais ja existentes
5. nao criar modulo novo se a surface atual puder ser consolidada

## Instrucoes para `@qa`

1. validar fluxo unico do dossie
2. validar separacao operacional x juridica
3. validar OCR com revisao humana
4. validar Clara sobre o caso real
5. validar regressao de navegacao e permissao

---

## Regras de corte

1. nao tratar o sistema como greenfield
2. nao misturar financeiro operacional com financeiro juridico
3. nao começar por peticao antes de documento e calculo
4. nao começar por Clara antes do dossie existir como unidade confiavel
5. nao reabrir PRDs antigos

