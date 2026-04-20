# LexIA Bancaria Redesign Radical Brief

**Version:** 1.0.0
**Last Updated:** 2026-04-08
**Status:** Active Brief

---

## Objective

Refazer completamente a interface do LexIA Bancaria. A direcao nao e iterativa. O objetivo e substituir a linguagem visual atual por um produto com aparencia de software juridico premium, contemporaneo e vendavel.

O redesign deve comunicar:

1. controle operacional
2. profundidade juridica
3. inteligencia aplicada
4. acabamento de produto SaaS serio

---

## Core Positioning

LexIA Bancaria nao deve parecer um dashboard genérico com tema bonito. Deve parecer um sistema vertical premium para Direito Bancario, desenhado para escritorio que precisa operar com rigor, contexto e velocidade.

Frase-guia:

`ERP juridico bancario com IA contextual, aparencia premium e confianca de produto de alto ticket.`

---

## Current Visual Diagnosis

O layout atual transmite um problema estrutural claro:

1. quase todas as telas repetem o mesmo bloco de cards brancos com borda cinza
2. a linguagem visual depende demais de `white card + amber badge + slate text`
3. a hierarquia e fraca e previsivel
4. o shell lateral escuro promete premium, mas o conteudo principal cai para um visual comum
5. dashboards, listas, detalhe e IA contextual parecem partes de sistemas diferentes
6. falta tensao visual entre operacao juridica, inteligencia LexIA e valor comercial do produto

Em resumo: existe organizacao minima, mas nao existe direcao de design forte.

---

## Non-Negotiables

1. Nao preservar a linguagem visual atual como base.
2. Nao usar visual generico de template admin.
3. Nao depender de branco dominante para quase todos os blocos.
4. Nao tratar IA como sidebar secundaria sem peso de produto.
5. Nao manter a mesma composicao em todas as paginas.
6. Nao resolver com cosmetica superficial.

---

## New Visual Direction

### Tonal Goal

O sistema deve parecer:

1. moderno
2. premium
3. juridico sem ser conservador demais
4. tecnologico sem parecer startup vazia
5. sofisticado, denso e controlado

### Style Keywords

1. command center
2. premium operations
3. legal intelligence
4. dark editorial SaaS
5. sharp hierarchy
6. controlled glow
7. contextual depth

### Visual Language

1. Base escura premium no shell e nas superficies-chave
2. Conteudo com contraste alto entre paines principais, paines secundarios e areas de acao
3. Tipografia mais forte, com cara de produto e nao de dashboard neutro
4. Componentes mais solidos e modulares
5. Destaques de IA com identidade propria dentro do sistema
6. Menos caixas soltas, mais secoes com relacao clara entre si

---

## Design Principles

### 1. Premium Before Pretty

Nao basta ficar bonito. Precisa parecer caro, confiavel e comercialmente convincente.

### 2. Context First

Cliente, caso, documento, tarefa e analise devem parecer partes do mesmo grafo operacional.

### 3. LexIA Is Product, Not Decoration

A IA nao deve parecer um widget lateral. Ela precisa ter peso visual e papel central onde faz sentido.

### 4. Dense, But Legible

O produto pode ser rico em informacao, mas nunca confuso. Densidade deve vir com ordem.

### 5. Different Screens, Same DNA

Cada tela precisa ter composicao propria, mas todas devem claramente pertencer ao mesmo produto.

---

## Visual System Directives

### Color

1. Trocar a dependencia atual de cinza claro + branco + amber como formula dominante.
2. Usar uma base mais escura e sofisticada, com neutros frios profundos.
3. Reservar cor de destaque para significado, nao para enfeite.
4. Criar uma cor LexIA reconhecivel para inteligencia, sugestao e contexto.
5. Usar estados semaforicos mais maduros para risco, urgencia, analise e sucesso.

### Typography

1. Reforcar hierarquia com uma familia de display e uma familia funcional.
2. Titulos devem parecer decisivos e editoriais.
3. Metricas e labels precisam ganhar mais contraste de importancia.
4. Reduzir a sensacao de texto “achatado” no mesmo peso visual.

### Surfaces

1. Diferenciar claramente shell, canvas, paineis principais e paineis auxiliares.
2. Cards precisam deixar de ser o bloco universal para tudo.
3. Introduzir secoes de maior escala com profundidade sutil.
4. Usar camadas, brilho discreto e bordas mais intencionais.

### Interaction

