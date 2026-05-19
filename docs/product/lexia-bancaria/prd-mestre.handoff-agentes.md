# PRD Mestre - Handoff para Agentes

**Base canonica:** `docs/product/lexia-bancaria/prd-mestre-escritorio-bancario-v2.md`
**Complementos obrigatorios:**
- `docs/product/lexia-bancaria/prd-mestre.addendum-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.execucao-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.backlog-fases.md`
- `docs/product/lexia-bancaria/prd-mestre.matriz-estado-atual.md`
- `docs/product/lexia-bancaria/prd-mestre.matriz-rastreabilidade.md`
- `docs/product/lexia-bancaria/prd-mestre.pacote-final-handoff.md`
- `docs/product/lexia-bancaria/prd-mestre.plano-operacional-imediato.md`

---

## `@po`

1. manter o `PRD mestre` como fonte unica
2. usar a matriz de estado atual para nao presumir greenfield
3. usar a matriz de rastreabilidade para ligar requisito -> story -> surface -> gap
4. manter o backlog canonico nas stories `18.25` a `18.33`
5. impedir resgate de PRD antigo ou escopo removido

## `@architect`

1. travar o modelo `Cliente -> Caso -> Processo -> Dossie Unico`
2. separar `Financeiro Operacional` de `Financeiro Juridico`
3. definir OCR como boundary real
4. manter BACEN como boundary de servico
5. desenhar Clara como orquestradora do dossie, nao superficie paralela

## `@dev`

1. iniciar pela consolidacao do cockpit do caso
2. consolidar documentos, workflow e timeline no caso
3. implementar OCR boundary
4. persistir calculo juridico, comparacao BACEN e abusividades
5. gerar estrategia, laudo e peticao
6. fechar Clara como acao de analise do caso

## `@qa`

1. validar o fluxo unico do dossie
2. validar separacao operacional x juridica
3. validar OCR com revisao humana
4. validar BACEN como boundary
5. validar Clara sobre o caso real e nao dados soltos

---

## Ordem de inicio

1. `@po`
2. `@architect`
3. `@dev`
4. `@qa`

---

## Regra de corte

1. nao criar modulo novo se uma surface atual puder ser consolidada
2. nao reabrir PRD antigo
3. nao misturar financeiro operacional com financeiro juridico
4. nao começar por Clara antes do dossie existir como unidade confiavel

