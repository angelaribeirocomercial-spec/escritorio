import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  getClaraAgendaArtifact,
  getClaraCaseArtifact,
  getClaraClientArtifact,
  getClaraComparisonArtifact,
  getClaraDeadlineArtifact,
  getClaraProcessArtifact,
  getClaraRevisionalAgendaArtifact,
  getClaraRevisionalFilingPackageArtifact,
  getClaraRevisionalTaskArtifact,
  getClaraTaskArtifact,
  getClaraTextDraftArtifact
} from "@/server/services/clara/get-clara-artifacts";

type ClaraRecordKind =
  | "agenda"
  | "deadline"
  | "task"
  | "text-draft"
  | "comparison"
  | "filing-package"
  | "process"
  | "case"
  | "client";

export type ClaraRecordWorkflowStatus =
  | "created"
  | "reviewed"
  | "completed";

export type ClaraRecordHistoryEvent =
  | "created"
  | "workflow-transition"
  | "review-note-updated"
  | "content-updated";

export type ClaraRecordHistoryEntry = {
  id: string;
  at: string;
  event: ClaraRecordHistoryEvent;
  actor: "clara";
  detail: string;
  metadata?: Record<string, string>;
};

type ClaraRecordPayload =
  | Awaited<ReturnType<typeof getClaraAgendaArtifact>>
  | Awaited<ReturnType<typeof getClaraCaseArtifact>>
  | Awaited<ReturnType<typeof getClaraClientArtifact>>
  | Awaited<ReturnType<typeof getClaraDeadlineArtifact>>
  | Awaited<ReturnType<typeof getClaraProcessArtifact>>
  | Awaited<ReturnType<typeof getClaraRevisionalAgendaArtifact>>
  | Awaited<ReturnType<typeof getClaraRevisionalFilingPackageArtifact>>
  | Awaited<ReturnType<typeof getClaraRevisionalTaskArtifact>>
  | Awaited<ReturnType<typeof getClaraTaskArtifact>>
  | Awaited<ReturnType<typeof getClaraTextDraftArtifact>>
  | Awaited<ReturnType<typeof getClaraComparisonArtifact>>;

export type ClaraRecord = {
  id: string;
  kind: ClaraRecordKind;
  createdAt: string;
  updatedAt: string;
  sourceAction: string;
  targetPath: string;
  workflowStatus: ClaraRecordWorkflowStatus;
  editedTitle?: string;
  editedDetail?: string;
  reviewNote?: string;
  history: ClaraRecordHistoryEntry[];
  payload: ClaraRecordPayload;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "clara-records.json");

async function ensureStore() {
  try {
    await mkdir(DATA_DIR, { recursive: true });

    try {
      await readFile(STORE_PATH, "utf8");
    } catch {
      await writeFile(STORE_PATH, JSON.stringify({ records: [] }, null, 2), "utf8");
    }

    return true;
  } catch {
    return false;
  }
}

async function readStore(): Promise<{ records: ClaraRecord[] }> {
  const storeReady = await ensureStore();

  if (!storeReady) {
    return { records: [] };
  }

  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const store = JSON.parse(raw) as { records: ClaraRecord[] };

    return {
      records: store.records.map(normalizeRecord)
    };
  } catch {
    return { records: [] };
  }
}

async function writeStore(store: { records: ClaraRecord[] }) {
  const storeReady = await ensureStore();

  if (!storeReady) {
    return;
  }

  try {
    await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Ignore non-persistent environments such as serverless preview/runtime.
  }
}

function buildRecordId(kind: ClaraRecordKind) {
  return `clara-${kind}-${Date.now()}`;
}

function buildHistoryEntry(input: {
  event: ClaraRecordHistoryEvent;
  detail: string;
  metadata?: Record<string, string>;
}): ClaraRecordHistoryEntry {
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    event: input.event,
    actor: "clara",
    detail: input.detail,
    metadata: input.metadata
  };
}

function normalizeRecord(record: ClaraRecord): ClaraRecord {
  if (record.history?.length) {
    return record;
  }

  return {
    ...record,
    history: [
      buildHistoryEntry({
        event: "created",
        detail: `Registro ${record.kind} criado a partir da acao ${record.sourceAction}.`,
        metadata: {
          workflowStatus: record.workflowStatus,
          sourceAction: record.sourceAction
        }
      })
    ]
  };
}

function readDraftParamsFromTargetPath(targetPath: string) {
  const url = new URL(targetPath, "http://localhost");

  return {
    objective: url.searchParams.get("objetivo") ?? undefined,
    piece: url.searchParams.get("piece") ?? undefined
  };
}

