export type ConsumidorReclamacoesConsultation = {
  sourceId: "consumidor-gov";
  sourceLabel: string;
  scope: string;
  empresa: string;
  normalizedEmpresa: string;
  status: "prepared_stub";
  consulted: boolean;
  queryHint: string;
  summary: string;
  sourceTrail: {
    origem_interna: string[];
    origem_documental: string[];
    origem_api: string[];
    inferencia_controlada: string[];
  };
  records: Array<{
    referenceId: string;
    kind: "consumer-complaint";
    label: string;
    detail: string;
    sourceHandle: string;
    metadata: Record<string, string>;
  }>;
  findings: Array<{
    findingId: string;
    category: "consumer-signal";
    title: string;
    detail: string;
    referenceIds: string[];
  }>;
  rawReferenceHandles: string[];
};

function normalizeCompany(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export async function getConsumidorReclamacoesConsultation(empresa: string): Promise<ConsumidorReclamacoesConsultation> {
  const normalizedEmpresa = normalizeCompany(empresa);

  if (!normalizedEmpresa) {
    throw new Error("Informe uma empresa valida para consulta no Consumidor.gov.br.");
  }

  const sourceHandle = `consumer-bank:${normalizedEmpresa.toLowerCase()}`;

  return {
    sourceId: "consumidor-gov",
    sourceLabel: "Consumidor.gov.br / Senacon",
    scope: "Inteligencia complementar sobre reclamacoes bancarias",
    empresa,
    normalizedEmpresa,
    status: "prepared_stub",
    consulted: false,
    queryHint: `Buscar padroes de reclamacao relacionados a ${normalizedEmpresa} sem misturar contextos de outros casos.`,
    summary: `Consulta estruturada preparada para sinais de reclamacao ligados a ${normalizedEmpresa}.`,
    sourceTrail: {
      origem_interna: [`Consulta solicitada para ${normalizedEmpresa}`],
      origem_documental: [],
      origem_api: [],
      inferencia_controlada: [
        "Consulta preparada como boundary server-side sem inventar reclamacoes publicas.",
        "A resposta carrega trilha controlada para auditoria e persistencia futura."
      ]
    },
    records: [
      {
        referenceId: `consumer-${normalizedEmpresa.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "consulta"}`,
        kind: "consumer-complaint",
        label: normalizedEmpresa,
        detail: "Instituicao alvo de pesquisa em reclamacoes publicas.",
        sourceHandle,
        metadata: {
          empresa: normalizedEmpresa
        }
      }
    ],
    findings: [
      {
        findingId: `consumer-${normalizedEmpresa.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "signal"}`,
        category: "consumer-signal",
        title: "Pesquisa de reclamacoes preparada",
        detail:
          "O contrato de consulta separa a fonte de sinais do workspace interno e deixa o output pronto para trilha de auditoria.",
        referenceIds: [
          `consumer-${normalizedEmpresa.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "consulta"}`
        ]
      }
    ],
    rawReferenceHandles: [sourceHandle]
  };
}
