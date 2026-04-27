# Handoff: Slice 1 do Redesign de Navegacao

**Data:** 2026-04-27  
**Origem:** PM  
**Destino sugerido:** SM / Dev / Architect

---

## Resumo

Implementar apenas o reenquadramento de navegacao do workspace. Nao reconstruir os modulos. O ganho deste slice vem de reorganizar a percepcao do produto:

1. `Dashboard` vira `Hoje`
2. `Pessoas` vira `CRM`
3. `Agenda` + `Diario Oficial` + `Andamentos` passam a ser lidos sob `Operacao`
4. `Processos`, `Financeiro` e `Clara` permanecem como eixos primarios

Referencia de produto: `docs/product/lexia-bancaria/redesign-navigation-product-cut.md`

---

## Escopo de Implementacao

1. editar `apps/web/src/components/layout/workspace-shell.tsx`
2. manter rotas atuais ativas
3. introduzir apenas a nova organizacao do menu
4. se necessario, criar paginas-landings leves para `CRM` e `Operacao`
5. rebaixar `Relatorios`, `Estatisticas`, `Arquivos`, `Editor de texto` e `Equipe` para area secundaria

---

## Acceptance Criteria Propostos

1. O menu principal passa a mostrar apenas `Hoje`, `CRM`, `Processos`, `Operacao`, `Financeiro` e `Clara`.
2. `CRM` abre o fluxo atual de clientes sem quebrar as rotas de `Pessoas`.
3. `Operacao` agrupa acesso a `Agenda`, `Publicacoes` e `Monitoramento` sem quebrar as rotas existentes.
4. `Clara` continua com workspace proprio e nao perde seus handoffs atuais.
5. Modulos rebaixados continuam acessiveis por navegacao secundaria.
6. `npm run lint`, `npm run typecheck` e `npm test` continuam verdes.

---

## Guardrails

1. Nao criar novo dominio de dados neste slice.
2. Nao renomear arquivos de rota em massa.
3. Nao quebrar links legados de Clara para clientes, processos, agenda e andamentos.
4. Nao transformar `Clara` em chat global sem ancora de contexto.

---

## Pergunta de Arquitetura

Antes de implementar, decidir apenas um ponto:

1. `CRM` e `Operacao` serao rotas novas com landing propria
2. ou serao apenas grupos visuais que redirecionam para a primeira subpagina util

Minha recomendacao de produto para Slice 1: usar grupos com landing leve, porque melhora compreensao sem exigir refactor profundo.
