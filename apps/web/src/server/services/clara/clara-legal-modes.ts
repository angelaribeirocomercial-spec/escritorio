import type { ClaraContextualTaskType } from "@/server/services/clara/get-clara-contextual-analysis";
import type { ClaraStructuredCore } from "@/server/services/clara/get-clara-structured-core";

type SourceTrace = {
  origem_interna: string[];
  origem_documental: string[];
  origem_api: string[];
  inferencia_controlada: string[];
};

export type ClaraLegalModeId =
  | "triagem"
  | "estrategia"
  | "intimacao"
  | "peca"
  | "jurisprudencia"
  | "acompanhamento"
  | "revisao";

export type ClaraLegalMode = {
  id: ClaraLegalModeId;
  label: string;
  tab: string;
  taskType: ClaraContextualTaskType;
  summary: string;
};

export type ClaraStructuredResponse = {
  mode: ClaraLegalMode;
  factsConfirmed: string[];
  pendingItems: string[];
  risks: string[];
  legalSuggestion: string;
  nextAction: string;
  sourceBuckets: SourceTrace;
  reviewStatus: string;
};

const LEGAL_MODES: ClaraLegalMode[] = [
  {
    id: "triagem",
    label: "Triagem",
    tab: "analise",
    taskType: "analisar-caso",
    summary: "Leitura inicial do caso, documentos base e seguranca probatoria."
  },
  {
    id: "estrategia",
    label: "Estrategia",
    tab: "proximos-passos",
    taskType: "sugerir-proximos-passos",
    summary: "Direcao juridica, riscos e proxima acao operacional."
  },
  {
    id: "intimacao",
    label: "Intimacao",
    tab: "intimacao",
    taskType: "analisar-intimacao",
    summary: "Leitura do ato, prazo, providencia e risco imediato."
  },
  {
    id: "peca",
    label: "Peca",
    tab: "pecas",
    taskType: "gerar-peca",
    summary: "Preparacao da minuta com base em fatos confirmados e revisao humana."
  },
  {
    id: "jurisprudencia",
    label: "Jurisprudencia",
    tab: "jurisprudencia",
    taskType: "consultar-jurisprudencia",
    summary: "Consulta e triagem de precedentes com rastreabilidade de fonte."
  },
  {
    id: "acompanhamento",
    label: "Acompanhamento",
    tab: "checklist",
    taskType: "acompanhar-processo",
    summary: "Pendencias, prova faltante e continuidade operacional do caso."
  },
  {
    id: "revisao",
    label: "Revisao",
    tab: "comparador",
    taskType: "revisar-minuta",
    summary: "Comparacao, reforco de consistencia e bloqueio de uso sem validacao humana."
  }
];

export function listClaraLegalModes() {
  return LEGAL_MODES;
}

export function getClaraLegalModeByTab(tab: string) {
  return LEGAL_MODES.find((mode) => mode.tab === tab) ?? LEGAL_MODES[0];
}

export function buildClaraStructuredResponse(params: {
  tab: string;
  structuredCore: ClaraStructuredCore;
  sourceTrace?: SourceTrace | null;
}) {
  const mode = getClaraLegalModeByTab(params.tab);
  const sourceBuckets = params.sourceTrace ?? params.structuredCore.classification.sourceTrail;
  const pendingItems =
    params.structuredCore.documentsMissing.length > 0
      ? params.structuredCore.documentsMissing
      : ["Nenhuma pendencia documental essencial aberta no contexto atual."];
  const legalSuggestion = (() => {
    switch (mode.id) {
      case "estrategia":
        return params.structuredCore.recommendation;
      case "intimacao":
        return "Separar o ato processual, confirmar prazo e preparar resposta sem tratar hipotese como fato.";
      case "peca":
        return "Redigir apenas com fatos confirmados e manter campos ausentes bloqueados para revisao humana.";
      case "jurisprudencia":
        return "Usar somente precedente com fonte rastreavel; sem consulta confirmada, tratar como sugestao de pesquisa.";
      case "acompanhamento":
        return "Priorizar prova faltante, pendencia operacional e etapa que destrava a proxima medida juridica.";
      case "revisao":
        return "Conferir coerencia entre fatos, prova, fundamentos e texto antes de liberar qualquer documento.";
      default:
        return params.structuredCore.recommendation;
    }
  })();

  return {
    mode,
    factsConfirmed: params.structuredCore.confirmedFacts.slice(0, 5),
    pendingItems: pendingItems.slice(0, 5),
    risks: params.structuredCore.risks.slice(0, 4),
    legalSuggestion,
    nextAction: params.structuredCore.nextStep,
    sourceBuckets,
    reviewStatus: "Revisao humana final obrigatoria antes de concluir ou protocolar."
  } satisfies ClaraStructuredResponse;
}
