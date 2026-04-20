# LexIA Bancaria System Map

**Version:** 1.0.0
**Last Updated:** 2026-04-08
**Status:** Draft

---

## Overview

Este mapa descreve os modulos, entidades e fluxos centrais do produto. O objetivo e garantir uma arquitetura funcional coerente antes da implementacao.

---

## Core Modules

### 1. Dashboard

Funcao: oferecer visao executiva e operacional consolidada.

Objetos principais:

- metricas de clientes
- metricas de casos
- metricas de tarefas
- metricas de pecas
- produtividade
- insights da IA

### 2. Clientes

Funcao: concentrar relacionamento, elegibilidade, onboarding e historico.

Objetos principais:

- cadastro completo
- score de viabilidade
- origem do lead
- banco envolvido
- honorarios
- timeline
- notas internas

### 3. Casos Bancarios

Funcao: ser o centro operacional e juridico de cada demanda.

Objetos principais:

- cliente
- banco reu
- tipo de demanda
- fase processual
- tese principal
- risco
- estrategia
- responsavel

### 4. Documentos

Funcao: armazenar, classificar, localizar e acionar inteligencia documental.

Objetos principais:

- tipo documental
- tags
- cliente vinculado
- caso vinculado
- status de analise
- acoes com IA

### 5. Prazos e Intimacoes

Funcao: organizar atos, vencimentos e acoes recomendadas.

Objetos principais:

- tipo de ato
- publicacao
- ciencia
- prazo sugerido
- vencimento
- responsavel
- tarefa gerada

### 6. Pecas Juridicas

Funcao: produzir, revisar, versionar e acompanhar documentos juridicos.

Objetos principais:

- tipo de peca
- caso vinculado
- status
- versoes
- rascunhos
- exportacao

### 7. Jurisprudencia

Funcao: pesquisar e reutilizar entendimento aplicavel por tema.

Objetos principais:

- tema
- tribunal
- data
- tese
- trecho util
- vinculacao com peca

### 8. Tarefas

Funcao: operacionalizar o fluxo juridico interno.

Objetos principais:

- titulo
- descricao
- caso
- cliente
- responsavel
- prazo interno
- prioridade
- checklist

### 9. Carteira / Gestao

Funcao: monitorar distribuicao, produtividade e valor da carteira.

Objetos principais:

- casos por banco
- casos por tese
- casos por fase
- aging
- produtividade
- honorarios
- conversao

### 10. Assistente IA

Funcao: interpretar contexto e apoiar atendimento, analise, producao e operacao.

Objetos principais:

- modo de atuacao
- contexto corrente
- acoes sugeridas
- resposta gerada
- historico contextual

### 11. Configuracoes

Funcao: parametrizar o tenant e os comportamentos do sistema.

Objetos principais:

- dados do escritorio
- branding
- preferencias
- regras de equipe
- prompts e politicas futuras

### 12. Equipe / Usuarios

Funcao: controlar acesso e responsabilidade operacional.

Objetos principais:

- usuario
- papel
- permissoes
- equipe
- especialidade

---

## Core Domain Entities

### Tenant

Representa o escritorio. E o contorno de isolamento multi-tenant.

### User

Representa membros do escritorio com papeis e escopo de acesso.

### Client

Representa pessoa fisica ou juridica atendida pelo escritorio.

### BankingCase

Representa a demanda juridica bancaria. E a entidade central do dominio.

### Document

Representa qualquer arquivo ou item documental associado a cliente, caso ou producao.

### Deadline

Representa prazo processual ou interno.

### Task

Representa trabalho operacional estruturado.

### LegalDraft

Representa peca juridica ou comunicacao formal produzida no sistema.

### JurisprudenceItem

Representa precedente, resumo ou tese catalogada.

### AIInteraction

Representa uma acao contextual da LexIA, vinculada a um objeto do sistema.

### ContractAnalysis

Representa resultado estruturado da analise de contrato bancario.

---

## Key Relationships

1. Tenant possui muitos usuarios
2. Tenant possui muitos clientes
3. Cliente possui muitos casos
4. Caso possui muitos documentos
5. Caso possui muitas tarefas
6. Caso possui muitos prazos
7. Caso possui muitas pecas
8. Caso possui muitas interacoes de IA
9. Documento pode originar uma analise contratual
10. Jurisprudencia pode ser vinculada a pecas e casos

---

## Critical User Flows

### Flow 1: Novo lead ate caso ativo

1. Cadastrar cliente
2. Registrar origem e banco envolvido
3. Fazer score de viabilidade
4. Criar caso bancario
5. Solicitar ou receber documentos
6. Gerar checklist inicial
7. Acionar LexIA para triagem

### Flow 2: Analise de contrato bancario

1. Subir contrato
2. Classificar documento
3. Abrir tela de analise
4. Exibir taxa, CET, tarifas, clausulas sensiveis e abusividades
5. Sugerir tese, risco e pedidos
6. Permitir gerar tarefa ou peca

### Flow 3: Conducao do caso

1. Abrir pagina do caso
2. Revisar documentos, fase e tese
3. Ver tarefas e prazos
4. Acionar IA contextual
5. Gerar nova peca ou orientacao
6. Atualizar cliente

### Flow 4: Intimacao ate proximo passo

1. Subir intimacao
2. Sistema identifica o ato de forma simulada
3. Sugere prazo e vencimento
4. Recomenda acao
5. Cria tarefa
6. Exibe alerta de conferencia pelo advogado

---

## Most Important Screens

### Pagina do Caso Bancario

Esta e a tela mais importante do sistema porque concentra:

1. resumo do caso
2. cliente
3. risco e tese
4. documentos
5. tarefas
6. prazos
7. pecas
8. insights da LexIA

### Tela de Analise de Contrato

Esta e a demonstracao mais forte do diferencial de IA especializada.

### Dashboard Executivo

Esta e a tela de prova de valor para socio ou gestor.

---

## Functional Boundaries

Para manter foco no produto:

1. CRM precisa ser juridico, nao comercial generico
2. GED precisa ser inteligente, nao so repositrio de arquivos
3. IA precisa ser contextual, nao um chat livre sem ancora
4. Gestao precisa ser acionavel, nao so analitica

---

_Last Updated: 2026-04-08 | Atlas_
