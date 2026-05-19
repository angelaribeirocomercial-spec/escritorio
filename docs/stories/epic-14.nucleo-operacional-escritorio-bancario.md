# Epic 14: Nucleo operacional do escritorio bancario

## Status

Done

## Objetivo

Instalar o primeiro nucleo operacional completo do novo produto, obedecendo ao PRD mestre v2 e ao handoff arquitetural executavel.

O nucleo minimo correto e:

`Novo atendimento bancario -> caso com workflow do nicho -> cockpit do cliente -> Clara contextual minima`

## Autoridade

- `docs/product/lexia-bancaria/prd-mestre-escritorio-bancario-v2.md`
- `docs/handoffs/2026-04-28-architect-prd-v2-executable-handoff.md`
- validacao do `@po` em 2026-04-28

## Escopo

- entrada unica real do caso
- cockpit inicial coerente do cliente
- workflow visivel do nicho piloto
- Clara contextual minima com execucao segura dentro do contexto do caso
- governanca anti-legado para impedir recontaminacao

## Fora de escopo

- CRM profundo com leads, pipeline e follow-ups completos
- integracoes externas amplas com APIs oficiais
- automacoes avancadas de distribuicao
- suporte profundo aos nichos alem do piloto revisional

## Criterios de sucesso

1. O sistema permite abrir cliente, caso, nicho e documentos por uma jornada unica confiavel.
2. O caso nasce com workflow inicial e cockpit utilizavel.
3. O nicho piloto `Revisional de contratos (veiculos)` fica visivel e operacional no cockpit.
4. A Clara consegue analisar o caso, conferir documentos e sugerir proximos passos sem operar fora de contexto.
5. Superficies herdadas conflitantes deixam de interferir no fluxo principal.

## Ordem recomendada

1. Story 14.1 - Completar novo atendimento bancario com documentos e workflow inicial
2. Story 14.2 - Consolidar cockpit inicial do cliente
3. Story 14.3 - Instalar workflow visivel do nicho piloto revisional
4. Story 14.4 - Entregar Clara contextual minima
5. Story 14.5 - Aplicar governanca anti-legado no nucleo operacional

## Dependencias entre stories

- `14.1` nao depende das demais e deve abrir o nucleo.
- `14.2` depende de `14.1`.
- `14.3` depende de `14.1` e `14.2`.
- `14.4` depende de `14.1`, `14.2` e `14.3`.
- `14.5` acompanha todo o epic, mas deve consolidar e fechar depois de `14.4`.

## Recomendacao de implementacao

A primeira story a implementar deve ser a `14.1`, porque ela fecha o primeiro caminho real de cadastro de cliente e caso com documentos e workflow inicial, que e a prioridade imediata de negocio definida pela usuaria.

## Completion Notes

- As stories `14.1` a `14.5` foram implementadas, validadas e marcadas como `Done`.
- O nucleo operacional do escritorio bancario ficou consolidado no fluxo `Novo atendimento bancario -> caso com workflow do nicho -> cockpit do cliente -> Clara contextual minima`.
- A governanca anti-legado foi aplicada para manter a superficie principal consistente com o `PRD mestre novo`.
