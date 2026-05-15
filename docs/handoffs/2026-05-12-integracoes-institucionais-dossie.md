# Handoff: Integracoes Institucionais e Orquestracao do Dossie

**Data:** 2026-05-12  
**Origem:** Analyst / Atlas  
**Destino sugerido:** Architect -> Dev -> QA -> DevOps

---

## Motivo deste handoff

O dossie do caso passou a consolidar `Visao geral`, `Documentos`, `Calculos`, `Bacen`, `Estrategico`, `Laudo`, `Peticoes` e `Clara`, mas a usuaria definiu uma direcao adicional:

1. o sistema deve ser inteligente o suficiente para acionar integracoes externas quando o caso exigir
2. `Meu INSS`, `Dataprev` e `TJMG` nao podem ser tratados como mocks ou "APIs instaladas"
3. essas fontes devem entrar como frente de integracao institucional e tecnica separada

Este handoff existe para impedir que a UI sugira automacoes externas ainda nao homologadas e para orientar a proxima fase arquitetural.

---

## Decisao de produto

### 1. Visao geral continua no envelope atual

A aba `Visao geral` pode existir agora com o que o sistema realmente sabe:

1. leitura inicial do caso
2. status honesto do documento
3. campos como `contrato`, `taxas`, `CET`, `parcelas`, `banco` e `juros`
4. fallback explicito quando nao houver OCR estruturado persistido

### 2. Integracoes externas nao entram como promessas ficticias

`Meu INSS`, `Dataprev` e `TJMG` devem aparecer como dependencias externas reais, sujeitas a:

1. credenciais
2. convenio, quando exigido
3. contratacao, quando exigida
4. validacao juridica e operacional do uso

### 3. O sistema deve decidir quando consultar cada fonte

O objetivo nao e consultar tudo sempre. O objetivo e que o sistema:

1. classifique o caso
2. identifique se a fonte externa e necessaria
3. acione apenas a integracao relevante
4. registre origem, data, confianca, bloqueio e resultado

---

## Leitura funcional por modulo

### Visao geral

Deve responder:

1. o que o sistema ja leu automaticamente deste caso
2. o que ainda depende de OCR estruturado
3. quais fontes externas seriam necessarias para aprofundar a analise

### Calculos

Deve responder:

1. quais calculos foram ativados para o caso
2. quais insumos entraram no calculo
3. qual o resultado juridico-financeiro consolidado

### Bacen

Deve responder:

1. qual taxa contratual foi identificada
2. qual referencia de mercado foi consultada
3. qual a diferenca encontrada
4. qual o alerta juridico derivado

---

## Arquitetura recomendada

### 1. Integration orchestrator

Criar uma camada de decisao do dossie para fontes externas.

Responsabilidades:

1. receber contexto do caso
2. decidir quais integracoes sao necessarias
3. acionar conectores
4. consolidar resposta no envelope do dossie

### 2. Conectores separados

Cada fonte deve ter boundary proprio:

1. `bacen`
2. `meu-inss`
3. `dataprev`
4. `tjmg`

### 3. Contrato padrao de retorno

Cada conector deve retornar um envelope comum:

1. `source`
2. `requestedAt`
3. `status`
4. `confidence`
5. `data`
6. `errors`
7. `requiresHumanReview`
8. `blockedReason`

### 4. Estados obrigatorios

1. `consultado`
2. `pendente`
3. `indisponivel`
4. `bloqueado por credencial`
5. `bloqueado por convenio`
6. `bloqueado por contratacao`
7. `precisa revisao humana`

---

## Dependencias externas

### Meu INSS

Tratar como canal oficial externo cuja integracao precisa ser confirmada formalmente.

Checklist minimo:

1. confirmar se existe API utilizavel por terceiro
2. levantar credenciais exigidas
3. validar base legal e escopo de uso
4. definir quais dados do dossie podem depender desta fonte

### Dataprev

Tratar como ecossistema de integracoes formais e nao como endpoint publico trivial.

Checklist minimo:

1. identificar o produto/API exato necessario
2. levantar onboarding tecnico
3. confirmar autenticacao, ambiente e contrato
4. definir em quais casos o dossie precisa dessa fonte

### TJMG

Tratar como boundary operacional proprio do PJe/TJMG.

Checklist minimo:

1. definir se o objetivo e consulta, importacao, protocolo ou distribuicao
2. validar uso de certificado digital e requisitos do PJe
3. confirmar se existe API utilizavel ou apenas fluxo humano via portal
4. registrar claramente quando o sistema so pode fazer handoff manual

---

## Regras para implementacao

1. nao simular integracao pronta com `Meu INSS`, `Dataprev` ou `TJMG`
2. nao preencher automaticamente dados externos sem fonte real
3. nao ocultar bloqueios institucionais
4. expor na UI quando a automacao depende de credencial, convenio ou contratacao
5. manter `Visao geral` funcional mesmo sem essas integracoes

---

## Handoff para Architect

1. desenhar o `integration-orchestrator`
2. definir contrato unico dos conectores
3. separar regras de decisao por tipo de caso
4. registrar auditoria e rastreabilidade das consultas
5. decidir a estrategia de fallback quando a fonte externa nao puder ser usada

---

## Handoff para Dev

1. manter `Visao geral` como agregador honesto do envelope atual
2. preparar boundaries internos para fontes externas sem fingir integracao pronta
3. criar modelagem interna que permita acionar `Meu INSS`, `Dataprev`, `TJMG` e `Bacen` quando necessario
4. expor status de integracao de forma clara no dossie

---

## Handoff para QA

1. validar que o dossie nao promete fonte externa inexistente
2. validar estados de fallback, bloqueio e revisao humana
3. validar que `Visao geral` continua util sem integracoes institucionais ativas

---

## Handoff para DevOps

1. nao promover para deploy nenhuma integracao externa sem credenciais reais
2. exigir configuracao explicita de secrets e ambientes antes de ativar fontes institucionais
3. registrar dependencias externas como gates operacionais do rollout

---

## Criterio de aceite desta direcao

1. `Visao geral` continua funcional sem integracoes novas
2. `Meu INSS`, `Dataprev` e `TJMG` ficam explicitamente tratados como backlog de integracao institucional e tecnica
3. existe trilha arquitetural clara para o sistema decidir quando usar cada fonte
4. nenhuma automacao externa e simulada como pronta sem homologacao real
