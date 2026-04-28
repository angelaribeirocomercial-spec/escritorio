# Technical Debt Assessment - DRAFT

**Date:** 2026-04-20  
**Status:** Draft for specialist review

## 1. Debitos de Sistema

| ID | Debito | Area | Impacto | Esforco | Prioridade |
| --- | --- | --- | --- | --- | --- |
| SYS-01 | Documentacao de arquitetura nao reflete o estado real do repositorio | Docs / Architecture | Alto | Medio | Alta |
| SYS-02 | Modulos de produto dependem majoritariamente de mocks | Backend / Product | Critico | Alto | Critica |
| SYS-03 | Pacotes compartilhados `ui` e `config` ainda nao sustentam o app | Monorepo | Medio | Medio | Media |
| SYS-04 | Suite de testes nao valida comportamento real | Quality | Alto | Medio | Alta |
| SYS-05 | Configuracao Supabase com placeholders e fallback silencioso | Platform | Alto | Baixo | Alta |
| SYS-06 | Fallback de tenant context mascara erro de dados ou schema | Auth / Multi-tenant | Alto | Medio | Alta |
| SYS-07 | Listas manuais de navegacao e protecao de rotas podem divergir | App Shell | Medio | Baixo | Media |

## 2. Debitos de Database

⚠️ PENDENTE: revisao do especialista de dados

| ID | Debito | Area | Impacto | Esforco | Prioridade |
| --- | --- | --- | --- | --- | --- |
| DB-01 | Nenhuma migration versionada no repo | Schema management | Critico | Medio | Critica |
| DB-02 | Nenhuma policy RLS versionada no repo | Security | Critico | Medio | Critica |
| DB-03 | Tabelas `memberships` e `tenants` sao usadas pelo app sem baseline SQL no repositorio | Identity data | Critico | Medio | Critica |
| DB-04 | Seeds locais nao sustentam reproducao de auth + tenant | Developer experience | Alto | Baixo | Alta |
| DB-05 | Entidades de dominio ainda nao tem schema real correspondente no repo | Product data | Alto | Alto | Alta |

## 3. Debitos de Frontend/UX

⚠️ PENDENTE: revisao do especialista de UX

| ID | Debito | Area | Impacto | Esforco | Prioridade |
| --- | --- | --- | --- | --- | --- |
| UX-01 | Sistema visual nao foi extraido para `@lexia/ui` | Design system | Alto | Medio | Alta |
| UX-02 | `globals.css` concentra regras demais e acopla temas, paginas e superficies | Frontend architecture | Medio | Medio | Media |
| UX-03 | Falta de padrao claro para loading, error e empty states | UX reliability | Alto | Medio | Alta |
| UX-04 | Busca e algumas acoes de header sao majoritariamente affordances sem integracao real | Product UX | Medio | Medio | Media |
| UX-05 | Acessibilidade nao aparece como trilha sistemica | A11y | Medio | Medio | Media |

## 4. Matriz Preliminar

| ID | Debito | Area | Impacto | Esforco | Prioridade |
| --- | --- | --- | --- | --- | --- |
| DB-01 | Ausencia de migrations versionadas | Database | Critico | Medio | Critica |
| DB-02 | Ausencia de policies RLS versionadas | Database | Critico | Medio | Critica |
| SYS-02 | Dominio principal ainda sustentado por mocks | Sistema | Critico | Alto | Critica |
| DB-03 | Auth depende de schema nao versionado | Database | Critico | Medio | Critica |
| SYS-04 | Testes nao cobrem comportamento | Sistema | Alto | Medio | Alta |
| SYS-05 | Placeholder/fallback de Supabase | Sistema | Alto | Baixo | Alta |
| SYS-06 | Fallback de contexto do tenant | Sistema | Alto | Medio | Alta |
| UX-01 | Design system ainda nao consolidado | Frontend | Alto | Medio | Alta |
| UX-03 | Estados de tela nao padronizados | Frontend | Alto | Medio | Alta |
| SYS-01 | Drift entre docs e codigo | Sistema | Alto | Medio | Alta |

## 5. Perguntas Para Especialistas

### Para data-engineer

1. O baseline minimo deve cobrir apenas `tenants`, `memberships` e `profiles`, ou ja vale incluir o primeiro modulo juridico real?
2. O fallback de tenant context deve ser removido totalmente ou rebaixado para modo demo explicito?
3. Quais indices e constraints sao indispensaveis no baseline inicial?

### Para ux-design-expert

1. Qual recorte minimo de design system reduz risco sem travar a entrega?
2. A shell atual e forte o bastante para virar referencia, ou precisa de reestruturação antes da migracao para dados reais?
3. Quais estados de UX devem ser padronizados primeiro para suportar saida de mocks?
