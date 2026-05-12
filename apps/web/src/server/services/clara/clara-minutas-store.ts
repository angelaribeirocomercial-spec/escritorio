import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getClaraTextDraftArtifact } from "@/server/services/clara/get-clara-artifacts";
import {
  buildTextDraftDefaultBody,
  buildTextDraftDefaultTitle
} from "@/server/services/clara/clara-text-draft-renderer";
import type {
  ClaraRecordHistoryEntry,
  ClaraRecordWorkflowStatus
} from "@/server/services/clara/clara-record-store";

type TextDraftPayload = Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;

type ClaraTextDraftStatus = "draft" | "in_review" | "approved" | "sent" | "closed";

type ClaraTextDraftRow = {
  id: string;
  tenant_id: string;
  client_id: string;
  case_id: string;
  title: string;
  body: string;
  status: ClaraTextDraftStatus;
  output_format: "docx" | "pdf" | "print";
  summary: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type ClaraTextDraftVersionRow = {
  id: string;
  tenant_id: string;
  minuta_id: string;
  version_number: number;
  content: string;
  review_status: "draft" | "reviewed" | "approved";
  source_trace: Record<string, unknown>;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type ClaraTextDraftReviewRow = {
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

type ClaraMinutaSource = {
  session: NonNullable<Awaited<ReturnType<typeof getWorkspaceSession>>>;
  supabase: ReturnType<typeof getSupabaseAdminClient>;
};

export type ClaraTextDraftRecord = {
  id: string;
  kind: "text-draft";
  createdAt: string;
  updatedAt: string;
  sourceAction: string;
  targetPath: string;
  workflowStatus: ClaraRecordWorkflowStatus;
  editedTitle?: string;
  editedDetail?: string;
  reviewNote?: string;
  history: ClaraRecordHistoryEntry[];
  payload: TextDraftPayload;
};

function buildHistoryEntry(input: {
  event: ClaraRecordHistoryEntry["event"];
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

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asTextDraftPayload(value: unknown): TextDraftPayload | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const payload = value as TextDraftPayload;

  if (
    typeof payload.caseLabel !== "string" ||
    typeof payload.documentLabel !== "string" ||
    typeof payload.pieceLabel !== "string" ||
    typeof payload.preview !== "string" ||
    typeof payload.recordId !== "string"
  ) {
    return null;
  }

  return payload;
}

function mapWorkflowStatusToMinutaStatus(
  workflowStatus: ClaraRecordWorkflowStatus
): ClaraTextDraftStatus {
  switch (workflowStatus) {
    case "reviewed":
      return "in_review";
    case "completed":
      return "approved";
    case "created":
    default:
      return "draft";
  }
}

function mapMinutaStatusToWorkflowStatus(status: ClaraTextDraftStatus): ClaraRecordWorkflowStatus {
  switch (status) {
    case "in_review":
      return "reviewed";
    case "approved":
    case "sent":
    case "closed":
      return "completed";
    case "draft":
    default:
      return "created";
  }
}

function buildContentFromPayload(
  payload: TextDraftPayload,
  record: Pick<ClaraTextDraftRecord, "editedTitle" | "editedDetail">
) {
  const detail = record.editedDetail?.trim() || buildTextDraftDefaultBody(payload);
  const title = record.editedTitle?.trim() || buildTextDraftDefaultTitle(payload);

  return {
    title,
    body: detail,
    summary: detail
  };
}

async function resolveSource(): Promise<ClaraMinutaSource | null> {
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

function buildStoredSourceTrace(input: {
  record: ClaraTextDraftRecord;
  context: Record<string, unknown>;
}) {
  return {
    kind: input.record.kind,
    sourceAction: input.record.sourceAction,
    targetPath: input.record.targetPath,
    workflowStatus: input.record.workflowStatus,
    editedTitle: input.record.editedTitle ?? null,
    editedDetail: input.record.editedDetail ?? null,
    context: input.context,
    artifact: input.record.payload
  };
}

function buildTextDraftRecordFromRows(input: {
  row: ClaraTextDraftRow;
  version?: ClaraTextDraftVersionRow | null;
  reviewNote?: string | null;
}): ClaraTextDraftRecord | null {
  const payload = input.version ? asTextDraftPayload(input.version.source_trace.artifact) : null;

  if (!payload) {
    return null;
  }

  const sourceAction =
    asString(input.version?.source_trace.sourceAction) ?? "clara-text-draft";
  const targetPath = asString(input.version?.source_trace.targetPath) ?? "/editor-de-texto/meus-textos";
  const editedTitle = input.row.title.trim() || undefined;
  const editedDetail = input.row.body.trim() || undefined;
  const history: ClaraRecordHistoryEntry[] = [
    buildHistoryEntry({
      event: "created",
      detail: `Registro text-draft recuperado do schema persistente para o tenant ${input.row.tenant_id}.`,
      metadata: {
        workflowStatus: mapMinutaStatusToWorkflowStatus(input.row.status)
      }
    })
  ];

  return {
    id: input.row.id,
    kind: "text-draft",
    createdAt: input.row.created_at,
    updatedAt: input.row.updated_at,
    sourceAction,
    targetPath,
    workflowStatus: mapMinutaStatusToWorkflowStatus(input.row.status),
    editedTitle,
    editedDetail,
    reviewNote: input.reviewNote ?? undefined,
    history,
    payload
  };
}

async function loadReviewNotes(source: ClaraMinutaSource, minutaIds: string[]) {
  if (!minutaIds.length) {
    return new Map<string, string>();
  }

  const { data, error } = await source.supabase
    .from("observacoes_revisor_humano")
    .select("minuta_id, review_note, updated_at")
    .eq("tenant_id", source.session.workspace.tenant.id)
    .in("minuta_id", minutaIds)
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn(
      `Falha ao ler observacoes de revisao humana para o tenant ${source.session.workspace.tenant.id}: ${error.message}`
    );
    return new Map<string, string>();
  }

  const notes = new Map<string, string>();

  for (const row of (data ?? []) as ClaraTextDraftReviewRow[]) {
    if (row.minuta_id && !notes.has(row.minuta_id)) {
      notes.set(row.minuta_id, row.review_note);
    }
  }

  return notes;
}

async function loadLatestVersions(source: ClaraMinutaSource, minutaIds: string[]) {
  if (!minutaIds.length) {
    return new Map<string, ClaraTextDraftVersionRow>();
  }

  const { data, error } = await source.supabase
    .from("versoes_peca")
    .select(
      "id, tenant_id, minuta_id, version_number, content, review_status, source_trace, created_by, updated_by, created_at, updated_at"
    )
    .eq("tenant_id", source.session.workspace.tenant.id)
    .in("minuta_id", minutaIds)
    .order("version_number", { ascending: false });

  if (error) {
    console.warn(
      `Falha ao ler versoes de peca para o tenant ${source.session.workspace.tenant.id}: ${error.message}`
    );
    return new Map<string, ClaraTextDraftVersionRow>();
  }

  const versions = new Map<string, ClaraTextDraftVersionRow>();

  for (const row of (data ?? []) as ClaraTextDraftVersionRow[]) {
    if (!versions.has(row.minuta_id)) {
      versions.set(row.minuta_id, row);
    }
  }

  return versions;
}

export async function listClaraMinutas(limit = 12): Promise<ClaraTextDraftRecord[]> {
  const source = await resolveSource();

  if (!source) {
    return [];
  }

  const { data, error } = await source.supabase
    .from("minutas")
    .select(
      "id, tenant_id, client_id, case_id, title, body, status, output_format, summary, created_by, updated_by, created_at, updated_at"
    )
    .eq("tenant_id", source.session.workspace.tenant.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn(
      `Falha ao ler minutas do tenant ${source.session.workspace.tenant.id}: ${error.message}`
    );
    return [];
  }

  const rows = (data ?? []) as ClaraTextDraftRow[];
  const minutaIds = rows.map((row) => row.id);
  const [versions, reviewNotes] = await Promise.all([
    loadLatestVersions(source, minutaIds),
    loadReviewNotes(source, minutaIds)
  ]);

  return rows
    .map((row) =>
      buildTextDraftRecordFromRows({
        row,
        version: versions.get(row.id) ?? null,
        reviewNote: reviewNotes.get(row.id) ?? null
      })
    )
    .filter((record): record is ClaraTextDraftRecord => record !== null);
}

export async function getClaraMinuta(recordId: string): Promise<ClaraTextDraftRecord | null> {
  const source = await resolveSource();

  if (!source) {
    return null;
  }

  const { data, error } = await source.supabase
    .from("minutas")
    .select(
      "id, tenant_id, client_id, case_id, title, body, status, output_format, summary, created_by, updated_by, created_at, updated_at"
    )
    .eq("tenant_id", source.session.workspace.tenant.id)
    .eq("id", recordId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.warn(
        `Falha ao ler minuta ${recordId} do tenant ${source.session.workspace.tenant.id}: ${error.message}`
      );
    }
    return null;
  }

  const [version, reviewNotes] = await Promise.all([
    loadLatestVersions(source, [recordId]),
    loadReviewNotes(source, [recordId])
  ]);

  return (
    buildTextDraftRecordFromRows({
      row: data as ClaraTextDraftRow,
      version: version.get(recordId) ?? null,
      reviewNote: reviewNotes.get(recordId) ?? null
    }) ?? {
      id: data.id,
      kind: "text-draft",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      sourceAction: "clara-text-draft",
      targetPath: "/editor-de-texto/meus-textos",
      workflowStatus: mapMinutaStatusToWorkflowStatus(data.status),
      editedTitle: data.title,
      editedDetail: data.body,
      reviewNote: reviewNotes.get(recordId) ?? undefined,
      history: [
        buildHistoryEntry({
          event: "created",
          detail: `Registro text-draft recuperado do schema persistente para o tenant ${source.session.workspace.tenant.id}.`,
          metadata: {
            workflowStatus: mapMinutaStatusToWorkflowStatus(data.status)
          }
        })
      ],
      payload: {
        recordId: data.id,
        statusLabel: data.status,
        stageLabel: data.status,
        pieceLabel: data.title,
        caseLabel: data.title,
        bankLabel: "",
        processLabel: "",
        documentLabel: data.summary || data.title,
        sections: data.body ? data.body.split("\n").filter(Boolean) : [],
        preview: data.summary || data.body,
        revisionalMemory: null
      } as TextDraftPayload
    }
  );
}

export async function syncClaraTextDraftRecord(input: {
  record: ClaraTextDraftRecord;
  context: Record<string, unknown>;
  createVersion?: boolean;
}) {
  const source = await resolveSource();

  if (!source) {
    return false;
  }

  const clientId = typeof input.context.clientId === "string" ? input.context.clientId : "";
  const caseId = typeof input.context.caseId === "string" ? input.context.caseId : "";

  if (!clientId || !caseId) {
    return false;
  }

  const { record, context, createVersion = false } = input;
  const payload = record.payload;
  const content = buildContentFromPayload(payload, record);
  const minutaRow: ClaraTextDraftRow = {
    id: record.id,
    tenant_id: source.session.workspace.tenant.id,
    client_id: clientId,
    case_id: caseId,
    title: content.title,
    body: content.body,
    status: mapWorkflowStatusToMinutaStatus(record.workflowStatus),
    output_format: "docx",
    summary: content.summary,
    created_by: source.session.userId,
    updated_by: source.session.userId,
    created_at: record.createdAt,
    updated_at: record.updatedAt
  };

  const { error: minutaError } = await source.supabase
    .from("minutas")
    .upsert(minutaRow, { onConflict: "id" });

  if (minutaError) {
    throw new Error(
      `Falha ao persistir minuta ${record.id} no Supabase para o tenant ${source.session.workspace.tenant.id}: ${minutaError.message}`
    );
  }

  if (createVersion) {
    const { data: versionRows, error: versionError } = await source.supabase
      .from("versoes_peca")
      .select("version_number")
      .eq("tenant_id", source.session.workspace.tenant.id)
      .eq("minuta_id", record.id)
      .order("version_number", { ascending: false })
      .limit(1);

    if (versionError) {
      throw new Error(
        `Falha ao consultar versoes da minuta ${record.id} no Supabase para o tenant ${source.session.workspace.tenant.id}: ${versionError.message}`
      );
    }

    const nextVersionNumber = ((versionRows?.[0] as { version_number?: number } | undefined)?.version_number ?? 0) + 1;
    const versionRow: ClaraTextDraftVersionRow = {
      id: `versao-${record.id}-${nextVersionNumber}`,
      tenant_id: source.session.workspace.tenant.id,
      minuta_id: record.id,
      version_number: nextVersionNumber,
      content: content.body,
      review_status: "draft",
      source_trace: buildStoredSourceTrace({ record, context }),
      created_by: source.session.userId,
      updated_by: source.session.userId,
      created_at: record.createdAt,
      updated_at: record.updatedAt
    };

    const { error: versionInsertError } = await source.supabase
      .from("versoes_peca")
      .upsert(versionRow, { onConflict: "id" });

    if (versionInsertError) {
      throw new Error(
        `Falha ao persistir versao da minuta ${record.id} no Supabase para o tenant ${source.session.workspace.tenant.id}: ${versionInsertError.message}`
      );
    }
  }

  return true;
}

export async function syncClaraTextDraftReviewNote(input: {
  record: ClaraTextDraftRecord;
  context: Record<string, unknown>;
}) {
  const source = await resolveSource();

  if (!source) {
    return false;
  }

  const reviewRow: ClaraTextDraftReviewRow = {
    id: `review-${input.record.id}`,
    tenant_id: source.session.workspace.tenant.id,
    minuta_id: input.record.id,
    case_id: (input.context.caseId as string | undefined) ?? null,
    review_note: input.record.reviewNote ?? "",
    status_revisao: "pending",
    created_by: source.session.userId,
    updated_by: source.session.userId,
    created_at: input.record.createdAt,
    updated_at: input.record.updatedAt
  };

  const { error } = await source.supabase
    .from("observacoes_revisor_humano")
    .upsert(reviewRow, { onConflict: "id" });

  if (error) {
    throw new Error(
      `Falha ao persistir observacao da minuta ${input.record.id} no Supabase para o tenant ${source.session.workspace.tenant.id}: ${error.message}`
    );
  }

  return true;
}
