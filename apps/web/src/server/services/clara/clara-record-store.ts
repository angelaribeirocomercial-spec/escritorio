import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  type ClaraTextDraftRecord,
  syncClaraTextDraftRecord,
  syncClaraTextDraftReviewNote
} from "@/server/services/clara/clara-minutas-store";
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

type ClaraRecordContext = {
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
  tenantId?: string;
};

type ClaraStoredEnvelope = {
  record: ClaraRecord;
  context: ClaraRecordContext;
};

type ClaraLocalStoreEntry = ClaraRecord | ClaraStoredEnvelope;

type ClaraLocalStore = {
  records: ClaraLocalStoreEntry[];
};

type ClaraLogRow = {
  id: string;
  tenant_id: string;
  execution_id: string;
  task_type: string;
  input_payload: unknown;
  output_payload: unknown;
  source_trace: unknown;
  status: "success" | "warning" | "failed";
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type ClaraReviewRow = {
  id: string;
  tenant_id: string;
  minuta_id: string | null;
  case_id: string | null;
  review_note: string;
  status_revisao: "pending" | "approved" | "rejected";
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type ClaraSupabaseSource = {
  session: NonNullable<Awaited<ReturnType<typeof getWorkspaceSession>>>;
  supabase: ReturnType<typeof getSupabaseAdminClient>;
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

function buildRecordId(kind: ClaraRecordKind) {
  return `clara-${kind}-${randomUUID()}`;
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

function buildRecordContext(input: {
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
  tenantId?: string;
}): ClaraRecordContext {
  return {
    kind: input.kind,
    sourceAction: input.sourceAction,
    targetPath: input.targetPath,
    clientId: input.clientId,
    processId: input.processId,
    caseId: input.caseId,
    taskId: input.taskId,
    documentId: input.documentId,
    documentId2: input.documentId2,
    piece: input.piece,
    deadlineAction: input.deadlineAction,
    focus: input.focus,
    objective: input.objective,
    tenantId: input.tenantId
  };
}

function mapWorkflowStatusToLogStatus(
  workflowStatus: ClaraRecordWorkflowStatus
): ClaraLogRow["status"] {
  switch (workflowStatus) {
    case "reviewed":
      return "warning";
    case "completed":
    case "created":
    default:
      return "success";
  }
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asHistoryEntries(value: unknown): ClaraRecordHistoryEntry[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const entries: ClaraRecordHistoryEntry[] = [];

  for (const item of value) {
    if (!isObjectRecord(item)) {
      continue;
    }

    const id = asString(item.id);
    const at = asString(item.at);
    const event = asString(item.event) as ClaraRecordHistoryEvent | undefined;
    const detail = asString(item.detail);
    const actor = asString(item.actor) as "clara" | undefined;

    if (!id || !at || !event || !detail || actor !== "clara") {
      continue;
    }

    const metadataRecord = isObjectRecord(item.metadata)
      ? Object.fromEntries(
          Object.entries(item.metadata).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string"
          )
        )
      : undefined;

    const metadata =
      metadataRecord && Object.keys(metadataRecord).length > 0 ? metadataRecord : undefined;

    entries.push({
      id,
      at,
      event,
      actor,
      detail,
      metadata
    });
  }

  return entries.length > 0 ? entries : undefined;
}

function normalizeRecordPayload(record: ClaraRecordPayload): ClaraRecordPayload {
  return record;
}

function extractStoredRecord(value: unknown): ClaraRecord | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const recordCandidate = isObjectRecord(value.record) ? value.record : value;

  const id = asString(recordCandidate.id);
  const kind = asString(recordCandidate.kind) as ClaraRecordKind | undefined;
  const createdAt = asString(recordCandidate.createdAt) ?? asString(recordCandidate.created_at);
  const updatedAt = asString(recordCandidate.updatedAt) ?? asString(recordCandidate.updated_at);
  const sourceAction = asString(recordCandidate.sourceAction) ?? "";
  const targetPath = asString(recordCandidate.targetPath) ?? "";
  const workflowStatus = asString(recordCandidate.workflowStatus) as
    | ClaraRecordWorkflowStatus
    | undefined;
  const payload = recordCandidate.payload;

  if (!id || !kind || !createdAt || !updatedAt || !workflowStatus || !isObjectRecord(payload)) {
    return null;
  }

  const history = asHistoryEntries(recordCandidate.history) ?? [
    buildHistoryEntry({
      event: "created",
      detail: `Registro ${kind} recuperado do armazenamento persistente.`,
      metadata: {
        workflowStatus,
        sourceAction
      }
    })
  ];

  return normalizeRecord({
    id,
    kind,
    createdAt,
    updatedAt,
    sourceAction,
    targetPath,
    workflowStatus,
    editedTitle: asString(recordCandidate.editedTitle),
    editedDetail: asString(recordCandidate.editedDetail),
    reviewNote: asString(recordCandidate.reviewNote),
    history,
    payload: normalizeRecordPayload(payload as ClaraRecordPayload)
  });
}

function extractEnvelope(value: unknown): ClaraStoredEnvelope | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const record = extractStoredRecord(value.record ?? value);

  if (!record) {
    return null;
  }

  const contextCandidate = isObjectRecord(value.context) ? value.context : value;

  return {
    record,
    context: buildRecordContext({
      kind: record.kind,
      sourceAction: record.sourceAction,
      targetPath: record.targetPath,
      clientId: asString(contextCandidate.clientId),
      processId: asString(contextCandidate.processId),
      caseId: asString(contextCandidate.caseId),
      taskId: asString(contextCandidate.taskId),
      documentId: asString(contextCandidate.documentId),
      documentId2: asString(contextCandidate.documentId2),
      piece: asString(contextCandidate.piece),
      deadlineAction: asString(contextCandidate.deadlineAction),
      focus: asString(contextCandidate.focus),
      objective: asString(contextCandidate.objective),
      tenantId: asString(contextCandidate.tenantId)
    })
  };
}

async function readLocalStore(): Promise<ClaraStoredEnvelope[]> {
  const storeReady = await ensureStore();

  if (!storeReady) {
    return [];
  }

  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const store = JSON.parse(raw) as ClaraLocalStore;

    return (store.records ?? [])
      .map((entry) => extractEnvelope(entry))
      .filter((entry): entry is ClaraStoredEnvelope => entry !== null);
  } catch {
    return [];
  }
}

async function writeLocalStore(entries: ClaraStoredEnvelope[]) {
  const storeReady = await ensureStore();

  if (!storeReady) {
    return;
  }

  try {
    const store: ClaraLocalStore = {
      records: entries
    };

    await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Ignore non-persistent environments such as serverless preview/runtime.
  }
}

async function resolveSupabaseSource(): Promise<ClaraSupabaseSource | null> {
  const session = await getWorkspaceSession();

  if (!session) {
    return null;
  }

  try {
    const supabase = getSupabaseAdminClient();

    return { session, supabase };
  } catch {
    return null;
  }
}

function serializeLogRow(input: {
  record: ClaraRecord;
  context: ClaraRecordContext;
  tenantId: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}): Omit<ClaraLogRow, "created_at" | "updated_at"> & {
  created_at: string;
  updated_at: string;
} {
  const { record, context, tenantId, createdBy, updatedBy } = input;
  const envelope = {
    record,
    context
  };

  return {
    id: record.id,
    tenant_id: tenantId,
    execution_id: record.id,
    task_type: record.kind,
    input_payload: {
      context,
      sourceAction: record.sourceAction,
      targetPath: record.targetPath,
      workflowStatus: record.workflowStatus
    },
    output_payload: envelope,
    source_trace: {
      history: record.history,
      kind: record.kind,
      updatedAt: record.updatedAt
    },
    status: mapWorkflowStatusToLogStatus(record.workflowStatus),
    created_by: createdBy ?? null,
    updated_by: updatedBy ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt
  };
}

function toStoreEnvelope(record: ClaraRecord, context: ClaraRecordContext): ClaraStoredEnvelope {
  return {
    record: normalizeRecord(record),
    context
  };
}

async function persistRecordToSupabase(record: ClaraRecord, context: ClaraRecordContext) {
  const source = await resolveSupabaseSource();

  if (!source) {
    return false;
  }

  const row = serializeLogRow({
    record,
    context,
    tenantId: source.session.workspace.tenant.id,
    createdBy: source.session.userId,
    updatedBy: source.session.userId
  });

  const { error } = await source.supabase
    .from("logs_execucao_clara")
    .upsert(row, { onConflict: "id" });

  if (error) {
    throw new Error(
      `Falha ao persistir registro da Clara no Supabase para o tenant ${source.session.workspace.tenant.id}: ${error.message}`
    );
  }

  return true;
}

async function persistReviewNoteToSupabase(record: ClaraRecord, context: ClaraRecordContext) {
  const source = await resolveSupabaseSource();

  if (!source) {
    return false;
  }

  const caseId = context.caseId ?? null;

  if (!caseId && record.kind !== "text-draft") {
    return true;
  }

  const reviewRow: ClaraReviewRow = {
    id: `review-${record.id}`,
    tenant_id: source.session.workspace.tenant.id,
    minuta_id: record.kind === "text-draft" ? record.id : null,
    case_id: caseId,
    review_note: record.reviewNote ?? "",
    status_revisao: "pending",
    created_by: source.session.userId,
    updated_by: source.session.userId,
    created_at: record.createdAt,
    updated_at: record.updatedAt
  };

  const { error } = await source.supabase
    .from("observacoes_revisor_humano")
    .upsert(reviewRow, { onConflict: "id" });

  if (error) {
    throw new Error(
      `Falha ao persistir observacao da Clara no Supabase para o tenant ${source.session.workspace.tenant.id}: ${error.message}`
    );
  }

  return true;
}

async function writePersistentRecord(record: ClaraRecord, context: ClaraRecordContext) {
  const localEntries = await readLocalStore();
  const nextLocalEntries = [
    toStoreEnvelope(record, context),
    ...localEntries.filter((entry) => entry.record.id !== record.id)
  ];

  await writeLocalStore(nextLocalEntries);

  try {
    await persistRecordToSupabase(record, context);
  } catch (error) {
    console.warn(
      error instanceof Error ? error.message : "Falha ao persistir registro da Clara no Supabase."
    );
  }
}

async function writePersistentReviewNote(record: ClaraRecord, context: ClaraRecordContext) {
  const localEntries = await readLocalStore();
  const nextLocalEntries = localEntries.map((entry) =>
    entry.record.id === record.id ? toStoreEnvelope(record, context) : entry
  );

  await writeLocalStore(nextLocalEntries);

  try {
    await persistReviewNoteToSupabase(record, context);
  } catch (error) {
    console.warn(
      error instanceof Error ? error.message : "Falha ao persistir observacao da Clara no Supabase."
    );
  }
}

async function readPersistentRecords(): Promise<ClaraStoredEnvelope[]> {
  const source = await resolveSupabaseSource();
  const localEntries = await readLocalStore();

  if (!source) {
    return localEntries;
  }

  const { data, error } = await source.supabase
    .from("logs_execucao_clara")
    .select(
      `
        id,
        tenant_id,
        execution_id,
        task_type,
        input_payload,
        output_payload,
        source_trace,
        status,
        created_by,
        updated_by,
        created_at,
        updated_at
      `
    )
    .eq("tenant_id", source.session.workspace.tenant.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn(
      `Falha ao ler registros da Clara no Supabase para o tenant ${source.session.workspace.tenant.id}: ${error.message}`
    );
    return localEntries;
  }

  const remoteEntries: ClaraStoredEnvelope[] = [];

  for (const row of data ?? []) {
    const logRow = row as ClaraLogRow;
    const envelope = extractEnvelope(logRow.output_payload);

    if (!envelope) {
      continue;
    }

    remoteEntries.push({
      record: envelope.record,
      context: {
        ...envelope.context,
        tenantId: envelope.context.tenantId ?? logRow.tenant_id
      }
    });
  }

  const merged = new Map<string, ClaraStoredEnvelope>();

  for (const entry of localEntries) {
    merged.set(entry.record.id, entry);
  }

  for (const entry of remoteEntries) {
    merged.set(entry.record.id, entry);
  }

  return Array.from(merged.values()).sort((left, right) => {
    const rightDate = new Date(right.record.updatedAt).getTime();
    const leftDate = new Date(left.record.updatedAt).getTime();

    return rightDate - leftDate;
  });
}

async function readPersistentRecord(recordId: string): Promise<ClaraStoredEnvelope | null> {
  const source = await resolveSupabaseSource();

  if (source) {
    const { data, error } = await source.supabase
      .from("logs_execucao_clara")
      .select(
        `
          id,
          tenant_id,
          execution_id,
          task_type,
          input_payload,
          output_payload,
          source_trace,
          status,
          created_by,
          updated_by,
          created_at,
          updated_at
        `
      )
      .eq("tenant_id", source.session.workspace.tenant.id)
    .eq("id", recordId)
      .maybeSingle();

    if (!error && data) {
      const envelope = extractEnvelope((data as ClaraLogRow).output_payload);

      if (envelope) {
        return {
          record: envelope.record,
          context: {
            ...envelope.context,
            tenantId: envelope.context.tenantId ?? (data as ClaraLogRow).tenant_id
          }
        };
      }
    }
  }

  const localEntries = await readLocalStore();
  return localEntries.find((entry) => entry.record.id === recordId) ?? null;
}

function buildDraftRecordContext(input: {
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
}): ClaraRecordContext {
  return buildRecordContext({
    ...input,
    tenantId: undefined
  });
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
    case "text-draft": {
      const targetDraftParams = readDraftParamsFromTargetPath(input.targetPath);
      payload = await getClaraTextDraftArtifact({
        caseId: input.caseId,
        committed: true,
        documentId: input.documentId,
        objective: input.objective ?? targetDraftParams.objective,
        piece: input.piece ?? targetDraftParams.piece
      });
      break;
    }
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

  const context = buildDraftRecordContext(input);
  const now = new Date().toISOString();
  const record: ClaraRecord = normalizeRecord({
    id: buildRecordId(input.kind),
    kind: input.kind,
    createdAt: now,
    updatedAt: now,
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
  });

  await writePersistentRecord(record, context);

  if (record.kind === "text-draft") {
    try {
      await syncClaraTextDraftRecord({
        record: record as unknown as ClaraTextDraftRecord,
        context,
        createVersion: true
      });
    } catch (error) {
      console.warn(
        error instanceof Error ? error.message : "Falha ao sincronizar minuta da Clara no Supabase."
      );
    }
  }

  return record;
}

export async function getClaraRecord(recordId?: string | null) {
  if (!recordId) {
    return null;
  }

  const entry = await readPersistentRecord(recordId);
  return entry?.record ?? null;
}

export async function listClaraRecords(limit = 12) {
  const records = await readPersistentRecords();
  return records.slice(0, limit).map((entry) => entry.record);
}

export async function updateClaraRecordWorkflowStatus(
  recordId: string,
  workflowStatus: ClaraRecordWorkflowStatus
) {
  const entry = await readPersistentRecord(recordId);

  if (!entry) {
    return null;
  }

  const previousStatus = entry.record.workflowStatus;
  const updatedRecord = normalizeRecord({
    ...entry.record,
    workflowStatus,
    updatedAt: new Date().toISOString(),
    history: [
      ...entry.record.history,
      buildHistoryEntry({
        event: "workflow-transition",
        detail: `Status alterado de ${previousStatus} para ${workflowStatus}.`,
        metadata: {
          from: previousStatus,
          to: workflowStatus
        }
      })
    ]
  });

  await writePersistentRecord(updatedRecord, entry.context);

  if (updatedRecord.kind === "text-draft") {
    try {
      await syncClaraTextDraftRecord({
        record: updatedRecord as unknown as ClaraTextDraftRecord,
        context: entry.context,
        createVersion: true
      });
    } catch (error) {
      console.warn(
        error instanceof Error ? error.message : "Falha ao sincronizar minuta da Clara no Supabase."
      );
    }
  }

  return updatedRecord;
}

export async function updateClaraRecordReviewNote(recordId: string, reviewNote: string) {
  const entry = await readPersistentRecord(recordId);

  if (!entry) {
    return null;
  }

  const updatedRecord = normalizeRecord({
    ...entry.record,
    reviewNote: reviewNote.trim(),
    updatedAt: new Date().toISOString(),
    history: [
      ...entry.record.history,
      buildHistoryEntry({
        event: "review-note-updated",
        detail: reviewNote.trim()
          ? "Observacao de revisao humana atualizada."
          : "Observacao de revisao humana removida.",
        metadata: {
          hasReviewNote: reviewNote.trim() ? "true" : "false"
        }
      })
    ]
  });

  await writePersistentReviewNote(updatedRecord, entry.context);

  if (updatedRecord.kind === "text-draft") {
    try {
      await syncClaraTextDraftReviewNote({
        record: updatedRecord as unknown as ClaraTextDraftRecord,
        context: entry.context
      });
    } catch (error) {
      console.warn(
        error instanceof Error ? error.message : "Falha ao sincronizar observacao da Clara no Supabase."
      );
    }
  }

  return updatedRecord;
}

export async function updateClaraRecordContent(input: {
  recordId: string;
  editedTitle: string;
  editedDetail: string;
}) {
  const entry = await readPersistentRecord(input.recordId);

  if (!entry) {
    return null;
  }

  const updatedRecord = normalizeRecord({
    ...entry.record,
    editedTitle: input.editedTitle.trim(),
    editedDetail: input.editedDetail.trim(),
    updatedAt: new Date().toISOString(),
    history: [
      ...entry.record.history,
      buildHistoryEntry({
        event: "content-updated",
        detail: "Conteudo revisado do registro atualizado.",
        metadata: {
          hasEditedTitle: input.editedTitle.trim() ? "true" : "false",
          hasEditedDetail: input.editedDetail.trim() ? "true" : "false"
        }
      })
    ]
  });

  await writePersistentRecord(updatedRecord, entry.context);

  return updatedRecord;
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
