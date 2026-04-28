# Relatorio de Debito Tecnico

**Projeto:** LexIA Bancaria  
**Data:** 2026-04-20  
**Versao:** 1.0

## Executive Summary

O produto comunica um escritorio juridico premium com boa cobertura visual, navegacao ampla e narrativa comercial forte. O problema e que essa camada de percepcao esta na frente da fundacao tecnica. Hoje, a autenticacao com Supabase existe, mas o banco versionado no repositorio nao acompanha nem mesmo as tabelas minimas usadas pela aplicacao. Ao mesmo tempo, a maior parte dos modulos de negocio ainda opera sobre fixtures.

Isso cria um risco classico de brownfield: o sistema parece pronto para escalar, mas ainda nao e suficientemente reproduzivel, auditavel ou testado para sustentar evolucao segura. O investimento recomendado nao e estetico. Ele e estrutural: banco baseline, seguranca multi-tenant, primeira vertical real de dados e cobertura minima de testes.

Se esse investimento for adiado, a equipe tende a acumular retrabalho em cada nova funcionalidade. Cada modulo novo herdara os mesmos problemas: dados mockados, ausencia de schema auditavel, estados de UX nao preparados para falha real e baixa protecao contra regressao.

## Numeros-Chave

| Metrica | Valor |
| --- | --- |
| Total de debitos priorizados | 11 |
| Debitos criticos | 4 |
| Esforco total prioritario | 104 horas |
| Custo estimado de resolucao | R$ 15.600 |

## Recomendacao

Executar um ciclo curto de fundacao tecnica antes de ampliar funcionalidades. O foco deve ser tornar o produto reproduzivel e seguro, depois migrar uma vertical real de negocio com UX confiavel.

## Analise de Custos

### Custo de Resolver

| Categoria | Horas | Custo (R$150/h) |
| --- | --- | --- |
| Sistema | 42 | R$ 6.300 |
| Database | 34 | R$ 5.100 |
| Frontend | 28 | R$ 4.200 |
| **TOTAL** | **104** | **R$ 15.600** |

### Custo de Nao Resolver

| Risco | Probabilidade | Impacto | Custo Potencial |
| --- | --- | --- | --- |
| Vazamento ou erro cross-tenant por falta de baseline auditavel | Media/Alta | Critico | R$ 60.000+ |
| Retrabalho em cada nova vertical por falta de schema e testes | Alta | Alto | R$ 35.000+ |
| Queda de confianca em demos e homologacao por falhas ao sair de mocks | Alta | Alto | R$ 25.000+ |
| Atraso estrutural de roadmap | Alta | Alto | R$ 30.000+ |

**Custo potencial de nao agir:** R$ 150.000+ em retrabalho, atraso e risco operacional acumulado.

## Impacto no Negocio

### Performance Organizacional

- O time hoje entrega rapido em demo, mas lento para transformar demo em operacao real.
- Sem baseline de banco e testes, cada nova feature custa mais do que deveria.

### Seguranca

- O modelo multi-tenant existe na intencao do codigo, mas nao esta auditavel no repositorio.
- Isso e risco direto para qualquer evolucao que envolva clientes reais.

### Experiencia do Usuario

- A UX atual convence em apresentacao.
- Quando dados reais entrarem, loading, erro, vazio e indisponibilidade vao ficar visiveis se nada for padronizado antes.

### Manutenibilidade

- A arquitetura atual favorece crescimento da divida: mocks, CSS global amplo, testes superficiais e docs fora de sincronia.

## Timeline Recomendado

### Fase 1: Quick Wins e Seguranca Basica (1-2 semanas)

- Baseline de migrations
- Policies RLS baseline
- Seed local reproduzivel
- Ajuste de fallback silencioso
- Custo estimado: R$ 5.400

### Fase 2: Fundacao Operacional (2-3 semanas)

- Testes de auth e tenant scope
- Primeira vertical real saindo de mocks
- Padrao de loading/error/empty states
- Custo estimado: R$ 6.000

### Fase 3: Consolidacao do Frontend e Escala (2-3 semanas)

- Extracao de primitives para `@lexia/ui`
- Limpeza de CSS global e consolidacao visual
- Expansao gradual para outras verticais
- Custo estimado: R$ 4.200

## ROI da Resolucao

| Investimento | Retorno Esperado |
| --- | --- |
| R$ 15.600 | Reducao relevante de risco estrutural e retrabalho |
| 104 horas | Base confiavel para roadmap real |
| 5-8 semanas | Produto mais sustentavel para operar e vender |

**ROI estimado:** entre 4:1 e 8:1 ao evitar retrabalho, incidentes e atraso estrutural.

## Proximos Passos

1. Aprovar o ciclo de fundacao tecnica.
2. Priorizar baseline de banco e seguranca no proximo bloco de trabalho.
3. Escolher a primeira vertical real para migracao.
4. Executar stories em ordem de dependencia, nao por conveniencia visual.
