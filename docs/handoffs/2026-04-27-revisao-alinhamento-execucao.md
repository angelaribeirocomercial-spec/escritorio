# Revisao de Alinhamento da Execucao

**Data:** 2026-04-27  
**Status:** Ativo  
**Objetivo:** reduzir ajustes manuais reativos, consolidando o que ja esta alinhado, o que esta parcial e o que ainda precisa ser corrigido contra a visao canonica.

## Fonte canonica

- `docs/product/lexia-bancaria/reestruturacao-produto-canonica.md`
- `docs/handoffs/2026-04-27-atlas-reestruturacao-produto.md`
- `docs/product/lexia-bancaria/reestruturacao-produto-recorte-faseado.md`

## 1. Alinhado

1. A identidade visivel do produto esta centrada em `Clara`, nao em `Lexia`.
2. O menu lateral principal foi reenquadrado para:
   - `Clara`
   - `CRM`
   - `Clientes`
   - `Processos`
   - `Diario oficial`
   - `Andamentos`
   - `Agenda`
   - `Financeiro`
   - `Configuracoes`
3. `Dashboard`, `Arquivos`, `Editor`, `Relatorios`, `Estatisticas`, `Pessoas` e `Equipe` deixaram de aparecer como navegacao lateral principal.
4. A home da `Clara` foi simplificada e deixou de depender de uma bancada excessiva de cards.
5. A rota `Novo atendimento bancario` existe como entrada unica do caso.
6. A demonstracao deixou de depender de `NODE_ENV !== "production"` e passou a usar uma regra central de habilitacao.

## 2. Parcial

1. `CRM`
   - ja foi limpo visualmente para parar de expor `Adversos` e `Contatos / Partes` como protagonismo do submenu
   - ainda nao entrega os blocos finais de `Leads`, `Pipeline`, `Follow-ups`, `Contratos` e `Conversas`
2. `Novo atendimento bancario`
   - ja cria cliente e caso
   - ainda nao fecha todo o fluxo documental na mesma pagina
3. `Cliente`
   - ja recebeu um cockpit inicial
   - ainda nao e o cockpit final completo com `Workflow`, `Documentos`, `Pecas`, `Processo`, `Andamentos`, `Diario oficial relacionado` e `Clara`
4. `Clara`
   - ja foi simplificada na entrada
   - ainda nao executa ponta a ponta as sugestoes como camada completa de acao real

## 3. Desalinhado ou ainda pendente

1. O fluxo de `CRM` ainda nao foi implementado como modulo de relacionamento comercial completo.
2. O workflow por nicho ainda nao esta visivel e controlado de forma plena dentro do cliente.
3. O pipeline documental interno com edicao, revisao, aprovacao e exportacao ainda nao esta instalado.
4. A revisao sistematica de botoes mortos, links redundantes e superficies herdadas ainda nao foi concluida em todo o workspace.
5. A remocao de `Lexia` como identidade visivel ainda nao foi concluida em todas as superficies expostas ao usuario.
6. O naming tecnico legado de `Lexia` ainda permanece em rotas, wrappers, campos, cookies, estilos e pacotes internos.

## 4. Revisao de tarefas obrigatorias

### Bloco A: consolidacao do fluxo principal

- [ ] Fechar `Novo atendimento bancario` como pagina unica com documentos na mesma jornada.
- [ ] Evoluir a area do cliente para cockpit mais proximo da estrutura canonica.
- [ ] Instalar o primeiro workflow visivel do nicho piloto `Revisional de contratos`.

### Bloco B: Clara executora

- [ ] Mapear sugestoes criticas da Clara para acoes reais.
- [ ] Garantir que a sugestao clicada execute algo concreto e registravel no caso.
- [ ] Remover qualquer superficie remanescente que pareca explicativa sem acao correspondente.

### Bloco C: CRM real

- [ ] Criar a primeira leitura real de `Leads`.
- [ ] Criar a primeira leitura real de `Pipeline`.
- [ ] Preparar `Follow-ups`, `Contratos` e `Conversas` como proximos subblocos do CRM.

### Bloco D: saneamento de superficies herdadas

- [ ] Revisar rotas herdadas de `Pessoas` e decidir o que fica apenas por compatibilidade.
- [ ] Revisar links e botoes redundantes em paginas principais.
- [ ] Revisar selects e estados de formulario ainda herdados.

### Bloco E: remocao progressiva de Lexia

- [ ] Remover qualquer referencia visivel a `Lexia` na interface do produto.
- [ ] Revisar e tratar rotas legadas expostas como `/lexia`.
- [ ] Revisar wrappers e aliases herdados que ainda expõem `Lexia` por compatibilidade visual.
- [ ] Planejar uma etapa tecnica separada para normalizar naming legado (`@lexia/*`, `lexia_*`, `bg-lexia-*`, cookies e campos internos) sem quebrar compatibilidade.

## 5. Regra operacional daqui para frente

1. Cada ajuste importante deve ser comparado primeiro com este documento e com a visao canonica.
2. O que estiver fora do alvo deve virar tarefa registrada, nao correcao improvisada.
3. O produto deve avancar pelo fluxo principal antes de voltar a polir superficies secundarias.
