import { mockCases, mockClients, mockContractAnalyses, mockDocuments } from "@lexia/mocks";

import { getBankingRevisionalCalculation } from "@/server/services/clara/get-banking-revisional-calculation";

function getScenarioProfile(params: { documentType: string; bankName: string }) {
  if (params.documentType === "CCB") {
    return {
      label: "CCB com foco em capitalizacao",
      summary: `Operacao empresarial com leitura orientada para capitalizacao mensal, CET elevado e encargos agregados na relacao com ${params.bankName}.`,
      thesisFocus: [
        "capitalizacao mensal indevida ou excessivamente onerosa",
        "revisao do CET e dos custos incorporados ao saldo",
        "controle de comissao de permanencia e cumulos moratorios"
      ]
    };
  }

  return {
    label: "Financiamento ao consumidor",
    summary: `Operacao voltada ao consumidor com leitura orientada para seguro embutido, venda casada e distorcao entre parcela prometida e parcela cobrada na relacao com ${params.bankName}.`,
    thesisFocus: [
      "seguro embutido e venda casada",
      "falta de transparencia sobre CET e composicao da parcela",
      "onerosidade excessiva no cumprimento do contrato"
    ]
  };
}

export async function getContractAnalysisWorkspace(
  documentId?: string,
  calculationParams?: {
    financedAmount?: string;
    installmentCount?: string;
    contractedInstallment?: string;
    chargedInstallment?: string;
    targetReductionPercent?: string;
  }
) {
  const contractDocuments = mockDocuments.filter((document) =>
    ["Contrato bancario", "CCB"].includes(document.documentType)
  );

  const selectedDocument =
    contractDocuments.find((document) => document.id === documentId) ?? contractDocuments[0];

  const analysis = mockContractAnalyses.find(
    (analysisItem) => analysisItem.documentId === selectedDocument.id
  );
  const client = mockClients.find((clientItem) => clientItem.id === selectedDocument.clientId);
  const bankingCase = mockCases.find((caseItem) => caseItem.id === selectedDocument.caseId);

  if (!analysis || !client || !bankingCase) {
    throw new Error("Contract analysis workspace is missing linked mock data.");
  }

  const scenarioProfile = getScenarioProfile({
    bankName: bankingCase.bankName,
    documentType: selectedDocument.documentType
  });

  return {
    contractDocuments: contractDocuments.map((document) => ({
      id: document.id,
      label: document.fileName,
      documentType: document.documentType
    })),
    selectedDocument,
    analysis,
    client,
    bankingCase,
    scenarioProfile,
    calculationMemory: getBankingRevisionalCalculation(
      calculationParams,
      selectedDocument.id === "doc-004"
        ? {
            financedAmount: 248000,
            installmentCount: 21,
            contractedInstallment: 8420,
            chargedInstallment: 10185,
            targetReductionPercent: 21.8,
            basis:
              "Simulacao mockada com expurgo de capitalizacao mensal e de custos agregados de baixa transparencia."
          }
        : {
            financedAmount: 68400,
            installmentCount: 29,
            contractedInstallment: 1842,
            chargedInstallment: 2214,
            targetReductionPercent: 27.8,
            basis:
              "Simulacao mockada com exclusao de seguro embutido, readequacao do CET e afastamento de encargos cumulativos."
          }
    ),
    revisionalChecklist: [
      "Contrato principal com clausulas legiveis e identificacao do produto bancario",
      "Historico de parcelas pagas, vencidas e renegociadas",
      "Memoria de calculo ou planilha minima para sustentar o excesso",
      "Extratos ou comprovantes que mostrem o comportamento da cobranca",
      "Definicao objetiva das clausulas e encargos que serao rediscutidos"
    ],
    thesisFrames: [
      {
        title: "Transparencia e informacao adequada",
        detail:
          "Usar quando CET, seguros, tarifas ou a formacao da parcela nao estiverem expostos de forma clara ao consumidor."
      },
      {
        title: "Desequilibrio contratual",
        detail:
          "Fundamento util quando a execucao economica do contrato produz onerosidade superior ao desenho inicialmente apresentado."
      },
      {
        title: "Controle dos encargos financeiros",
        detail:
          "Abrange juros, capitalizacao, comissao de permanencia e outros cumulos que elevem parcela e saldo alem do patamar juridicamente defensavel."
      },
      {
        title: "Foco principal deste cenario",
        detail: `Neste tipo de operacao, a Clara prioriza ${scenarioProfile.thesisFocus.join(", ")}.`
      }
    ],
    revisionalRequests: [
      "Tutela para conter cobranca excessiva e impedir agravamento da mora",
      "Revisao das clausulas remuneratorias e recalcule das parcelas",
      "Recomposicao do saldo contratual sem encargos abusivos",
      "Compensacao ou repeticao do indebito, quando a prova economica estiver madura"
    ],
    proofStrategy: [
      "Separar contrato, aditivos, proposta comercial e quadro-resumo da operacao",
      "Montar memoria minima do excesso com parcelas contratadas, cobradas e revisadas",
      "Anexar extratos, boletos, comunicacoes de cobranca e eventual negativacao"
    ],
    revisionalStructure: [
      "Sintese da contratacao e evolucao da divida",
      "Clausulas abusivas e onerosidade excessiva",
      "Impacto no valor das parcelas e no saldo",
      "Tutela para limitar cobranca ou readequar a parcela",
      "Pedidos revisionais e eventual repeticao de indebito"
    ]
  };
}
