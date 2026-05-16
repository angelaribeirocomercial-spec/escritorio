import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ClaraChatContext,
  ClaraChatMessage,
  ClaraChatThread
} from "@/server/services/clara/clara-chat-types";

type ClaraChatThreadRow = {
  id: string;
  tenant_id: string;
  client_id: string;
  case_id: string;
  process_id: string | null;
  document_id: string | null;
  source: "dossie" | "workspace";
  status: "active";
  created_at: string;
  updated_at: string;
};

type ClaraChatMessageRow = {
  id: string;
  thread_id: string;
  tenant_id: string;
  role: "user" | "assistant";
  text: string;
  intent: string | null;
  status: "completed" | "fallback" | null;
  source_trace: ClaraChatMessage["sourceTrace"] | null;
  metadata: Record<string, string> | null;
  created_at: string;
};

type ClaraChatLocalStore = {
  threads: Array<{
    tenantId: string;
    thread: ClaraChatThread;
  }>;
};

type ClaraSupabaseSource = {
  session: NonNullable<Awaited<ReturnType<typeof getWorkspaceSession>>>;
  supabase: ReturnType<typeof getSupabaseAdminClient>;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "clara-chat.json");

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(STORE_PATH, "utf8");
  } catch {
    await writeFile(STORE_PATH, JSON.stringify({ threads: [] }, null, 2), "utf8");
  }
}

async function readStore() {
  await ensureStore();
  const raw = await readFile(STORE_PATH, "utf8");
  const parsed = JSON.parse(raw) as ClaraChatLocalStore;

  return {
    threads: Array.isArray(parsed.threads) ? parsed.threads : []
  } satisfies ClaraChatLocalStore;
}

