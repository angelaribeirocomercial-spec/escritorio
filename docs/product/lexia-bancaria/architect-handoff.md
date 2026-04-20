# LexIA Bancaria Architect Handoff

**Version:** 1.0.0
**Last Updated:** 2026-04-08
**Status:** Ready for Architect Review
**Author:** Atlas

---

## Objective

Entregar ao `@architect` um contexto consolidado para definicao da arquitetura tecnica do MVP premium da LexIA Bancaria, preservando o posicionamento de ERP Juridico com IA contextual especializada em Direito Bancario.

---

## Product Constraints

1. O produto deve ser SaaS multi-tenant
2. O isolamento por escritorio e obrigatorio
3. Permissoes por usuario sao obrigatorias
4. O MVP precisa parecer um produto vendavel e nao um prototipo tecnico
5. A IA deve ser contextual e integrada ao fluxo, nao um chat livre
6. O dominio e vertical de Direito Bancario, nao juridico generico

---

## Recommended MVP Technical Direction

### Application

1. Next.js 14+ com App Router
2. TypeScript
3. React Server Components onde fizer sentido
4. Client Components apenas para interacoes ricas e formulários

### UI Layer

1. Tailwind CSS
2. shadcn/ui
3. Lucide React
4. TanStack Table para grids e listagens
5. React Hook Form + Zod para formularios

### Backend / Data

1. Supabase Auth para autenticacao
2. Supabase Postgres para banco do MVP
3. Supabase Storage para documentos
4. RLS como base do multi-tenant

### AI Readiness

1. Estrutura de service layer para IA
2. Objetos de contexto bem definidos
3. Mocks sofisticados no MVP
4. Camada preparada para futura integracao com OpenAI

---

## Domain Architecture Priorities

### Core bounded contexts

1. Identity and Access
2. CRM / Clients
3. Banking Cases
4. Document Intelligence
5. Operational Workflow
6. AI Copilot
7. Executive Analytics

### Central domain object

`BankingCase` deve ser a entidade central do dominio, com conexoes fortes para:

1. Client
2. Document
3. Task
4. Deadline
5. LegalDraft
6. AIInteraction

---

## MVP Entity Set

1. Tenant
2. User
3. Role
4. Client
5. BankingCase
6. Document
7. Task
8. Deadline
9. LegalDraft
10. ContractAnalysis
11. AIInteraction
12. ActivityLog

---

## Key Architectural Decisions Needed

O `@architect` precisa fechar principalmente:

1. estrategia de isolamento multi-tenant
2. modelo de permissao por papel e escopo
3. modelagem inicial das entidades
4. organizacao do App Router
5. estrategia de data fetching no dashboard e nas paginas de detalhe
6. estrutura de componentes compartilhados x modulos de dominio
7. shape do contexto da LexIA
8. estrategia de mocks e fixtures consistentes
9. abordagem para upload e preview documental
10. readiness para dark mode e theming premium

---

## Suggested Information Architecture

### Global navigation

1. Dashboard
2. Clientes
3. Casos Bancarios
4. Documentos
5. Tarefas
6. Prazos
7. Pecas
8. Jurisprudencia
9. Carteira
10. LexIA
11. Equipe
12. Configuracoes

### Recommended MVP focus in app shell

1. Dashboard
2. Clientes
3. Casos
4. Documentos
5. Tarefas
6. LexIA
7. Equipe
8. Configuracoes

---

## AI Architecture Guardrails

1. Toda chamada da LexIA deve receber `tenantContext`
2. Se houver entidade ativa, deve receber `entityContext`
3. Se houver relacoes relevantes, deve receber `workspaceContext`
4. A UI deve expor a acao contextual antes do chat livre
5. O sistema deve registrar `AIInteraction` para rastreabilidade

---

## UX Architecture Guardrails

1. Sidebar fixa
2. Header com busca global
3. Pagina de caso como centro de comando
4. Pagina de cliente como historico relacional
5. Tela de contrato como prova premium da IA
6. LexIA lateral persistente sem poluir a tela

---

## Non-Goals for MVP

1. OCR real
2. Jurisprudencia com fonte viva
3. Geração juridica 100 por cento automatizada
4. Calculo processual confiavel
5. Integrações externas complexas

---

## Inputs For Architectural Spec

Usar como base:

1. [Project Brief](./project-brief.md)
2. [MVP Roadmap](./mvp-roadmap.md)
3. [System Map](./system-map.md)
4. [LexIA Context Architecture](./lexia-context-architecture.md)

---

## Requested Output From Architect

1. arquitetura tecnica do MVP
2. modelagem inicial de dados
3. estrutura de pastas e modulos
4. estrategia de autenticacao e RLS
5. arquitetura da camada de IA
6. plano de scaffold tecnico

---

_Last Updated: 2026-04-08 | Atlas_