1. Hover, foco e selecao precisam parecer premium e confiaveis.
2. Acoes principais devem saltar aos olhos com prioridade real.
3. Busca, filtro, tabs e comandos rapidos devem parecer ferramentas de trabalho, nao formulario padrão.

---

## Layout Architecture

## Global Shell

Arquivos-base atuais:

1. [workspace-shell.tsx](/C:/Users/User/escritorio/apps/web/src/components/layout/workspace-shell.tsx)
2. [sign-in page](/C:/Users/User/escritorio/apps/web/src/app/(auth)/sign-in/page.tsx)

### Problems

1. Sidebar escura e promissora, mas o resto do app volta para um padrao branco genérico.
2. Header pouco expressivo e com busca placeholder sem autoridade visual.
3. Conteudo principal e copiloto lateral parecem acoplados por grade, nao por narrativa.

### Direction

1. Transformar o shell em um centro de comando premium.
2. Dar ao header papel real de contexto ativo, busca global e comandos.
3. Fazer o copiloto LexIA parecer uma camada de inteligencia do produto.
4. Separar melhor navegação, contexto da pagina e inteligencia contextual.
5. Construir um canvas principal que suporte secoes maiores, nao apenas empilhamento de cards.

### Mandatory Changes

1. Sidebar com identidade mais forte e navegacao mais cirurgica.
2. Header com busca real, contexto de tenant e acoes primarias.
3. Copiloto lateral com visual de modulo premium, nao card isolado.
4. Grid principal com mais peso para conteudo e variacao entre telas.

---

## Screen Briefs

### 1. Sign-In

Arquivo:
[page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(auth)/sign-in/page.tsx)

### Goal

Vender a sensacao de acesso a uma plataforma juridica premium antes do login.

### Problems

1. Tela institucional demais.
2. Blocos simples sem dramatizacao.
3. Coluna da direita parece checklist, nao proposta de valor.

### Redesign Direction

1. Fazer a tela parecer entrada de produto high-end.
2. Reforcar promessa comercial do LexIA Bancaria.
3. Usar composicao mais cinematografica e menos burocratica.
4. Dar mais peso a seguranca, IA contextual e operacao premium.

### 2. Dashboard

Arquivo:
[page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/dashboard/page.tsx)

### Goal

Virar um cockpit executivo real da operacao bancaria.

### Problems

1. Estrutura atual parece um mosaico de cards comuns.
2. Graficos e listas nao constroem narrativa de comando.
3. A LexIA entra como bloco lateral, sem liderar leitura.

### Redesign Direction

1. Organizar a tela em narrativa de comando: panorama, risco, execucao, inteligencia.
2. Criar hero area executiva de alto impacto.
3. Dar mais peso visual aos numeros criticos e sinais de risco.
4. Fazer evolucao, carteira e urgencia parecerem instrumentos de decisao.
5. Criar uma secao LexIA protagonista com insights e recomendacoes acionaveis.

### Must-Have Modules

1. Hero executivo
2. Indicadores de risco e gargalo
3. Performance da carteira
4. Timeline operacional
5. Insights prioritarios da LexIA

### 3. Clientes

Arquivo:
[page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/clientes/page.tsx)

### Goal

Parecer um CRM juridico premium, nao uma lista simples com cards repetidos.

### Problems

1. Cada cliente vira o mesmo card largo.
2. Pouca diferenca entre status, valor, risco e oportunidade.
3. Falta sensacao de pipeline e relacao comercial-juridica.

### Redesign Direction

1. Introduzir visao de carteira com segmentacao mais clara.
2. Dar peso a score, contrato, origem, banco e maturidade do lead.
3. Transformar a lista em estrutura de CRM premium com leitura mais rapida.
4. Criar contraste entre cliente quente, em triagem, pendente de docs e ativo.

### 4. Casos Bancarios

Arquivo:
[page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/casos/page.tsx)

### Goal

Virar um workspace de tese e risco, com cara de operacao juridica especializada.

### Problems

1. Lista segue o mesmo padrao visual de clientes e documentos.
2. Tese, risco, banco e fase nao criam prioridade visual suficiente.
3. A tela nao comunica profundidade juridica.

### Redesign Direction

1. Fazer o caso parecer a unidade central da operacao.
2. Dar destaque forte para tese, banco, risco e fase processual.
3. Criar leitura mais tecnica e menos “CRM”.
4. Permitir ver rapidamente quais casos exigem decisao, prova ou urgencia.

