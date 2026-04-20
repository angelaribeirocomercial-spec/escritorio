# Backlog Modular Bancário

## Objetivo

Transformar o mapeamento funcional do sistema modelo em backlog executável para o ADVX, mantendo a Clara como camada central e excluindo `SAC`.

## Princípios

1. Especialização em direito bancário
2. Clara como camada transversal
3. Primeiro operação jurídica, depois refinamento comercial
4. Primeiro dados reais e automação crítica, depois expansão

## Ordem de execução

1. Processos judiciais e núcleo processual
2. Diário Oficial e andamentos automáticos
3. Agenda operacional real
4. Financeiro e boletos
5. GED real
6. Relatórios e estatísticas
7. Editor jurídico bancário
8. Portal do cliente
9. Personalização operacional

## Epic 1: Processos Judiciais Bancários

### Objetivo

Adicionar o conceito de processo judicial real dentro dos casos bancários.

### Entregas

1. Cadastro de processo judicial
2. Vínculo processo-caso-cliente-banco
3. Campos processuais essenciais
4. Lista e filtros de processos
5. Timeline processual

### Stories

1. Como operador jurídico, quero cadastrar um processo judicial vinculado a um caso bancário para controlar a ação real.
2. Como operador jurídico, quero informar tribunal, comarca, vara, número do processo e fase para acompanhar o status corretamente.
3. Como advogado, quero filtrar processos por banco, tese, fase e risco para priorizar a carteira.
4. Como usuário, quero visualizar últimos andamentos do processo dentro do caso para entender o contexto rapidamente.

### Dependências

1. Modelo de dados de casos
2. Navegação de detalhe do caso
3. Estrutura de filtros e listas

## Epic 2: Diário Oficial Bancário

### Objetivo

Adicionar leitura de publicações com vínculo direto ao caso bancário.

### Entregas

1. Lista de publicações
2. Vínculo com processo e caso
3. Classificação por urgência
4. Geração de tarefa a partir da publicação

### Stories

1. Como advogado, quero registrar publicações do Diário Oficial para não perder intimações.
2. Como operador, quero vincular a publicação a processo, cliente e caso bancário para centralizar o contexto.
3. Como gestor, quero classificar publicações por urgência para atacar primeiro o que gera risco.
4. Como sistema, quero gerar tarefa automaticamente quando a publicação exigir ação.

### Dependências

1. Epic 1
2. Estrutura de tarefas

## Epic 3: Andamentos Processuais Automáticos

### Objetivo

Adicionar captura e leitura de andamentos processuais com interpretação da Clara.

### Entregas

1. Lista de andamentos
2. Configuração de monitoramento
3. Histórico por processo
4. Sugestão de próxima ação pela Clara

### Stories

1. Como advogado, quero registrar andamentos processuais para acompanhar a evolução do processo.
2. Como usuário, quero ver os últimos andamentos por processo e por caso bancário.
3. Como operador, quero marcar andamentos críticos para destacar risco imediato.
4. Como usuário, quero receber leitura contextual da Clara sobre o impacto do andamento e a próxima ação sugerida.

### Dependências

1. Epic 1
2. Clara integrada aos objetos processuais

## Epic 4: Agenda Operacional Real

### Objetivo

Substituir a agenda estática por agenda real de compromissos, tarefas e prazos.

### Entregas

1. Compromissos
2. Prazos
3. Tarefas vinculadas
4. Visões dia, semana e mês
5. Filtros por responsável

### Stories

1. Como equipe, queremos cadastrar compromissos para organizar a operação.
2. Como advogado, quero registrar prazos processuais vinculados ao processo para não perder vencimentos.
3. Como operador, quero ver tarefas, compromissos e prazos numa visão única de agenda.
4. Como gestor, quero filtrar agenda por responsável para distribuir carga.

### Dependências

1. Tarefas
2. Processos judiciais

## Epic 5: Financeiro Jurídico Bancário

### Objetivo

Construir o módulo financeiro adaptado ao fluxo jurídico bancário.

### Entregas

1. Receitas
2. Despesas
3. Transferências
4. Vencimentos
5. Honorários contratuais
6. Honorários de êxito
7. Previsão de recebimento

### Stories

1. Como gestor, quero lançar receitas e despesas para acompanhar a saúde financeira do escritório.
2. Como operador financeiro, quero vincular lançamentos a cliente e caso bancário para rastrear origem.
3. Como advogado, quero registrar honorários contratuais e de êxito para controlar cobrança e recebimento.
4. Como gestor, quero visualizar lançamentos realizados e em aberto para controlar fluxo.

### Dependências

1. Clientes reais
2. Casos reais

## Epic 6: Emissão de Boletos e Cobrança

### Objetivo

Adicionar cobrança estruturada de honorários.

### Entregas

1. Emissão de boletos
2. Vencimentos
3. Situação de cobrança
4. Inadimplência

### Stories

