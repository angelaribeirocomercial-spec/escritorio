# Handoff Arquitetural: Fase 1 da Reestruturacao

**Data:** 2026-04-27  
**Origem:** Architect  
**Destino sugerido:** SM / Dev

---

## Objetivo arquitetural

Entregar a primeira espinha dorsal real do novo produto sem reescrever o workspace inteiro.

Fluxo alvo da Fase 1:

`Clara simplificada -> Novo atendimento bancario -> Cliente como cockpit`

---

## Leitura da base atual

O codigo atual ja possui tres blocos relevantes que devem ser reaproveitados:

1. `Clara` com estrutura de workspace, artefatos e registros
2. servicos de cliente e caso ja resolvidos na base atual
3. componentes e paginas de cliente/processo que podem ser elevados para cockpit

Evidencias principais:

1. `apps/web/src/app/(workspace)/clara/page.tsx` concentra a interface da Clara
2. `apps/web/src/server/services/clara/get-clara-workspace.ts` e `get-banking-revisional-workspace.ts` ja resolvem contexto e nicho
3. `apps/web/src/server/services/clara/get-clara-artifacts.ts` e `clara-record-store.ts` ja sustentam artefatos e historico
4. `apps/web/src/app/(workspace)/pessoas/clientes/[clientId]/page.tsx` ja oferece uma base de contexto do cliente

Conclusao:

O caminho seguro nao e recomeçar. E reencaixar e simplificar o que ja existe.

---

## Restricao arquitetural principal

Nao tentar entregar Fase 1 como um mega-refactor de:

1. navegacao
2. CRM
3. Clara
4. cliente
5. documentos
6. editor

ao mesmo tempo.

Isso reabriria o caos.

---

## Decisao tecnica principal

A Fase 1 deve ser entregue como um slice funcional unico, mas internamente dividido em tres camadas acopladas:

1. camada de entrada: `Novo atendimento bancario`
2. camada de orquestracao: `Clara` simplificada
3. camada de destino: cockpit inicial do cliente

Essas tres camadas precisam nascer juntas para a experiencia fazer sentido.

---

## Sequencia tecnica recomendada

### Slice A: Higiene e reducao da Clara

Objetivo:

Reduzir a complexidade da home da Clara antes de plugar o novo fluxo.

Escopo:

1. remover `Acesso rapido` como eixo principal
2. rebaixar blocos que so explicam e nao executam
3. corrigir `selects` controlados por `selected` na pagina
4. preservar os servicos de workspace e artefatos por tras da tela
5. manter `Revisional` como nicho piloto real

Entrega:

uma `Clara` menor, mais clara e preparada para ser porta do caso

### Slice B: Novo atendimento bancario

Objetivo:

Criar a pagina unica de entrada sem quebrar os fluxos atuais de cadastro.

Escopo:

1. pagina nova dedicada
2. formulario unico com cliente, caso, nicho, documentos e objetivo
3. submissao criando ou conectando os registros necessarios
4. primeira instancia de workflow do nicho piloto
5. redirecionamento para o cliente

Entrega:

fluxo unico de abertura do caso

### Slice C: Cockpit inicial do cliente

Objetivo:

Elevar a pagina do cliente de detalhe expandido para centro do caso.

Escopo:

1. manter informacoes ja existentes de contexto
2. adicionar bloco principal de workflow
3. adicionar bloco de proximo passo
4. reorganizar documentos e casos ao redor do caso ativo
5. integrar `Clara` contextual sem depender de redirecionamento solto

Entrega:

primeira versao do cockpit do cliente

---

## Estrategia de nicho

A arquitetura deve tratar `Revisional de contratos (veiculos)` como piloto completo.

Justificativa:

1. ja existe base mais forte em `get-banking-revisional-workspace.ts`
2. ja existem artefatos revisionais no ecossistema da Clara
3. isso reduz risco de abstrair cedo demais

`Fraude bancaria` e `Busca e apreensao` devem continuar previstas no modelo, mas sem exigir profundidade igual na primeira onda.

---

## Reaproveitamento tecnico recomendado

### Reaproveitar

1. `getClaraWorkspace`
2. `getBankingRevisionalWorkspace`
3. `clara-record-store`
4. `getClara*Artifact`
5. `getClientById` e estrutura atual de cliente

### Reencaixar

1. `ClaraConversationCard` como componente central de conversa
2. tela do cliente como base para cockpit
3. artefatos e registros como trilha inicial do workflow

### Evitar por enquanto

1. reescrever todos os servicos de Clara
2. substituir toda a navegacao mais uma vez
3. criar engine de workflow generica total antes do piloto

---

## Modelo tecnico de workflow na Fase 1

Nao criar agora um sistema enorme de workflow abstrato universal.

Criar primeiro um modelo pragmatico:

1. um caso ativo
2. um nicho
3. uma lista ordenada de etapas
4. um status atual
5. um proximo passo
6. uma trilha de artefatos gerados

Depois disso, abstrair.

---

## Compatibilidade com legado

O slice deve conviver com rotas antigas:

1. cadastros antigos continuam existindo
2. `pessoas/clientes` continua acessivel
3. documentos e editor continuam disponiveis tecnicamente
4. Clara antiga perde protagonismo, mas nao precisa ser desmontada em um unico commit

Estrategia:

1. introduzir novos pontos de entrada
2. redirecionar a experiencia principal para eles
3. manter legado como compatibilidade temporaria

---

## Riscos tecnicos

### 1. Misturar simplificacao visual com quebra de servico

Se a reducao da Clara mexer demais nos servicos, o slice perde seguranca.

### 2. Criar onboarding unico sem modelo de destino

Se `Novo atendimento bancario` nascer antes do cockpit do cliente, a usuaria continua sem centro operacional.

### 3. Tentar generalizar workflow cedo demais

O piloto deve provar o fluxo primeiro.

---

## Recomendacao de corte para a primeira story

A primeira story correta deve cobrir:

1. simplificacao inicial da `Clara`
2. remocao do `Acesso rapido` fragmentado
3. criacao do CTA/ponto unico para `Novo atendimento bancario`
4. correcao dos `selects` quebrados

Justificativa:

Esse corte e pequeno o bastante para implementar com seguranca e grande o bastante para mudar a direcao da experiencia.

O onboarding completo e o cockpit do cliente podem entrar nas stories imediatamente seguintes, ainda dentro da mesma Fase 1.

---

## Recomendacao final do Architect

O proximo agente correto e `@sm`.

Ele deve abrir a primeira story da Fase 1 com escopo fechado no slice inicial de simplificacao da `Clara` e ponto unico de entrada para o caso, sem tentar entregar toda a reestruturacao em uma vez.
