# UX Specialist Review

## Debitos Validados

| ID | Debito | Severidade | Horas | Prioridade | Impacto UX |
| --- | --- | --- | --- | --- | --- |
| UX-01 | Sistema visual nao foi extraido para `@lexia/ui` | Alta | 16 | Alta | Dificulta escala e consistencia |
| UX-02 | `globals.css` concentra regras demais | Media | 10 | Media | Baixa previsibilidade para evolucao |
| UX-03 | Falta padrao para loading, error e empty states | Alta | 12 | Alta | UX quebra quando dados reais entrarem |
| UX-04 | Acoes de busca/header ainda sao majoritariamente visuais | Media | 8 | Media | Promessa de produto sem resposta real |
| UX-05 | Acessibilidade nao aparece como trilha sistemica | Media | 8 | Media | Risco de exclusao e retrabalho |

## Debitos Adicionados

| ID | Debito | Severidade | Horas | Prioridade | Impacto UX |
| --- | --- | --- | --- | --- | --- |
| UX-06 | Navegacao e protecao de rotas usam listas paralelas | Media | 4 | Media | Risco de inconsistencias de experiencia |
| UX-07 | Forte dependencia de dados mockados gera UX valida apenas para demo | Alta | 10 | Alta | Transicao para real data pode quebrar fluxos |

## Respostas ao Architect

1. O recorte minimo de design system deve incluir shell, cards, formularios, estados de tela e tipografia/tokens.
2. A shell atual e um bom ponto de partida visual. Nao precisa ser descartada; precisa ser extraida e normalizada.
3. Os primeiros estados a padronizar devem ser: loading, empty, error, unauthorized e unavailable-data.

## Recomendacoes de Design

1. Extrair primitives de superficie, input, button, badge e card.
2. Criar componentes de estado compartilhados antes de ligar paginas a dados reais.
3. Usar uma trilha de migracao incremental: login -> dashboard -> clientes/processos -> Clara.
