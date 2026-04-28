# Handoff: Gap entre Visao Canonica e Sistema Atual

**Data:** 2026-04-27  
**Origem:** Analyst / Atlas  
**Destino sugerido:** PM

---

## Objetivo

Consolidar o gap entre:

1. a visao canonica registrada em `docs/product/lexia-bancaria/reestruturacao-produto-canonica.md`
2. o estado real atual do codigo e da navegacao

Este documento nao redefine produto. Ele mede o desvio para permitir um recorte de produto correto na proxima etapa.

---

## Referencias inspecionadas

1. `apps/web/src/app/(workspace)/clara/page.tsx`
2. `apps/web/src/app/(workspace)/pessoas/clientes/[clientId]/page.tsx`
3. `apps/web/src/app/(workspace)/crm/page.tsx`
4. `apps/web/src/app/(workspace)/operacao/page.tsx`
5. `apps/web/src/components/layout/workspace-navigation.ts`
6. `docs/handoffs/2026-04-27-atlas-reestruturacao-produto.md`
7. `docs/product/lexia-bancaria/reestruturacao-produto-canonica.md`

---

## Resumo executivo

O sistema atual ja recebeu movimentos de navegacao, mas ainda nao reflete a espinha dorsal do escritorio bancario desejado.

O desvio principal e este:

1. a navegacao foi parcialmente reorganizada
2. mas os modulos centrais do novo produto ainda nao existem no papel esperado
3. e a `Clara` continua concentrando excesso de interface e controle manual

Resultado: o produto parece reestruturado em partes, mas o fluxo principal `cliente -> caso -> nicho -> workflow -> peca -> distribuicao -> acompanhamento` ainda nao virou experiencia real.

---

## Gap 1: Clara continua confusa e sobrecarregada

### Evidencia

Em `apps/web/src/app/(workspace)/clara/page.tsx` a tela ainda acumula:

1. `ClaraConversationCard`
2. secao `Acesso rapido`
3. secao `Nichos`
4. trilha de nicho
5. abas operacionais
6. bancada de trabalho manual com varios selects
7. blocos de motor do nicho e execucao do nicho

Tambem ha uso de `selected` em `<option>`:

1. linha `1515`
2. linha `1554`
3. linha `1606`

E varios `<select>` na tela:

1. linha `1511`
2. linha `1537`
3. linha `1546`
4. linha `1589`
5. linha `1598`
6. linha `2054`

### Leitura analitica

Isto confirma dois problemas:

1. `Clara` ainda exige montagem manual de contexto em vez de operar como executora conversacional
2. a base tecnica da tela ainda favorece estados inconsistentes de selecao

### Estado desejado

`Clara` deve ser reduzida a:

1. conversa
2. sugestoes executaveis
3. historico/proximo passo

Ela nao deve continuar como hub multifuncional com onboarding fragmentado.

---

## Gap 2: Acesso rapido ficou conceitualmente superado, mas ainda esta na Clara

### Evidencia

Em `apps/web/src/app/(workspace)/clara/page.tsx` existe a secao:

1. `Acesso rapido`
2. com atalhos separados para:
   - cadastrar cliente
   - registrar caso
   - anexar documentos
   - abrir processo
   - abrir editor formal

### Leitura analitica

Isso contradiz a decisao aprovada de `Novo atendimento bancario` como pagina unica de entrada.

Enquanto essa secao existir como principal caminho operacional, a usuaria continua sendo empurrada para varias telas intermediarias separadas.

### Estado desejado

Substituir esse conjunto por um unico ponto de entrada:

1. `Novo atendimento bancario`

---

## Gap 3: CRM existe so como landing de navegacao

### Evidencia

Em `apps/web/src/app/(workspace)/crm/page.tsx`, `CRM` hoje apenas lista links para:

1. `Clientes`
2. `Adversos`
3. `Contatos / Partes`

### Leitura analitica

Isso confirma que o `CRM` ainda nao foi implementado como modulo de negocio.

