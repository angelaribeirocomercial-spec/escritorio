# Consolidacao de Auditorias: Sistema e Clara

## Data

2026-04-23

## Origem

- Auditoria de sistema: `docs/handoffs/2026-04-20-escopo-vs-sistema-auditoria.md`
- Auditoria de Clara: `docs/handoffs/2026-04-20-clara-auditoria-vs-escopo.md`
- Story de consolidacao: `docs/stories/11.9.audit-driven-foundation-hardening.md`

## Objetivo

Registrar as duas auditorias como artefatos canonicos do projeto, cruzar os gaps com as evidencias de implementacao real, e produzir o mapa que orienta o backlog de hardening.

Este documento nao inventa escopo. Ele apenas organiza o que as auditorias ja disseram.

## Classificacao Canonica Derivada das Auditorias

Esta consolidacao preserva quatro buckets canonicos para leitura e backlog:

| Bucket | Significado | Origem |
|--------|-------------|--------|
| Pronto | Existe no produto com superficie funcional comprovavel | Auditoria de sistema + auditoria de Clara |
| Parcial | Existe de forma distribuida, contextual ou sem contrato formal unico | Auditoria de sistema + auditoria de Clara |
| Ausente | Nao existe como modulo, boundary ou automacao real | Auditoria de sistema + auditoria de Clara |
| Promocional | Aparece em texto de visao, landing, UX ou narrativa de produto sem entrega funcional equivalente | Auditoria de sistema |

### Promocional preservado de forma explicita

| Item promocional | Evidencia de auditoria | Tratamento nesta consolidacao |
|------------------|------------------------|-------------------------------|
| Landing e textos institucionais descrevem capacidades maiores do que a interface entrega sozinha | `docs/handoffs/2026-04-20-escopo-vs-sistema-auditoria.md` ("O Que E Promocional e O Que E Real") | Nao vira backlog por si so; serve como filtro para nao classificar narrativa de produto como evidencia de implementacao |
| Claims amplos sobre IA juridica completa, dados reais e automacao plena | `docs/handoffs/2026-04-20-clara-auditoria-vs-escopo.md` ("Texto promocional x realidade") | Reforca que backlog deve nascer de gaps funcionais reais, nao de copy promocional |

**Regra canonica:** nenhum item entra no backlog apenas por aparecer em texto promocional; ele precisa existir como gap real nas secoes `Parcial` ou `Ausente` das auditorias.

---

## Mapa de Evidencias por Camada

### Camada 1: Workspace e Navegacao

**Status: PRONTO**

| Evidencia | Arquivo |
|-----------|---------|
| Pagina principal Clara | `apps/web/src/app/(workspace)/clara/page.tsx` |
| Contexto do workspace | `apps/web/src/server/services/clara/get-clara-workspace.ts` |
| Artefatos e drafts | `apps/web/src/server/services/clara/get-clara-artifacts.ts` |
| Persistencia com fallback | `apps/web/src/server/services/clara/clara-record-store.ts` |
| Tipos de registro | `apps/web/src/server/services/clara/clara-record-types.ts` |

**Conclusao:** A base de workspace esta solida. Nao requer hardening prioritario.

---

### Camada 2: Nucleo Juridico Estruturado

**Status: IMPLEMENTADO (Story 11.10 — Review)**

| Evidencia | Arquivo |
|-----------|---------|
| Core estruturado | `apps/web/src/server/services/clara/get-clara-structured-core.ts` |
| Revisional bancario | `apps/web/src/server/services/clara/get-banking-revisional-workspace.ts` |
| Calculo revisional | `apps/web/src/server/services/clara/get-banking-revisional-calculation.ts` |
| Analise de contrato | `apps/web/src/server/services/contract-analysis/get-contract-analysis.ts` |

**O que a auditoria identificava como parcial:**
- Classificacao formal de caso como funcao central
- Leitura estruturada de documentos com separacao fatos/gaps/recomendacoes
- Motor unico de decisao juridica

**O que foi implementado (11.10):**
- Contrato estruturado de leitura de caso
- Classificacao normalizada para nichos bancarios
- Separacao de fatos, gaps e recomendacoes no shape de saida
- Conexao com superficies existentes do workspace

**Conclusao:** Gap da auditoria enderecado pela Story 11.10. Aguarda QA gate.

---

### Camada 3: Adaptadores de Fontes Oficiais

**Status: IMPLEMENTADO (Story 11.11 — Review)**

| Evidencia | Arquivo |
|-----------|---------|
| Adaptadores de fonte | `apps/web/src/server/services/clara/clara-source-adapters.ts` |

