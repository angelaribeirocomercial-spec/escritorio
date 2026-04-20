# Mapeamento MaisJurídico -> ADVX Bancário

## Objetivo

Copiar a lógica funcional principal da plataforma MaisJurídico e adaptar tudo para o produto ADVX, mantendo a advogada digital Clara como camada central de inteligência e excluindo o módulo `SAC`.

## Fonte da análise

### Acesso autenticado validado via Playwright

Login realizado com sucesso em `2026-04-09` no ambiente:

- URL: `https://www.maisjuridico.com.br/login.php`
- Destino após login: `https://www.maisjuridico.com.br/cp/dashboard.php`

### Módulos confirmados no sistema modelo

1. Dashboard
2. Processos
3. Pessoas
4. Equipe
5. Agenda
6. Financeiro
7. SAC
8. Relatórios
9. Estatísticas
10. Diário Oficial
11. Andamentos
12. Arquivos
13. Site
14. Editor de texto

### Submódulos confirmados

#### Processos

1. Lista de processos
2. Lixeira
3. Últimos andamentos
4. Importar lote
5. Importar via OAB
6. Adicionar
7. Filtros simples
8. Filtros personalizados
9. Filtros por status
10. Filtros por cliente, advogado, processo, adverso e pasta

#### Pessoas

1. Clientes
2. Adversos
3. Advogados adversos
4. Contatos / Partes
5. Importar lote
6. Adicionar

#### Equipe

1. Advogados / Equipe
2. Grupo de advogados
3. Adicionar
4. Gestão de usuários permitidos
5. Status de uso

#### Agenda

1. Compromissos
2. Tarefas
3. Prazos
4. Modos mês, semana e dia
5. Hoje
6. Filtrar por advogados

#### Financeiro

1. Despesas
2. Receitas
3. Transferências
4. Vencimentos
5. Gráficos
6. Saldo das contas
7. Lançamentos realizados
8. Lançamentos em aberto
9. Filtro por conta
10. Filtro por situação
11. Filtro por cliente

#### Relatórios

1. Resumo
2. Processos
3. Custas
4. Honorários
5. Compromissos
6. Tarefas
7. Prazos
8. Horas trabalhadas
9. Pessoas
10. Torpedos SMS
11. E-mails
12. Etiquetas

#### Estatísticas

1. Andamentos atrasados
2. Andamentos dos processos
3. Últimos andamentos
4. Andamentos automáticos
5. Clientes
6. Processos
7. Abertura de processos
8. Cadastro de processos
9. Fase do processo
10. Natureza da ação
11. Personalizados

#### Diário Oficial

1. Lista de publicações

#### Andamentos

1. Andamentos automáticos
2. Configuração de andamentos

#### Arquivos

1. Meus arquivos
2. Enviar arquivos
3. Relatórios
4. Estrutura de pastas
5. Indicador de uso do armazenamento

#### Site

1. Páginas do site
2. Banco de imagens
3. E-mail
4. Configurações

#### Editor de texto

1. Meus textos
2. Modelos
3. Criar texto

## Tradução para o produto bancário

### 1. Dashboard

No ADVX:

1. Carteira ativa de clientes bancários
2. Casos bancários ativos
3. Tarefas urgentes
4. Prazos críticos
5. Recortes de Diário Oficial do dia
6. Andamentos processuais relevantes
7. Financeiro do mês
8. Contratos analisados pela Clara
9. Gargalos documentais
10. Alertas estratégicos da Clara

### 2. Processos -> Casos bancários + processos judiciais

No ADVX:

1. Cadastro de processo judicial vinculado ao caso bancário
2. Banco réu
3. Contrato vinculado
4. Tese bancária principal
5. Fase processual
6. Número do processo
7. Vara, tribunal e comarca
8. Pasta
9. Importação em lote
10. Importação por OAB
11. Últimos andamentos
12. Lixeira
13. Filtros avançados
14. Cliente, banco, tese, fase, status e risco

### 3. Pessoas -> CRM bancário

No ADVX:

1. Clientes
2. Bancos e instituições rés
3. Partes adversas
4. Correspondentes e parceiros
5. Contatos / partes do processo
6. Importação em lote
7. Classificação por etapa comercial
8. Score de viabilidade
9. Pendência documental
10. Origem do lead

### 4. Equipe

No ADVX:

1. Usuários internos
2. Perfis e permissões
3. Grupos de trabalho
4. Equipe comercial
5. Equipe jurídica
6. Equipe operacional
7. Capacidade de uso / assentos

### 5. Agenda

No ADVX:

1. Compromissos
2. Tarefas
3. Prazos
4. Audiências
5. Follow-up com cliente
6. Vencimentos internos de produção
7. Visões mês, semana e dia
8. Filtragem por responsável

### 6. Financeiro

No ADVX:

