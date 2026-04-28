# Database Specialist Review

## Debitos Validados

| ID | Debito | Severidade | Horas | Prioridade | Notas |
| --- | --- | --- | --- | --- | --- |
| DB-01 | Nenhuma migration versionada no repo | Critica | 8 | Critica | Sem baseline SQL nao existe banco reproduzivel |
| DB-02 | Nenhuma policy RLS versionada no repo | Critica | 10 | Critica | Multi-tenancy nao pode depender de configuracao implícita |
| DB-03 | App usa `memberships` e `tenants` sem schema versionado | Critica | 6 | Critica | Risco direto para onboarding e deploy |
| DB-04 | Seeds locais nao sustentam auth + tenant reais | Alta | 4 | Alta | Dev e QA dependem de fallback e mocks |
| DB-05 | Entidades do dominio nao possuem schema confirmavel no repo | Alta | 16 | Alta | Bloqueia saida organizada de mocks |

## Debitos Adicionados

| ID | Debito | Severidade | Horas | Prioridade | Notas |
| --- | --- | --- | --- | --- | --- |
| DB-06 | Falta de smoke tests SQL para validar baseline e RLS | Alta | 6 | Alta | Evita drift futuro |
| DB-07 | Fallback heuristico de membership mascara incidente de dados | Alta | 3 | Alta | Deve ser transformado em modo demo explicito |

## Respostas ao Architect

1. O baseline inicial deve incluir `tenants`, `profiles` e `memberships`, mais seeds minimos para login local reproduzivel.
2. O fallback nao deve continuar como caminho silencioso para erro de banco. Ele pode existir apenas em modo demo explicitamente configurado.
3. Indices minimos: PKs em todas as tabelas, indice por `memberships.user_id`, indice por `memberships.tenant_id`, unicidade em `tenants.slug` e constraint de integridade entre `memberships.tenant_id` e `tenants.id`.

## Recomendacoes

1. Criar `0001_initial_identity.sql` com tabelas, constraints e indices minimos.
2. Versionar policies para leitura e escrita tenant-scoped.
3. Adicionar seed de tenant demo e membership demo controlados.
4. So depois escolher um primeiro modulo de negocio para sair de mocks.
