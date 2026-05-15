type BcbStatus = "consulted" | "unavailable" | "failed";

export type BcbConsultationKind = "tarifas" | "sgs" | "ptax";

export type BcbConsultation = {
  kind: BcbConsultationKind;
  status: BcbStatus;
  consultedAt?: string;
  endpoint: string;
  summary: string;
  query: Record<string, string>;
  sourceTrace: {
    origem_interna: string[];
    origem_documental: string[];
    origem_api: string[];
    inferencia_controlada: string[];
  };
  payload: {
    title: string;
    items: Array<{
      label: string;
      value: string;
      sourceHandle: string;
      metadata: Record<string, string>;
    }>;
  };
  failureReason?: string;
};

export type BankingRateReferenceConfig = {
  modalityKey: string;
  modalityLabel: string;
  seriesCode: string;
  seriesLabel: string;
  sourceUrl: string;
  approximationLabel?: string;
};

type ConsultedResponse = {
  title: string;
  items: Array<{
    label: string;
    value: string;
    sourceHandle: string;
    metadata: Record<string, string>;
  }>;
};

const BCB_SGS_BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";
const BCB_PTAX_BASE_URL = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata";
const BCB_TARIFAS_PORTAL_URL =
  "https://dadosabertos.bcb.gov.br/dataset/tarifas-bancarias-por-segmento-e-por-instituicao";

const DEFAULT_SGS_SERIES = {
  "433": "IPCA - variacao mensal",
  "1": "Selic - taxa meta",
  "432": "IGP-M - variacao mensal"
} as const;