Hoje ele nao oferece:

1. leads
2. pipeline
3. follow-ups
4. origem do contato
5. conversao para cliente/caso

### Estado desejado

`CRM` deve virar modulo proprio de entrada e relacionamento, e nao landing de rotas herdadas.

---

## Gap 4: Operacao foi reorganizada, mas ainda e landing

### Evidencia

Em `apps/web/src/app/(workspace)/operacao/page.tsx`, `Operacao` hoje apenas lista links para:

1. `Agenda`
2. `Tarefas`
3. `Prazos`
4. `Publicacoes`
5. `Monitoramento`

### Leitura analitica

Houve ganho de navegacao, mas nao existe ainda uma fila operacional unificada de fato.

### Estado desejado

`Operacao` deve ser lida como fila real do escritorio, alimentada por workflow, publicacoes, prazos, tarefas e Clara.

---

## Gap 5: Cliente ainda e detalhe expandido, nao cockpit do caso

### Evidencia

Em `apps/web/src/app/(workspace)/pessoas/clientes/[clientId]/page.tsx`, a area do cliente hoje e estruturada como detalhe com:

1. visao geral
2. contexto da Clara
3. historico da Clara
4. casos vinculados
5. documentos vinculados
6. timeline de atendimento
7. CTA para continuar na Clara

### Leitura analitica

A tela ajuda na leitura contextual, mas ainda nao e o cockpit desejado.

Faltam como estrutura principal:

1. workflow embutido do caso
2. proxima fase do nicho
3. pecas e artefatos juridicos como eixo central
4. processo e acompanhamento como trilha viva
5. Clara integrada como aba/contexto do caso, nao so redirecionamento

### Estado desejado

A area do cliente deve abrir o caso como centro operacional real.

---

## Gap 6: A navegacao ja mudou, mas a espinha dorsal do produto ainda nao

### Evidencia

Em `apps/web/src/components/layout/workspace-navigation.ts` a navegacao principal atual ja mostra:

1. `Hoje`
2. `CRM`
3. `Processos`
4. `Operacao`
5. `Financeiro`
6. `Clara`

### Leitura analitica

Esse reenquadramento ajuda, mas ele e superficial se os modulos por tras continuarem herdando semantica antiga.

Ou seja:

1. a casca mudou
2. o fluxo central do produto ainda nao mudou

---

## Gap 7: Pipeline documental editavel ainda nao e espinha do sistema

### Evidencia

Pelo estado atual das telas revisadas, ainda nao existe um fluxo centralizado que:

1. gere peca editavel no contexto do caso
2. mantenha status `rascunho -> em revisao -> aprovado`
3. integre aprovacoes do advogado
4. exponha exportacao `DOCX/PDF` como parte natural do caso

### Leitura analitica

Existe suporte parcial a artefatos e editor, mas o modelo documental aprovado ainda nao virou experiencia principal.

---

## Prioridades sugeridas ao PM

O proximo recorte de produto deve atacar primeiro os gaps que mudam a espinha dorsal, nao so a navegacao.

Ordem sugerida:

1. `Clara` simplificada e livre de cards/atalhos fragmentados
2. `Novo atendimento bancario` como porta unica de entrada
3. `Cliente` como cockpit do caso
4. workflow por nicho embutido no caso
5. `CRM` como modulo real
6. pipeline documental editavel

---

## Pergunta que o PM deve responder

Qual e o menor recorte implementavel que:

1. remove a principal confusao da `Clara`
2. cria a primeira experiencia real de entrada unica do caso
3. abre a primeira versao do cockpit do cliente

Se esse recorte nao atacar esses tres pontos juntos, ele tende a repetir o erro de melhorar periferia sem resolver o centro.

---

## Recomendacao final do Analyst

Nao seguir agora para nova implementacao direta.

O proximo agente correto e `@pm`, usando este gap analysis junto com a visao canonica para produzir um recorte de produto faseado, objetivo e implementavel.
