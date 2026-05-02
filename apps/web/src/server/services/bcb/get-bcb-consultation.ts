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