1. Como financeiro, quero emitir boletos de honorários para formalizar a cobrança.
2. Como gestor, quero ver cobranças em aberto e vencidas para agir na inadimplência.
3. Como operador, quero vincular boleto a cliente e contrato para rastrear cobrança.

### Dependências

1. Epic 5

## Epic 7: GED Bancário Real

### Objetivo

Transformar o módulo de documentos em GED funcional.

### Entregas

1. Upload real
2. Organização por pastas
3. Vínculo cliente-caso-processo
4. OCR futuro preparado
5. Relatórios de arquivos

### Stories

1. Como usuário, quero enviar arquivos reais para compor o caso bancário.
2. Como operador, quero organizar arquivos por cliente, caso e processo.
3. Como advogado, quero localizar rapidamente contratos, extratos e provas.
4. Como sistema, quero preparar a base para OCR e classificação automática.

### Dependências

1. Clientes
2. Casos
3. Processos

## Epic 8: Relatórios Operacionais

### Objetivo

Adicionar relatórios gerenciais e operacionais.

### Entregas

1. Resumo executivo
2. Relatórios de casos
3. Relatórios de honorários
4. Relatórios de tarefas, compromissos e prazos
5. Relatórios de pessoas e clientes

### Stories

1. Como gestor, quero um resumo executivo da operação para decisões rápidas.
2. Como financeiro, quero relatório de honorários e cobranças para acompanhar receita.
3. Como operação, quero relatório de tarefas, compromissos e prazos para controlar execução.
4. Como gestão, quero relatório de clientes e casos por banco e tese.

### Dependências

1. Financeiro
2. Agenda
3. Casos reais

## Epic 9: Estatísticas e BI Bancário

### Objetivo

Adicionar indicadores estratégicos do negócio jurídico bancário.

### Entregas

1. Casos por banco
2. Casos por tese
3. Fase processual
4. Clientes travados
5. Tempo médio por fase
6. Conversão comercial

### Stories

1. Como gestor, quero estatísticas por banco para saber onde está a carteira.
2. Como gestor, quero estatísticas por tese para identificar concentração de demanda.
3. Como operação, quero visualizar andamentos atrasados para destravar gargalos.
4. Como direção, quero indicadores de produtividade e conversão para gestão da operação.

### Dependências

1. Epic 8

## Epic 10: Editor Jurídico Bancário

### Objetivo

Adicionar editor e modelos jurídicos com autofill contextual.

### Entregas

1. Meus textos
2. Modelos
3. Criação de textos
4. Modelos bancários
5. Autofill com dados do sistema

### Stories

1. Como advogado, quero criar textos dentro do sistema para centralizar a produção.
2. Como advogado, quero usar modelos bancários prontos para petições e notificações.
3. Como usuário, quero preencher automaticamente cliente, caso, processo e contrato ao gerar uma minuta.
4. Como Clara, quero sugerir estrutura inicial de texto com base no contexto do caso.

### Dependências

1. Casos
2. Processos
3. GED
4. Clara

## Epic 11: Portal do Cliente

### Objetivo

Adicionar área controlada para o cliente acompanhar seu caso.

### Entregas

1. Status do caso
2. Documentos pendentes
3. Upload do cliente
4. Histórico
5. Financeiro do cliente

### Stories

1. Como cliente, quero acompanhar o andamento do meu caso bancário.
2. Como cliente, quero saber quais documentos ainda faltam enviar.
3. Como cliente, quero enviar documentos diretamente pelo portal.
4. Como cliente, quero visualizar cobranças e contratos.

### Dependências

1. GED
2. Casos reais
3. Financeiro

## Epic 12: Personalização Operacional

### Objetivo

Permitir adaptar o sistema ao escritório e às teses bancárias mais recorrentes.

### Entregas

1. Configuração por tese
2. Configuração por banco
3. Modelos padrão
4. Perfis e permissões
5. Regras da Clara

### Stories

1. Como gestor, quero definir teses bancárias padrão do escritório.
2. Como gestor, quero personalizar modelos por banco e tipo de demanda.
3. Como administrador, quero controlar permissões por usuário e equipe.
4. Como operação, quero configurar regras da Clara por fluxo.

### Dependências

1. Clara
2. Equipe
3. Modelos

## Priorização recomendada

### Sprinting por blocos

#### Bloco 1

1. Epic 1
2. Epic 2
3. Epic 3

#### Bloco 2

1. Epic 4
2. Epic 7

#### Bloco 3

1. Epic 5
2. Epic 6

#### Bloco 4

1. Epic 8
2. Epic 9

#### Bloco 5

1. Epic 10
2. Epic 11
3. Epic 12

## Recomendação de implementação imediata

Começar por:

1. Processos judiciais
2. Andamentos automáticos
3. Diário Oficial

Razão:

1. Isso aproxima o ADVX da lógica central do sistema modelo
2. Isso cria a camada jurídica mais crítica para direito bancário
3. Isso alimenta a Clara com contexto real
