import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getClaraStructuredCore } from "@/server/services/clara/get-clara-structured-core";

export type ClaraContextualTaskType =
  | "analisar-caso"
  | "checklist-documental"
  | "sugerir-proximos-passos";

type ClaraExecutionLog = {
  executionId: string;
  createdAt: string;
  clientId: string;
  caseId: string;
  taskType: ClaraContextualTaskType;
  contextSnapshot: {
    clientId: string;
    caseId: string;
    processId: string | null;
    documentId: string | null;
    niche: string;
    stage: string;
    workflowStep: string;
  };
  sourceTrace: {
    origem_interna: string[];
    origem_documental: string[];
    origem_api: string[];
    inferencia_controlada: string[];
  };
  summary: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const EXECUTION_STORE_PATH = path.join(DATA_DIR, "clara-executions.json");

async function ensureExecutionStore() {
  try {
    await mkdir(DATA_DIR, { recursive: true });

    try {
      await readFile(EXECUTION_STORE_PATH, "utf8");
    } catch {
      await writeFile(EXECUTION_STORE_PATH, JSON.stringify({ executions: [] }, null, 2), "utf8");
    }

    return true;
  } catch {
    return false;
  }
}

async function appendExecutionLog(log: ClaraExecutionLog) {
  const storeReady = await ensureExecutionStore();

  if (!storeReady) {
    return;
  }

  try {
    const raw = await readFile(EXECUTION_STORE_PATH, "utf8");
    const store = JSON.parse(raw) as { executions: ClaraExecutionLog[] };

    store.executions.unshift(log);
    await writeFile(EXECUTION_STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Ignore non-persistent runtimes and keep the response flow alive.
  }
}

export async function getClaraContextualAnalysis(params: {
  clientId?: string;
  caseId?: string;
  processId?: string;
  documentId?: string;
  taskType?: ClaraContextualTaskType;
}) {
  if (!params.clientId || !params.caseId || !params.taskType) {
    throw new Error(
      "Clara exige clientId, caseId e taskType para executar analise contextual minima."
    );
  }

  const structuredCore = await getClaraStructuredCore({
    clientId: params.clientId,
    caseId: params.caseId,
    processId: params.processId,
    documentId: params.documentId,
    strict: true
  });
  const executionId = `clara-exec-${Date.now()}`;
  const contextSnapshot = {
    clientId: structuredCore.context.client.id,
    caseId: structuredCore.context.bankingCase.id,
    processId: structuredCore.context.process?.id ?? null,
    documentId: structuredCore.context.selectedDocument?.id ?? null,
    niche: structuredCore.classification.nicheId,
    stage: structuredCore.context.bankingCase.stage,
    workflowStep: structuredCore.context.bankingCase.workflowState.currentStepId
  };
  const sourceTrace = structuredCore.classification.sourceTrail;

  await appendExecutionLog({
    executionId,
    createdAt: new Date().toISOString(),
    clientId: structuredCore.context.client.id,
    caseId: structuredCore.context.bankingCase.id,
    taskType: params.taskType,
    contextSnapshot,
    sourceTrace,
    summary: structuredCore.summary
  });

  return {
    executionId,
    taskType: params.taskType,
    contextSnapshot,
    sourceTrace,
    summary: structuredCore.summary,
    caseAnalysis: {
      confirmedFacts: structuredCore.confirmedFacts,
      documentsFound: structuredCore.documentsFound,
      documentsMissing: structuredCore.documentsMissing,
      risks: structuredCore.risks,
      suggestions: [
        structuredCore.nextStep,
        structuredCore.recommendation,
        ...structuredCore.checklist.slice(0, 2)
      ]
    }
  };
}
