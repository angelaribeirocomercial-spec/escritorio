# Frontend Brownfield Spec

**Date:** 2026-04-20  
**Status:** Discovery document  
**Scope:** `apps/web/src/app`, `apps/web/src/components`, `apps/web/src/app/globals.css`

## 1. Current UX Summary

O frontend atual entrega uma shell convincente para um SaaS juridico bancario: sidebar fixa, header com busca, tema dark/light e uma cobertura ampla de rotas para os modulos principais do escritorio. A direcao visual e consistente o bastante para demo, mas o sistema ainda depende mais de mocks e CSS global do que de componentes compartilhados reutilizaveis.

## 2. IA/UX Structure

### Positive Findings

- Tipografia e shell de produto passam uma identidade premium consistente.
- `WorkspaceShell` centraliza navegacao e cria experiencia unificada entre modulos.
- A pagina de login tem narrativa comercial clara e reforca a proposta do produto.
- Ha suporte a tema light e dark com tokens CSS bem definidos.
- A estrutura de App Router favorece navegacao segmentada e layout persistente.

### Brownfield UX Debts

| ID | Debt | Severity | Evidence |
| --- | --- | --- | --- |
| UX-01 | Design system ainda nao existe como biblioteca real | Alto | `@lexia/ui` e placeholder; estilo mora em `globals.css` |
| UX-02 | Forte dependencia de classes e tokens globais, com pouca encapsulacao | Medio | `src/app/globals.css` concentra grande volume de regras |
| UX-03 | Muitas telas parecem estruturais ou demonstrativas, nao orientadas a dados reais | Alto | servicos de pagina usam fixtures |
| UX-04 | Busca do header e varios CTAs sao visuais, sem comportamento real consolidado | Medio | shell exibe affordances sem backend correspondente |
| UX-05 | Estados de loading, error e empty nao aparecem como padrao sistemico | Alto | pouca evidencia de componentes reutilizaveis para estados |
| UX-06 | Acessibilidade nao esta explicitamente tratada como camada transversal | Medio | nenhuma estrutura visivel de auditoria a11y, foco ou keyboard map |
| UX-07 | Navegacao depende de uma lista manual extensa e suscetivel a drift | Medio | itens de menu e rotas protegidas mantidos em listas paralelas |

## 3. Information Architecture

Os modulos principais hoje sao:

- Dashboard
- Clara
- Processos
- Pessoas
- Equipe
- Agenda
- Financeiro
- Relatorios
- Estatisticas
- Diario Oficial
- Andamentos
- Arquivos
- Editor de texto

Essa arquitetura de informacao esta coerente com o produto-alvo, mas o backend real ainda nao sustenta a maioria desses dominios.

## 4. Interaction Patterns

### Current Patterns

- Sidebar expansivel por secao
- Header persistente com busca
- Cards de dashboard
- Paginas de referencia/listagem
- Modos contextuais da Clara

### Missing Patterns

- Feedback de carregamento padronizado
- Tratamento de falha de integracao
- Estados sem permissao/acesso
- Visoes de comparacao ou historico com dados reais
- Componentes compartilhados de formulario e tabela em `@lexia/ui`

## 5. Accessibility Snapshot

### What is visible

- Estrutura semantica basica de links, buttons e main areas
- Uso razoavel de contraste no tema dark

### Gaps

1. Nao ha evidencias de checklist a11y automatizado.
2. Nao ha evidencias de componentes com foco gerenciado de forma padrao.
3. Nao ha sinal claro de validacao por teclado nos fluxos mais complexos.
4. Nao ha padrao evidente para mensagens de erro acessiveis em formularios.

## 6. Recommended Frontend Refactor Direction

1. Extrair primitives e componentes compartilhados para `packages/ui`.
2. Consolidar tokens e temas fora de `globals.css` gigante.
3. Criar biblioteca de estados de tela: loading, empty, error, unauthorized.
4. Comecar pela vertical mais usada em demo, para que a migracao para dados reais nao destrua a coerencia visual.
5. Conectar UX e backend por etapas: `auth -> clientes -> processos -> Clara`.

## 7. Priority Frontend Debts

| Priority | Item | Rationale |
| --- | --- | --- |
| P1 | Criar design system minimo reutilizavel | reduz duplicacao e acelera mudancas |
| P1 | Padronizar estados de carregamento/erro/vazio | necessario para sair de mocks |
| P1 | Garantir navegação e protecao de rotas coerentes | evita drift entre shell e middleware |
| P2 | Revisar a11y do login e shell | melhora base para escala |
| P2 | Instrumentar busca e acoes hoje apenas visuais | reduz falsas affordances |
| P3 | Reduzir CSS global acoplado a pagina especifica | melhora manutencao |
