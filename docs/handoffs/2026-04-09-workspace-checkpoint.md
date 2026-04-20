# Checkpoint 2026-04-09

## Estado salvo

- Workspace realinhado para o padrao do MaisJuridico nas secoes principais.
- Modulos com submenu agora entram direto na primeira subpagina util, exceto `Dashboard` e `Processos`.
- Clique no nome da sessao na sidebar tambem abre o submenu, sem depender apenas da seta.

## Seções alinhadas por referencia autenticada

- Relatorios
- Financeiro
- Estatisticas
- Diario Oficial
- Andamentos
- Arquivos
- Site
- Editor de texto

## Ajustes recentes finais

- Remocao das paginas-raiz duplicadas em sessoes com submenu.
- Abertura automatica do submenu ao entrar na rota da secao.
- Clique no nome da sessao da sidebar abrindo o submenu.
- Ajustes finos de escala visual em `Pessoas`, `Equipe`, `Agenda` e `Andamentos`.

## Story de referencia

- `docs/stories/11.2.realign-workspace-ia-to-reference-suite.md`

## Validacao final

- `npm run lint`
- `npm run typecheck`
- `npm test`

Todos passaram neste estado.
