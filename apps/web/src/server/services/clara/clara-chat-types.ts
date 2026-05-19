export type ClaraChatIntent =
  | "analisar-caso"
  | "checklist-documental"
  | "sugerir-proximos-passos"
  | "gerar-peca"
  | "revisar-minuta"
  | "consultar-jurisprudencia"
  | "acompanhar-processo"
  | "fallback";

export type ClaraChatMessageRole = "user" | "assistant";

export type ClaraChatMessageStatus = "completed" | "fallback";

export type ClaraChatThreadSource = "dossie" | "workspace";

export type ClaraChatMessage = {
  id: string;
  role: ClaraChatMessageRole;
  text: string;
  createdAt: string;
  intent?: ClaraChatIntent;
  status?: ClaraChatMessageStatus;
  sourceTrace?: {
    origem_interna?: string[];
    origem_documental?: string[];
    origem_api?: string[];
    inferencia_controlada?: string[];
  };
  metadata?: Record<string, string>;
};

export type ClaraChatThread = {
  id: string;
  clientId: string;
  caseId: string;
  processId: string | null;
  documentId: string | null;
  source: ClaraChatThreadSource;
  status: "active";
  createdAt: string;
  updatedAt: string;
  messages: ClaraChatMessage[];
};

export type ClaraChatContext = {
  clientId: string;
  caseId: string;
  processId?: string;
  documentId?: string;
  source: ClaraChatThreadSource;
};

export type ClaraChatRouteRequest = ClaraChatContext & {
  threadId?: string;
  message: string;
};

export type ClaraChatResolution = {
  intent: ClaraChatIntent;
  usedFallback: boolean;
};

export type ClaraChatRouteResponse = {
  ok: true;
  data: {
    threadId: string;
    messages: ClaraChatMessage[];
    resolution?: ClaraChatResolution;
  };
};
