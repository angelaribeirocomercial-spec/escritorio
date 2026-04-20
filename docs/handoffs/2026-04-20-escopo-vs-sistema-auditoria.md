# Auditoria: Escopo Proposto vs Sistema Atual

## Data

2026-04-20

## Objetivo

Comparar o escopo funcional solicitado com o que já existe hoje no projeto, separando:

- pronto
- parcial
- ausente
- risco de promessa promocional sem entrega funcional

## Resumo Executivo

O sistema já possui uma base forte de workspace jurídico:

- autenticação Supabase
- tenant/workspace
- clientes, casos, processos, documentos, tarefas, agenda, relatórios, estatisticas e Clara
- geração e edição de textos
- modo demo público e workspace demo interno

O que ainda falta para cumprir o escopo proposto de forma completa e consistente:

- intake de leads com classificação IA formalizada em funções centrais
- dossiê unificado com timeline, prova e análise automática consolidada
- gerador jurídico padronizado para contrato de honorarios, procuração e petição inicial
- acompanhamento automático de processo com eventos, alertas e ações auditaveis
- camada de LGPD/segurança explicitada como produto

## Mapa Comparativo

### 1. Módulo de Leads

### Já existe

- Cadastro de clientes.
- Upload e vínculo de documentos.
- Intake com contexto jurídico e campos operacionais.
- Navegação demo com dados mockados.

### Parcial

- Campo de relato do problema existe de forma distribuída nos formulários, mas não como módulo único.
- Classificação automática via IA existe como contexto em Clara e em serviços jurídicos, mas não como função central `classifyCase(texto, documentos)`.

### Ausente

- Pipeline formal de leads com saída estruturada para o restante do sistema.
- Classificação automática oficial e padronizada por tipo de ação.

### 2. Módulo Dossiê

### Já existe

- Armazenamento de documentos.
- Visualização de documentos.
- Timeline e contexto processual em várias páginas.
- Dossiê parcial em processo/caso.

### Parcial

- Organização por tipo de prova aparece de forma contextual, não como estrutura unificada.
- Análise automática por IA está espalhada em Clara e serviços específicos.

### Ausente

- Dossiê consolidado como módulo único.
- Timeline de provas e análise automática centralizada por caso.

### 3. Gerador Jurídico

### Já existe

- Editor de texto.
- Drafts jurídicos.
- Exportação para Word, PDF e impressão.
- Peças com estrutura formal em vários fluxos.

### Parcial

- Contrato de honorarios, procuração e petição inicial existem como intenção funcional, mas não como gerador padronizado único.

### Ausente

- Um módulo formal `generatePetition(tipo, dados)`.
- Geração automática padronizada de documentos jurídicos-base.

### 4. Lógica da Petição

### Já existe

- Revisional:
  - revisão de juros
  - repetição de indébito
  - tutela em cenários de urgência
- Fraude:
  - inexistência de débito
  - dano moral
  - suspensão de descontos
- Busca e apreensão:
  - suspensão liminar
  - purga da mora
  - revisão contratual

### Parcial

- A lógica jurídica existe em serviços e conteúdo de Clara, mas não como um motor único de petição.

### Ausente

- Estrutura formal e centralizada para transformar tipo de ação + dados + documentos em petição pronta.

### 5. Distribuição da Ação

### Já existe

- Estrutura para documentos finais.
- Print/export.
- Organização de páginas para saída formal.

### Parcial

- Compatibilidade com protocolo judicial existe como preparo visual e de fluxo.

### Ausente

- Checklist de envio.
- Pacote final de protocolo judicial como unidade funcional.
- Organização automática final dos documentos para distribuição.

### 6. Acompanhamento Automático do Processo

### Já existe

- Módulo de processos.
- Cadastro de número do processo em contextos do sistema.
- Vínculo processo/caso/cliente.
- Timeline parcial e controle de prazos.
- Diário oficial e andamentos como módulos já existentes.

### Parcial

- Atualização de status e próximos passos existem como informação operacional, mas não como automação de monitoramento real.

### Ausente

- Monitoramento automático de movimentações processuais.
- Atualização em tempo real ou rotina programada integrada.
- Identificação automática de eventos processuais relevantes.
- Alertas automáticos derivados de movimentação processual.
- Registro auditável das ações do advogado.
- Base preparada para integração futura com PJe, mas sem integração implementada.

### 7. Módulo Gestão de Processos

### Já existe

- Lista de processos ativos.
- Filtros.
- Controle de prazos.
- Dashboard com indicadores.
- Tela de processo detalhada.

### Parcial

- A gestão existe, mas ainda não como painel completo de operações processuais com automação forte.

### Ausente

- Painel unificado de acompanhamento automático e manual em um único fluxo.

### 8. Interface

### Já existe

- Dashboard.
- Tela de leads/clientes.
- Tela de caso.
- Tela de processo.
- Tela de acompanhamento de documentos.
- Tela de agenda.
- Tela de relatório.
- Tela de Clara.

### Parcial

- A tela de caso ainda é mais agregação de dados do que um hub único com IA, geração e histórico em um lugar só.

### Ausente

- Tela única de acompanhamento processual automático com IA, observações e log de ações.

### 9. IA

### Já existe

- Clara contextual.
- Análise de contrato.
- Geração e interpretação de peças.
- Sugestões de próxima ação em vários fluxos.

### Parcial

- Funções pedidas existem diluídas, não como API central:
  - `classifyCase(texto, documentos)`
  - `analyzeDocuments(documentos)`
  - `generatePetition(tipo, dados)`
  - `suggestNextStep(processo)`

### Ausente

- Camada única e formal de IA de produto.

### 10. Segurança

### Já existe

- Autenticação Supabase.
- Middleware de proteção.
- Tenant/workspace.
- Sessão no servidor.
- Demo pública isolada do workspace real.

### Parcial

- Persistência e fallback ainda coexistem em algumas rotas.

### Ausente

- LGPD e criptografia sensível como política de produto explícita.
- Trilha de auditoria de ações do usuário como módulo.

## O Que É Promocional e O Que É Real

### Promocional

- O texto da home e da sign-in vende a visão do produto.
- A landing descreve capacidades maiores do que a interface entrega sozinha.

### Real

- As rotas efetivamente implementadas.
- O que a navegação consegue abrir sem erro.
- O que o workspace mostra em dados, telas e ações reais.

## Prioridade Recomendada

### Prioridade 1

- Centralizar o intake de leads.
- Formalizar classificação IA de caso.
- Consolidar dossiê por caso.

### Prioridade 2

- Criar gerador jurídico padronizado.
- Formalizar petição inicial por tipo de ação.
- Construir checklist de distribuição.

### Prioridade 3

- Implementar acompanhamento automático do processo.
- Criar timeline processual automática.
- Gerar alertas e próximos passos.

### Prioridade 4

- Consolidar segurança/LGPD.
- Formalizar trilha de auditoria.
- Preparar integração futura com PJe.

## Conclusão

O projeto não está vazio. Ele já possui um núcleo operacional forte.

O que falta não é “mais uma landing”, e sim:

- consolidar o que hoje está espalhado
- transformar contexto em módulos explícitos
- fechar a cadeia lead -> dossiê -> peça -> distribuição -> acompanhamento

Este documento deve ser a base para priorização das próximas stories.
