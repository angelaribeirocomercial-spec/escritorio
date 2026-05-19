# Diagnostico 2026-05-15: Gap do fluxo bancario real apos intake

## Escopo analisado

Fluxo esperado pelo PRD mestre:

1. cadastro do cliente
2. criacao do caso com nicho bancario
3. upload do contrato e documentos
4. OCR e conferencia humana
5. calculo juridico real
6. comparacao BACEN por modalidade e epoca
7. abusividades, estrategia e laudo
8. peticao com revisao humana
9. distribuicao
10. acompanhamento processual

## Base canonica

- `docs/product/lexia-bancaria/prd-mestre-escritorio-bancario-v2.md`
- `docs/product/lexia-bancaria/prd-mestre.addendum-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.execucao-dossie-unico.md`
- `docs/product/lexia-bancaria/prd-mestre.matriz-rastreabilidade.md`
- `docs/stories/18.29.criar-boundary-real-de-ocr-com-status-e-revisao-humana.md`
- `docs/stories/18.30.persistir-calculo-juridico-e-comparacao-bacen.md`
- `docs/stories/18.31.registrar-abusividades-e-sugestao-juridica.md`
- `docs/stories/18.32.gerar-estrategia-e-laudo-revisional.md`
- `docs/stories/18.33.clara-orquestradora-e-acao-analise-caso.md`
- `docs/stories/18.34.dossie-case-local-com-abas-convencionais-laudo-peticoes-e-clara.md`
- `docs/stories/18.35.registro-oficial-pos-distribuicao-com-comprovante-e-auditoria.md`

## Estado atual confirmado

### Ja implantado de forma util

1. o onboarding cria cliente, caso e vinculos documentais reais
2. o dossie do caso existe com abas de `Visao geral`, `Documentos`, `Calculos`, `Bacen`, `Estrategico`, `Laudo`, `Peticoes` e `Clara`
3. o handoff de distribuicao e o registro oficial pos-distribuicao existem
4. o detalhe do processo ja suporta numero oficial, data oficial, comprovante e trilha auditavel

### Gap real ainda aberto

1. o upload nao dispara OCR estruturado persistido automaticamente
2. os calculos juridicos ainda dependem de fallback controlado e memoria estatica em parte do fluxo
3. a consulta BACEN ainda nao materializa a media real da modalidade e da epoca do contrato
4. a `chance de exito` exibida no topo ainda nao nasce de analise juridica real do caso
5. laudo e peticao ainda operam como saida assistida/templateada, nao como artefatos integralmente ancorados em extracao persistida confiavel
6. o fluxo pos-peticao ainda nao fecha a esteira operacional do processo bancario com fases, andamentos, pecas supervenientes e acompanhamento continuo

## Leitura analitica

O produto ja montou a espinha dorsal correta de navegacao:

`cliente -> caso -> dossie -> peticao -> handoff de distribuicao -> processo`

O problema nao e mais de superficie principal. O problema agora e de profundidade funcional dentro dessa espinha:

1. o dossie existe, mas ainda nao e alimentado ponta a ponta por artefatos juridicos persistidos do proprio caso
2. a automacao bancaria ainda nao fecha a cadeia `documento -> leitura -> calculo -> BACEN -> abusividade -> estrategia -> laudo -> peticao`
3. o processo pos-distribuicao ja nasceu como superficie correta, mas ainda precisa virar esteira de acompanhamento juridico bancario e nao apenas registro oficial inicial

## Recomendacao de corte

Nao reabrir a arquitetura principal do dossie.

O caminho correto e hardening incremental em seis stories:

1. OCR estruturado e persistido por documento do caso
2. calculo juridico real derivado da extracao persistida
3. BACEN real por modalidade, competencia e taxa comparavel
4. visao geral estrategica, score, laudo e Clara ancorados no dossie persistido
5. peticao inicial pronta para revisao/aprovacao e handoff de distribuicao
6. acompanhamento processual bancario pos-distribuicao com andamentos, fases e pecas cabiveis

## Resultado esperado apos esse pacote

1. a usuaria sobe contrato, fotos, prints, extratos e carne
2. o sistema extrai e persiste os dados relevantes do caso
3. o motor juridico calcula e compara com BACEN de forma rastreavel
4. a Clara explica o caso a partir de fatos persistidos
5. o laudo e a peticao deixam de depender de placeholders soltos
6. a distribuicao continua humana/oficial quando exigido pelo tribunal
7. o processo passa a ser acompanhado no sistema com trilha de fases e pecas supervenientes