export async function createClaraRecord(input: {
  kind: ClaraRecordKind;
  sourceAction: string;
  targetPath: string;
  clientId?: string;
  processId?: string;
  caseId?: string;
  taskId?: string;
  documentId?: string;
  documentId2?: string;
  piece?: string;
  deadlineAction?: string;
  focus?: string;
  objective?: string;
}) {
  let payload: ClaraRecordPayload;

  switch (input.kind) {
    case "agenda":
      payload =
        input.focus === "revisional"
          ? await getClaraRevisionalAgendaArtifact({
              caseId: input.caseId,
              clientId: input.clientId,
              committed: true,
              documentId: input.documentId,
              objective: input.objective,
              processId: input.processId
            })
          : await getClaraAgendaArtifact(input.clientId, input.caseId, true);
      break;
    case "deadline":
      payload = await getClaraDeadlineArtifact(input.deadlineAction, true);
      break;
    case "task":
      payload =
        input.focus === "revisional"
          ? await getClaraRevisionalTaskArtifact({
              caseId: input.caseId,
              clientId: input.clientId,
              committed: true,
              documentId: input.documentId,
              objective: input.objective,
              processId: input.processId
            })
          : await getClaraTaskArtifact(input.taskId, input.caseId, true);
      break;
    case "process":
      payload = await getClaraProcessArtifact(
        input.processId,
        input.clientId,
        input.documentId,
        true
      );
      break;
    case "case":
      payload = await getClaraCaseArtifact(input.caseId, true);
      break;
    case "client":
      payload = await getClaraClientArtifact(input.clientId, input.caseId, true);
      break;
    case "text-draft":
      {
        const targetDraftParams = readDraftParamsFromTargetPath(input.targetPath);
      payload = await getClaraTextDraftArtifact({
        caseId: input.caseId,
        committed: true,
        documentId: input.documentId,
        objective: input.objective ?? targetDraftParams.objective,
        piece: input.piece ?? targetDraftParams.piece
      });
      }
      break;
    case "comparison":
      payload = await getClaraComparisonArtifact(input.documentId, input.documentId2, true);
      break;
    case "filing-package":
      payload = await getClaraRevisionalFilingPackageArtifact({
        caseId: input.caseId,
        clientId: input.clientId,
        committed: true,
        documentId: input.documentId,
        objective: input.objective,
        processId: input.processId
      });
      break;
  }

  const record: ClaraRecord = {
    id: buildRecordId(input.kind),
    kind: input.kind,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payload,
    sourceAction: input.sourceAction,
    targetPath: input.targetPath,
    workflowStatus: "created",
    history: [
      buildHistoryEntry({
        event: "created",
        detail: `Registro ${input.kind} criado a partir da acao ${input.sourceAction}.`,
        metadata: {
          workflowStatus: "created",
          sourceAction: input.sourceAction,
          targetPath: input.targetPath
        }
      })
    ]
  };

  const store = await readStore();
  store.records.unshift(record);
  await writeStore(store);

  return record;
}

export async function getClaraRecord(recordId?: string | null) {
  if (!recordId) {
    return null;
  }

  const store = await readStore();
  return store.records.find((record) => record.id === recordId) ?? null;
}

export async function listClaraRecords(limit = 12) {
  const store = await readStore();
  return store.records.slice(0, limit);
}

export async function updateClaraRecordWorkflowStatus(
  recordId: string,
  workflowStatus: ClaraRecordWorkflowStatus
) {
  const store = await readStore();
  const record = store.records.find((item) => item.id === recordId);

  if (!record) {
    return null;
  }

  const previousStatus = record.workflowStatus;
  record.workflowStatus = workflowStatus;
  record.updatedAt = new Date().toISOString();
  record.history.push(
    buildHistoryEntry({
      event: "workflow-transition",
      detail: `Status alterado de ${previousStatus} para ${workflowStatus}.`,
      metadata: {
        from: previousStatus,
        to: workflowStatus
      }
    })
  );

  await writeStore(store);

  return record;
}

export async function updateClaraRecordReviewNote(recordId: string, reviewNote: string) {
  const store = await readStore();
  const record = store.records.find((item) => item.id === recordId);

  if (!record) {
    return null;
  }

  record.reviewNote = reviewNote.trim();
  record.updatedAt = new Date().toISOString();
  record.history.push(
    buildHistoryEntry({
      event: "review-note-updated",
      detail: record.reviewNote
        ? "Observacao de revisao humana atualizada."
        : "Observacao de revisao humana removida.",
      metadata: {
        hasReviewNote: record.reviewNote ? "true" : "false"
      }
    })
  );

  await writeStore(store);

  return record;
}

export async function updateClaraRecordContent(input: {
  recordId: string;
  editedTitle: string;
  editedDetail: string;
}) {
  const store = await readStore();
  const record = store.records.find((item) => item.id === input.recordId);

  if (!record) {
    return null;
  }

  record.editedTitle = input.editedTitle.trim();
  record.editedDetail = input.editedDetail.trim();
  record.updatedAt = new Date().toISOString();
  record.history.push(
    buildHistoryEntry({
      event: "content-updated",
      detail: "Conteudo revisado do registro atualizado.",
      metadata: {
        hasEditedTitle: record.editedTitle ? "true" : "false",
        hasEditedDetail: record.editedDetail ? "true" : "false"
      }
    })
  );

  await writeStore(store);

  return record;
}

export function getClaraRecordDisplay(
  record: ClaraRecord | null,
  fallbackTitle: string,
  fallbackDetail: string
) {
  return {
    title: record?.editedTitle || fallbackTitle,
    detail: record?.editedDetail || fallbackDetail,
    reviewNote: record?.reviewNote || "",
    workflowStatus: record?.workflowStatus || "created"
  };
}
