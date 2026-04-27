# Backlog de Hardening — Derivado das Auditorias

## Data

2026-04-23

## Origem

- Consolidacao: `docs/handoffs/2026-04-23-audit-consolidation.md`
- Auditoria de sistema: `docs/handoffs/2026-04-20-escopo-vs-sistema-auditoria.md`
- Auditoria de Clara: `docs/handoffs/2026-04-20-clara-auditoria-vs-escopo.md`

## Principio

Fortalecer o que existe antes de expandir escopo. Cada item do backlog parte de um gap real identificado na auditoria, nao de uma ideia nova.

---

## Wave 1: Clara Hardening (ATUAL — em Review)

Objetivo: transformar a Clara de workspace assistido em motor juridico rastreavel.

| # | Story | Foco | Status | Evidencia |
|---|-------|------|--------|-----------|
| 1 | 11.9 | Consolidar auditorias e backlog | InReview | `docs/stories/11.9.audit-driven-foundation-hardening.md` |
| 2 | 11.10 | Nucleo juridico estruturado | Review | `get-clara-structured-core.ts` |
| 3 | 11.11 | Adaptadores de fontes oficiais | Review | `clara-source-adapters.ts` |
| 4 | 11.12 | Audit trail e anti-alucinacao | Review | `clara-audit-trail.ts` |

**Resultado esperado:** Clara com classificacao de caso, separacao de fontes, e trilha de auditoria.

---

## Wave 2: Centralizacao de Dominio (PROXIMO CICLO)

Objetivo: consolidar modulos que existem de forma distribuida em funcoes centrais.

| # | Gap (auditoria) | Acao de Hardening | Prioridade |
|---|-----------------|-------------------|------------|
| 5 | Classificacao IA distribuida em servicos | Centralizar `classifyCase(texto, documentos)` como funcao unica | P1 |
| 6 | Dossie distribuido entre caso/processo/documento | Consolidar dossie unificado com timeline por caso | P1 |
| 7 | Intake de leads sem pipeline formal | Criar pipeline estruturado lead → caso com saida padronizada | P1 |

**Pre-requisito:** Wave 1 completa (Clara com nucleo estruturado para consumir classificacao).

---

## Wave 3: Gerador Juridico Formalizado

Objetivo: transformar geracao distribuida de pecas em modulo padronizado.

| # | Gap (auditoria) | Acao de Hardening | Prioridade |
|---|-----------------|-------------------|------------|
| 8 | Drafts existem mas sem gerador padronizado | Criar `generatePetition(tipo, dados)` como modulo central | P2 |
| 9 | Contrato de honorarios, procuracao como intencao funcional | Padronizar geracao por tipo de peca juridica | P2 |
| 10 | Checklist de distribuicao ausente | Criar pacote final de protocolo judicial | P2 |

**Pre-requisito:** Wave 2 (classificacao centralizada alimenta o gerador).

---

## Wave 4: Monitoramento Processual Real

Objetivo: substituir acompanhamento manual por automacao real.

| # | Gap (auditoria) | Acao de Hardening | Prioridade |
|---|-----------------|-------------------|------------|
| 11 | Monitoramento existe como informacao, nao como automacao | Implementar rotina de consulta automatica | P3 |
| 12 | Timeline processual parcial | Criar timeline automatica com eventos classificados | P3 |
| 13 | Alertas de movimentacao ausentes | Gerar alertas a partir de novos andamentos | P3 |

**Pre-requisito:** Wave 1 (adaptadores de fonte oficiais ja preparados na 11.11).

---

## Wave 5: Seguranca e Governanca como Produto

Objetivo: explicitar camada de seguranca que hoje e apenas infraestrutura.

| # | Gap (auditoria) | Acao de Hardening | Prioridade |
|---|-----------------|-------------------|------------|
| 14 | LGPD como politica de produto inexistente | Criar classificacao de sensibilidade e politicas de retencao | P4 |
| 15 | Trilha de auditoria de acoes do usuario ausente | Formalizar log de acoes como modulo | P4 |
| 16 | Base preparada para integracao futura com PJe ausente | Preparar boundary e modelo de integracao futura sem inventar integracao real nesta wave | P4 |
| 17 | Telas de administracao da Clara inexistentes | Cadastro de teses, modelos e governanca | P5 |

**Pre-requisito:** Nenhum tecnico forte. Pode comecar em paralelo apos Wave 2.

---

## Regras do Backlog

1. **Nenhum item foi inventado.** Cada linha rastreia ate um gap da auditoria de 2026-04-20.
2. **A ordem respeita dependencias reais**, nao prioridade arbitraria.
3. **Wave 1 deve fechar antes de Wave 2 iniciar** — nao pular etapas.
4. **Cada wave deve produzir stories formais** via fluxo @sm → @po → @dev → @qa.
5. **Se um gap nao apareceu na auditoria, nao entra no backlog.**

---

## Supabase

Supabase ja configurado e operacional. A persistencia Clara (record-store, repository) ja suporta Postgres com fallback em arquivo. As waves futuras podem consumir Supabase diretamente para:
- Persistencia de classificacao de caso
- Logs de consulta a fontes oficiais
- Registro de audit trail
- Dossie unificado por caso

Nao requer setup adicional para a Wave 1.
