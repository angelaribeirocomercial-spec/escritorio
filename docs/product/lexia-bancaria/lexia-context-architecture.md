# LexIA Bancaria Context Architecture

**Version:** 1.0.0
**Last Updated:** 2026-04-08
**Status:** Draft

---

## Overview

LexIA Bancaria deve ser desenhada como uma camada de inteligencia contextual e nao como um chat juridico generico. Sua funcao e interpretar o estado do escritorio e responder com base no objeto ativo da experiencia.

---

## Core Principle

Toda resposta da LexIA deve nascer de tres camadas:

1. contexto do tenant
2. contexto do objeto ativo
3. intencao da tarefa pedida pelo usuario

Sem essas tres camadas, a experiencia perde valor e vira apenas conversa.

---

## Interaction Surfaces

### 1. Fixed Side Copilot

Chat lateral persistente em todo o sistema.

Papel:

- tirar duvidas operacionais
- resumir contexto atual
- sugerir proximos passos
- acelerar navegacao entre tarefas

### 2. Dedicated AI Workspace

Tela exclusiva da LexIA com modos e historico de trabalho.

Papel:

- analises mais profundas
- comparacao de documentos
- producao assistida
- consolidacao de estrategia

### 3. Contextual Actions

Botoes em clientes, casos, documentos, prazos e pecas.

Papel:

- executar a acao certa no momento certo
- reduzir friccao
- evitar pergunta manual para tarefas repetitivas

---

## Four Operating Modes

### Atendimento

Objetivo: triagem inicial e qualificacao do atendimento.

Entradas:

- dados do cliente
- origem do lead
- documentos recebidos

Saidas:

- score de viabilidade
- checklist documental
- proximos passos

### Analise

Objetivo: interpretar contexto juridico e documental.

Entradas:

- caso
- contrato
- processo
- intimacao
- documentos vinculados

Saidas:

- resumo
- tese sugerida
- risco juridico
- documentos faltantes

### Producao Juridica

Objetivo: apoiar criacao de pecas e fundamentos.

Entradas:

- dados do caso
- tese
- fatos resumidos
- jurisprudencia vinculada

Saidas:

- estrutura sugerida
- fundamentos
- pedidos
- minuta inicial

### Operacional

Objetivo: organizar a execucao do escritorio.

Entradas:

- status do caso
- tarefas abertas
- prazos
- responsavel

Saidas:

- tarefas sugeridas
- checklist
- atualizacao para cliente
- proximo passo recomendado

---

## Context Model

### Tenant Context

Contexto que sempre acompanha a resposta:

- nome do escritorio
- perfil do escritorio
- preferencias internas
- identidade visual
- configuracoes futuras de estilo e linguagem

### User Context

Contexto do operador atual:

- nome
- papel
- permissoes
- carteira de casos

### Entity Context

Objeto em foco no momento da acao:

- cliente
- caso
- documento
- prazo
- peca

### Workspace Context

Elementos relacionados ao objeto ativo:

- documentos vinculados
- tarefas abertas
- ultimas interacoes
- status processual
- tese atual

### Intent Context

Acao pedida pelo usuario:

- resumir
- analisar
- sugerir tese
- gerar peca
- criar tarefas
- explicar prazo

---

## Response Design Rules

Cada resposta da LexIA deve:

1. Explicar de onde tirou o contexto
2. Mostrar conclusao principal primeiro
3. Separar fatos, sinais e recomendacoes
4. Exibir aviso de validacao humana quando houver risco juridico
5. Oferecer acoes seguintes acionaveis

---

## Contextual Prompting Blueprint

### Example: Caso Bancario

Quando chamada na pagina do caso, a LexIA deve considerar:

1. tipo de demanda
2. banco reu
3. fase processual
4. tese atual
5. documentos disponiveis
6. tarefas pendentes
7. prazos proximos

Resposta ideal:

- resumo executivo do caso
- pontos fortes e fracos
- documentos faltantes
- proximo passo recomendado
- opcao de gerar peca ou tarefa

### Example: Documento

Quando chamada num contrato ou intimacao, a LexIA deve considerar:

1. tipo documental
2. cliente e caso relacionados
3. metadados do arquivo
4. historico do caso

Resposta ideal:

- resumo do documento
- dados sensiveis extraidos
- sinais juridicos relevantes
- recomendacoes de uso

---

## AI Output Objects

Para manter rastreabilidade, toda resposta importante da LexIA deve poder gerar objetos internos como:

1. insight
2. resumo
3. tese sugerida
4. risco sugerido
5. checklist documental
6. tarefa sugerida
7. rascunho de peca
8. atualizacao ao cliente

---

## Trust and Safety Layer

Como o dominio e juridico, a LexIA deve operar com limites claros:

1. Nao afirmar certeza absoluta em materia interpretativa
2. Sempre sinalizar quando a resposta for sugestiva e nao conclusiva
3. Inserir aviso discreto para conferencia por advogado responsavel
4. Preservar segregacao por tenant e permissao por papel

---

## MVP Architecture Recommendation

No MVP, a LexIA deve parecer inteligente sem depender de pipeline real complexo. A recomendacao e:

1. respostas simuladas por contexto e tipo de objeto
2. biblioteca de cenarios e templates premium
3. dados mockados vivos e consistentes
4. contratos, casos e intimacoes com analises estruturadas
5. mesma linguagem visual em chat, paineis e acoes contextuais

---

## Long-Term Evolution

Depois do MVP, a arquitetura da LexIA pode evoluir para:

1. RAG por tenant
2. memoria de escritorio
3. classificacao documental automatica
4. workflows assistidos por IA
5. observabilidade de qualidade da resposta

---

## Final Recommendation

O sucesso da LexIA nao depende de parecer humana. Depende de parecer util, confiavel, especializada e integrada ao fluxo real do escritorio. O design da IA deve servir a operacao juridica, e nao distrair dela.

---

_Last Updated: 2026-04-08 | Atlas_