async function writeStore(store: ClaraChatLocalStore) {
  await ensureStore();
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

async function resolveSupabaseSource(): Promise<ClaraSupabaseSource | null> {
  const session = await getWorkspaceSession();

  if (!session?.workspace?.tenant?.id) {
    return null;
  }

  try {
    const supabase = getSupabaseAdminClient();

    return {
      session,
      supabase
    };
  } catch {
    return null;
  }
}

function mapThreadRow(row: ClaraChatThreadRow, messages: ClaraChatMessageRow[]): ClaraChatThread {
  return {
    id: row.id,
    clientId: row.client_id,
    caseId: row.case_id,
    processId: row.process_id,
    documentId: row.document_id,
    source: row.source,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: messages
      .sort((left, right) => left.created_at.localeCompare(right.created_at))
      .map((message) => ({
        id: message.id,
        role: message.role,
        text: message.text,
        createdAt: message.created_at,
        intent: (message.intent as ClaraChatMessage["intent"]) ?? undefined,
        status: message.status ?? undefined,
        sourceTrace: message.source_trace ?? undefined,
        metadata: message.metadata ?? undefined
      }))
  };
}

function buildThread(context: ClaraChatContext): ClaraChatThread {
  const now = new Date().toISOString();

  return {
    id: `clara-thread-${randomUUID()}`,
    clientId: context.clientId,
    caseId: context.caseId,
    processId: context.processId ?? null,
    documentId: context.documentId ?? null,
    source: context.source,
    status: "active",
    createdAt: now,
    updatedAt: now,
    messages: []
  };
}

function matchesThread(thread: ClaraChatThread, context: ClaraChatContext) {
  return (
    thread.clientId === context.clientId &&
    thread.caseId === context.caseId &&
    thread.processId === (context.processId ?? null) &&
    thread.documentId === (context.documentId ?? null) &&
    thread.source === context.source
  );
}

function assertThreadContext(context: ClaraChatContext) {
  if (!context.clientId?.trim()) {
    throw new Error("Informe um clientId valido para abrir a conversa da Clara.");
  }

  if (!context.caseId?.trim()) {
    throw new Error("Informe um caseId valido para abrir a conversa da Clara.");
  }
}

export async function getOrCreateClaraChatThread(context: ClaraChatContext) {
  assertThreadContext(context);

  const supabaseSource = await resolveSupabaseSource();

  if (supabaseSource) {
    const tenantId = supabaseSource.session.workspace.tenant.id;
    let threadLookupQuery = supabaseSource.supabase
      .from("clara_chat_threads")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("client_id", context.clientId)
      .eq("case_id", context.caseId)
      .eq("source", context.source);

    threadLookupQuery = context.processId
      ? threadLookupQuery.eq("process_id", context.processId)
      : threadLookupQuery.is("process_id", null);
    threadLookupQuery = context.documentId
      ? threadLookupQuery.eq("document_id", context.documentId)
      : threadLookupQuery.is("document_id", null);

    const { data: existingThreadRow, error: threadLookupError } =
      await threadLookupQuery.maybeSingle<ClaraChatThreadRow>();

    if (threadLookupError) {
      throw new Error(`Falha ao localizar thread da Clara: ${threadLookupError.message}`);
    }

    let threadRow = existingThreadRow;

    if (!threadRow) {
      const { data, error } = await supabaseSource.supabase
        .from("clara_chat_threads")
        .insert({
          id: `clara-thread-${randomUUID()}`,
          tenant_id: tenantId,
          client_id: context.clientId,
          case_id: context.caseId,
          process_id: context.processId ?? null,
          document_id: context.documentId ?? null,
          source: context.source,
          status: "active"
        })
        .select("*")
        .single<ClaraChatThreadRow>();

      if (error) {
        throw new Error(`Falha ao criar thread da Clara: ${error.message}`);
      }

      threadRow = data;
    }

    if (!threadRow) {
      throw new Error("Falha ao materializar a thread da Clara.");
    }

    const { data: messageRows, error: messagesError } = await supabaseSource.supabase
      .from("clara_chat_messages")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("thread_id", threadRow.id)
      .order("created_at", { ascending: true })
      .returns<ClaraChatMessageRow[]>();

    if (messagesError) {
      throw new Error(`Falha ao carregar mensagens da Clara: ${messagesError.message}`);
    }

    return mapThreadRow(threadRow, messageRows ?? []);
  }

  const session = await getWorkspaceSession();
  const tenantId = session?.workspace?.tenant?.id ?? "demo-tenant";
  const store = await readStore();
  const existing = store.threads.find(
    (entry) => entry.tenantId === tenantId && matchesThread(entry.thread, context)
  );

  if (existing) {
    return existing.thread;
  }

  const thread = buildThread(context);

  store.threads.push({ tenantId, thread });
  await writeStore(store);

  return thread;
}

export async function appendClaraChatMessages(params: {
  threadId: string;
  context: ClaraChatContext;
  messages: ClaraChatMessage[];
}) {
  const supabaseSource = await resolveSupabaseSource();

  if (supabaseSource) {
    const tenantId = supabaseSource.session.workspace.tenant.id;
    const { error: threadError } = await supabaseSource.supabase
      .from("clara_chat_threads")
      .update({
        updated_at: new Date().toISOString(),
        process_id: params.context.processId ?? null,
        document_id: params.context.documentId ?? null
      })
      .eq("tenant_id", tenantId)
      .eq("id", params.threadId);

    if (threadError) {
      throw new Error(`Falha ao atualizar thread da Clara: ${threadError.message}`);
    }

    const rows = params.messages.map((message) => ({
      id: message.id,
      thread_id: params.threadId,
      tenant_id: tenantId,
      role: message.role,
      text: message.text,
      intent: message.intent ?? null,
      status: message.status ?? null,
      source_trace: message.sourceTrace ?? {},
      metadata: message.metadata ?? {}
    }));

    const { error: insertError } = await supabaseSource.supabase
      .from("clara_chat_messages")
      .insert(rows);

    if (insertError) {
      throw new Error(`Falha ao gravar mensagens da Clara: ${insertError.message}`);
    }

    return getOrCreateClaraChatThread(params.context);
  }

  const session = await getWorkspaceSession();
  const tenantId = session?.workspace?.tenant?.id ?? "demo-tenant";
  const store = await readStore();
  const threadEntry = store.threads.find(
    (entry) => entry.tenantId === tenantId && entry.thread.id === params.threadId
  );

  if (!threadEntry) {
    throw new Error("Thread da Clara nao encontrada para gravar mensagens.");
  }

  threadEntry.thread.processId = params.context.processId ?? null;
  threadEntry.thread.documentId = params.context.documentId ?? null;
  threadEntry.thread.updatedAt = new Date().toISOString();
  threadEntry.thread.messages.push(...params.messages);

  await writeStore(store);

  return threadEntry.thread;
}