**O que a auditoria identificava como ausente:**
- Conectores reais para CNJ/DataJud, BCB, STJ, STF, Consumidor.gov/Senacon
- Separacao entre dados internos e dados de fonte externa
- Report de falha quando fonte nao consultada

**O que foi implementado (11.11):**
- Boundary de adaptadores para fontes externas
- Contratos preparados para CNJ/DataJud, BCB, STJ, STF, Consumidor.gov
- Resposta estruturada com log de falha
- Workspace estavel mesmo com adaptador indisponivel

**Conclusao:** Gap da auditoria enderecado pela Story 11.11. Aguarda QA gate.

---

### Camada 4: Trilha de Auditoria e Anti-Alucinacao

**Status: IMPLEMENTADO (Story 11.12 — Review)**

| Evidencia | Arquivo |
|-----------|---------|
| Audit trail | `apps/web/src/server/services/clara/clara-audit-trail.ts` |

**O que a auditoria identificava como ausente:**
- Labels de origem (interna, documental, API, inferencia controlada)
- Contrato de saida com rastreabilidade por linha
- Registro auditavel de consultas e fontes
- Report explicito de falha de fonte

**O que foi implementado (11.12):**
- Labels de origem e marcadores de confianca
- Contrato de audit trail no shape de resultado Clara
- Persistencia de notas de revisao e historico de execucao
- Report de falha para fontes indisponiveis

**Conclusao:** Gap da auditoria enderecado pela Story 11.12. Aguarda QA gate.

---

### Camada 5: Servicos de Dominio do Workspace

**Status: PRONTO (base operacional)**

| Modulo | Arquivo | Status |
|--------|---------|--------|
| Clientes | `apps/web/src/server/services/clients/get-clients.ts` | Pronto |
| Processos | `apps/web/src/server/services/processes/get-processes.ts` | Pronto |
| Documentos | `apps/web/src/server/services/documents/get-documents.ts` | Pronto |
| Download docs | `apps/web/src/server/services/documents/get-document-file-url.ts` | Pronto |
| Diario oficial | `apps/web/src/server/services/official-diary/get-official-diary.ts` | Pronto |

**Conclusao:** Servicos de dominio existentes sao a fundacao. Nao requerem reconstrucao.

---

### Camada 6: Gaps Remanescentes (pos-hardening wave)

Estes gaps foram identificados pelas auditorias mas **nao fazem parte da wave atual de hardening** (Stories 11.9-11.12):

| Gap | Origem da Auditoria | Prioridade Sugerida |
|-----|---------------------|---------------------|
| Pipeline formal de leads com classificacao IA centralizada | Sistema | P1 — proximo ciclo |
| Dossie unificado com timeline de provas | Sistema | P1 — proximo ciclo |
| Gerador juridico padronizado (peticao, procuracao, honorarios) | Sistema + Clara | P2 |
| Monitoramento processual automatico real | Clara | P3 |
| Timeline processual automatica com alertas | Clara | P3 |
| Base preparada para integracao futura com PJe | Sistema | P4 |
| LGPD/seguranca como modulo de produto | Sistema | P4 |
| Telas de administracao da Clara (teses, modelos, governanca) | Clara | P5 |

---

## Separacao: Auditoria de Sistema vs Auditoria de Clara

### Auditoria de Sistema (escopo-vs-sistema)

Foco: modulos funcionais do workspace (leads, dossie, gerador, distribuicao, acompanhamento, gestao, interface, IA, seguranca).

Conclusao: base operacional forte, gaps concentrados em centralizacao e formalizacao de modulos que hoje existem de forma distribuida.

### Auditoria de Clara (clara-vs-escopo)

Foco: Clara como agente juridica (identidade, leitura de caso, classificacao, decisao, geracao, revisao).

Conclusao: Clara ja e um workspace juridico assistido forte, gaps concentrados em rastreabilidade, integracao com fontes oficiais e motor de decisao formalizado.

### Relacao entre as duas

As auditorias sao complementares, nao duplicadas:
- A auditoria de sistema cobre o **produto como um todo**
- A auditoria de Clara cobre a **agente como motor juridico**
- Os gaps de uma impactam a outra (ex: sem adaptadores de API, Clara nao pode rastrear origem externa)
- A wave de hardening (11.10-11.12) endereça os gaps centrais da Clara
- Os gaps de sistema remanescentes alimentam o proximo ciclo de stories

---

## Conclusao

As duas auditorias de 2026-04-20 estao registradas como artefatos canonicos. Os gaps criticos da Clara foram enderecados pelas stories 11.10, 11.11 e 11.12 (todas em Review). Os gaps remanescentes do sistema estao mapeados com prioridade sugerida para o proximo ciclo.

O hardening nao reconstruiu o produto — fortaleceu o que ja existia.
