type DataJudStatus = "consulted" | "unavailable" | "failed";

type ResolvedDataJudProcess = {
  id: string;
  caseId: string;
  clientId: string;
  processNumber: string;
  tribunal: string;
};

export type DataJudProcessConsultation = {
  status: DataJudStatus;
  tribunalAlias: string;
  tribunalLabel: string;
  processNumber: string;
  processNumberDigits: string;
  endpoint: string;
  consultedAt?: string;
  summary: string;
  query: {
    size: number;
    query: {
      bool: {
        must: Array<{ term: Record<string, string> }>;
      };
    };
  };
  sourceTrace: {
    origem_interna: string[];
    origem_documental: string[];
    origem_api: string[];
    inferencia_controlada: string[];
  };
  hits: Array<{
    tribunal: string;
    numeroProcesso: string;
    id: string;
    grau?: string;
    dataAjuizamento?: string;
  }>;
  failureReason?: string;
};

type TribunalAliasMap = Record<string, { alias: string; label: string }>;

const DATAJUD_TRIBUNAL_ALIASES: TribunalAliasMap = {
  TJSP: { alias: "api_publica_tjsp", label: "Tribunal de Justica de Sao Paulo" },
  TJRJ: { alias: "api_publica_tjrj", label: "Tribunal de Justiça do Rio de Janeiro" },
  TJMG: { alias: "api_publica_tjmg", label: "Tribunal de Justiça de Minas Gerais" },
  TJBA: { alias: "api_publica_tjba", label: "Tribunal de Justiça da Bahia" },
  TJRS: { alias: "api_publica_tjrs", label: "Tribunal de Justiça do Rio Grande do Sul" },
  TJPR: { alias: "api_publica_tjpr", label: "Tribunal de Justiça do Paraná" },
  TJSC: { alias: "api_publica_tjsc", label: "Tribunal de Justiça de Santa Catarina" },
  TJPE: { alias: "api_publica_tjpe", label: "Tribunal de Justiça de Pernambuco" },
  TJRN: { alias: "api_publica_tjrn", label: "Tribunal de Justiça do Rio Grande do Norte" },
  TJDFT: { alias: "api_publica_tjdft", label: "TJ do Distrito Federal e Territórios" },
  TJGO: { alias: "api_publica_tjgo", label: "Tribunal de Justiça do Goiás" },
  TJCE: { alias: "api_publica_tjce", label: "Tribunal de Justiça do Ceará" },
  TJPA: { alias: "api_publica_tjpa", label: "Tribunal de Justiça do Pará" },
  TJPI: { alias: "api_publica_tjpi", label: "Tribunal de Justiça do Piauí" },
  TJAL: { alias: "api_publica_tjal", label: "Tribunal de Justiça de Alagoas" },
  TJAM: { alias: "api_publica_tjam", label: "Tribunal de Justiça do Amazonas" },
  TJAC: { alias: "api_publica_tjac", label: "Tribunal de Justiça do Acre" },
  TJRO: { alias: "api_publica_tjro", label: "Tribunal de Justiça de Rondônia" },
  TJRR: { alias: "api_publica_tjrr", label: "Tribunal de Justiça de Roraima" },
  TJSE: { alias: "api_publica_tjse", label: "Tribunal de Justiça de Sergipe" },
  TJES: { alias: "api_publica_tjes", label: "Tribunal de Justiça do Espírito Santo" },
  TJMT: { alias: "api_publica_tjmt", label: "Tribunal de Justiça do Mato Grosso" },
  TJMS: { alias: "api_publica_tjms", label: "Tribunal de Justiça do Mato Grosso do Sul" },
  TJTO: { alias: "api_publica_tjto", label: "Tribunal de Justiça do Tocantins" },
  TST: { alias: "api_publica_tst", label: "Tribunal Superior do Trabalho" },
  TSE: { alias: "api_publica_tse", label: "Tribunal Superior Eleitoral" },
  STJ: { alias: "api_publica_stj", label: "Tribunal Superior de Justiça" },
  STM: { alias: "api_publica_stm", label: "Tribunal Superior Militar" },
  TRF1: { alias: "api_publica_trf1", label: "Tribunal Regional Federal da 1ª Região" },
  TRF2: { alias: "api_publica_trf2", label: "Tribunal Regional Federal da 2ª Região" },
  TRF3: { alias: "api_publica_trf3", label: "Tribunal Regional Federal da 3ª Região" },
  TRF4: { alias: "api_publica_trf4", label: "Tribunal Regional Federal da 4ª Região" },
  TRF5: { alias: "api_publica_trf5", label: "Tribunal Regional Federal da 5ª Região" },
  TRF6: { alias: "api_publica_trf6", label: "Tribunal Regional Federal da 6ª Região" }
};

function normalizeTribunal(tribunal: string) {
  const raw = tribunal.trim().toUpperCase();
  return DATAJUD_TRIBUNAL_ALIASES[raw] ?? null;
}

function normalizeProcessNumber(processNumber: string) {
  return processNumber.replace(/\D/g, "");
}

const FALLBACK_PROCESS_CATALOG: Record<string, ResolvedDataJudProcess> = {
  "1008421-19.2026.8.26.0100": {
    id: "proc-101",
    caseId: "case-101",
    clientId: "cl-001",
    processNumber: "1008421-19.2026.8.26.0100",
    tribunal: "TJSP"
  },
  "5011274-65.2026.8.19.0001": {
    id: "proc-205",
    caseId: "case-205",
    clientId: "cl-002",
    processNumber: "5011274-65.2026.8.19.0001",
    tribunal: "TJRJ"
  },
  "7012844-11.2026.8.13.0024": {
    id: "proc-311",
    caseId: "case-311",
    clientId: "cl-003",
    processNumber: "7012844-11.2026.8.13.0024",
    tribunal: "TJMG"
  },
  "7012855-49.2026.8.13.0024": {
    id: "proc-312",
    caseId: "case-312",
    clientId: "cl-003",
    processNumber: "7012855-49.2026.8.13.0024",
    tribunal: "TJMG"
  }
};