### 5. Documentos

Arquivo:
[page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/documentos/page.tsx)

### Goal

Parecer uma base documental inteligente, com IA pronta para agir.

### Problems

1. A tela parece uma listagem administrativa.
2. O valor da IA esta subcomunicado.
3. Contrato bancario e documento comum estao perto demais visualmente.

### Redesign Direction

1. Diferenciar documentos analisados, pendentes e premium.
2. Destacar contrato bancario como objeto nobre da plataforma.
3. Fazer preview, classificacao e acoes contextuais parecerem parte do core.
4. Introduzir uma visao mais “GED inteligente” e menos lista plana.

### 6. Tarefas

Arquivo:
[page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/tarefas/page.tsx)

### Goal

Virar uma central de execucao juridica com tensao operacional clara.

### Problems

1. A lista inicial repete o mesmo padrao visual das outras areas.
2. O kanban existe, mas ainda sem linguagem forte de operacao.
3. Agenda e automacoes sugeridas parecem modulos soltos.

### Redesign Direction

1. Priorizar urgencia, dono, prazo e dependencia.
2. Fazer a tela parecer uma mesa de operacao.
3. Integrar lista, kanban, agenda e automacoes numa mesma narrativa.
4. Deixar mais claro o que trava a equipe hoje e o que acelera.

### 7. Analise de Contrato

Arquivo:
[page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/analise-contrato/page.tsx)

### Goal

Ser a tela mais premium do sistema inteiro.

### Problems

1. Ja existe uma tentativa premium, mas ainda presa ao mesmo repertorio de cards.
2. O valor juridico da analise pode parecer distribuido demais.
3. Tese, risco, sinais e recomendacoes ainda podem ganhar mais dramatizacao.

### Redesign Direction

1. Tratar essa tela como produto flagship da LexIA.
2. Construir leitura em camadas: conclusao, sinais, tese, risco, acoes.
3. Dar tratamento visual especial para abusividade, clausulas sensiveis e proximos passos.
4. Fazer a experiencia parecer entre parecer juridico e console de IA especializada.

### 8. LexIA Workspace

Arquivo:
[page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/lexia/page.tsx)

### Goal

Ser o centro de inteligencia do produto.

### Direction

1. Nao parecer chat genérico.
2. Operar como hub contextual com modos, memoria, tarefas e respostas acionaveis.
3. Visualmente, precisa ser a tela que melhor vende a tese de IA contextual do produto.

### 9. Equipe

Arquivo:
[page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/equipe/page.tsx)

### Goal

Comunicar organizacao, ownership, distribuicao de carga e performance do time.

### Direction

1. Menos “cadastro de usuarios”.
2. Mais “controle operacional do escritorio”.
3. Evidenciar funcoes, gargalos e distribuicao de trabalho.

### 10. Configuracoes

Arquivo:
[page.tsx](/C:/Users/User/escritorio/apps/web/src/app/(workspace)/configuracoes/page.tsx)

### Goal

Manter linguagem premium mesmo em area utilitaria.

### Direction

1. Organizar por secoes estrategicas.
2. Evitar cara de formulario cru.
3. Passar sensacao de governanca e configuracao empresarial.

---

## Cross-Screen Consistency Rules

1. Cada tela precisa ter uma abertura visual forte.
2. Cards pequenos so quando houver motivo real.
3. Componentes repetidos devem variar por contexto, nao apenas por texto.
4. IA deve ter identidade visual propria, mas integrada.
5. Risco, urgencia, valor, status e recomendacao precisam ter codificacao clara.

---

## Anti-Reference Checklist

Se qualquer tela parecer um destes casos, o redesign falhou:

1. admin template genérico
2. dashboard claro com cards aleatorios
3. sistema “bonitinho”, mas sem autoridade
4. produto sem cara de vertical juridica
5. IA parecendo badge ou acessorio

---

## Execution Order

1. Shell global
2. Dashboard
3. Analise de Contrato
4. Clientes
5. Casos
6. Documentos
7. Tarefas
8. LexIA
9. Equipe
10. Configuracoes

---

## Immediate Next Step

Transformar este briefing em:

1. sistema visual base
2. tokens e componentes principais
3. redesign da home shell
4. redesign das telas prioritarias

Se for seguir por especialista:

1. `@premium-design` para ruptura visual
2. `@brad-frost` para consolidacao em sistema

