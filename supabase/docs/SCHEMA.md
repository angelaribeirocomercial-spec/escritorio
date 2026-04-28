# Supabase Schema Snapshot

**Date:** 2026-04-20  
**Status:** Baseline versioned in repository

## Summary

O repositorio agora possui uma baseline minima de identidade e tenancy em:

- `supabase/migrations/0001_initial_identity_tenancy.sql`
- `supabase/policies/0001_identity_tenancy_rls.sql`
- `supabase/seeds/0001_identity_tenancy_seed.sql`

Essa baseline cobre apenas a fundacao necessaria para o app atual: `tenants`, `profiles` e `memberships`, com integracao direta ao `auth.users` do Supabase.

## Tables

### `public.tenants`

Representa o escritorio/tenant do produto.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` | sim | PK, default `gen_random_uuid()` |
| `name` | `text` | sim | nome do escritorio |
| `slug` | `text` | sim | unico |
| `plan` | `text` | sim | `trial`, `starter`, `pro` |
| `created_at` | `timestamptz` | sim | default UTC |
| `updated_at` | `timestamptz` | sim | mantido por trigger |

### `public.profiles`

Perfil publico minimo do usuario autenticado.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` | sim | PK e FK para `auth.users(id)` |
| `full_name` | `text` | nao | nome exibido |
| `email` | `text` | nao | espelho util do auth |
| `is_active` | `boolean` | sim | default `true` |
| `created_at` | `timestamptz` | sim | default UTC |
| `updated_at` | `timestamptz` | sim | mantido por trigger |

### `public.memberships`

Vincula usuario a tenant com papel de acesso.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` | sim | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | sim | FK para `auth.users(id)` |
| `tenant_id` | `uuid` | sim | FK para `public.tenants(id)` |
| `role` | `text` | sim | `owner`, `admin`, `lawyer`, `assistant` |
| `is_active` | `boolean` | sim | default `true` |
| `created_at` | `timestamptz` | sim | default UTC |
| `updated_at` | `timestamptz` | sim | mantido por trigger |

Constraints:

- `unique (user_id, tenant_id)`

Indices:

- `memberships_user_id_idx`
- `memberships_tenant_id_idx`
- `memberships_user_active_idx`

## Trigger and Helper Functions

### `public.set_updated_at()`

Padroniza a escrita de `updated_at` em `tenants`, `profiles` e `memberships`.

### `public.handle_new_user()`

Cria ou sincroniza `public.profiles` sempre que um registro novo entra em `auth.users`.

## RLS Model

As policies baseline seguem o principio minimo de isolamento tenant-aware:

- usuario autenticado pode ler o proprio `profile`
- usuario autenticado pode atualizar o proprio `profile`
- usuario autenticado pode ler as proprias `memberships`
- `owner` e `admin` podem ler e gerenciar memberships do proprio tenant
- membro ativo pode ler o proprio `tenant`
- `owner` e `admin` podem atualizar o proprio `tenant`

Helper functions:

- `public.is_tenant_member(target_tenant_id uuid)`
- `public.is_current_user(target_user_id uuid)`

## Seed Local

O seed baseline cria:

- usuario demo em `auth.users`
- tenant demo `lexia-demo`
- profile correspondente
- membership `owner`

Credenciais de referencia do seed:

- Email: `owner@lexia-demo.local`
- Senha: `ChangeMe123!`

## Current Schema Boundary

Esta baseline ainda nao cobre entidades de negocio como:

- `clients`
- `banking_cases`
- `documents`
- `tasks`
- `deadlines`
- `contract_analyses`
- `ai_interactions`

Essas tabelas devem entrar em migrations futuras por vertical, nao por big bang.