1. Receitas
2. Despesas
3. Transferências
4. Vencimentos
5. Honorários contratuais
6. Honorários de êxito
7. Repasses
8. Cobrança por cliente
9. Inadimplência
10. Conta e centro de custo
11. Previsão de recebimento por caso
12. Emissão de boletos

### 7. Relatórios

No ADVX:

1. Resumo executivo
2. Casos bancários
3. Custas
4. Honorários
5. Compromissos
6. Tarefas
7. Prazos
8. Pessoas
9. Produtividade
10. Cobranças
11. Clientes travados
12. Casos por banco
13. Casos por tese

### 8. Estatísticas

No ADVX:

1. Andamentos atrasados
2. Últimos andamentos
3. Andamentos automáticos
4. Clientes
5. Casos
6. Abertura de casos
7. Cadastro de casos
8. Fase processual
9. Natureza da tese bancária
10. Personalizados
11. Tempo médio por fase
12. Conversão comercial

### 9. Diário Oficial

No ADVX:

1. Recortes de Diário Oficial
2. Monitoramento por OAB
3. Monitoramento por advogado
4. Monitoramento por cliente
5. Vínculo automático ao processo
6. Vínculo automático ao caso bancário
7. Classificação por urgência
8. Geração automática de tarefa

### 10. Andamentos

No ADVX:

1. Captura automática de andamentos processuais
2. Histórico de movimentações
3. Alertas por mudança crítica
4. Sugestão de próxima ação pela Clara
5. Regras de monitoramento
6. Configuração por tribunal / processo

### 11. Arquivos -> GED bancário

No ADVX:

1. Meus arquivos
2. Enviar arquivos
3. Estrutura de pastas
4. OCR
5. Classificação automática
6. Tags
7. Vínculo cliente/caso/processo
8. Relatórios do GED
9. Indicador de uso

### 12. Site

No ADVX:

1. Landing institucional
2. Páginas do site
3. Banco de imagens
4. Configuração de conteúdo
5. E-mail
6. SEO / páginas públicas

### 13. Editor de texto

No ADVX:

1. Meus textos
2. Modelos
3. Criar texto
4. Modelos bancários
5. Autofill por cliente, caso, contrato e processo
6. Minutas assistidas pela Clara

### 14. SAC

Excluído do escopo por decisão do projeto.

## O que o sistema já tem

### Já existe

1. Dashboard
2. Clientes
3. Casos bancários
4. Documentos / GED mockado
5. Tarefas
6. Clara
7. Análise contratual
8. Equipe
9. Configurações
10. Autenticação
11. Landing

### Existe parcialmente

1. CRM bancário sem CRUD real
2. GED sem upload real
3. Casos sem processo judicial completo
4. Tarefas sem automações
5. Dashboard sem dados reais
6. Configurações sem parametrização operacional robusta
7. Clara sem integração com todos os fluxos automáticos

### Não existe e precisa entrar

1. Processos judiciais vinculados ao caso
2. Recortes de Diário Oficial
3. Andamentos processuais automáticos
4. Agenda real de prazos, tarefas e compromissos
5. Financeiro completo
6. Emissão de boletos
7. Relatórios operacionais
8. Estatísticas/BI
9. Portal do cliente
10. Upload real
11. Armazenamento em nuvem real
12. Editor de textos e modelos
13. Permissões mais robustas
14. Automações e alertas

## Princípio de adaptação

Não copiar genericamente. Especializar.

Cada módulo deve ser reinterpretado para:

1. Direito bancário
2. Casos revisionais
3. Fraude bancária / PIX
4. Negativação indevida
5. Cartão de crédito
6. Consignado
7. CCB
8. Juros abusivos
9. Leitura contratual
10. Ação judicial e atendimento ao cliente

## Papel da Clara

A Clara não substitui módulos. Ela costura módulos.

Ela deve atuar como:

1. Leitura contextual do cliente
2. Leitura contextual do caso
3. Leitura contratual
4. Leitura documental
5. Leitura de andamento processual
6. Sugestão de próxima ação
7. Geração assistida de minuta
8. Camada de priorização operacional

## Ordem recomendada de construção

### Fase 1

1. CRUD real de clientes
2. CRUD real de casos bancários
3. Upload real de documentos
4. Vínculo cliente-caso-documento

### Fase 2

1. Processos judiciais
2. Agenda
3. Tarefas reais
4. Clara contextual integrada

### Fase 3

1. Andamentos automáticos
2. Diário Oficial
3. Geração automática de tarefas
4. Alertas

### Fase 4

1. Financeiro
2. Emissão de boletos
3. Relatórios
4. Estatísticas

### Fase 5

1. Editor de textos
2. Modelos jurídicos bancários
3. Portal do cliente
4. Personalização avançada

## Decisão

Direção aprovada para o produto:

1. Manter Clara
2. Excluir SAC
3. Absorver a lógica do MaisJurídico
4. Adaptar tudo ao direito bancário
5. Construir a partir do sistema atual, sem trocar o núcleo do projeto
