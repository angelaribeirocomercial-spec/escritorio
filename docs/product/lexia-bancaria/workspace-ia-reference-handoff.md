# Workspace IA Reference Handoff

## Status

Approved for implementation

## Context

The current ADVX workspace already contains banking-specialized modules, but the
information architecture and page density still diverge from the authenticated
MaisJurídico workspace that the product is meant to mirror.

The reference system was inspected through authenticated Playwright access on
2026-04-09 at:

- `https://www.maisjuridico.com.br/cp/dashboard.php`

## Authenticated Findings

### Main Navigation

The authenticated reference workspace exposes the following main modules:

1. Dashboard
2. Processos
3. Pessoas
4. Equipe
5. Agenda
6. Financeiro
7. SAC
8. Relatórios
9. Estatísticas
10. Diário Oficial
11. Andamentos
12. Arquivos
13. Site
14. Editor de texto

`SAC` is explicitly out of scope for ADVX.

### Reference Submodules

- `Pessoas`
  - Clientes
  - Adversos
  - Advogados Adversos
  - Contatos / Partes
- `Equipe`
  - Advogados / Equipe
  - Grupo de advogados
- `Agenda`
  - Compromissos
  - Tarefas
  - Prazos
- `Financeiro`
  - Despesas
  - Receitas
  - Transferências
  - Vencimentos
  - Gráficos
- `Relatórios`
  - Resumo
  - Processos
  - Financeiro
  - Custas
  - Honorários
  - Compromissos
  - Tarefas
  - Prazos
  - Horas trabalhadas
  - Pessoas
- `Estatísticas`
  - Andamentos atrasados
  - Andamentos dos processos
  - Últimos andamentos
  - Andamentos automáticos
  - Clientes
  - Processos
  - Abertura de processos
  - Cadastro de processos
  - Fase do processo
  - Natureza da ação
  - Financeiro
  - Personalizados
- `Diário Oficial`
  - Publicações
  - Advogados
  - Palavras-chave
  - Lixeira
- `Andamentos`
  - Andamentos automáticos
  - Configurar monitoramentos
- `Arquivos`
  - Meus arquivos
  - Enviar arquivos
  - Relatórios
- `Site`
  - Páginas do site
  - Banco de imagens
  - E-mail
  - Configurações
- `Editor de texto`
  - Meus textos
  - Modelos

### Theme Behavior

The account menu in the authenticated reference workspace exposes `Modo escuro (beta)`.
ADVX should support workspace theme switching so the mirrored IA includes both a dark
and light layout option.

## Architectural Direction

### Navigation

- Mirror the reference main navigation order, excluding `SAC`
- Keep banking specialization inside labels, summaries, and entity content rather than
  inventing a radically different IA
- Remove `Casos`, `Clientes`, `Tarefas`, and `Clara` as primary sidebar items
- Keep their routes working as supporting or linked surfaces

### Module Positioning

- `Processos` becomes the primary legal workspace
- `caso bancário` becomes linked domain context inside process views rather than a
  top-level workspace destination
- `Pessoas` becomes the primary entry for clients and related parties
- `Agenda` remains the time-based command surface, but visually simpler
- `Clara` remains cross-cutting and contextual, not a louder top-level module than
  the legal suite itself

### UI Density

- The reference system favors straightforward module pages over decorative hero-heavy
  layouts
- Each module should show only the essential summary and one concise example block per
  relevant sub-area
- Shared hero chrome should be simplified where necessary to avoid “demo dashboard”
  density

### Theme

- Add a workspace theme toggle with `dark` and `light`
- The choice can be local-first using browser persistence
- Light theme does not need a new IA; it should reuse the same module structure

## Implementation Scope

1. Add a story for workspace IA alignment and theme support
2. Refactor navigation to mirror the reference module order without `SAC`
3. Simplify `dashboard`, `processos`, `pessoas`, `equipe`, `agenda`, and `arquivos`
4. Add lean first-cut pages for `financeiro`, `relatorios`, `estatisticas`, `site`,
   and `editor de texto`
5. Add a user-visible dark/light workspace toggle

## Constraints

- Keep Clara as the digital lawyer layer across the workspace
- Keep existing routes working where already linked or protected
- Do not remove the banking specialization from data, labels, and flows
- Do not recreate `SAC`
