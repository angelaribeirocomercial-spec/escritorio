export type JurisprudenceSourceId = "stj" | "stf";

export type JurisprudenceConsultationRecord = {
  referenceId: string;
  kind: "jurisprudence";
  label: string;
  detail: string;
  sourceHandle: string;
  metadata: Record<string, string>;
};

export type JurisprudenceConsultationFinding = {
  findingId: string;
  category: "precedent";
  title: string;
  detail: string;
  referenceIds: string[];
};

export type JurisprudenceConsultationResult = {
  sourceId: JurisprudenceSourceId;
  sourceLabel: string;
  scope: string;
  query: string;
  normalizedQuery: string;
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
  records: JurisprudenceConsultationRecord[];
  findings: JurisprudenceConsultationFinding[];
  rawReferenceHandles: string[];
};

type ConsultationConfig = {
  sourceId: JurisprudenceSourceId;
  sourceLabel: string;
  scope: string;
};

const CONSULTATION_CONFIG: Record<JurisprudenceSourceId, ConsultationConfig> = {
  stj: {
    sourceId: "stj",
    sourceLabel: "STJ",
    scope: "Pesquisa de jurisprudencia bancaria e precedentes relevantes"
  },
  stf: {
    sourceId: "stf",
    sourceLabel: "STF",
    scope: "Pesquisa constitucional e repercussao geral quando aplicavel"
  }
};

function normalizeConsultation(query: string) {
  return query.replace(/\s+/g, " ").trim();
}

export async function getJurisprudenceConsultation(
  sourceId: JurisprudenceSourceId,
  consulta: string
): Promise<JurisprudenceConsultationResult> {
  const config = CONSULTATION_CONFIG[sourceId];
  const normalizedQuery = normalizeConsultation(consulta);

  if (!normalizedQuery) {
    throw new Error("Informe uma consulta valida para a jurisprudencia.");
  }

  const sourceHandle = `${sourceId}:${normalizedQuery.toLowerCase()}`;

  return {
    sourceId: config.sourceId,
    sourceLabel: config.sourceLabel,
    scope: config.scope,
    query: consulta,
    normalizedQuery,
    status: "prepared_stub",
    consulted: false,
    queryHint:
      sourceId === "stj"
        ? `Pesquisar precedentes do STJ para ${normalizedQuery}.`
        : `Consultar o STF apenas se houver recorte constitucional real para ${normalizedQuery}.`,
    summary:
      sourceId === "stj"
        ? `Consulta estruturada preparada para o STJ sobre ${normalizedQuery}.`
        : `Consulta estruturada preparada para o STF sobre ${normalizedQuery}.`,
    sourceTrail: {
      origem_interna: [`Consulta solicitada em ${config.sourceLabel}`],
      origem_documental: [],
      origem_api: [],
      inferencia_controlada: [
        "Consulta preparada como boundary server-side sem inventar resultado jurisprudencial.",
        "A resposta carrega trilha controlada para auditoria e persistencia futura."
      ]
    },
    records: [
      {
        referenceId: `${sourceId}-${normalizedQuery.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "consulta"}`,
        kind: "jurisprudence",
        label: normalizedQuery,
        detail:
          sourceId === "stj"
            ? "Recorte de jurisprudencia bancaria preparado para consulta oficial do STJ."
            : "Recorte constitucional preparado para consulta oficial do STF.",
        sourceHandle,
        metadata: {
          sourceId,
          sourceLabel: config.sourceLabel,
          query: normalizedQuery
        }
      }
    ],
    findings: [
      {
        findingId: `${sourceId}-${normalizedQuery.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "finding"}`,
        category: "precedent",
        title:
          sourceId === "stj"
            ? "Pesquisa de precedentes preparada"
            : "Triagem constitucional preparada",
        detail:
          sourceId === "stj"
            ? "O contrato de consulta esta pronto para logging e persistencia sem fingir resultado oficial."
            : "O contrato de consulta delimita o recorte constitucional sem misturar o STF com a regra geral do caso.",
        referenceIds: [
          `${sourceId}-${normalizedQuery.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "consulta"}`
        ]
      }
    ],
    rawReferenceHandles: [sourceHandle]
  };
}
