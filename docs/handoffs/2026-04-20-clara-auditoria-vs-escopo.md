# Auditoria: CLARA atual vs escopo desejado

## Data

2026-04-20

## Objetivo

Comparar a CLARA que existe hoje no sistema com o escopo pedido para uma agente jurídica bancária completa, rastreável e integrada por dados, documentos, APIs e banco.

## Conclusão executiva

A CLARA atual já é mais do que um chat:

- ela organiza contexto por cliente, caso, processo, documento e tarefa
- gera rascunhos jurídicos
- salva registros e histórico
- tem fluxos próprios para revisional, fraude, busca e apreensão e acompanhamento operacional

Mas ainda não é, de forma plena, o motor jurídico descrito no escopo. O que existe hoje é principalmente:

- orquestração de contexto mockado ou interno
- geração assistida de peças e pacotes
- trilha de registros e revisão humana
- navegação forte dentro do workspace

O que falta para cumprir o escopo da CLARA:

- classificação formal de caso como função central
- leitura estruturada de documentos com origem marcada
- integração real com APIs oficiais externas
- motor único de decisão jurídica
- camada explícita de anti-alucinação
- acompanhamento processual automático real
- registro auditável de consultas e fontes

## O que já existe de fato

### 1. Workspace da CLARA

Existe uma tela principal da CLARA em:

- `apps/web/src/app/(workspace)/clara/page.tsx`

Essa tela não é apenas texto decorativo. Ela já oferece:

- abas de análise, intimação, peças, jurisprudência, checklist, próximos passos e comparador
- seleção de cliente, processo, caso, documento e tarefa
- execução de ações via formulário
- histórico de registros
- reabertura e revisão de conteúdo salvo

### 2. Contexto jurídico por nicho

Existe um motor contextual forte em:

- `apps/web/src/server/services/clara/get-clara-workspace.ts`
- `apps/web/src/server/services/clara/get-banking-revisional-workspace.ts`
- `apps/web/src/server/services/contract-analysis/get-contract-analysis.ts`

Hoje a CLARA já consegue trabalhar com:

- revisional
- fraude bancária
- busca e apreensão
- comparador de documentos
- checklist operacional
- próximos passos

### 3. Geração de peças e artefatos

Existe geração e persistência de artefatos em:

- `apps/web/src/server/services/clara/get-clara-artifacts.ts`
- `apps/web/src/server/services/clara/clara-record-store.ts`
- `apps/web/src/server/services/clara/clara-draft-export.ts`
- `apps/web/src/app/api/clara/drafts/route.ts`

Isso já permite:

- criar rascunhos
- salvar registros
- exportar Word e PDF
- revisar conteúdo
- manter histórico

### 4. Persistência e estado

Existe uma camada de persistência com fallback:

- `apps/web/src/server/services/clara/clara-record-repository.ts`
- `apps/web/src/server/services/clara/clara-record-repository-postgres.ts`
- `apps/web/src/server/services/clara/clara-record-repository-file.ts`

Ou seja:

- há suporte a Postgres/Supabase
- há fallback em arquivo local
- há rastreio de registros por workspace

### 5. Integração com o workspace real

A CLARA já está conectada ao restante do sistema:

- clientes
- casos
- processos
- documentos
- tarefas
- diário oficial
- editor de texto
- impressão

Isso aparece espalhado em várias telas do app, não só na página da CLARA.

## O que está parcial

### 1. Classificação de caso

O escopo pede funções formais como:

- `classifyCase(texto, documentos)`
- `analyzeDocuments(documentos)`
- `generatePetition(tipo, dados)`
- `suggestNextStep(processo)`

Hoje isso existe só como lógica distribuída em serviços e telas.

Não existe ainda uma camada central única que receba entrada estruturada e devolva o caso classificado com origem e justificativa.

### 2. Leitura estruturada de documentos

A CLARA usa documentos e contratos como contexto, mas ainda não há um módulo formal de extração estruturada com campos como:

- partes
- fatos
- pedidos
- provas
- valores
- datas
- riscos
- pendências

### 3. Anti-alucinação

O escopo pede:

- origem_interna
- origem_documental
- origem_api
- inferencia_controlada

Hoje a CLARA ainda não carrega essa trilha como contrato de saída.

Ela tem revisão humana e campos de observação, mas não uma política de rastreabilidade por linha de resposta.

### 4. APIs externas

O escopo cita integrações com:

- CNJ / DataJud
- Banco Central
- STJ
- STF
- Consumidor.gov / Senacon

Não encontrei conectores reais implementados para essas fontes.