const BANKING_RATE_REFERENCE_BY_MODALITY: Record<string, BankingRateReferenceConfig | null> = {
  "financiamento-veiculo": {
    modalityKey: "financiamento-veiculo",
    modalityLabel: "Financiamento de veiculo",
    seriesCode: "25471",
    seriesLabel:
      "Taxa media mensal de juros das operacoes de credito com recursos livres - Pessoas fisicas - Aquisicao de veiculos",
    sourceUrl:
      "https://dadosabertos.bcb.gov.br/dataset/25471-taxa-media-mensal-de-juros-das-operacoes-de-credito-com-recursos-livres---pessoas-fisicas---a"
  },
  "busca-apreensao": {
    modalityKey: "busca-apreensao",
    modalityLabel: "Financiamento com risco de mora",
    seriesCode: "25471",
    seriesLabel:
      "Taxa media mensal de juros das operacoes de credito com recursos livres - Pessoas fisicas - Aquisicao de veiculos",
    sourceUrl:
      "https://dadosabertos.bcb.gov.br/dataset/25471-taxa-media-mensal-de-juros-das-operacoes-de-credito-com-recursos-livres---pessoas-fisicas---a",
    approximationLabel: "Serie de aquisicao de veiculos usada por aderencia ao contrato-base com garantia do bem."
  },
  "beneficio-descontos": {
    modalityKey: "beneficio-descontos",
    modalityLabel: "Desconto em beneficio",
    seriesCode: "25468",
    seriesLabel:
      "Taxa media mensal de juros das operacoes de credito com recursos livres - Pessoas fisicas - Credito pessoal consignado para aposentados e pensionistas do INSS",
    sourceUrl:
      "https://dadosabertos.bcb.gov.br/dataset/25468-taxa-media-mensal-de-juros-das-operacoes-de-credito-com-recursos-livres---pessoas-fisicas---c"
  },
  "cartao-consignado": null,
  fraude: null,
  ccb: null
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateForBcb(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatDateForPtax(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${month}-${day}-${year}`;
}

function resolveCompetenceWindow(competenceLabel?: string) {
  const normalized = competenceLabel?.trim();

  if (!normalized) {
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, "0");
    return {
      competenceLabel: `${month}/${year}`,
      startDate: `${year}-${month}-01`,
      endDate: `${year}-${month}-28`
    };
  }

  const slashMatch = normalized.match(/^(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    const [, month, year] = slashMatch;
    return {
      competenceLabel: normalized,
      startDate: `${year}-${month}-01`,
      endDate: `${year}-${month}-28`
    };
  }

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month] = isoMatch;
    return {
      competenceLabel: `${month}/${year}`,
      startDate: `${year}-${month}-01`,
      endDate: `${year}-${month}-28`
    };
  }

  return {
    competenceLabel: normalized,
    startDate: todayIsoDate(),
    endDate: todayIsoDate()
  };
}

function buildUnavailableConsultation(params: {
  kind: BcbConsultationKind;
  endpoint: string;
  query: Record<string, string>;
  summary: string;
  failureReason: string;
  title: string;
}): BcbConsultation {
  return {
    kind: params.kind,
    status: "unavailable",
    endpoint: params.endpoint,
    summary: params.summary,
    query: params.query,
    sourceTrace: {
      origem_interna: [],
      origem_documental: [BCB_TARIFAS_PORTAL_URL],
      origem_api: [],
      inferencia_controlada: [params.failureReason]
    },
    payload: {
      title: params.title,
      items: []
    },
    failureReason: params.failureReason
  };
}

async function safeFetchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as unknown;
}

function buildConsultedConsultation(params: {
  kind: BcbConsultationKind;
  endpoint: string;
  query: Record<string, string>;
  title: string;
  summary: string;
  origemApi: string[];
  items: ConsultedResponse["items"];
}): BcbConsultation {
  return {
    kind: params.kind,
    status: "consulted",
    consultedAt: new Date().toISOString(),
    endpoint: params.endpoint,
    summary: params.summary,
    query: params.query,
    sourceTrace: {
      origem_interna: [],
      origem_documental: [params.endpoint],
      origem_api: params.origemApi,
      inferencia_controlada: ["Consulta oficial executada por adaptador server-side controlado."]
    },
    payload: {
      title: params.title,
      items: params.items
    }
  };
}

export async function getBcbTarifasConsultation(instituicao?: string) {
  const institution = instituicao?.trim();
  const endpoint = BCB_TARIFAS_PORTAL_URL;

  if (!institution) {
    return buildUnavailableConsultation({
      kind: "tarifas",
      endpoint,
      query: {},
      title: "Tarifas bancarias",
      summary:
        "Consulta de tarifas do Banco Central preparada, mas a instituicao ainda nao foi informada.",
      failureReason: "Parametro instituicao ausente para consulta de tarifas."
    });
  }

  return buildUnavailableConsultation({
    kind: "tarifas",
    endpoint,
    query: { instituicao: institution },
    title: "Tarifas bancarias",
    summary:
      "A consulta de tarifas permanece controlada pelo portal publico do Banco Central enquanto o contrato de leitura automatica e consolidado.",
    failureReason:
      "Tarifas do Banco Central permanecem em boundary controlado sem consulta automatica nesta story."
  });
}

export async function getBcbSgsConsultation(serie?: string, dataInicial?: string, dataFinal?: string) {
  const resolvedSerie = (serie?.trim() || "433").replace(/\D/g, "");
  const seriesLabel = DEFAULT_SGS_SERIES[resolvedSerie as keyof typeof DEFAULT_SGS_SERIES] ?? "Serie SGS";
  const endDate = dataFinal?.trim() || todayIsoDate();
  const startDate = dataInicial?.trim() || endDate;
  const query = {
    serie: resolvedSerie,
    dataInicial: startDate,
    dataFinal: endDate
  };
  const endpoint = `${BCB_SGS_BASE_URL}.${resolvedSerie}/dados?formato=json&dataInicial=${encodeURIComponent(
    formatDateForBcb(startDate)
  )}&dataFinal=${encodeURIComponent(formatDateForBcb(endDate))}`;

  try {
    const json = await safeFetchJson(endpoint);

    if (!Array.isArray(json)) {
      return buildUnavailableConsultation({
        kind: "sgs",
        endpoint,
        query,
        title: seriesLabel,
        summary:
          "A serie SGS foi preparada, mas a resposta publica nao retornou no formato esperado.",
        failureReason: "Resposta SGS indisponivel ou fora do contrato esperado."
      });
    }

    const items = json.slice(0, 10).map((entry: any, index: number) => ({
      label: `${seriesLabel} ${index + 1}`,
      value: `${entry.data ?? "sem data"} | ${entry.valor ?? "sem valor"}`,
      sourceHandle: `sgs:${resolvedSerie}:${index + 1}`,
      metadata: {
        serie: resolvedSerie,
        data: String(entry.data ?? ""),
        valor: String(entry.valor ?? "")
      }
    }));

    return buildConsultedConsultation({
      kind: "sgs",
      endpoint,
      query,
      title: seriesLabel,
      summary: `Serie SGS ${resolvedSerie} consultada com sucesso.`,
      origemApi: [`SGS ${resolvedSerie}`],
      items
    });
  } catch (error) {
    return buildUnavailableConsultation({
      kind: "sgs",
      endpoint,
      query,
      title: seriesLabel,
      summary: `A serie SGS ${resolvedSerie} foi preparada, mas a consulta publica nao concluiu.`,
      failureReason: error instanceof Error ? error.message : "Falha desconhecida na consulta SGS."
    });
  }
}

export async function getBcbPtaxConsultation(moeda?: string, data?: string) {
  const resolvedCurrency = (moeda?.trim() || "USD").toUpperCase();
  const resolvedDate = data?.trim() || todayIsoDate();
  const query = {
    moeda: resolvedCurrency,
    data: resolvedDate
  };
  const endpoint = `${BCB_PTAX_BASE_URL}/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@moeda='${resolvedCurrency}'&@dataInicial='${formatDateForPtax(
    resolvedDate
  )}'&@dataFinalCotacao='${formatDateForPtax(resolvedDate)}'&$format=json`;

  try {
    const json = await safeFetchJson(endpoint);
    const results = (json as { value?: Array<any> } | null)?.value;

    if (!Array.isArray(results)) {
      return buildUnavailableConsultation({
        kind: "ptax",
        endpoint,
        query,
        title: `PTAX ${resolvedCurrency}`,
        summary:
          "A consulta PTAX foi preparada, mas a resposta publica nao retornou no formato esperado.",
        failureReason: "Resposta PTAX indisponivel ou fora do contrato esperado."
      });
    }

    const items = results.slice(0, 10).map((entry, index) => ({
      label: `${resolvedCurrency} ${index + 1}`,
      value: `${entry.dataHoraCotacao ?? entry.dataCotacao ?? "sem data"} | compra ${entry.cotacaoCompra ?? "n/d"} | venda ${entry.cotacaoVenda ?? "n/d"}`,
      sourceHandle: `ptax:${resolvedCurrency}:${index + 1}`,
      metadata: {
        moeda: resolvedCurrency,
        dataHoraCotacao: String(entry.dataHoraCotacao ?? ""),
        cotacaoCompra: String(entry.cotacaoCompra ?? ""),
        cotacaoVenda: String(entry.cotacaoVenda ?? "")
      }
    }));

    return buildConsultedConsultation({
      kind: "ptax",
      endpoint,
      query,
      title: `PTAX ${resolvedCurrency}`,
      summary: `PTAX ${resolvedCurrency} consultada com sucesso para ${resolvedDate}.`,
      origemApi: ["PTAX OData"],
      items
    });
  } catch (error) {
    return buildUnavailableConsultation({
      kind: "ptax",
      endpoint,
      query,
      title: `PTAX ${resolvedCurrency}`,
      summary: `A consulta PTAX ${resolvedCurrency} foi preparada, mas a execucao publica nao concluiu.`,
      failureReason: error instanceof Error ? error.message : "Falha desconhecida na consulta PTAX."
    });
  }
}

