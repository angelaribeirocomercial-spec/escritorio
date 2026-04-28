# Epic: Resolucao de Debitos Tecnicos - LexIA Bancaria

## Objetivo

Transformar a base atual da LexIA Bancaria de uma demo tecnicamente convincente em uma plataforma reproduzivel, auditavel e pronta para evoluir para dados reais sem regressao estrutural.

## Escopo

- Baseline de banco e RLS
- Eliminacao de fallbacks silenciosos que mascaram erro estrutural
- Cobertura minima de testes para auth e tenant scope
- Primeira vertical real saindo de mocks
- Padrao de estados de tela para suportar dados reais

## Criterios de Sucesso

- Banco minimo versionado em SQL no repositorio
- Policies RLS versionadas e revisaveis
- Seed local de tenant/membership funcionando
- Testes cobrindo auth e tenant resolution
- Primeira vertical real operando sem fixtures como fonte primaria
- Estados loading/error/empty aplicados nessa vertical

## Ordem Recomendada

1. Foundation de banco e seguranca
2. Hardening de auth e configuracao
3. Migracao da primeira vertical real
4. Consolidacao de UI compartilhada

## Stories Iniciais

1. Story 12.1 - Baseline Supabase de identidade e tenancy
2. Story 12.2 - Hardening de auth, tenant context e configuracao
3. Story 12.3 - Primeira vertical real com estados de UX e testes