O que existe hoje é:

- desenho conceitual
- menção na UX
- fluxo interno baseado em mock/contexto

### 5. Monitoramento processual

A CLARA apoia acompanhamento de processos e andamentos em nível operacional, mas ainda não há:

- monitoramento automático real
- rotina agendada de consulta
- classificação automática de evento processual
- alertas a partir de novas movimentações externas

### 6. LGPD e segurança como módulo de produto

Existe segurança de plataforma:

- auth
- middleware
- tenant
- sessão

Mas não existe uma camada explícita de produto para:

- classificação de sensibilidade
- políticas de retenção
- trilha de acesso a dados sensíveis
- bloqueio de consulta sem base

## O que falta de verdade

### 1. Motor jurídico único

Hoje a CLARA está espalhada em:

- services
- páginas
- artefatos
- drafts
- record store

Falta uma camada central que orquestre:

1. entrada do caso
2. leitura documental
3. classificação
4. decisão jurídica
5. geração
6. revisão
7. persistência de log

### 2. APIs oficiais em adaptadores

O escopo pede adaptadores próprios para fontes públicas e oficiais.

Isso ainda não existe como módulo independente.

### 3. Schema de dados para CLARA como produto

A persistência atual cobre registros de execução, mas ainda não cobre formalmente:

- fontes consultadas
- resultados de APIs
- versões de peça
- logs de execução
- observações do revisor humano
- classificação de origem por linha

### 4. Telas próprias para os blocos do escopo

Hoje existe uma boa experiência da CLARA dentro do workspace, mas ainda não há telas separadas e explícitas para:

- análise do caso
- documentos
- checklist
- APIs consultadas
- log de consultas
- revisão humana
- acompanhamento processual
- configurações da agente
- cadastro de teses e modelos

## Leitura prática do produto

### A CLARA hoje é

- um workspace jurídico assistido
- um motor de rascunho e contexto
- uma central de navegação e execução
- um hub operacional forte para direito bancário

### A CLARA ainda não é

- um motor jurídico totalmente rastreável
- uma agente com integrações oficiais reais
- um sistema de decisão formal por tipo de caso
- um pipeline anti-alucinação completo

## Gap por camada

### Camada 1: Identidade da agente

Status: parcial

- nicho bancário já está claro
- tom técnico já existe
- limites anti-fantasia ainda não estão formalizados como contrato de saída

### Camada 2: Leitura estruturada do caso

Status: parcial

- contexto existe
- análise jurídica existe
- extração estruturada ainda não é centralizada

### Camada 3: Motor de classificação

Status: parcial

- revisional, fraude e busca e apreensão já aparecem
- função formal de classificação ainda não existe

### Camada 4: Motor de decisão

Status: parcial

- há sugestão de tese, urgência e pedido
- não há contrato único de decisão com fallback explícito

### Camada 5: Gerador jurídico

Status: parcial

- já gera drafts e pacotes
- não há gerador padronizado único por tipo de peça

### Camada 6: Revisor interno

Status: parcial

- existe revisão humana no fluxo
- falta uma camada de validação explícita contra contradição e alucinação

## Ordem recomendada de construção

### Fase 1

- criar o núcleo `clara-engine`
- formalizar tipos de entrada e saída
- padronizar classificação de caso
- consolidar leitura documental estruturada

### Fase 2

- criar adaptadores de API
- adicionar logs de consulta
- salvar origem de cada dado
- integrar DataJud e BCB primeiro

### Fase 3

- criar gerador jurídico formal
- separar contrato de honorários, procuração e petição
- padronizar revisão humana

### Fase 4

- criar monitoramento processual
- timeline automática
- alertas de andamento

### Fase 5

- criar telas próprias de administração da CLARA
- cadastro de teses
- cadastro de modelos internos
- governança e auditoria

## Comparação curta

### Texto promocional x realidade

O texto do escopo descreve uma CLARA idealizada, com:

- IA jurídica completa
- dados reais
- APIs oficiais
- acompanhamento automático
- anti-alucinação forte

A CLARA atual já entrega parte importante da operação, mas ainda depende muito de:

- dados mockados
- contexto do workspace
- serviços locais
- revisão humana

## Recomendação objetiva

Se a intenção é realmente adaptar o sistema completo, o próximo passo não deve ser “mais uma tela”.

O correto é criar a base técnica da CLARA em três blocos:

1. motor jurídico central
2. adaptadores de dados e APIs
3. trilha de origem, revisão e auditoria

Sem isso, o sistema continua parecendo forte na interface, mas frágil como agente jurídica confiável.
