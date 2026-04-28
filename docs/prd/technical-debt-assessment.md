# Technical Debt Assessment

**Project:** LexIA Bancaria  
**Date:** 2026-04-20  
**Status:** Approved for planning

## 1. Assessment Summary

O repositorio apresenta um brownfield atipico: a UX e a estrutura de rotas ja comunicam um produto robusto, mas a base operacional real ainda esta concentrada em mocks, autenticação parcial com Supabase e uma suite de testes muito superficial. O principal problema nao e um bug isolado; e a diferenca entre a maturidade percebida do produto e a maturidade real da fundacao tecnica.

## 2. Top Priorities

| Rank | ID | Debt | Category | Why now |
| --- | --- | --- | --- | --- |
| 1 | DB-01 | Ausencia de migrations versionadas | Database | Banco nao e reproduzivel |
| 2 | DB-02 | Ausencia de policies RLS versionadas | Security | Multi-tenancy nao e auditavel |
| 3 | SYS-02 | Modulos de negocio ainda dependem de mocks | Product architecture | Impede avancar para operacao real |
| 4 | SYS-04 | Testes nao cobrem comportamento | Quality | Aumenta risco de regressao |
| 5 | UX-03 | Falta de estados loading/error/empty padronizados | Frontend | Dados reais vao expor falhas de UX |
| 6 | SYS-05 | Placeholders/fallback silenciosos de Supabase | Platform | Mascara problemas de configuracao |

## 3. Consolidated Debt Register

| ID | Debt | Severity | Estimated Hours | Priority |
| --- | --- | --- | --- | --- |
| DB-01 | Versionar migration baseline | Critica | 8 | Critica |
| DB-02 | Versionar policies RLS baseline | Critica | 10 | Critica |
| DB-03 | Formalizar schema de `tenants` e `memberships` | Critica | 6 | Critica |
| DB-04 | Criar seed local para auth e tenant | Alta | 4 | Alta |
| DB-06 | Adicionar smoke tests SQL | Alta | 6 | Alta |
| SYS-02 | Migrar primeira vertical de mocks para dados reais | Critica | 24 | Critica |
| SYS-04 | Substituir testes de existencia por testes de comportamento | Alta | 12 | Alta |
| SYS-05 | Remover placeholders silenciosos de Supabase | Alta | 3 | Alta |
| SYS-06 | Remover fallback silencioso de workspace context | Alta | 3 | Alta |
| UX-01 | Extrair design system minimo para `@lexia/ui` | Alta | 16 | Alta |
| UX-03 | Criar biblioteca de estados de tela | Alta | 12 | Alta |

**Total estimado das prioridades imediatas:** 104 horas

## 4. Resolution Phases

### Phase 1: Foundation and Safety

- Banco baseline versionado
- RLS baseline versionado
- Seed local reproduzivel
- Fallbacks silenciosos removidos ou explicitamente rebaixados para demo mode
- Testes de auth e tenant scope

### Phase 2: First Real Data Vertical

- Escolher modulo inicial: `clientes` ou `processos`
- Criar schema correspondente
- Criar repositorios reais
- Padronizar loading/error/empty states no frontend
- Cobrir fluxo com testes

### Phase 3: UI and Shared System Consolidation

- Extrair componentes compartilhados para `@lexia/ui`
- Reduzir dependencias de `globals.css`
- Alinhar shell, estados e formularios com fontes reais de dados

## 5. Risk-Based Recommendation

Nao e recomendado seguir adicionando funcionalidades grandes sobre o estado atual sem primeiro estabilizar fundacao de banco, tenant scope e testes. O retorno tecnico mais alto esta em transformar o repositorio de demo convincente em produto minimamente reproduzivel e auditavel.

## 6. QA Decision

**QA Gate:** APPROVED

Condicoes para execucao:

1. Iniciar pelo baseline de banco e seguranca.
2. Nao abrir varias verticais reais ao mesmo tempo.
3. Criar testes junto com a primeira migracao de mocks.
