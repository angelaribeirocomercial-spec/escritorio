# LexIA Bancaria Brownfield System Architecture

**Date:** 2026-04-21  
**Status:** Brownfield runtime migrated  
**Scope:** Codigo atual em `apps/web`, `packages/*`, `supabase/*` e stories `12.x`

## 1. Executive Summary

O repositorio segue como monorepo npm workspaces com a aplicacao principal em `apps/web`, contratos em `packages/domain`, componentes compartilhados em `packages/ui` e estrutura Supabase versionada em `supabase/`.

A migracao Brownfield removeu o pacote ativo `@lexia/mocks` e converteu as principais verticais operacionais para fontes reais por tenant, usando Supabase como fonte primaria. Rotas que ainda nao possuem contrato tecnico real, como upload de arquivos, importacao de processos, site e preferencias editaveis, foram substituidas por estados controlados de indisponibilidade para nao simular funcionalidade pronta.

## 2. Current Stack

| Area | Current state | Evidence |
| --- | --- | --- |
| Runtime | Node.js 20+ | `package.json` |
| Frontend | Next.js 14.2, React 18, App Router | `apps/web/package.json` |
| Styling | Tailwind CSS 3.4 + CSS globals | `apps/web/tailwind.config.ts`, `src/app/globals.css` |
| Auth | Supabase SSR + contexto de tenant por membership | `src/lib/auth/session.ts`, `src/server/services/auth/workspace-context.ts` |
| Data access | Supabase por vertical operacional | `src/server/services/*` |
| Testing | Guard tests de Brownfield + gates do workspace web | `apps/web/tests/run-tests.js` |
| Shared packages | `domain`, `ui` e `config`; pacote `mocks` removido do runtime ativo | `packages/`, `tsconfig.base.json` |

## 3. Repository Shape

```text
apps/
  web/                 # aplicacao executavel
packages/
  domain/              # contratos de dominio
  ui/                  # componentes compartilhados usados pelo workspace
  config/              # configuracao compartilhada
supabase/
  migrations/          # schema versionado por vertical
  policies/            # RLS versionado por vertical
  seeds/               # dados iniciais por tenant
docs/
  stories/             # stories Brownfield 12.x
```

## 4. Application Architecture

### 4.1 Rendering and Routing

- O app usa App Router com layout protegido em `src/app/(workspace)/layout.tsx`.
- O shell de workspace concentra navegacao, sessao, tenant ativo e acesso as verticais.
- Subrotas sem backend real usam `WorkspaceStatePanel` em vez de placeholders funcionais.

### 4.2 Authentication and Session Model

- `getWorkspaceSession()` usa Supabase SSR quando configurado.
- `resolveWorkspaceContext()` busca `memberships` e `tenants` reais.
- Ambiente local ainda pode usar demonstracao controlada por cookie, mas os servicos de negocio nao dependem de `@lexia/mocks`.

### 4.3 Service Layer

As verticais principais foram migradas para services por tenant:

- `clients`
- `cases`
- `processes`
- `documents`
- `tasks`
- `agenda`
- `contract-analysis`
- `procedural-updates`
- `official-diary`
- `finance`
- `adversaries`
- `clara`

### 4.4 Controlled Unavailable Areas

As areas abaixo nao exibem formulario ou fluxo falso enquanto nao houver contrato de backend:

- Importacao de processos por lote/OAB.
- Upload de documentos e relatorios reais de storage.
- Criador de site, banco de imagens, e-mail e configuracoes do site.
- Preferencias editaveis gerais do tenant.

## 5. Brownfield Closure Criteria

| Criterion | Status |
| --- | --- |
| Runtime principal sem `@lexia/mocks` | Done |
| Alias `@lexia/mocks` removido | Done |
| Pacote `packages/mocks` removido do lockfile | Done |
| Verticais principais usando Supabase ou estado controlado | Done |
| Placeholders criticos removidos das rotas operacionais | Done |
| Gates `lint`, `typecheck` e `test` passando | Done |

## 6. Residual Scope

O Brownfield foi fechado para migracao de runtime e remocao de placeholders criticos. O proximo trabalho deve ser tratado como evolucao de produto, nao descoberta Brownfield:

- Implementar upload real com storage, processamento e vinculacao.
- Implementar importadores de processos por lote/OAB.
- Implementar site publico, banco de imagens e e-mail por tenant.
- Transformar estados controlados em funcionalidades reais conforme novas stories.