export async function getBcbBankingRateConsultation(modalityKey?: string, competenceLabel?: string) {
  const reference = modalityKey ? BANKING_RATE_REFERENCE_BY_MODALITY[modalityKey] : null;
  const competenceWindow = resolveCompetenceWindow(competenceLabel);

  if (!modalityKey || !reference) {
    return buildUnavailableConsultation({
      kind: "sgs",
      endpoint: BCB_SGS_BASE_URL,
      query: {
        modalityKey: modalityKey ?? "",
        competence: competenceWindow.competenceLabel
      },
      title: "Referencia BACEN da modalidade",
      summary:
        "Nao existe serie oficial aderente mapeada automaticamente para esta modalidade contratual.",
      failureReason:
        "Modalidade sem serie oficial aderente mapeada no adaptador BACEN; fallback controlado mantido."
    });
  }

  const consultation = await getBcbSgsConsultation(
    reference.seriesCode,
    competenceWindow.startDate,
    competenceWindow.endDate
  );

  if (consultation.status !== "consulted") {
    return {
      ...consultation,
      summary: `A serie oficial ${reference.seriesCode} foi selecionada para ${reference.modalityLabel}, mas a consulta nao retornou dado utilizavel para ${competenceWindow.competenceLabel}.`,
      query: {
        ...consultation.query,
        modalityKey: reference.modalityKey,
        competence: competenceWindow.competenceLabel
      },
      sourceTrace: {
        ...consultation.sourceTrace,
        origem_documental: [reference.sourceUrl],
        origem_api: [...consultation.sourceTrace.origem_api, `SGS ${reference.seriesCode}`],
        inferencia_controlada: reference.approximationLabel
          ? [...consultation.sourceTrace.inferencia_controlada, reference.approximationLabel]
          : consultation.sourceTrace.inferencia_controlada
      }
    };
  }

  return {
    ...consultation,
    title: reference.seriesLabel,
    summary: `Serie oficial ${reference.seriesCode} consultada para ${reference.modalityLabel} em ${competenceWindow.competenceLabel}.`,
    query: {
      ...consultation.query,
      modalityKey: reference.modalityKey,
      competence: competenceWindow.competenceLabel
    },
    sourceTrace: {
      ...consultation.sourceTrace,
      origem_documental: [reference.sourceUrl],
      origem_api: [...consultation.sourceTrace.origem_api, `SGS ${reference.seriesCode}`],
      inferencia_controlada: reference.approximationLabel
        ? [...consultation.sourceTrace.inferencia_controlada, reference.approximationLabel]
        : consultation.sourceTrace.inferencia_controlada
    },
    payload: {
      title: reference.seriesLabel,
      items: consultation.payload.items.map((item, index) => ({
        ...item,
        label: index === 0 ? `${reference.modalityLabel} | ${competenceWindow.competenceLabel}` : item.label,
        metadata: {
          ...item.metadata,
          modalityKey: reference.modalityKey,
          competence: competenceWindow.competenceLabel,
          sourceUrl: reference.sourceUrl
        }
      }))
    }
  };
}
