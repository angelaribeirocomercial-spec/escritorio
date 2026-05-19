# Handoff dev -> devops: publicar Clara conversacional no dossie

## Data

2026-05-16

## Story

- [18.50.clara-conversacional-persistida-no-dossie-do-caso.md](C:/Users/Hearthz%20Gaming/escritorio/docs/stories/18.50.clara-conversacional-persistida-no-dossie-do-caso.md)

## Objetivo desta publicacao

Publicar apenas o primeiro slice da Clara conversacional persistida no dossie do caso para validacao visual do usuario.

Este deploy:

- instala o chat real apenas na aba `Clara` do dossie
- adiciona persistencia dedicada de thread e mensagens
- cria o endpoint novo `/api/clara/chat`
- preserva fallback controlado se a trilha conversacional falhar

Este deploy nao inclui:

- unificacao da pagina `/clara`
- refactor do restante do workspace conversacional
- mudancas nas abas `financeiro`, `bacen`, `laudo` e `peticoes`

## Estado da entrega

- implementacao concluida por `@dev`
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm test`: PASS
- `npm run build`: PASS
- QA formal ainda nao executado nesta story

## Arquivos da entrega

- `apps/web/src/server/services/clara/clara-chat-types.ts`
- `apps/web/src/server/services/clara/clara-chat-store.ts`
- `apps/web/src/server/services/clara/clara-chat-service.ts`
- `apps/web/src/app/api/clara/chat/route.ts`
- `apps/web/src/components/layout/clara-case-chat-panel.tsx`
- `apps/web/src/components/layout/client-dossier-frame.tsx`
- `apps/web/src/app/(workspace)/pessoas/clientes/[clientId]/page.tsx`
- `supabase/migrations/0020_clara_chat_threads.sql`
- `apps/web/tsconfig.json`
- `docs/stories/18.50.clara-conversacional-persistida-no-dossie-do-caso.md`

## Observacao importante de ambiente

A persistencia em banco da conversa depende da aplicacao da migration:

- `supabase/migrations/0020_clara_chat_threads.sql`

Se a migration ainda nao estiver aplicada no ambiente de preview, o sistema continua funcional pelo fallback local, mas sem a trilha persistida no banco.

## O que o devops deve fazer

1. Stagear apenas os arquivos desta entrega e o handoff correspondente.
2. Manter fora do fluxo os handoffs antigos, artefatos temporarios e arquivos locais nao relacionados.
3. Commitar o slice focado da `18.50` na branch `feature/clara-hardening`.
4. Publicar no fluxo normal de preview/deploy.
5. Se o ambiente suportar migration automatica, garantir a aplicacao da `0020_clara_chat_threads.sql`.
6. Depois do deploy, validar visualmente o dossie autenticado de um cliente com caso ativo e abrir a aba `Clara`.

## Verificacao pos-deploy sugerida

1. Abrir um cliente com caso ativo no dossie.
2. Entrar na aba `Clara`.
3. Confirmar que a interface abre uma thread real e nao mais um bloco estatico.
4. Enviar uma pergunta simples sobre o caso.
5. Confirmar resposta da Clara e preservacao do estado da thread ao recarregar a tela.
6. Se a migration nao estiver aplicada, ao menos confirmar que o fallback controlado mantem a aba funcional.

## Observacoes

- O build reescreveu `apps/web/tsconfig.json` para incluir `.next/types/**/*.ts`; essa mudanca foi mantida porque faz parte do estado verificado da toolchain.
- `apps/web/tsconfig.tsbuildinfo`, `.tmp-playwright/` e `supabase/.temp/` nao devem entrar no publish.
