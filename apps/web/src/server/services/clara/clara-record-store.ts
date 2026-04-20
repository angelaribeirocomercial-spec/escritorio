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
  payload: ClaraRecordPayload;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "clara-records.json");

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(STORE_PATH, "utf8");
  } catch {
    await writeFile(STORE_PATH, JSON.stringify({ records: [] }, null, 2), "utf8");
  }
}

async function readStore(): Promise<{ records: ClaraRecord[] }> {
  await ensureStore();
  const raw = await readFile(STORE_PATH, "utf8");
  return JSON.parse(raw) as { records: ClaraRecord[] };
}

async function writeStore(store: { records: ClaraRecord[] }) {
  await ensureStore();
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function buildRecordId(kind: ClaraRecordKind) {
  return `clara-${kind}-${Date.now()}`;
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
      payload = await getClaraTextDraftArtifact({
        caseId: input.caseId,
        committed: true,
        documentId: input.documentId,
        piece: input.piece
      });
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
    workflowStatus: "created"
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

  record.workflowStatus = workflowStatus;
  record.updatedAt = new Date().toISOString();

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
