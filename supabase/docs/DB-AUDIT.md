# Database Audit

**Date:** 2026-04-20  
**Scope:** Auditoria brownfield do banco a partir do repositorio

## Gate Result

**Status:** FOUNDATION ESTABLISHED, BUSINESS DATA STILL NEEDS WORK

## Key Findings

| ID | Finding | Severity | Why it matters |
| --- | --- | --- | --- |
| DB-01 | Baseline de identidade e tenancy agora esta versionada | Resolvido | O repo passou a ter schema minimo reproduzivel |
| DB-02 | Policies RLS baseline agora estao versionadas | Resolvido | Isolamento minimo pode ser auditado |
| DB-03 | Seed local minimo agora existe para tenant e membership | Resolvido | Ambiente local pode começar de forma reproduzivel |
| DB-04 | Fallback de tenant context ainda mascara erro de banco/dados | Alto | Falhas reais ainda podem passar despercebidas |
| DB-05 | Entidades de negocio seguem sem schema real no repo | Alto | App continua dependente de mocks nos modulos principais |
| DB-06 | Ainda nao ha smoke tests automatizados executados no pipeline para schema/RLS | Medio | Pode haver drift futuro sem verificacao automatica |

## Security Assessment

### Observed

- O codigo pressupoe multi-tenancy por `memberships -> tenants`.
- Agora existe baseline SQL versionada para `tenants`, `profiles` e `memberships`.
- Agora existem policies versionadas para leitura e gestao tenant-aware da camada de identidade.

### Security Risks

1. Risco residual de vazamento cross-tenant se novas tabelas de negocio forem criadas sem repetir o padrao de RLS.
2. Risco residual de drift enquanto o ambiente remoto nao for reconciliado com esta baseline.
3. Risco de fallback do app ainda mascarar falha estrutural de membership.

## Performance and Operability

### Current State

- A baseline introduziu indices minimos em `memberships`.
- Ha triggers versionadas para `updated_at`.
- Ha seed local de usuario demo, tenant demo e membership demo.

### Operational Consequences

- Identidade e tenancy agora podem ser provisionadas por codigo.
- O proximo gargalo operacional saiu da fundacao e foi para a ausencia de schema real dos modulos de negocio.
- Ainda faltam testes automatizados de schema/RLS e reconciliacao com ambiente remoto existente.

## Recommended Remediation

### Immediate

1. Aplicar esta baseline no ambiente local e validar compatibilidade com o projeto Supabase real.
2. Remover ou explicitar o fallback silencioso de tenant context na aplicacao.
3. Adicionar smoke tests SQL para schema e RLS.

### Next

1. Definir o schema do primeiro modulo que sairá de mocks.
2. Introduzir constraints e indices tenant-aware na vertical escolhida.
3. Automatizar smoke tests de banco no pipeline.

## Suggested Initial Backlog

| Candidate story | Outcome |
| --- | --- |
| Hardening de auth e tenant context | Falha estrutural deixa de ser mascarada |
| Smoke tests de schema e RLS | Banco baseline verificavel |
| Primeira vertical real | Reducao da dependencia de mocks |