async function resolveProcessByNumber(processNumber: string) {
  try {
    const { getProcesses } = await import("@/server/services/processes/get-processes");
    const processes = await getProcesses();
    const resolved = processes.find((process) => process.processNumber === processNumber);

    if (resolved) {
      return resolved;
    }
  } catch {
    // Fall back to the seeded process catalog below.
  }

  return FALLBACK_PROCESS_CATALOG[processNumber] ?? null;
}

function buildUnavailablePayload(params: {
  processNumber: string;
  tribunalLabel: string;
  tribunalAlias: string;
  reason: string;
}): DataJudProcessConsultation {
  return {
    status: "unavailable",
    tribunalAlias: params.tribunalAlias,
    tribunalLabel: params.tribunalLabel,
    processNumber: params.processNumber,
    processNumberDigits: normalizeProcessNumber(params.processNumber),
    endpoint: `https://api-publica.datajud.cnj.jus.br/${params.tribunalAlias}/_search`,
    summary:
      "Consulta DataJud preparada, mas a execucao real ainda depende de credencial publica configurada no ambiente.",
    query: {
      size: 1,
      query: {
        bool: {
          must: [{ term: { numeroProcesso: normalizeProcessNumber(params.processNumber) } }]
        }
      }
    },
    sourceTrace: {
      origem_interna: [`Processo ${params.processNumber}`],
      origem_documental: [],
      origem_api: [],
      inferencia_controlada: [params.reason]
    },
    hits: [],
    failureReason: params.reason
  };
}

export async function getDataJudProcessConsultation(processNumber: string) {
  const bankingProcess = await resolveProcessByNumber(processNumber);

  if (!bankingProcess) {
    return buildUnavailablePayload({
      processNumber,
      tribunalLabel: "Tribunal nao resolvido",
      tribunalAlias: "alias-desconhecido",
      reason:
        "Nao foi possivel resolver o processo na base local. A consulta DataJud permanece controlada."
    });
  }

  const tribunal = normalizeTribunal(bankingProcess.tribunal);

  if (!tribunal) {
    return buildUnavailablePayload({
      processNumber,
      tribunalLabel: bankingProcess.tribunal,
      tribunalAlias: "alias-desconhecido",
      reason: `Tribunal ${bankingProcess.tribunal} nao mapeado para alias do DataJud.`
    });
  }

  const baseUrl = globalThis.process.env.DATAJUD_API_BASE_URL ?? "https://api-publica.datajud.cnj.jus.br";
  const apiKey = globalThis.process.env.DATAJUD_API_KEY;
  const endpoint = `${baseUrl}/${tribunal.alias}/_search`;

  if (!apiKey) {
    return buildUnavailablePayload({
      processNumber,
      tribunalLabel: tribunal.label,
      tribunalAlias: tribunal.alias,
      reason: "DATAJUD_API_KEY nao configurada. Consulta real nao executada."
    });
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `APIKey ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      size: 1,
      query: {
        bool: {
          must: [{ term: { numeroProcesso: normalizeProcessNumber(processNumber) } }]
        }
      }
    })
  });

  if (!response.ok) {
    return buildUnavailablePayload({
      processNumber,
      tribunalLabel: tribunal.label,
      tribunalAlias: tribunal.alias,
      reason: `DataJud respondeu com status ${response.status}.`
    });
  }

  const json = (await response.json()) as {
    hits?: {
      hits?: Array<{
        _source?: {
          tribunal?: string;
          numeroProcesso?: string;
          id?: string;
          grau?: string;
          dataAjuizamento?: string;
        };
      }>;
    };
  };

  const hits =
    json.hits?.hits?.flatMap((hit) =>
      hit._source
        ? [
            {
              tribunal: hit._source.tribunal ?? tribunal.label,
              numeroProcesso: hit._source.numeroProcesso ?? normalizeProcessNumber(processNumber),
              id: hit._source.id ?? `${tribunal.alias}:${processNumber}`,
              grau: hit._source.grau,
              dataAjuizamento: hit._source.dataAjuizamento
            }
          ]
        : []
    ) ?? [];

  return {
    status: "consulted" as const,
    tribunalAlias: tribunal.alias,
    tribunalLabel: tribunal.label,
    processNumber,
    processNumberDigits: normalizeProcessNumber(processNumber),
    endpoint,
    consultedAt: new Date().toISOString(),
    summary: `DataJud consultado para o processo ${processNumber} no contexto de ${bankingProcess.tribunal}.`,
    query: {
      size: 1,
      query: {
        bool: {
          must: [{ term: { numeroProcesso: normalizeProcessNumber(processNumber) } }]
        }
      }
    },
    sourceTrace: {
      origem_interna: [`Processo ${bankingProcess.id}`, `Caso ${bankingProcess.caseId}`, `Cliente ${bankingProcess.clientId}`],
      origem_documental: [],
      origem_api: [`DataJud ${tribunal.alias}`],
      inferencia_controlada: [
        "Consulta oficial executada via adaptador server-side com autenticacao condicional."
      ]
    },
    hits
  };
}

