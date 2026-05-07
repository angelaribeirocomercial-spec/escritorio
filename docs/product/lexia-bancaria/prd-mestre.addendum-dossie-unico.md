# PRD Mestre - Addendum do Dossie Unico

**Base canonica:** `docs/product/lexia-bancaria/prd-mestre-escritorio-bancario-v2.md`
**Status:** Draft controlado
**Objetivo:** complementar o PRD mestre com a visao de Dossie Unico do Caso sem reintroduzir PRDs antigos, lixo legado ou fragmentacao de produto

---

## 1. Regra de leitura

Este addendum nao substitui o PRD mestre.

Ele apenas registra a extensao de produto para o fluxo:

1. cliente
2. caso
3. contrato
4. documentos
5. analise
6. estrategia
7. laudo
8. peticao
9. revisao humana
10. acompanhamento

---

## 2. Distincao de dominios

### 2.1 Financeiro Operacional

E o financeiro do escritorio.

Exemplos:

1. receitas
2. despesas
3. transferencias
4. vencimentos
5. caixa
6. contas bancarias da empresa

Esse dominio permanece separado e nao deve ser reutilizado como camada de calculo juridico do caso.

### 2.2 Financeiro Juridico

E o financeiro do caso juridico bancario.

Exemplos:

1. tabela Price
2. SAC
3. saldo devedor original
4. saldo devedor revisado
5. valor total pago
6. diferenca apurada
7. repeticao de indébito simples
8. repeticao de indébito em dobro
9. liquidacao antecipada
10. margem consignavel

Esse dominio pertence ao dossie do caso e deve ser consumido por Clara, laudo, estrategia e peticao.

---

## 3. Dossie unico do caso

O dossie unico deve ser a superficie central do caso.

Deve concentrar:

1. visao geral
2. documentos
3. contrato
4. financeiro juridico
5. BACEN
6. abusividades
7. estrategia
8. laudo
9. peticoes
10. timeline
11. Clara contextual

---

## 4. Fluxo alvo

O fluxo alvo permanece:

1. advogado cadastra cliente
2. cria caso juridico bancario
3. seleciona o tipo
4. faz upload do contrato e documentos
5. sistema le o material
6. advogado confere os dados extraidos
7. sistema analisa
8. motor financeiro juridico calcula
9. sistema consulta BACEN
10. sistema compara contrato x mercado
11. sistema detecta abusividades
12. Clara explica o caso
13. sistema gera estrategia
14. sistema gera laudo
15. sistema gera peticao
16. advogado revisa e aprova

---

## 5. Escopo de produto

### Dentro do escopo

1. consolidar o caso em um dossie unico
2. separar claramente financeiro operacional e financeiro juridico
3. ligar documentos, contrato, calculos, BACEN, abusividades, estrategia, laudo e peticao ao mesmo `case_id`
4. manter Clara como camada contextual do caso
5. preservar revisao humana

### Fora do escopo imediato

1. reescrever o produto do zero
2. criar um ERP financeiro empresarial novo
3. fragmentar Clara, BACEN ou OCR em sistemas independentes
4. reabrir PRDs antigos
5. restaurar lixo legado removido do PRD mestre

---

## 6. Artefatos do caso

O caso deve gerar e manter, no minimo:

1. documentos anexados
2. extracao estruturada
3. calculo juridico persistido
4. comparacao BACEN
5. abusividades detectadas
6. estrategia sugerida
7. laudo tecnico
8. minuta de peticao
9. timeline do caso
10. historico de Clara

---

## 7. Priorizacao macro

### Fase 1

1. travar o modelo canônico
2. separar os dominios financeiro operacional e juridico
3. definir contratos de identificadores

### Fase 2

1. criar o dossie unico no cockpit do cliente
2. consolidar intake, workflow e timeline

### Fase 3

1. criar boundary de OCR
2. ligar upload ao contrato do caso
3. permitir conferencia humana

### Fase 4

1. persistir calculo juridico
2. formalizar BACEN como boundary
3. classificar abusividades

### Fase 5

1. gerar estrategia
2. gerar laudo
3. gerar peticao

### Fase 6

1. fazer Clara operar sobre o dossie real
2. consolidar historico e fontes
3. criar a acao central analisar caso

---

## 8. Regra de ouro de navegacao

O advogado nao deve precisar ir manualmente em varios modulos separados.

O caminho correto e:

1. abrir cliente
2. abrir caso
3. subir contrato
4. clicar em analisar
5. revisar resultados

---

## 9. Dependencias que devem ser preservadas

1. cliente possui casos
2. caso possui contratos e documentos
3. contrato possui calculos, BACEN e abusividades
4. caso possui estrategia, laudo, peticao, timeline e Clara

---

## 10. Observacao final

Este addendum e deliberadamente incremental.

Ele serve para orientar backlog, arquitetura e stories sem contradizer o PRD mestre.
