# LexIA Bancaria Backlog Prioritization

**Version:** 1.0.0
**Last Updated:** 2026-04-08
**Status:** Draft
**Author:** Pax

---

## Overview

Este documento oficializa a priorizacao do backlog do MVP da LexIA Bancaria com base na visao de produto, no roadmap e na arquitetura full-stack. O objetivo e garantir uma sequencia de entrega executavel, comercialmente forte e tecnicamente segura.

---

## Prioritization Logic

Cada epic foi priorizada pelos seguintes criterios:

1. dependencia tecnica
2. impacto no fluxo principal
3. impacto na demonstracao comercial
4. reforco do posicionamento premium
5. proximidade com o diferencial da LexIA

---

## Official Epic Order

### P0

1. Fundacao SaaS
2. CRM Juridico
3. Casos Bancarios

### P1

4. GED Inteligente
5. Tarefas e Fluxo Operacional
6. Dashboard Executivo

### P2

7. LexIA Contextual MVP
8. Analise de Contrato Bancario
9. Landing Page Comercial

### P2.5

10. Clara hardening foundation

11. Clara structured juridical core
12. Clara official source adapters
13. Clara audit trail and anti-hallucination

---

## Epic Decisions

### Epic 1. Fundacao SaaS

**Priority:** P0

**Why now:**

1. desbloqueia toda a aplicacao
2. define tenancy, auth e shell do produto
3. sem esta base o resto vira retrabalho

**Exit condition:**

1. app inicial em Next.js
2. layout autenticado premium
3. auth funcional
4. tenancy e papeis basicos definidos

### Epic 2. CRM Juridico

**Priority:** P0

**Why now:**

1. cliente e um dos objetos centrais do produto
2. quase todos os fluxos dependem da entidade cliente
3. demonstra valor operacional real rapidamente

**Exit condition:**

1. listagem de clientes
2. cadastro e edicao
3. pagina individual
4. score e timeline mockados

### Epic 3. Casos Bancarios

**Priority:** P0

**Why now:**

1. e a entidade principal do dominio
2. concentra a experiencia juridica mais importante
3. viabiliza documentos, tarefas e IA contextual

**Exit condition:**

1. listagem de casos
2. cadastro e edicao
3. pagina rica do caso
4. vinculo com cliente

### Epic 4. GED Inteligente

**Priority:** P1

**Why now:**

1. sem documentos o dominio bancario perde profundidade
2. cria base para a futura inteligencia documental
3. melhora muito a demonstracao do produto

**Exit condition:**

1. upload funcional
2. listagem e filtros
3. preview
4. categorias, tags e vinculos

### Epic 5. Tarefas e Fluxo Operacional

**Priority:** P1

**Why now:**

1. transforma dados em execucao
2. reforca a proposta de ERP e nao apenas CRM
3. prepara a camada operacional para a LexIA

**Exit condition:**

1. lista de tarefas
2. responsavel e prioridade
3. checklist por tipo de caso
4. vinculacao com cliente e caso

### Epic 6. Dashboard Executivo

**Priority:** P1

**Why now:**

1. materializa o valor da plataforma para socios
2. depende de clientes, casos e tarefas ja modelados
3. fortalece narrativa comercial

**Exit condition:**

1. cards principais
2. listas operacionais
3. graficos mockados
4. painel de insights

### Epic 7. LexIA Contextual MVP

**Priority:** P2

**Why now:**

1. e o diferencial mais forte do produto
2. precisa de contexto suficiente dos modulos anteriores
3. deve entrar quando o sistema ja tiver objetos reais para alimentar a IA

**Exit condition:**

1. chat lateral fixo
2. tela dedicada
3. acoes contextuais por entidade
4. persistencia de interacoes mockadas

### Epic 8. Analise de Contrato Bancario

**Priority:** P2

**Why now:**

1. e a grande prova premium da IA especializada
2. depende de documentos e contexto de caso
3. deve entrar quando a base documental estiver pronta

**Exit condition:**

1. tela premium de analise
2. resumo e clausulas sensiveis
3. tese, risco e pedidos sugeridos

### Epic 9. Landing Page Comercial

**Priority:** P2

**Why now:**

1. importante para venda
2. mas fica mais forte depois que houver mock real do produto
3. deve refletir a experiencia ja construida

**Exit condition:**

1. hero
2. modulos
3. mockup
4. bloco da LexIA
5. CTA final

---

## Delivery Waves

### Wave 1

1. Epic 1. Fundacao SaaS

### Wave 2

1. Epic 2. CRM Juridico
2. Epic 3. Casos Bancarios

### Wave 3

1. Epic 4. GED Inteligente
2. Epic 5. Tarefas e Fluxo Operacional
3. Epic 6. Dashboard Executivo

### Wave 4

1. Epic 7. LexIA Contextual MVP
2. Epic 8. Analise de Contrato Bancario

### Wave 5

1. Epic 9. Landing Page Comercial
2. refinamento premium e hardening de demo

### Wave 6

1. Clara audit-driven foundation hardening
2. Clara structured juridical core
3. Clara official source adapters
4. Clara audit trail and anti-hallucination

---

## Recommended First Stories

As primeiras stories do `@sm` devem sair nesta ordem:

1. scaffold do workspace Next.js com App Router
2. app shell premium com sidebar, header e theme base
3. auth com Supabase e protecao de rotas
4. tenancy e membership basicos
5. modulo de clientes com lista e detalhe
6. modulo de casos com lista e detalhe

---

## Backlog Guardrails

1. nao antecipar modulos de V2 antes do fluxo central funcionar
2. nao construir IA sem contexto real de entidades
3. nao criar telas vazias apenas para parecer completo
4. nao espalhar backlog em muitas epics pequenas e rasas

---

## Handoff To Scrum Master

Com este backlog priorizado, o `@sm` deve:

1. transformar cada onda em stories pequenas e executaveis
2. garantir acceptance criteria claras
3. manter cada story dentro de um incremento demonstravel

---

_Last Updated: 2026-04-08 | Pax_
