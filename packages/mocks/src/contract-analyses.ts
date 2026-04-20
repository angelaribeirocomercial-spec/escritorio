import { ContractAnalysisRecord } from "@lexia/domain";

export const mockContractAnalyses: readonly ContractAnalysisRecord[] = [
  {
    id: "ca-001",
    documentId: "doc-001",
    rateLabel: "2,79% a.m.",
    cetLabel: "3,41% a.m. | 49,62% a.a.",
    capitalizationLabel: "Capitalizacao mensal com impacto relevante no custo final",
    feesLabel: "Tarifa de cadastro e servicos agregados embutidos no saldo financiado",
    bundledInsuranceLabel: "Seguro prestamista com indicio de venda casada",
    permanenceCommissionLabel: "Prevista de forma cumulativa com outros encargos",
    penaltyLabel: "Multa contratual de 2% e juros de mora de 1% a.m.",
    sensitiveClauses: [
      "Clausula de adesao ao seguro sem destaque claro da opcionalidade",
      "Previsao ampla de encargos em caso de inadimplemento",
      "Composicao do CET sem transparencia suficiente na formacao do custo"
    ],
    abusivenessSignals: [
      "Possivel venda casada no seguro embutido",
      "CET elevado em comparacao com a narrativa comercial do contrato",
      "Encargos moratorios descritos de forma potencialmente cumulativa"
    ],
    suggestedThesis: "Juros abusivos com seguro embutido e revisao do CET",
    proceduralRisk: "medium",
    suggestedRequests: [
      "Revisao das clausulas remuneratorias e afastamento do seguro embutido",
      "Recálculo contratual com exclusao de encargos abusivos",
      "Tutela para suspensao de cobranca excessiva e vedacao de medidas restritivas"
    ],
    executiveSummary:
      "Contrato com bom potencial revisional, especialmente pela combinacao entre CET elevado, seguro embutido e redacao sensivel sobre encargos cumulativos."
  },
  {
    id: "ca-004",
    documentId: "doc-004",
    rateLabel: "3,12% a.m.",
    cetLabel: "3,88% a.m. | 57,92% a.a.",
    capitalizationLabel: "Capitalizacao mensal expressa em CCB com reflexo direto no custo efetivo",
    feesLabel: "Tarifas administrativas e custos operacionais incorporados ao contrato",
    bundledInsuranceLabel: "Cobertura acessoria sem detalhamento comercial suficiente",
    permanenceCommissionLabel: "Clausula de comissao de permanencia dependente de interpretacao restritiva",
    penaltyLabel: "Multa de 2% com encargos moratorios adicionais",
    sensitiveClauses: [
      "Capitalizacao mensal destacada em bloco tecnico de dificil leitura para o tomador",
      "Descricao pouco clara de tarifas e custos agregados",
      "Previsao de permanencia com margem para discussao sobre cumulatividade"
    ],
    abusivenessSignals: [
      "Capitalizacao mensal com potencial forte de revisao",
      "CET alto para operacao de capital de giro",
      "Tarifas acessorias e custo agregado com transparencia insuficiente"
    ],
    suggestedThesis: "Capitalizacao mensal indevida e revisao de encargos em CCB",
    proceduralRisk: "low",
    suggestedRequests: [
      "Revisao contratual com limitacao de encargos remuneratorios",
      "Afastamento de cobrancas acessorias sem transparencia",
      "Tutela para estabilizar cobranca durante a discussao judicial"
    ],
    executiveSummary:
      "A CCB apresenta boa base para tese economica, com foco em capitalizacao mensal, CET elevado e transparencia insuficiente sobre custos agregados."
  }
];
