# Active Legacy Governance Map

**Date:** 2026-04-28  
**Status:** Active  
**Scope:** Epic 14 closure guard for the new master PRD

## Objective

Evitar que residuos de navegacao, naming e superficies antigas contaminem o fluxo principal definido pelo `prd-mestre-escritorio-bancario-v2.md`.

## Canonical Core

O nucleo operacional visivel do produto passa a ser:

- `Clara`
- `CRM`
- `Clientes`
- `Processos`
- `Diario oficial`
- `Andamentos`
- `Agenda`
- `Financeiro`
- `Configuracoes`

Tudo que nao reforca esse fluxo fica fora da promocao principal e precisa obedecer a um contrato explicito de compatibilidade.

## Governance Decisions

| Residuo | Estado | Decisao | Contrato minimo |
| --- | --- | --- | --- |
| Rota `/lexia` | Herdado | `adaptar` | Redireciona para `/clara` sem experiencia paralela |
| Identidade visivel `LexIA` no workspace principal | Herdado | `remover` | Clara assume a camada visivel; nomes internos podem permanecer temporariamente |
| Rota raiz `/site` | Herdado | `congelar` | Exibe estado controlado e aponta para `Configuracoes`; nao promove vertical propria |
| Subrotas `/site/*` | Herdado | `congelar` | Mantidas apenas como bloqueio explicito, sem simular backend inexistente |
| Estruturas internas `lexiaInsights` e `lexiaNextStep` | Tecnico | `reaproveitar` | Mantidas enquanto nao bloquearem leitura do produto; renomeacao fica fora do Epic 14 |
| Pacotes `@lexia/*` | Tecnico | `adaptar` | Mantidos como contrato de codigo ate migracao dedicada de naming |

## Execution Rules

1. Nenhuma nova story do fluxo principal pode reintroduzir `LexIA` como marca visivel em menu, cockpit, workspace ou CTA canonico.
2. Rotas herdadas so podem sobreviver se estiverem redirecionadas para o fluxo canonico ou bloqueadas com estado controlado.
3. Areas sem backend proprio nao podem reaparecer como modulo ativo do produto.
4. Residuos tecnicos internos podem permanecer apenas quando nao criarem duplicidade visivel nem ambiguidade operacional.

## Review Checklist

- Navegacao principal continua limitada ao nucleo canonico
- Clara segue como unica superficie visivel da camada de IA
- `/lexia` nao abre workspace paralelo
- `/site` nao promove vertical ativa
- Stories do Epic 14 referenciam a governanca anti-legado
